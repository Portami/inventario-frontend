import {del, get, patch, post} from './api';
import {cacheGet, cacheInvalidate, cacheSet} from './cache';
import {ALL_BACKEND_STATES, OFFER_PATH_A, VAT_RATE} from '@/pages/constants/offerConstants';
import {CreateFeltRequest, FeltDto} from '@/types/felt';
import {
    BackendCreateOfferItemDto,
    BackendFullCustomerDto,
    BackendOfferDto,
    BackendOfferItemDto,
    CustomerWithIdDto,
    FeltCatalogItem,
    LineItemDto,
    LineItemKind,
    OfferDto,
    OfferState,
    OfferSummaryDto,
    ProductCatalogItem,
} from '@/types/offerte';
import {Product, ProductDto, ProductId} from '@/types/product';
import {CreateFeltRollRequest, FeltRollDto, UpdateFeltRollRequest} from '@/types/roll';
import {ScanResult} from '@/types/scanner';

function mapBackendOffer(raw: BackendOfferDto): OfferDto {
    return {
        id: String(raw.id),
        number: `A-${raw.id}`,
        createdISO: raw.createdAt ? raw.createdAt.substring(0, 10) : new Date().toISOString().substring(0, 10),
        dueISO: raw.dueAt ? raw.dueAt.substring(0, 10) : undefined,
        state: raw.state,
        path: OFFER_PATH_A,
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
            kind: 'PRODUKT' as LineItemKind,
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
    };
}

function mapBackendOfferToSummary(raw: BackendOfferDto): OfferSummaryDto {
    const total = raw.items.reduce((sum, item) => sum + Number(item.unitPrice) * item.quantity, 0);
    return {
        id: String(raw.id),
        state: raw.state,
        customer: raw.customerDto.name,
        contact: raw.customerDto.contactPerson ?? '',
        city: raw.customerDto.city ?? '',
        lines: raw.items.length,
        total,
        vat: total * VAT_RATE,
        createdISO: raw.createdAt ? raw.createdAt.substring(0, 10) : new Date().toISOString().substring(0, 10),
        dueISO: raw.dueAt ? raw.dueAt.substring(0, 10) : raw.createdAt ? raw.createdAt.substring(0, 10) : new Date().toISOString().substring(0, 10),
        path: 'A',
        overdue: 0,
        reservedScraps: 0,
        taggedRolls: 0,
    };
}

function mapBackendCustomer(raw: BackendFullCustomerDto): CustomerWithIdDto {
    return {
        id: String(raw.id),
        customerNumber: String(raw.id),
        name: raw.name,
        contactPerson: raw.contactPerson ?? '',
        email: raw.email ?? '',
        phone: raw.phone ?? '',
        street: raw.street ?? '',
        zip: raw.zip ?? '',
        city: raw.city ?? '',
        country: raw.country ?? '',
        vatNumber: raw.vatNumber ?? '',
    };
}

/**
 * Lookup a roll or scrap piece by Data Matrix code.
 * Calls GET /api/barcodes/{code} and normalizes the response to ScanResult.
 *
 * @param code - 5-digit roll code to lookup
 * @returns Promise with scan result (type and ID)
 */
export const lookupRollCode = async (code: string): Promise<ScanResult> => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    try {
        const raw = await get<{type: string; id: number}>(`/barcodes/${encodeURIComponent(code)}`, {
            signal: controller.signal,
        });
        clearTimeout(timeoutId);
        return {
            // Backend returns "scrap"; frontend uses "scrap_piece"
            type: raw.type === 'scrap' ? 'scrap_piece' : 'roll',
            id: String(raw.id),
        };
    } catch (error) {
        clearTimeout(timeoutId);
        console.warn(`Failed to lookup barcode: ${error}`);
        throw error;
    }
};

/**
 * Fetch details for a specific roll.
 * Calls GET /api/rolls/{id}.
 *
 * @param rollId - ID of the roll to fetch
 * @returns Promise with roll details
 */
export const fetchRollDetails = async (rollId: ProductId): Promise<FeltRollDto> => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    try {
        const result = await get<FeltRollDto>(`/rolls/${rollId}`, {
            signal: controller.signal,
        });
        clearTimeout(timeoutId);
        return result;
    } catch (error) {
        clearTimeout(timeoutId);
        console.warn(`Failed to fetch roll details from backend: ${error}`);
        throw error;
    }
};

export const fetchFelts = async (): Promise<FeltDto[]> => {
    const cached = cacheGet<FeltDto[]>('felts');
    if (cached) return cached;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    try {
        const result = await get<FeltDto[]>('/felts', {signal: controller.signal});
        clearTimeout(timeoutId);
        cacheSet('felts', result);
        return result;
    } catch (error) {
        clearTimeout(timeoutId);
        throw error;
    }
};

export const createFelt = async (payload: CreateFeltRequest): Promise<FeltDto> => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    try {
        const result = await post<FeltDto>('/felts', payload, {signal: controller.signal});
        clearTimeout(timeoutId);
        cacheInvalidate('felts');
        cacheInvalidate('rolls');
        return result;
    } catch (error) {
        clearTimeout(timeoutId);
        throw error;
    }
};

export const updateFelt = async (id: number, payload: CreateFeltRequest): Promise<FeltDto> => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    try {
        const result = await patch<FeltDto>(`/felts/${id}`, payload, {signal: controller.signal});
        clearTimeout(timeoutId);
        cacheInvalidate('felts');
        cacheInvalidate('rolls');
        return result;
    } catch (error) {
        clearTimeout(timeoutId);
        throw error;
    }
};

/** Delete a felt. Calls DELETE /api/felts/{id}. */
export const deleteFelt = async (feltId: number): Promise<void> => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    try {
        await del<void>(`/felts/${feltId}`, {signal: controller.signal});
        clearTimeout(timeoutId);
        cacheInvalidate('felts');
        cacheInvalidate('rolls');
    } catch (error) {
        clearTimeout(timeoutId);
        console.warn(`Failed to delete felt: ${error}`);
        throw error;
    }
};

// No global list endpoint, fetches felts first, then their rolls in parallel.
export const fetchRolls = async (): Promise<FeltRollDto[]> => {
    const cached = cacheGet<FeltRollDto[]>('rolls');
    if (cached) return cached;

    const felts = await fetchFelts();
    const rollGroups = await Promise.all(felts.map((f) => get<FeltRollDto[]>(`/felts/${f.id}/rolls`)));
    const result = rollGroups.flat();
    cacheSet('rolls', result);
    return result;
};

export const createRoll = async (payload: CreateFeltRollRequest): Promise<FeltRollDto> => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    try {
        const result = await post<FeltRollDto>('/rolls', payload, {signal: controller.signal});
        clearTimeout(timeoutId);
        cacheInvalidate('rolls');
        return result;
    } catch (error) {
        clearTimeout(timeoutId);
        throw error;
    }
};

export const updateRoll = async (rollId: ProductId, payload: UpdateFeltRollRequest): Promise<FeltRollDto> => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    try {
        const result = await patch<FeltRollDto>(`/rolls/${rollId}`, payload, {signal: controller.signal});
        clearTimeout(timeoutId);
        cacheInvalidate('rolls');
        return result;
    } catch (error) {
        clearTimeout(timeoutId);
        console.warn(`Failed to update roll: ${error}`);
        throw error;
    }
};

/**
 * Delete a roll. Calls DELETE /api/rolls/{id}.
 */
export const deleteRoll = async (rollId: ProductId): Promise<void> => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    try {
        await del<void>(`/rolls/${rollId}`, {signal: controller.signal});
        clearTimeout(timeoutId);
        cacheInvalidate('rolls');
    } catch (error) {
        clearTimeout(timeoutId);
        console.warn(`Failed to delete roll: ${error}`);
        throw error;
    }
};

export const fetchScrapDetails = async (scrapId: ProductId): Promise<Product> => {
    const roll = await fetchRollDetails(scrapId);
    return {
        id: roll.id,
        articleNumber: roll.articleNumber,
        name: `${roll.feltTypeName} · ${roll.color}`,
        length: roll.length,
        width: roll.width,
    };
};

export const fetchProducts = async (): Promise<ProductDto[]> => {
    const cached = cacheGet<ProductDto[]>('products');
    if (cached) return cached;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    try {
        const result = await get<ProductDto[]>('/products', {signal: controller.signal});
        clearTimeout(timeoutId);
        cacheSet('products', result);
        return result;
    } catch (error) {
        clearTimeout(timeoutId);
        throw error;
    }
};

export const fetchOffers = async (): Promise<OfferSummaryDto[]> => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);
    try {
        const results = await Promise.all(ALL_BACKEND_STATES.map((state) => get<BackendOfferDto[]>(`/offers?state=${state}`, {signal: controller.signal})));
        clearTimeout(timeoutId);
        return results.flat().map(mapBackendOfferToSummary);
    } catch (error) {
        clearTimeout(timeoutId);
        throw error;
    }
};

export const fetchOffer = async (id: string): Promise<OfferDto> => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    try {
        const raw = await get<BackendOfferDto>(`/offers/${encodeURIComponent(id)}`, {signal: controller.signal});
        clearTimeout(timeoutId);
        return mapBackendOffer(raw);
    } catch (error) {
        clearTimeout(timeoutId);
        throw error;
    }
};

export const changeOfferState = async (id: string, state: OfferState): Promise<void> => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    try {
        await patch(`/offers/${encodeURIComponent(id)}`, {state}, {signal: controller.signal});
        clearTimeout(timeoutId);
    } catch (error) {
        clearTimeout(timeoutId);
        throw error;
    }
};

export const patchOfferLine = async (offerId: string, lineId: string, changes: Partial<LineItemDto>): Promise<void> => {
    const itemUpdate: Record<string, unknown> = {id: Number(lineId)};
    if (changes.quantity !== undefined) itemUpdate.quantity = changes.quantity;
    if (changes.pricePerUnit !== undefined) itemUpdate.unitPrice = changes.pricePerUnit;
    if (changes.description !== undefined) itemUpdate.description = changes.description;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    try {
        await patch(`/offers/${encodeURIComponent(offerId)}`, {items: [itemUpdate]}, {signal: controller.signal});
        clearTimeout(timeoutId);
    } catch (error) {
        clearTimeout(timeoutId);
        throw error;
    }
};

export const deleteOfferLine = async (offerId: string, lineId: string): Promise<void> => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    try {
        await del(`/offers/${encodeURIComponent(offerId)}/items/${encodeURIComponent(lineId)}`, {signal: controller.signal});
        clearTimeout(timeoutId);
    } catch (error) {
        clearTimeout(timeoutId);
        throw error;
    }
};

export const addOfferLine = async (offerId: string, productVariantId: number, line: Omit<LineItemDto, 'id'>): Promise<LineItemDto> => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    try {
        const payload: BackendCreateOfferItemDto = {
            productVariantId,
            description: line.description || undefined,
            quantity: line.quantity,
            unitPrice: line.pricePerUnit,
        };
        const raw = await post<BackendOfferItemDto>(`/offers/${encodeURIComponent(offerId)}/items`, payload, {signal: controller.signal});
        clearTimeout(timeoutId);
        return {...line, id: String(raw.id), variantId: productVariantId};
    } catch (error) {
        clearTimeout(timeoutId);
        throw error;
    }
};

export const updateOfferDueDate = async (id: string, dueISO: string): Promise<void> => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    try {
        const dueAt = `${dueISO}T12:00:00Z`;
        await patch(`/offers/${encodeURIComponent(id)}`, {dueAt}, {signal: controller.signal});
        clearTimeout(timeoutId);
    } catch (error) {
        clearTimeout(timeoutId);
        throw error;
    }
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

export const updateCustomer = async (
    id: string,
    dto: {
        name?: string;
        contactPerson?: string;
        email?: string;
        phone?: string;
        street?: string;
        zip?: string;
        city?: string;
        country?: string;
        vatNumber?: string;
    },
): Promise<CustomerWithIdDto> => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    try {
        const raw = await patch<BackendFullCustomerDto>(`/customers/${encodeURIComponent(id)}`, dto, {signal: controller.signal});
        clearTimeout(timeoutId);
        return mapBackendCustomer(raw);
    } catch (error) {
        clearTimeout(timeoutId);
        throw error;
    }
};

export const createCustomer = async (dto: {
    name: string;
    contactPerson?: string;
    email?: string;
    phone?: string;
    street?: string;
    zip?: string;
    city?: string;
    country?: string;
    vatNumber?: string;
}): Promise<CustomerWithIdDto> => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    try {
        const raw = await post<BackendFullCustomerDto>('/customers', dto, {signal: controller.signal});
        clearTimeout(timeoutId);
        return mapBackendCustomer(raw);
    } catch (error) {
        clearTimeout(timeoutId);
        throw error;
    }
};

export const fetchCustomers = async (): Promise<CustomerWithIdDto[]> => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    try {
        const result = await get<BackendFullCustomerDto[]>('/customers', {signal: controller.signal});
        clearTimeout(timeoutId);
        return result.map(mapBackendCustomer);
    } catch (error) {
        clearTimeout(timeoutId);
        throw error;
    }
};

export const createOffer = async (customerName: string, items: BackendCreateOfferItemDto[]): Promise<OfferDto> => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    try {
        const raw = await post<BackendOfferDto>('/offers', {customerName, items}, {signal: controller.signal});
        clearTimeout(timeoutId);
        return mapBackendOffer(raw);
    } catch (error) {
        clearTimeout(timeoutId);
        throw error;
    }
};

export const deleteOffer = async (id: string): Promise<void> => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    try {
        await del(`/offers/${encodeURIComponent(id)}`, {signal: controller.signal});
        clearTimeout(timeoutId);
    } catch (error) {
        clearTimeout(timeoutId);
        throw error;
    }
};

export const fetchProductById = async (id: number | string): Promise<ProductDto> => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    try {
        const result = await get<ProductDto>(`/products/${id}`, {signal: controller.signal});
        clearTimeout(timeoutId);
        return result;
    } catch (error) {
        clearTimeout(timeoutId);
        throw error;
    }
};
