export type OfferState =
    | 'OFFER'
    | 'ORDER_CONFIRMATION'
    | 'INVOICE'
    | 'PAYMENT_REMINDER'
    | 'FIRST_DUNNING_NOTICE'
    | 'SECOND_DUNNING_NOTICE'
    | 'COMPLETED'
    | 'CANCELLED'
    | 'NO_RESPONSE';

/** Lightweight list-view snapshot of an offer, returned by the offers collection endpoint. */
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

export type LineItemKind = 'SCRAP' | 'ROLL' | 'PRODUCT';

export type ReservationKind = 'RESERVED' | 'TAGGED';

/** Stock reservation attached to a line item, tracking which physical roll or scrap is held. */
export interface ReservationDto {
    kind: ReservationKind;
    untilISO?: string;
    sourceLabel?: string;
}

/** One position on an offer: a felt cut from a roll, a scrap piece, or a standalone product. */
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
    variantId?: number;
}

/** Customer contact and address data as used within the frontend domain model. */
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

/** Full offer document returned by the detail endpoint, including all line items and state history. */
export interface OfferDto {
    id: string;
    number: string;
    createdISO: string;
    dueISO?: string;
    state: OfferState;
    path: OfferState[];
    customer: CustomerDto;
    lines: LineItemDto[];
    history: HistoryEntry[];
    offerSent: boolean;
}

/** Felt product variant from the catalog, used for searching and adding roll-based line items. */
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

/** Non-felt product (e.g. accessories) from the catalog, used for adding product-type line items. */
export interface ProductCatalogItem {
    id: number;
    articleNumber: string;
    name: string;
    price: number;
}

/** Single audit trail entry recording who changed what and when on an offer. */
export interface HistoryEntry {
    ts: string;
    who: string;
    what: string;
}

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
    kind: LineItemKind;
    productVariantId: number;
    description: string | null;
    quantity: number;
    unitPrice: number;
}

export interface BackendOfferDto {
    id: number;
    customerDto: BackendCustomerDto;
    state: OfferState;
    createdAt: string;
    updatedAt: string;
    dueAt?: string;
    items: BackendOfferItemDto[];
    offerSent: boolean;
}

export interface BackendCreateOfferItemDto {
    kind: LineItemKind;
    productVariantId: number;
    description?: string;
    quantity: number;
    unitPrice: number;
}
