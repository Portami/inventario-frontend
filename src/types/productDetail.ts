export type ProductAttribute = {
    label: string;
    value: string;
};

export type ProductDetail = {
    name: string;
    sku: string;
    description: string;
    stock: number;
    price: string;
    attributes: ProductAttribute[];
};

export type Currency = 'CHF';

export type GetProductDetailResponse = {
    data: ProductDetail;
    status: 'success' | 'error';
    message?: string;
};

export type ProductSpecificationsProps = {
    attributes: ProductAttribute[];
};

export const PRODUCT_STATUS = {
    IN_STOCK: 'IN_STOCK',
    OUT_OF_STOCK: 'OUT_OF_STOCK',
} as const;
