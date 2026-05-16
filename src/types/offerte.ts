export type OfferState = 'OFFER' | 'ORDER_CONFIRMATION' | 'INVOICE' | 'PAYMENT_REMINDER' | 'FIRST_DUNNING_NOTICE' | 'SECOND_DUNNING_NOTICE' | 'PAID';

export interface OfferSummaryDto {
    id: string;
    state: OfferState;
    customer: string;
    contact: string;
    city: string;
    lines: number;
    total: number;
    vat: number;
    createdISO: string;
    dueISO: string;
    path: 'A' | 'B';
    overdue: number;
    reservedScraps: number;
    taggedRolls: number;
}

export type LineItemKind = 'RESTSTUECK' | 'ROLLE' | 'PRODUKT';

export type ReservationKind = 'RESERVED' | 'TAGGED';

export interface ReservationDto {
    kind: ReservationKind;
    untilISO?: string;
    sourceLabel?: string;
}

export interface LineItemDto {
    id: string;
    kind: LineItemKind;
    articleNumber: string;
    feltTypeName: string;
    color: string | null;
    description: string;
    quantity: number;
    unit: string;
    pricePerUnit: number;
    cutSurcharge: number;
    extras: number;
    discount: number;
    reservation: ReservationDto | null;
    _variantId?: number;
}

export interface CustomerDto {
    customerNumber: string;
    name: string;
    contactPerson: string;
    email: string;
    phone: string;
    street: string;
    zip: string;
    city: string;
    country: string;
    vatNumber: string;
}

export interface CustomerWithIdDto extends CustomerDto {
    id: string;
}

export interface OfferDto {
    id: string;
    number: string;
    createdISO: string;
    state: OfferState;
    path: OfferState[];
    customer: CustomerDto;
    lines: LineItemDto[];
    history: HistoryEntry[];
}

export interface FeltCatalogItem {
    id: number;
    articleNumber: string;
    feltTypeName: string;
    color: string;
    thickness: number;
    density: number;
    pricePerSqm: number;
    supplierName: string;
}

export interface ProductCatalogItem {
    id: number;
    articleNumber: string;
    name: string;
    price: number;
}

export interface HistoryEntry {
    ts: string;
    who: string;
    what: string;
}

export type BackendOfferState = Exclude<OfferState, 'PAID'>;

export interface BackendCustomerDto {
    id: number;
    name: string;
    contactPerson: string | null;
    email: string | null;
    phone: string | null;
    street: string | null;
    zip: string | null;
    city: string | null;
    country: string | null;
    vatNumber: string | null;
}

export interface BackendFullCustomerDto {
    id: number;
    name: string;
    contactPerson: string;
    email: string;
    phone: string;
    street: string;
    zip: string;
    city: string;
    country: string;
    vatNumber: string;
}

export interface BackendOfferItemDto {
    id: number;
    productVariantId: number;
    description: string | null;
    quantity: number;
    unitPrice: number;
}

export interface BackendOfferDto {
    id: number;
    customerDto: BackendCustomerDto;
    state: BackendOfferState;
    createdAt: string;
    updatedAt: string;
    items: BackendOfferItemDto[];
}

export interface BackendCreateOfferItemDto {
    productVariantId: number;
    description?: string;
    quantity: number;
    unitPrice: number;
}
