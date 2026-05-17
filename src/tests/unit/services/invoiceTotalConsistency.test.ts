import {computeTotal, InvoiceOptions} from '@/services/invoiceTotal';
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

const ALL_STATES: OfferState[] = ['OFFER', 'ORDER_CONFIRMATION', 'INVOICE', 'PAYMENT_REMINDER', 'FIRST_DUNNING_NOTICE', 'SECOND_DUNNING_NOTICE', 'COMPLETED'];

const QR_STATES: OfferState[] = ['INVOICE', 'PAYMENT_REMINDER', 'FIRST_DUNNING_NOTICE', 'SECOND_DUNNING_NOTICE', 'COMPLETED'];

// ─── Formula identity: the two formerly-duplicated call sites ─────────────────
// drawTotals used:      vatBase + vatAmount + dunningFee
// generateOfferPdf used: subtotal + shippingFee + vatAmount + dunningFee
// Both are algebraically equivalent since vatBase = subtotal + shippingFee.
// computeTotal is now the single source of truth for both.

describe('UI/QR total formula identity', () => {
    it('drawTotals formula (vatBase + vatAmount + dunningFee) matches computeTotal.total', () => {
        const opts: InvoiceOptions = {shippingFee: 20, vatRate: 0.081};
        const c = computeTotal([makeLine({pricePerUnit: 500})], 'INVOICE', opts);
        expect(c.total).toBeCloseTo(c.vatBase + c.vatAmount + c.dunningFee, 10);
    });

    it('generateOfferPdf formula (subtotal + shippingFee + vatAmount + dunningFee) matches computeTotal.total', () => {
        const opts: InvoiceOptions = {shippingFee: 20, vatRate: 0.081};
        const c = computeTotal([makeLine({pricePerUnit: 500})], 'INVOICE', opts);
        expect(c.total).toBeCloseTo(c.subtotal + c.shippingFee + c.vatAmount + c.dunningFee, 10);
    });

    it('both formulas are identical for complex multi-line offer with dunning', () => {
        const lines = [makeLine({pricePerUnit: 300, quantity: 3}), makeLine({pricePerUnit: 50, cutSurcharge: 5, extras: 10, discount: 5})];
        const opts: InvoiceOptions = {shippingFee: 12.5, vatRate: 0.081};
        const c = computeTotal(lines, 'SECOND_DUNNING_NOTICE', opts);
        const formula1 = c.vatBase + c.vatAmount + c.dunningFee;
        const formula2 = c.subtotal + c.shippingFee + c.vatAmount + c.dunningFee;
        expect(formula1).toBeCloseTo(formula2, 10);
        expect(c.total).toBeCloseTo(formula1, 10);
    });
});

// ─── QR states always receive a defined, finite total ─────────────────────────

describe('QR states — total is always well-defined', () => {
    it.each(QR_STATES)('state %s: total is finite and ≥ subtotal', (state) => {
        const {total, subtotal} = computeTotal([makeLine({pricePerUnit: 100})], state);
        expect(isFinite(total)).toBe(true);
        expect(total).toBeGreaterThanOrEqual(subtotal);
    });
});

// ─── VAT base always includes shippingFee ─────────────────────────────────────

describe('VAT base includes shippingFee', () => {
    it('shipping is taxed at the same rate as goods', () => {
        // vatBase = 100 + 20 = 120; vatAmount = 120 × 0.081 ≠ 100 × 0.081
        const c = computeTotal([makeLine({pricePerUnit: 100})], 'INVOICE', {shippingFee: 20, vatRate: 0.081});
        expect(c.vatBase).toBeCloseTo(120, 10);
        expect(c.vatAmount).toBeCloseTo(120 * 0.081, 10);
    });

    it('shipping is NOT excluded from VAT base (goods-only VAT would be wrong)', () => {
        const c = computeTotal([makeLine({pricePerUnit: 100})], 'INVOICE', {shippingFee: 20, vatRate: 0.081});
        const goodsOnlyVat = 100 * 0.081;
        expect(c.vatAmount).not.toBeCloseTo(goodsOnlyVat, 5);
    });

    it('vatBase = subtotal + shippingFee for all states', () => {
        for (const state of ALL_STATES) {
            const c = computeTotal([makeLine({pricePerUnit: 100})], state, {shippingFee: 15});
            expect(c.vatBase).toBeCloseTo(c.subtotal + c.shippingFee, 10);
        }
    });
});

// ─── Dunning fee isolation ────────────────────────────────────────────────────

describe('dunning fee isolation', () => {
    it('dunning fee is never part of vatBase', () => {
        // vatBase must equal subtotal + shippingFee, without dunning
        const c = computeTotal([makeLine({pricePerUnit: 100})], 'SECOND_DUNNING_NOTICE', {shippingFee: 10});
        expect(c.vatBase).toBe(110);
    });

    it('dunning fee is never subject to VAT', () => {
        // vatAmount computed from vatBase only (no dunning), then dunning added after
        const c = computeTotal([makeLine({pricePerUnit: 100})], 'SECOND_DUNNING_NOTICE', {vatRate: 0.1});
        expect(c.vatAmount).toBeCloseTo(10, 10); // 100 × 0.1
        expect(c.total).toBeCloseTo(140, 10); // 100 + 10 + 30 (not 143)
    });

    it('total = vatBase + vatAmount + dunningFee holds for all states', () => {
        for (const state of ALL_STATES) {
            const c = computeTotal([makeLine({pricePerUnit: 100})], state, {vatRate: 0.081, shippingFee: 15});
            expect(c.total).toBeCloseTo(c.vatBase + c.vatAmount + c.dunningFee, 10);
        }
    });
});
