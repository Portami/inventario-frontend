export type OfferState = 'OFFERTE' | 'AUFTRAGSBESTAETIGUNG' | 'RECHNUNG' | 'ZAHLUNGSERINNERUNG' | 'MAHNUNG_1' | 'MAHNUNG_2' | 'BEZAHLT';

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
