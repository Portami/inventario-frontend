import {CreateProductDto, ProductCategoryDto, ProductDto, ProductInventoryDto, ProductVariantDto} from './types';
import {del, get, patch, post} from '@/shared/api/http';

export const fetchProducts = (): Promise<ProductDto[]> => get<ProductDto[]>('/products');

export const fetchProductById = (id: number | string): Promise<ProductDto> => get<ProductDto>(`/products/${id}`);

export const createProduct = (payload: CreateProductDto): Promise<ProductDto> => post<ProductDto>('/products', payload);

export const patchProduct = (id: number, payload: {name?: string; categoryId?: number; attributes?: {id?: number; name: string}[]}): Promise<ProductDto> =>
    patch<ProductDto>(`/products/${id}`, payload);

export const deleteProduct = (id: number): Promise<void> => del<void>(`/products/${id}`);

export const fetchProductCategories = (): Promise<ProductCategoryDto[]> => get<ProductCategoryDto[]>('/products/categories');

export const createProductCategory = (name: string, fieldNames?: string[]): Promise<ProductCategoryDto> =>
    post<ProductCategoryDto>('/products/categories', {name, fieldNames});

export const patchProductCategory = (id: number, payload: {name?: string; fieldNames?: string[]}): Promise<ProductCategoryDto> =>
    patch<ProductCategoryDto>(`/products/categories/${id}`, payload);

export const deleteProductCategory = (id: number): Promise<void> => del<void>(`/products/categories/${id}`);

export const createProductVariant = (
    productId: number,
    payload: {name: string; price: number; attributes?: {attributeId: number; value: string}[]},
): Promise<ProductVariantDto> => post<ProductVariantDto>(`/products/${productId}/variants`, payload);

export const patchProductVariant = (
    productId: number,
    variantId: number,
    payload: {name?: string; price?: number; attributes?: {attributeId: number; value: string}[]},
): Promise<ProductVariantDto> => patch<ProductVariantDto>(`/products/${productId}/variants/${variantId}`, payload);

export const deleteProductVariant = (productId: number, variantId: number): Promise<void> => del<void>(`/products/${productId}/variants/${variantId}`);

export const changeInventory = (changes: {productVariantId: number; storageId: number; quantityChange: number}[]): Promise<ProductInventoryDto[]> =>
    post<ProductInventoryDto[]>('/products/inventory/changes', changes);
