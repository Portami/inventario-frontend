import Demo from '@/pages/Demo';
import {createProduct, deleteProduct, fetchProducts} from '@/services/backend';
import {colorLabels, COLORS, typeLabels, TYPES} from '@/types/product';
import {render, screen, waitFor} from '@testing-library/react';
import userEvent from '@testing-library/user-event';

vi.mock('@/services/backend', () => ({
    createProduct: vi.fn(),
    deleteProduct: vi.fn(),
    fetchProducts: vi.fn(),
}));

describe('Demo', () => {
    const mockedFetchProducts = vi.mocked(fetchProducts);
    const mockedCreateProduct = vi.mocked(createProduct);
    const mockedDeleteProduct = vi.mocked(deleteProduct);

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('loads and renders products', async () => {
        mockedFetchProducts.mockResolvedValueOnce([
            {
                id: 1,
                articleNumber: 'ART-001',
                name: 'Sneakers',
                type: TYPES.Wool,
                color: COLORS.Other,
            },
        ]);

        render(<Demo />);

        expect(screen.getByRole('heading', {name: /products/i})).toBeInTheDocument();
        expect(screen.getByLabelText(/loading products/i)).toBeInTheDocument();
        expect(await screen.findByText('Sneakers')).toBeInTheDocument();
        expect(mockedFetchProducts).toHaveBeenCalledTimes(1);
    });

    it('creates a product from the form', async () => {
        const user = userEvent.setup({delay: null}); // Remove artificial delays between interactions

        mockedFetchProducts.mockResolvedValueOnce([]);
        mockedCreateProduct.mockResolvedValueOnce({
            id: 22,
            articleNumber: 'ART-022',
            name: 'Windbreaker',
            type: TYPES.Blended,
            color: COLORS.Blue,
        });

        render(<Demo />);

        await screen.findByText(/no products yet/i);

        // Fill text fields
        await user.type(screen.getByRole('textbox', {name: 'Name'}), 'Windbreaker');
        await user.type(screen.getByRole('textbox', {name: /article number/i}), 'ART-022');

        // Select Type
        await user.click(screen.getByRole('combobox', {name: /select product type/i}));
        await user.click(screen.getByRole('option', {name: typeLabels[TYPES.Blended]}));

        // Select Color - must await the previous menu close before opening next
        await user.click(screen.getByRole('combobox', {name: /select product color/i}));
        await user.click(screen.getByRole('option', {name: colorLabels[COLORS.Blue]}));

        // Submit form
        await user.click(screen.getByRole('button', {name: /add product/i}));

        await screen.findByText('Windbreaker');
        expect(mockedCreateProduct).toHaveBeenCalledWith({
            articleNumber: 'ART-022',
            name: 'Windbreaker',
            type: TYPES.Blended,
            color: COLORS.Blue,
        });
    });

    it('prevents duplicate article numbers', async () => {
        const user = userEvent.setup({delay: null});

        // Mock initial products with one existing product
        mockedFetchProducts.mockResolvedValueOnce([{id: 1, articleNumber: 'ART-001', name: 'Existing Product', type: TYPES.Wool, color: COLORS.Red}]);

        render(<Demo />);

        // Wait for products to load
        await screen.findByText('Existing Product');

        // Try to create a product with duplicate article number
        await user.type(screen.getByRole('textbox', {name: 'Name'}), 'New Product');
        await user.type(screen.getByRole('textbox', {name: /article number/i}), 'ART-001');

        // Select Type and Color
        await user.click(screen.getByRole('combobox', {name: /select product type/i}));
        await user.click(screen.getByRole('option', {name: typeLabels[TYPES.Blended]}));

        await user.click(screen.getByRole('combobox', {name: /select product color/i}));
        await user.click(screen.getByRole('option', {name: colorLabels[COLORS.Blue]}));

        // Try to submit
        await user.click(screen.getByRole('button', {name: /add product/i}));

        // Verify error message appears
        expect(screen.getByText('Article number already exists')).toBeInTheDocument();
        expect(mockedCreateProduct).not.toHaveBeenCalled();
    });

    it('deletes a product from the list', async () => {
        const user = userEvent.setup();

        mockedFetchProducts.mockResolvedValueOnce([{id: 7, articleNumber: 'ART-007', name: 'Beanie', type: TYPES.Synthetic, color: COLORS.Green}]);
        mockedDeleteProduct.mockResolvedValueOnce(undefined);

        render(<Demo />);

        await screen.findByText('Beanie');
        await user.click(screen.getByRole('button', {name: /delete product 7/i}));

        await waitFor(() => {
            expect(screen.queryByText('Beanie')).not.toBeInTheDocument();
        });

        expect(mockedDeleteProduct).toHaveBeenCalledWith(7);
    });

    it('shows an error state when loading fails', async () => {
        mockedFetchProducts.mockRejectedValueOnce(new Error('boom'));

        render(<Demo />);

        expect(await screen.findByText('Failed to load products: boom')).toBeInTheDocument();
        expect(screen.getByRole('button', {name: /retry/i})).toBeInTheDocument();
    });
});
