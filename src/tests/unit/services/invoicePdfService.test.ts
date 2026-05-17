import {generateOfferPdf} from '@/services/invoicePdfService';
import {CustomerDto, LineItemDto, OfferDto, OfferState} from '@/types/offerte';
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';

// Hoisted mocks — vi.hoisted ensures initialization before vi.mock factories run.

const mockPdf = vi.hoisted(() => ({
    setFont: vi.fn(),
    setFontSize: vi.fn(),
    setTextColor: vi.fn(),
    setDrawColor: vi.fn(),
    setLineWidth: vi.fn(),
    line: vi.fn(),
    text: vi.fn(),
    getTextWidth: vi.fn().mockReturnValue(10),
    setFillColor: vi.fn(),
    rect: vi.fn(),
    addPage: vi.fn(),
    save: vi.fn(),
    addImage: vi.fn(),
}));

const MockQRBill = vi.hoisted(() =>
    vi.fn(function () {
        return {toString: vi.fn(() => '<svg></svg>')};
    }),
);

// Arrow functions can't be constructors — use a regular function so `new jsPDF(...)` works.
vi.mock('jspdf', () => ({
    default: vi.fn(function () {
        return mockPdf;
    }),
}));
vi.mock('swissqrbill/svg', () => ({SwissQRBill: MockQRBill}));
vi.mock('@/assets/logo.svg', () => ({default: 'data:image/svg+xml,<svg/>'}));

// Fixtures

const CUSTOMER: CustomerDto = {
    customerNumber: 'C-1',
    name: 'Test Customer',
    contactPerson: '',
    email: 'test@example.com',
    phone: '',
    street: 'Teststrasse 1',
    zip: '7000',
    city: 'Chur',
    country: 'CH',
    vatNumber: '',
};

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

function makeOffer(overrides: Partial<OfferDto> = {}): OfferDto {
    return {
        id: 'test-id',
        number: '2024-001',
        createdISO: '2024-01-15',
        state: 'INVOICE',
        path: ['OFFER', 'INVOICE'],
        customer: CUSTOMER,
        lines: [makeLine({pricePerUnit: 100, quantity: 1})],
        history: [],
        offerSent: false,
        ...overrides,
    };
}

// DOM and browser API mocks

class MockImage {
    onload: (() => void) | null = null;
    onerror: (() => void) | null = null;
    set src(_: string) {
        // Fire onload asynchronously so Promise chains resolve naturally
        queueMicrotask(() => this.onload?.());
    }
}

let restoreCreateElement: () => void;

beforeEach(() => {
    vi.clearAllMocks();
    // Re-apply the static return value cleared by clearAllMocks
    mockPdf.getTextWidth.mockReturnValue(10);

    vi.stubGlobal('URL', {
        createObjectURL: vi.fn().mockReturnValue('blob:mock-url'),
        revokeObjectURL: vi.fn(),
    });
    vi.stubGlobal('Image', MockImage);

    const originalCreateElement = document.createElement.bind(document);
    const spy = vi.spyOn(document, 'createElement').mockImplementation((tag: string) => {
        if (tag === 'canvas') {
            const mockCtx = {drawImage: vi.fn(), fillRect: vi.fn(), fillStyle: ''};
            return {
                getContext: vi.fn().mockReturnValue(mockCtx),
                width: 0,
                height: 0,
                toDataURL: vi.fn().mockReturnValue('data:image/png;base64,MOCK'),
            } as unknown as HTMLCanvasElement;
        }
        return originalCreateElement(tag);
    });
    restoreCreateElement = () => spy.mockRestore();
});

afterEach(() => {
    vi.unstubAllGlobals();
    restoreCreateElement?.();
});

// QR bill generation by state

const QR_STATES: OfferState[] = ['INVOICE', 'PAYMENT_REMINDER', 'FIRST_DUNNING_NOTICE', 'SECOND_DUNNING_NOTICE', 'COMPLETED'];
const NON_QR_STATES: OfferState[] = ['OFFER', 'ORDER_CONFIRMATION'];

describe('QR bill — generated for QR states only', () => {
    it.each(QR_STATES)('state %s: SwissQRBill constructor is called', async (state) => {
        await generateOfferPdf(makeOffer({state}));
        expect(MockQRBill).toHaveBeenCalledOnce();
    });

    it.each(QR_STATES)('state %s: pdf.addImage called twice (logo + QR)', async (state) => {
        await generateOfferPdf(makeOffer({state}));
        expect(mockPdf.addImage).toHaveBeenCalledTimes(2);
    });

    it.each(NON_QR_STATES)('state %s: SwissQRBill is NOT called', async (state) => {
        await generateOfferPdf(makeOffer({state}));
        expect(MockQRBill).not.toHaveBeenCalled();
    });

    it.each(NON_QR_STATES)('state %s: pdf.addImage called once (logo only)', async (state) => {
        await generateOfferPdf(makeOffer({state}));
        expect(mockPdf.addImage).toHaveBeenCalledTimes(1);
    });
});

// Total passed to QR bill

describe('QR bill amount — matches computeTotal', () => {
    it('passes correct total for INVOICE (no dunning, no VAT)', async () => {
        const offer = makeOffer({state: 'INVOICE', lines: [makeLine({pricePerUnit: 100})]});
        await generateOfferPdf(offer);
        const [qrData] = MockQRBill.mock.calls[0] as unknown as [{amount: number}];
        expect(qrData.amount).toBe(100);
    });

    it('SECOND_DUNNING_NOTICE: total includes CHF 30 dunning fee', async () => {
        const offer = makeOffer({state: 'SECOND_DUNNING_NOTICE', lines: [makeLine({pricePerUnit: 100})]});
        await generateOfferPdf(offer);
        const [qrData] = MockQRBill.mock.calls[0] as unknown as [{amount: number}];
        expect(qrData.amount).toBe(130);
    });

    it('FIRST_DUNNING_NOTICE: total does NOT include dunning fee', async () => {
        const offer = makeOffer({state: 'FIRST_DUNNING_NOTICE', lines: [makeLine({pricePerUnit: 100})]});
        await generateOfferPdf(offer);
        const [qrData] = MockQRBill.mock.calls[0] as unknown as [{amount: number}];
        expect(qrData.amount).toBe(100);
    });

    it('VAT is applied to total passed to QR bill', async () => {
        const offer = makeOffer({state: 'INVOICE', lines: [makeLine({pricePerUnit: 100})]});
        await generateOfferPdf(offer, {vatRate: 0.1});
        const [qrData] = MockQRBill.mock.calls[0] as unknown as [{amount: number}];
        expect(qrData.amount).toBeCloseTo(110, 10);
    });

    it('shippingFee is included in total passed to QR bill', async () => {
        const offer = makeOffer({state: 'INVOICE', lines: [makeLine({pricePerUnit: 100})]});
        await generateOfferPdf(offer, {shippingFee: 15});
        const [qrData] = MockQRBill.mock.calls[0] as unknown as [{amount: number}];
        expect(qrData.amount).toBeCloseTo(115, 10);
    });

    it('QR bill amount is rounded to 2 decimal places', async () => {
        // 3 × 0.1 = 0.30000...04 in IEEE 754 — must be rounded
        const offer = makeOffer({state: 'INVOICE', lines: [makeLine({pricePerUnit: 0.1, quantity: 3})]});
        await generateOfferPdf(offer);
        const [qrData] = MockQRBill.mock.calls[0] as unknown as [{amount: number}];
        expect(qrData.amount).toBe(0.3);
    });

    it('QR bill amount is clamped to 0 when total is negative', async () => {
        // Large discount makes lineSubtotal negative
        const offer = makeOffer({
            state: 'INVOICE',
            lines: [makeLine({pricePerUnit: 10, discount: 100})],
        });
        await generateOfferPdf(offer);
        const [qrData] = MockQRBill.mock.calls[0] as unknown as [{amount: number}];
        expect(qrData.amount).toBe(0);
    });
});

// PDF filename

describe('generateOfferPdf — filename', () => {
    it('saves PDF with date-stamped filename for INVOICE', async () => {
        const offer = makeOffer({state: 'INVOICE', number: '2024-001', customer: {...CUSTOMER, name: 'Test Customer'}});
        await generateOfferPdf(offer);
        const [filename] = mockPdf.save.mock.calls[0] as [string];
        expect(filename).toMatch(/^Rechnung-2024-001-Test-Customer-\d{4}-\d{2}-\d{2}\.pdf$/);
    });

    it('saves PDF with date-stamped filename for OFFER', async () => {
        const offer = makeOffer({state: 'OFFER', number: '2024-042'});
        await generateOfferPdf(offer);
        const [filename] = mockPdf.save.mock.calls[0] as [string];
        expect(filename).toMatch(/^Offerte-2024-042-Test-Customer-\d{4}-\d{2}-\d{2}\.pdf$/);
    });

    it('slugifies spaces in customer name', async () => {
        const offer = makeOffer({state: 'INVOICE', customer: {...CUSTOMER, name: 'Müller AG GmbH'}});
        await generateOfferPdf(offer);
        const [filename] = mockPdf.save.mock.calls[0] as [string];
        expect(filename).toContain('Müller-AG-GmbH');
    });
});

// Page breaks

describe('generateOfferPdf — page layout', () => {
    it('does not add a new page for a 3-line OFFER (non-QR, 282mm safe bottom)', async () => {
        // OFFER uses SAFE_BOTTOM_STD=282mm. A 3-line offer produces y≈131mm + COMBINED_TAIL_H=78mm = 209mm < 282mm.
        const offer = makeOffer({
            state: 'OFFER',
            lines: [makeLine({pricePerUnit: 50}), makeLine({pricePerUnit: 75}), makeLine({pricePerUnit: 25})],
        });
        await generateOfferPdf(offer);
        expect(mockPdf.addPage).not.toHaveBeenCalled();
    });
});
