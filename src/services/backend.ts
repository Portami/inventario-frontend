import {del, get, patch, post} from './api';
import {cacheGet, cacheInvalidate, cacheSet} from './cache';
import {ALL_BACKEND_STATES, computeInitialPath, daysFromNow, VAT_RATE} from '@/pages/constants/offerConstants';
import {Batch} from '@/types/batches.ts';
import {CreateFeltRequest, FeltDto, FeltTypeDto} from '@/types/felt';
import {
    BackendCreateOfferItemDto,
    BackendFullCustomerDto,
    BackendOfferDto,
    BackendOfferItemDto,
    CustomerWithIdDto,
    FeltCatalogItem,
    LineItemDto,
    OfferDto,
    OfferState,
    OfferSummaryDto,
    ProductCatalogItem,
} from '@/types/offerte';
import {CreateProductDto, Product, ProductCategoryDto, ProductDto, ProductId, ProductInventoryDto, ProductVariantDto} from '@/types/product';
import {CreateFeltRollRequest, FeltRollDto, UpdateFeltRollRequest} from '@/types/roll';
import {ScanResult} from '@/types/scanner';
import {Storage} from '@/types/storage';
import {Supplier} from '@/types/supplier.ts';

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

export const fetchSuppliers = async (): Promise<Supplier[]> => {
    const cached = cacheGet<FeltTypeDto[]>('suppliers');
    if (cached) return cached;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    try {
        const result = await get<Supplier[]>('/felts/suppliers', {signal: controller.signal});
        clearTimeout(timeoutId);
        cacheSet('suppliers', result);
        return result;
    } catch (error) {
        clearTimeout(timeoutId);
        throw error;
    }
};

export const fetchFeltTypes = async (): Promise<FeltTypeDto[]> => {
    const cached = cacheGet<FeltTypeDto[]>('feltTypes');
    if (cached) return cached;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    try {
        const result = await get<FeltTypeDto[]>('/felts/types', {signal: controller.signal});
        clearTimeout(timeoutId);
        cacheSet('feltTypes', result);
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

export const fetchRolls = async (): Promise<FeltRollDto[]> => {
    const cached = cacheGet<FeltRollDto[]>('rolls');
    if (cached) return cached;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    try {
        const result = await get<FeltRollDto[]>('/rolls', {signal: controller.signal});
        clearTimeout(timeoutId);
        cacheSet('rolls', result);
        return result;
    } catch (error) {
        clearTimeout(timeoutId);
        throw error;
    }
};

export const fetchRollsByFelt = async (feltId: number): Promise<FeltRollDto[]> => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    try {
        const result = await get<FeltRollDto[]>(`/felts/${feltId}/rolls`, {signal: controller.signal});
        clearTimeout(timeoutId);
        return result;
    } catch (error) {
        clearTimeout(timeoutId);
        throw error;
    }
};

export const fetchBatchesByFelt = async (feltId: number): Promise<Batch[]> => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    try {
        const result = await get<Batch[]>(`/felts/${feltId}/batches`, {signal: controller.signal});
        clearTimeout(timeoutId);
        return result;
    } catch (error) {
        clearTimeout(timeoutId);
        throw error;
    }
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

export const splitRoll = async (rollId: ProductId, payload: {width: number}): Promise<FeltRollDto> => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    try {
        const result = await post<FeltRollDto>(`/rolls/${rollId}/split`, payload, {signal: controller.signal});
        clearTimeout(timeoutId);
        cacheInvalidate('rolls');
        return result;
    } catch (error) {
        clearTimeout(timeoutId);
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

export const fetchAllScraps = async (): Promise<Product[]> => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    try {
        const result = await get<Product[]>('/scraps', {signal: controller.signal});
        clearTimeout(timeoutId);
        return result;
    } catch (error) {
        clearTimeout(timeoutId);
        throw error;
    }
};

export const fetchScrapsByFelt = async (feltId: number): Promise<Product[]> => {
    if (import.meta.env.DEV) {
        // Mock data has no feltId field, so filtering is not possible; return empty to avoid showing unrelated scraps.
        return [];
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    try {
        const result = await get<Product[]>(`/felts/${feltId}/scraps`, {signal: controller.signal});
        clearTimeout(timeoutId);
        return result;
    } catch (error) {
        clearTimeout(timeoutId);
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

export const fetchStorages = async (): Promise<Storage[]> => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    try {
        const result = await get<Storage[]>('/storages', {signal: controller.signal});
        clearTimeout(timeoutId);
        return result;
    } catch (error) {
        clearTimeout(timeoutId);
        throw error;
    }
};

export const fetchOffers = async (): Promise<OfferSummaryDto[]> => {
    const cached = cacheGet<OfferSummaryDto[]>('offers');
    if (cached) return cached;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);
    try {
        const results = await Promise.all(ALL_BACKEND_STATES.map((state) => get<BackendOfferDto[]>(`/offers?state=${state}`, {signal: controller.signal})));
        clearTimeout(timeoutId);
        const data = results.flat().map(mapBackendOfferToSummary);
        cacheSet('offers', data);
        return data;
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

export const markOfferSent = async (id: string, sent: boolean): Promise<void> => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    try {
        await patch(`/offers/${encodeURIComponent(id)}`, {offerSent: sent}, {signal: controller.signal});
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
            kind: line.kind,
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

export const fetchProductCategories = async (): Promise<ProductCategoryDto[]> => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    try {
        const result = await get<ProductCategoryDto[]>('/products/categories', {signal: controller.signal});
        clearTimeout(timeoutId);
        return result;
    } catch (error) {
        clearTimeout(timeoutId);
        throw error;
    }
};

export const patchProductCategory = async (id: number, payload: {name?: string; fieldNames?: string[]}): Promise<ProductCategoryDto> => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    try {
        const result = await patch<ProductCategoryDto>(`/products/categories/${id}`, payload, {signal: controller.signal});
        clearTimeout(timeoutId);
        cacheInvalidate('products');
        return result;
    } catch (error) {
        clearTimeout(timeoutId);
        throw error;
    }
};

export const deleteProductCategory = async (id: number): Promise<void> => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    try {
        await del<void>(`/products/categories/${id}`, {signal: controller.signal});
        clearTimeout(timeoutId);
        cacheInvalidate('products');
    } catch (error) {
        clearTimeout(timeoutId);
        throw error;
    }
};

export const createProductCategory = async (name: string, fieldNames?: string[]): Promise<ProductCategoryDto> => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    try {
        const result = await post<ProductCategoryDto>('/products/categories', {name, fieldNames}, {signal: controller.signal});
        clearTimeout(timeoutId);
        cacheInvalidate('products');
        return result;
    } catch (error) {
        clearTimeout(timeoutId);
        throw error;
    }
};

export const createProduct = async (payload: CreateProductDto): Promise<ProductDto> => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    try {
        const result = await post<ProductDto>('/products', payload, {signal: controller.signal});
        clearTimeout(timeoutId);
        cacheInvalidate('products');
        return result;
    } catch (error) {
        clearTimeout(timeoutId);
        throw error;
    }
};

export const patchProduct = async (
    id: number,
    payload: {name?: string; categoryId?: number; attributes?: {id?: number; name: string}[]},
): Promise<ProductDto> => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    try {
        const result = await patch<ProductDto>(`/products/${id}`, payload, {signal: controller.signal});
        clearTimeout(timeoutId);
        cacheInvalidate('products');
        return result;
    } catch (error) {
        clearTimeout(timeoutId);
        throw error;
    }
};

export const deleteProduct = async (id: number): Promise<void> => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    try {
        await del<void>(`/products/${id}`, {signal: controller.signal});
        clearTimeout(timeoutId);
        cacheInvalidate('products');
    } catch (error) {
        clearTimeout(timeoutId);
        throw error;
    }
};

export const deleteProductVariant = async (productId: number, variantId: number): Promise<void> => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    try {
        await del<void>(`/products/${productId}/variants/${variantId}`, {signal: controller.signal});
        clearTimeout(timeoutId);
        cacheInvalidate('products');
    } catch (error) {
        clearTimeout(timeoutId);
        throw error;
    }
};

export const createProductVariant = async (
    productId: number,
    payload: {name: string; price: number; attributes?: {attributeId: number; value: string}[]},
): Promise<ProductVariantDto> => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    try {
        const result = await post<ProductVariantDto>(`/products/${productId}/variants`, payload, {signal: controller.signal});
        clearTimeout(timeoutId);
        cacheInvalidate('products');
        return result;
    } catch (error) {
        clearTimeout(timeoutId);
        throw error;
    }
};

export const changeInventory = async (changes: {productVariantId: number; storageId: number; quantityChange: number}[]): Promise<ProductInventoryDto[]> => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    try {
        const result = await post<ProductInventoryDto[]>('/products/inventory/changes', changes, {signal: controller.signal});
        clearTimeout(timeoutId);
        cacheInvalidate('products');
        return result;
    } catch (error) {
        clearTimeout(timeoutId);
        throw error;
    }
};

export const patchProductVariant = async (
    productId: number,
    variantId: number,
    payload: {name?: string; price?: number; attributes?: {attributeId: number; value: string}[]},
): Promise<ProductVariantDto> => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    try {
        const result = await patch<ProductVariantDto>(`/products/${productId}/variants/${variantId}`, payload, {signal: controller.signal});
        clearTimeout(timeoutId);
        cacheInvalidate('products');
        return result;
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
