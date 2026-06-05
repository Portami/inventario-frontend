import {Felt} from './felt';

export type ProductId = number | string;

/** Legacy type used by scrap mock data. */
export type Product = {
    id: ProductId;
    articleNumber: string;
    name?: string;
    length?: number;
    width?: number;
    felt?: Felt;
};

// Backend product catalog types (GET /api/products)

export type CategoryFieldDto = {
    readonly id: number;
    readonly name: string;
};

export type ProductCategoryDto = {
    readonly id: number;
    readonly name: string;
    readonly fields: CategoryFieldDto[];
};

export type ProductAttributeDto = {
    readonly id: number;
    readonly name: string;
};

export type ProductVariantAttributeDto = {
    readonly id: number;
    readonly attributeId: number;
    readonly value: string;
};

export type ProductInventoryDto = {
    readonly storageId: number;
    readonly storageName: string;
    readonly quantity: number;
};

export type ProductVariantDto = {
    readonly id: number;
    readonly name: string;
    readonly price: number;
    readonly inventory: ProductInventoryDto[];
    readonly attributes: ProductVariantAttributeDto[];
};

export type CreateProductVariantDto = {
    name: string;
    price: number;
};

export type CreateProductDto = {
    name: string;
    categoryId: number;
    attributes?: {name: string}[];
};

export type ProductDto = {
    readonly id: number;
    readonly name: string;
    readonly category: ProductCategoryDto;
    readonly variants: ProductVariantDto[];
    readonly attributes: ProductAttributeDto[];
};
