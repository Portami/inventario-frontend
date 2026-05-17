import {lineSubtotal} from '@/pages/constants/offerConstants';
import {LineItemDto, OfferState} from '@/types/offerte';

export interface InvoiceOptions {
    shippingFee?: number;
    vatRate?: number;
}

export interface TotalComponents {
    subtotal: number;
    shippingFee: number;
    vatRate: number;
    vatBase: number;
    vatAmount: number;
    dunningFee: number;
    total: number;
}

export function computeTotal(lines: LineItemDto[], state: OfferState, options?: InvoiceOptions): TotalComponents {
    const shippingFee = options?.shippingFee ?? 0;
    const vatRate = options?.vatRate ?? 0;
    const subtotal = lines.reduce((s, l) => s + lineSubtotal(l), 0);
    const dunningFee = state === 'SECOND_DUNNING_NOTICE' ? 30 : 0;
    const vatBase = subtotal + shippingFee;
    const vatAmount = vatBase * vatRate;
    const total = vatBase + vatAmount + dunningFee;
    return {subtotal, shippingFee, vatRate, vatBase, vatAmount, dunningFee, total};
}
