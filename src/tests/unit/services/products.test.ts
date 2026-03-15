import {createProduct, deleteProduct, getProduct, getProducts, updateProduct} from '@/services/products';

const MOCK_BASE_URL = 'http://localhost:8080';

const MOCK_PRODUCT = {
    id: 1,
    name: 'Test Product',
    description: 'A test product',
    quantity: 10,
    price: 9.99,
};

function mockFetch(ok: boolean, data: unknown, status = 500, statusText = 'Internal Server Error'): void {
    vi.spyOn(global, 'fetch').mockResolvedValue({
        ok,
        status,
        statusText,
        json: vi.fn().mockResolvedValue(data),
    } as unknown as Response);
}

beforeEach(() => {
    vi.stubEnv('VITE_BACKEND_URL', MOCK_BASE_URL);
});

afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllEnvs();
});

describe('getProducts', () => {
    it('returns products on success', async () => {
        mockFetch(true, [MOCK_PRODUCT]);

        const result = await getProducts();

        expect(global.fetch).toHaveBeenCalledWith(`${MOCK_BASE_URL}/products`);
        expect(result).toEqual([MOCK_PRODUCT]);
    });

    it('throws on error response', async () => {
        mockFetch(false, null);

        await expect(getProducts()).rejects.toThrow('Failed to fetch products: 500 Internal Server Error');
    });
});

describe('getProduct', () => {
    it('returns a product on success', async () => {
        mockFetch(true, MOCK_PRODUCT);

        const result = await getProduct(1);

        expect(global.fetch).toHaveBeenCalledWith(`${MOCK_BASE_URL}/products/1`);
        expect(result).toEqual(MOCK_PRODUCT);
    });

    it('throws on error response', async () => {
        mockFetch(false, null);

        await expect(getProduct(1)).rejects.toThrow('Failed to fetch product with id 1: 500 Internal Server Error');
    });
});

describe('createProduct', () => {
    it('returns created product on success', async () => {
        mockFetch(true, MOCK_PRODUCT);

        const requestData = {name: 'Test Product', description: 'A test product', quantity: 10, price: 9.99};
        const result = await createProduct(requestData);

        expect(global.fetch).toHaveBeenCalledWith(`${MOCK_BASE_URL}/products`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(requestData),
        });
        expect(result).toEqual(MOCK_PRODUCT);
    });

    it('throws on error response', async () => {
        mockFetch(false, null);

        await expect(createProduct({name: 'Test', description: 'A description', quantity: 1, price: 1.0})).rejects.toThrow(
            'Failed to create product: 500 Internal Server Error',
        );
    });
});

describe('updateProduct', () => {
    it('returns updated product on success', async () => {
        const updateData = {name: 'Updated Product'};
        mockFetch(true, {...MOCK_PRODUCT, ...updateData});

        const result = await updateProduct(1, updateData);

        expect(global.fetch).toHaveBeenCalledWith(`${MOCK_BASE_URL}/products/1`, {
            method: 'PUT',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(updateData),
        });
        expect(result).toEqual({...MOCK_PRODUCT, ...updateData});
    });

    it('throws on error response', async () => {
        mockFetch(false, null);

        await expect(updateProduct(1, {name: 'Updated Product'})).rejects.toThrow('Failed to update product with id 1: 500 Internal Server Error');
    });
});

describe('deleteProduct', () => {
    it('resolves without a value on success', async () => {
        mockFetch(true, null);

        await expect(deleteProduct(1)).resolves.toBeUndefined();
        expect(global.fetch).toHaveBeenCalledWith(`${MOCK_BASE_URL}/products/1`, {
            method: 'DELETE',
        });
    });

    it('throws on error response', async () => {
        mockFetch(false, null);

        await expect(deleteProduct(1)).rejects.toThrow('Failed to delete product with id 1: 500 Internal Server Error');
    });
});
