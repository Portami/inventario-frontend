import {del, get, patch, post} from './api';
import {cacheGet, cacheInvalidate, cacheSet} from './cache';
import {getMockProductById, MOCK_FELTS} from './mock/backendMock.ts';
import {CreateFeltRequest, FeltDto} from '@/types/felt';
import {Product, ProductDto, ProductId} from '@/types/product';
import {CreateFeltRollRequest, FeltRollDto, UpdateFeltRollRequest} from '@/types/roll';
import {ScanResult} from '@/types/scanner';

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
    if (import.meta.env.DEV) {
        return MOCK_FELTS;
    }

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

/**
 * Fetch details for a specific scrap piece.
 * TODO: replace mock with GET /api/scraps/{id} once the endpoint is available.
 *
 * @param scrapId - ID of the scrap piece to fetch
 * @returns Promise with scrap details
 */
export const fetchScrapDetails = async (scrapId: ProductId): Promise<Product> => {
    if (import.meta.env.DEV) {
        const mockProduct = getMockProductById(scrapId);
        if (mockProduct) {
            return mockProduct;
        }
        throw new Error(`Scrap ${scrapId} not found in mock data`);
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    try {
        const result = await get<Product>(`/scraps/${scrapId}`, {
            signal: controller.signal,
        });
        clearTimeout(timeoutId);
        return result;
    } catch (error) {
        clearTimeout(timeoutId);
        console.warn(`Failed to fetch scrap details from backend: ${error}`);
        throw error;
    }
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
