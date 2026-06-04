import {lineSubtotal} from '@/pages/constants/offerConstants';
import {computeTotal} from '@/services/invoiceTotal';
import {LineItemDto, OfferState} from '@/types/offerte';
import {describe, expect, it} from 'vitest';

function makeLine(overrides: Partial<LineItemDto> = {}): LineItemDto {
    return {
        id: '1',
        kind: 'PRODUKT',
        articleNumber: 'ART-1',
        feltTypeName: 'Wool',
        color: null,
        description: 'Wool',
        quantity: 1,
        unit: 'Stk',
        pricePerUnit: 100,
        cutSurcharge: 0,
        extras: 0,
        discount: 0,
        reservation: null,
        ...overrides,
    };
}

// lineSubtotal

describe('lineSubtotal', () => {
    it('multiplies pricePerUnit by quantity', () => {
        expect(lineSubtotal(makeLine({quantity: 3, pricePerUnit: 10}))).toBe(30);
    });

    it('adds cutSurcharge × quantity', () => {
        // 2×10 (price) + 2×5 (cut) = 30
        expect(lineSubtotal(makeLine({quantity: 2, pricePerUnit: 10, cutSurcharge: 5}))).toBe(30);
    });

    it('adds extras', () => {
        expect(lineSubtotal(makeLine({pricePerUnit: 100, extras: 15}))).toBe(115);
    });

    it('subtracts discount', () => {
        expect(lineSubtotal(makeLine({pricePerUnit: 100, discount: 20}))).toBe(80);
    });

    it('combines all four fields correctly', () => {
        // quantity=2, price=50 → 100; cut=10 → +20; extras=5 → +5; discount=3 → -3 = 122
        expect(lineSubtotal(makeLine({quantity: 2, pricePerUnit: 50, cutSurcharge: 10, extras: 5, discount: 3}))).toBe(122);
    });

    it('treats null extras as zero', () => {
        expect(lineSubtotal(makeLine({pricePerUnit: 100, extras: null as unknown as number}))).toBe(100);
    });

    it('treats null discount as zero', () => {
        expect(lineSubtotal(makeLine({pricePerUnit: 100, discount: null as unknown as number}))).toBe(100);
    });
});

// computeTotal - baseline

describe('computeTotal - baseline (no fees)', () => {
    it('returns zero total for empty lines', () => {
        expect(computeTotal([], 'INVOICE').total).toBe(0);
    });

    it('subtotal equals sum of lineSubtotals', () => {
        const lines = [makeLine({pricePerUnit: 50}), makeLine({pricePerUnit: 75})];
        expect(computeTotal(lines, 'INVOICE').subtotal).toBe(125);
    });

    it('total equals subtotal when no shipping, no VAT, no dunning', () => {
        expect(computeTotal([makeLine({pricePerUnit: 200})], 'INVOICE').total).toBe(200);
    });

    it('defaults shippingFee to 0 when options is undefined', () => {
        expect(computeTotal([makeLine()], 'INVOICE').shippingFee).toBe(0);
    });

    it('defaults vatRate to 0 when options is undefined', () => {
        expect(computeTotal([makeLine()], 'INVOICE').vatRate).toBe(0);
    });
});

// computeTotal - shippingFee

describe('computeTotal - shippingFee', () => {
    it('adds shippingFee to vatBase', () => {
        const {vatBase} = computeTotal([makeLine({pricePerUnit: 100})], 'INVOICE', {shippingFee: 15});
        expect(vatBase).toBe(115);
    });

    it('includes shippingFee in VAT calculation base', () => {
        // subtotal=100, shipping=15, vatRate=0.1 → vatBase=115, vatAmount=11.5
        const {vatAmount} = computeTotal([makeLine({pricePerUnit: 100})], 'INVOICE', {shippingFee: 15, vatRate: 0.1});
        expect(vatAmount).toBeCloseTo(11.5, 10);
    });

    it('shippingFee=0 produces same result as omitting options', () => {
        const withZero = computeTotal([makeLine({pricePerUnit: 100})], 'INVOICE', {shippingFee: 0});
        const withoutOpts = computeTotal([makeLine({pricePerUnit: 100})], 'INVOICE');
        expect(withZero.total).toBe(withoutOpts.total);
    });
});

// computeTotal - VAT

describe('computeTotal - VAT', () => {
    it('vatAmount = vatBase × vatRate', () => {
        const {vatBase, vatAmount, vatRate} = computeTotal([makeLine({pricePerUnit: 1000})], 'INVOICE', {vatRate: 0.081});
        expect(vatAmount).toBeCloseTo(vatBase * vatRate, 10);
    });

    it('applies standard Swiss VAT (8.1%) correctly', () => {
        const {vatAmount, total} = computeTotal([makeLine({pricePerUnit: 1000})], 'INVOICE', {vatRate: 0.081});
        expect(vatAmount).toBeCloseTo(81, 10);
        expect(total).toBeCloseTo(1081, 10);
    });

    it('VAT is applied to subtotal + shippingFee, not just subtotal', () => {
        const {vatAmount} = computeTotal([makeLine({pricePerUnit: 100})], 'INVOICE', {shippingFee: 20, vatRate: 0.1});
        expect(vatAmount).toBeCloseTo(12, 10); // (100+20)×0.1, not 100×0.1
    });

    it('vatRate=0 produces zero vatAmount', () => {
        expect(computeTotal([makeLine({pricePerUnit: 500})], 'INVOICE', {vatRate: 0}).vatAmount).toBe(0);
    });
});

// computeTotal - dunningFee

describe('computeTotal - dunningFee', () => {
    it('adds CHF 30 for SECOND_DUNNING_NOTICE', () => {
        const {dunningFee, total} = computeTotal([makeLine({pricePerUnit: 100})], 'SECOND_DUNNING_NOTICE');
        expect(dunningFee).toBe(30);
        expect(total).toBe(130);
    });

    it('dunning fee is NOT part of vatBase', () => {
        // vatBase = subtotal + shippingFee - dunning is not in vatBase
        const {vatBase} = computeTotal([makeLine({pricePerUnit: 100})], 'SECOND_DUNNING_NOTICE');
        expect(vatBase).toBe(100);
    });

    it('dunning fee is NOT subject to VAT', () => {
        // subtotal=100, vatRate=0.1 → vatAmount=10; dunning=30 → total=140, not 143
        const {vatAmount, total} = computeTotal([makeLine({pricePerUnit: 100})], 'SECOND_DUNNING_NOTICE', {vatRate: 0.1});
        expect(vatAmount).toBeCloseTo(10, 10);
        expect(total).toBeCloseTo(140, 10);
    });

    it.each<[OfferState, number]>([
        ['OFFER', 0],
        ['ORDER_CONFIRMATION', 0],
        ['INVOICE', 0],
        ['PAYMENT_REMINDER', 0],
        ['FIRST_DUNNING_NOTICE', 0],
        ['COMPLETED', 0],
    ])('state %s has dunningFee = %i', (state, expectedFee) => {
        expect(computeTotal([makeLine()], state).dunningFee).toBe(expectedFee);
    });
});

// computeTotal - component invariants

describe('computeTotal - component invariants', () => {
    it('vatBase = subtotal + shippingFee', () => {
        const c = computeTotal([makeLine({pricePerUnit: 100})], 'INVOICE', {shippingFee: 20, vatRate: 0.1});
        expect(c.vatBase).toBeCloseTo(c.subtotal + c.shippingFee, 10);
    });

    it('total = vatBase + vatAmount + dunningFee', () => {
        const c = computeTotal([makeLine({pricePerUnit: 100})], 'SECOND_DUNNING_NOTICE', {vatRate: 0.081, shippingFee: 10});
        expect(c.total).toBeCloseTo(c.vatBase + c.vatAmount + c.dunningFee, 10);
    });

    it.each<OfferState>(['OFFER', 'ORDER_CONFIRMATION', 'INVOICE', 'PAYMENT_REMINDER', 'FIRST_DUNNING_NOTICE', 'SECOND_DUNNING_NOTICE', 'COMPLETED'])(
        'total is finite for state %s',
        (state) => {
            expect(isFinite(computeTotal([makeLine({pricePerUnit: 100})], state).total)).toBe(true);
        },
    );

    it('accumulates multiple lines correctly', () => {
        const lines = [makeLine({pricePerUnit: 50}), makeLine({pricePerUnit: 75.5}), makeLine({pricePerUnit: 24.5})];
        expect(computeTotal(lines, 'INVOICE').subtotal).toBeCloseTo(150, 10);
    });
});
