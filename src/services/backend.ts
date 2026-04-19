import {del, get, post} from './api';
import {getMockProductById, getMockProducts} from './mock/backendMock.ts';
import {getMockScanResult} from './mock/scannerMock.ts';
import {ProductFilters} from '@/types/felt';
import {CreateProductRequest, Product, ProductId} from '@/types/product';
import {ScanResult} from '@/types/scanner';

const buildProductQuery = (filters?: ProductFilters): string => {
    if (!filters) {
        return '';
    }

    const searchParams = new URLSearchParams();

    if (filters.type) {
        searchParams.set('type', filters.type);
    }

    if (filters.color) {
        searchParams.set('color', filters.color);
    }

    const serialized = searchParams.toString();
    return serialized ? `?${serialized}` : '';
};

/**
 * Fetch all products (rolls) with optional filtering
 * Uses mock data in development mode to avoid blocking on missing backend
 * TODO: Implement backend endpoint GET /api/products
 * Backend should support filters: ?type=WOOL&color=RED
 *
 * @param filters - Optional filters (type and/or color)
 * @returns Promise with array of products
 */
export const fetchProducts = async (filters?: ProductFilters): Promise<Product[]> => {
    // In development, use mock data immediately instead of waiting for backend
    if (import.meta.env.DEV) {
        return getMockProducts(filters);
    }

    // In production, try backend with timeout
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

        const result = await get<Product[]>(`/products${buildProductQuery(filters)}`, {
            signal: controller.signal,
        });

        clearTimeout(timeoutId);
        return result;
    } catch (error) {
        // Fallback to mock data on any error
        console.warn('Failed to fetch products from backend, using mock data:', error);
        return getMockProducts(filters);
    }
};

/**
 * Create a new product (roll)
 * Uses mock implementation in development mode
 * TODO: Implement backend endpoint POST /api/products
 * Backend should accept product data and return created product with ID
 *
 * @param payload - Product creation request
 * @returns Promise with created product
 */
export const createProduct = async (payload: CreateProductRequest): Promise<Product> => {
    // In development, use mock data immediately
    if (import.meta.env.DEV) {
        // Generate a mock ID
        const newId = String(Math.max(...getMockProducts().map((p) => Number.parseInt(String(p.id), 10)))) + 1;
        return {
            id: newId,
            ...payload,
        };
    }

    // In production, try backend with timeout
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

        const result = await post<Product>('/products', payload, {
            signal: controller.signal,
        });

        clearTimeout(timeoutId);
        return result;
    } catch (error) {
        console.warn('Failed to create product on backend, using mock:', error);
        // Fallback to mock implementation
        const newId = String(Math.max(...getMockProducts().map((p) => Number.parseInt(String(p.id), 10)))) + 1;
        return {
            id: newId,
            ...payload,
        };
    }
};

/**
 * Delete a product (roll)
 * Uses mock implementation in development mode
 * TODO: Implement backend endpoint DELETE /api/products/:id
 * Backend should remove the product and return success/error
 *
 * @param productId - ID of product to delete
 * @returns Promise that resolves when deletion is complete
 */
export const deleteProduct = async (productId: ProductId): Promise<void> => {
    // In development, use mock immediately
    if (import.meta.env.DEV) {
        // In a real implementation, this would remove from backend
        return;
    }

    // In production, try backend with timeout
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

        const result = await del<void>(`/products/${productId}`, {
            signal: controller.signal,
        });

        clearTimeout(timeoutId);
        return result;
    } catch (error) {
        console.warn('Failed to delete product on backend, using mock:', error);
        // Fallback to mock implementation
        return;
    }
};

/**
 * Lookup a roll by Data Matrix code
 * Uses mock data in development mode for immediate response
 * TODO: Implement backend endpoint GET /api/rolls/lookup
 * Backend should accept code parameter and return roll info with type (roll or scrap_piece)
 *
 * @param code - 5-digit roll code to lookup
 * @returns Promise with scan result (type and ID)
 */
export const lookupRollCode = async (code: string): Promise<ScanResult> => {
    // In development, use mock data immediately
    if (import.meta.env.DEV) {
        const mockResult = getMockScanResult(code);
        if (mockResult) {
            return mockResult;
        }
        throw new Error(`Code ${code} not found in mock data`);
    }

    // In production, try backend with timeout
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

        const result = await get<ScanResult>(`/rolls/lookup?code=${encodeURIComponent(code)}`, {
            signal: controller.signal,
        });

        clearTimeout(timeoutId);
        return result;
    } catch (error) {
        console.warn(`Failed to lookup roll code on backend: ${error}`);
        throw error;
    }
};

/**
 * Fetch details for a specific roll
 * Uses mock data in development mode
 * TODO: Implement backend endpoint GET /api/rolls/:id
 * Backend should return full roll information including dimensions
 *
 * @param rollId - ID of the roll to fetch
 * @returns Promise with roll details
 */
export const fetchRollDetails = async (rollId: ProductId): Promise<Product> => {
    // In development, use mock data immediately
    if (import.meta.env.DEV) {
        const mockProduct = getMockProductById(rollId);
        if (mockProduct) {
            return mockProduct;
        }
        throw new Error(`Roll ${rollId} not found in mock data`);
    }

    // In production, try backend with timeout
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

        const result = await get<Product>(`/rolls/${rollId}`, {
            signal: controller.signal,
        });

        clearTimeout(timeoutId);
        return result;
    } catch (error) {
        console.warn(`Failed to fetch roll details from backend: ${error}`);
        throw error;
    }
};

/**
 * Fetch details for a specific scrap piece
 * Uses mock data in development mode
 * TODO: Implement backend endpoint GET /api/scraps/:id
 * Backend should return full scrap piece information
 *
 * @param scrapId - ID of the scrap piece to fetch
 * @returns Promise with scrap details
 */
export const fetchScrapDetails = async (scrapId: ProductId): Promise<Product> => {
    // In development, use mock data immediately
    if (import.meta.env.DEV) {
        // For now, treat scraps the same as products
        const mockProduct = getMockProductById(scrapId);
        if (mockProduct) {
            return mockProduct;
        }
        throw new Error(`Scrap ${scrapId} not found in mock data`);
    }

    // In production, try backend with timeout
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

        const result = await get<Product>(`/scraps/${scrapId}`, {
            signal: controller.signal,
        });

        clearTimeout(timeoutId);
        return result;
    } catch (error) {
        console.warn(`Failed to fetch scrap details from backend: ${error}`);
        throw error;
    }
};
