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

export type ProductCategoryDto = {
    readonly id: number;
    readonly name: string;
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

export type ProductVariantDto = {
    readonly id: number;
    readonly name: string;
    readonly price: number;
    readonly attributes: ProductVariantAttributeDto[];
};

export type ProductDto = {
    readonly id: number;
    readonly name: string;
    readonly category: ProductCategoryDto;
    readonly variants: ProductVariantDto[];
    readonly attributes: ProductAttributeDto[];
};
