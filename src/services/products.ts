import {CreateProductRequest, Product, UpdateProductRequest} from '@/types/product';

export async function getProducts(): Promise<Product[]> {
    const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/products`);

    if (!response.ok) {
        throw new Error(`Failed to fetch products: ${response.status} ${response.statusText}`);
    }

    return response.json() as Promise<Product[]>;
}

export async function getProduct(id: number): Promise<Product> {
    const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/products/${id}`);

    if (!response.ok) {
        throw new Error(`Failed to fetch product with id ${id}: ${response.status} ${response.statusText}`);
    }

    return response.json() as Promise<Product>;
}

export async function createProduct(data: CreateProductRequest): Promise<Product> {
    const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/products`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(data),
    });

    if (!response.ok) {
        throw new Error(`Failed to create product: ${response.status} ${response.statusText}`);
    }

    return response.json() as Promise<Product>;
}

export async function updateProduct(id: number, data: UpdateProductRequest): Promise<Product> {
    const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/products/${id}`, {
        method: 'PUT',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(data),
    });

    if (!response.ok) {
        throw new Error(`Failed to update product with id ${id}: ${response.status} ${response.statusText}`);
    }

    return response.json() as Promise<Product>;
}

export async function deleteProduct(id: number): Promise<void> {
    const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/products/${id}`, {
        method: 'DELETE',
    });

    if (!response.ok) {
        throw new Error(`Failed to delete product with id ${id}: ${response.status} ${response.statusText}`);
    }
}
