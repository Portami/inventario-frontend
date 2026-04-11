import {del, get, post} from './api';
import {CreateProductRequest, Product, ProductFilters, ProductId} from '@/types/product';

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

export const fetchProducts = (filters?: ProductFilters): Promise<Product[]> => {
    return get<Product[]>(`/products${buildProductQuery(filters)}`);
};

export const createProduct = (payload: CreateProductRequest): Promise<Product> => {
    return post<Product>('/products', payload);
};

export const deleteProduct = (productId: ProductId): Promise<void> => {
    return del<void>(`/products/${productId}`);
};
