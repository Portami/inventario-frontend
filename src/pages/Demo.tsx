import ProductCreateForm from '@/components/ProductCreateForm';
import ProductList from '@/components/ProductList';
import {createProduct, deleteProduct, fetchProducts} from '@/services/backend';
import {CreateProductRequest, Product, ProductId} from '@/types/product';
import {Alert, Box, Button, CircularProgress, Stack, Typography} from '@mui/material';
import {useCallback, useEffect, useState} from 'react';

export default function Demo() {
    const [products, setProducts] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [deletingIds, setDeletingIds] = useState<Set<ProductId>>(new Set());
    const [errorMessage, setErrorMessage] = useState('');

    const toErrorMessage = (error: unknown, fallback: string): string => {
        return error instanceof Error ? `${fallback}: ${error.message}` : fallback;
    };

    const loadProducts = useCallback(async () => {
        setIsLoading(true);
        setErrorMessage('');

        try {
            const fetchedProducts = await fetchProducts();
            setProducts(fetchedProducts);
        } catch (error) {
            setErrorMessage(toErrorMessage(error, 'Failed to load products'));
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        void loadProducts();
    }, [loadProducts]);

    const handleCreateProduct = async (payload: CreateProductRequest): Promise<boolean> => {
        setIsSubmitting(true);
        setErrorMessage('');

        try {
            const createdProduct = await createProduct(payload);
            setProducts((currentProducts) => [createdProduct, ...currentProducts]);
            return true;
        } catch (error) {
            setErrorMessage(toErrorMessage(error, 'Failed to create product'));
            return false;
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteProduct = async (productId: ProductId): Promise<void> => {
        setErrorMessage('');
        setDeletingIds((currentDeletingIds) => {
            const nextDeletingIds = new Set(currentDeletingIds);
            nextDeletingIds.add(productId);
            return nextDeletingIds;
        });

        try {
            await deleteProduct(productId);
            setProducts((currentProducts) => currentProducts.filter((product) => product.id !== productId));
        } catch (error) {
            setErrorMessage(toErrorMessage(error, 'Failed to delete product'));
        } finally {
            setDeletingIds((currentDeletingIds) => {
                const nextDeletingIds = new Set(currentDeletingIds);
                nextDeletingIds.delete(productId);
                return nextDeletingIds;
            });
        }
    };

    return (
        <div className="demo-page">
            <header className="demo-header">
                <Typography variant="h4">Products</Typography>
            </header>

            <main className="demo-content">
                <Box className="demo-box">
                    <Typography variant="body1">Display, create, and delete products from the backend API.</Typography>

                    {errorMessage ? (
                        <Alert
                            severity="error"
                            action={
                                <Button color="inherit" size="small" onClick={() => void loadProducts()}>
                                    Retry
                                </Button>
                            }
                        >
                            {errorMessage}
                        </Alert>
                    ) : null}

                    <ProductCreateForm isSubmitting={isSubmitting} existingProducts={products} onSubmit={handleCreateProduct} />

                    {isLoading ? (
                        <Stack direction="row" justifyContent="center" alignItems="center" sx={{py: 4}}>
                            <CircularProgress aria-label="loading products" />
                        </Stack>
                    ) : (
                        <ProductList products={products} onDelete={handleDeleteProduct} deletingIds={deletingIds} />
                    )}
                </Box>
            </main>

            <footer className="demo-footer">
                <Typography variant="body2">Product management demo</Typography>
            </footer>
        </div>
    );
}
