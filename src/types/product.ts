export interface Product {
    id: number;
    name: string;
    description: string;
    quantity: number;
    price: number;
}

export interface CreateProductRequest {
    name: string;
    description: string;
    quantity: number;
    price: number;
}

export interface UpdateProductRequest {
    name?: string;
    description?: string;
    quantity?: number;
    price?: number;
}
