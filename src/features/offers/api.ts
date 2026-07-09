import {ALL_BACKEND_STATES, computeInitialPath, daysFromNow, VAT_RATE} from './constants';
import {
    BackendCreateOfferItemDto,
    BackendOfferDto,
    BackendOfferItemDto,
    FeltCatalogItem,
    LineItemDto,
    OfferDto,
    OfferState,
    OfferSummaryDto,
    ProductCatalogItem,
} from './types';
import {fetchFelts} from '@/features/felts';
import {fetchProducts} from '@/features/products';
import {del, get, patch, post} from '@/shared/api/http';

/** Query keys for the offers feature. */
export const offerKeys = {list: ['offers'] as const};

const toDateISO = (s?: string | null): string => (s ?? new Date().toISOString()).substring(0, 10);

function mapBackendOffer(raw: BackendOfferDto): OfferDto {
    return {
        id: String(raw.id),
        number: `A-${raw.id}`,
        createdISO: toDateISO(raw.createdAt),
        dueISO: raw.dueAt ? toDateISO(raw.dueAt) : undefined,
        state: raw.state,
        path: computeInitialPath(raw.state),
        customer: {
            customerNumber: String(raw.customerDto.id),
            name: raw.customerDto.name,
            contactPerson: raw.customerDto.contactPerson ?? '',
            email: raw.customerDto.email ?? '',
            phone: raw.customerDto.phone ?? '',
            street: raw.customerDto.street ?? '',
            zip: raw.customerDto.zip ?? '',
            city: raw.customerDto.city ?? '',
            country: raw.customerDto.country ?? '',
            vatNumber: raw.customerDto.vatNumber ?? '',
        },
        lines: raw.items.map((item) => ({
            id: String(item.id),
            kind: item.kind,
            articleNumber: String(item.productVariantId),
            feltTypeName: item.description ?? '',
            color: null,
            description: item.description ?? '',
            quantity: item.quantity,
            unit: 'Stk.',
            pricePerUnit: Number(item.unitPrice),
            cutSurcharge: 0,
            extras: 0,
            discount: 0,
            reservation: null,
            variantId: item.productVariantId,
        })),
        history: [],
        offerSent: raw.offerSent ?? false,
    };
}

function mapBackendOfferToSummary(raw: BackendOfferDto): OfferSummaryDto {
    const total = raw.items.reduce((sum, item) => sum + Number(item.unitPrice) * item.quantity, 0);
    const dueISO = raw.dueAt ? toDateISO(raw.dueAt) : toDateISO(raw.createdAt);
    return {
        id: String(raw.id),
        state: raw.state,
        customer: raw.customerDto.name,
        contact: raw.customerDto.contactPerson ?? '',
        city: raw.customerDto.city ?? '',
        lines: raw.items.length,
        total,
        vat: total * VAT_RATE,
        createdISO: toDateISO(raw.createdAt),
        dueISO,
        path: 'A',
        overdue: raw.dueAt ? Math.max(0, -daysFromNow(toDateISO(raw.dueAt))) : 0,
        reservedScraps: 0,
        taggedRolls: 0,
    };
}

export const fetchOffers = async (): Promise<OfferSummaryDto[]> => {
    // The per-state fan-out needs more headroom than the default request timeout.
    const signal = AbortSignal.timeout(10000);
    const results = await Promise.all(ALL_BACKEND_STATES.map((state) => get<BackendOfferDto[]>(`/offers?state=${state}`, {signal})));
    return results.flat().map(mapBackendOfferToSummary);
};

export const fetchOffer = async (id: string): Promise<OfferDto> => mapBackendOffer(await get<BackendOfferDto>(`/offers/${encodeURIComponent(id)}`));

export const createOffer = async (customerName: string, items: BackendCreateOfferItemDto[]): Promise<OfferDto> =>
    mapBackendOffer(await post<BackendOfferDto>('/offers', {customerName, items}));

export const changeOfferState = async (id: string, state: OfferState): Promise<void> => {
    await patch(`/offers/${encodeURIComponent(id)}`, {state});
};

export const markOfferSent = async (id: string, sent: boolean): Promise<void> => {
    await patch(`/offers/${encodeURIComponent(id)}`, {offerSent: sent});
};

export const updateOfferDueDate = async (id: string, dueISO: string): Promise<void> => {
    await patch(`/offers/${encodeURIComponent(id)}`, {dueAt: `${dueISO}T12:00:00Z`});
};

export const deleteOfferLine = async (offerId: string, lineId: string): Promise<void> => {
    await del(`/offers/${encodeURIComponent(offerId)}/items/${encodeURIComponent(lineId)}`);
};

export const addOfferLine = async (offerId: string, productVariantId: number, line: Omit<LineItemDto, 'id'>): Promise<LineItemDto> => {
    const payload: BackendCreateOfferItemDto = {
        kind: line.kind,
        productVariantId,
        description: line.description || undefined,
        quantity: line.quantity,
        unitPrice: line.pricePerUnit,
    };
    const raw = await post<BackendOfferItemDto>(`/offers/${encodeURIComponent(offerId)}/items`, payload);
    return {...line, id: String(raw.id), variantId: productVariantId};
};

export const fetchFeltCatalog = async (): Promise<FeltCatalogItem[]> => {
    const felts = await fetchFelts();
    return felts.map((f) => ({
        id: f.id,
        articleNumber: f.articleNumber,
        feltTypeName: f.feltTypeName,
        color: f.color,
        thickness: f.thickness,
        density: f.density,
        pricePerSqm: f.price,
        supplierName: f.supplierName,
    }));
};

export const fetchProductCatalog = async (): Promise<ProductCatalogItem[]> => {
    const products = await fetchProducts();
    return products.flatMap((p) =>
        p.variants.map((v) => ({
            id: v.id,
            articleNumber: String(v.id),
            name: p.variants.length === 1 ? p.name : `${p.name} · ${v.name}`,
            price: v.price,
        })),
    );
};
