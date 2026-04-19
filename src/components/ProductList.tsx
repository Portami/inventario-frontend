import {Product, ProductId} from '@/types/product';
import {Button, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography} from '@mui/material';

type ProductListProps = {
    deletingIds: Set<ProductId>;
    // eslint-disable-next-line no-unused-vars -- Parameter is part of the callback signature for consumers to know what ID was deleted
    onDelete(productId: ProductId): Promise<void>;
    products: Product[];
};

export default function ProductList({deletingIds, onDelete, products}: ProductListProps) {
    if (!Array.isArray(products)) {
        return <Typography color="error">Error: Failed to load products (Backend might be blocking the request).</Typography>;
    }

    if (products.length === 0) {
        return <Typography>No products yet. Add your first product.</Typography>;
    }

    return (
        <TableContainer component={Paper}>
            <Table aria-label="products table">
                <TableHead>
                    <TableRow>
                        <TableCell>ID</TableCell>
                        <TableCell>Name</TableCell>
                        <TableCell>Article number</TableCell>
                        <TableCell>Type</TableCell>
                        <TableCell>Color</TableCell>
                        <TableCell align="right">Actions</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {products.map((product) => {
                        const isDeleting = deletingIds.has(product.id);

                        return (
                            <TableRow key={product.id}>
                                <TableCell>{String(product.id)}</TableCell>
                                <TableCell>{product.name || '-'}</TableCell>
                                <TableCell>{product.articleNumber}</TableCell>
                                <TableCell>{product.type}</TableCell>
                                <TableCell>{product.color}</TableCell>
                                <TableCell align="right">
                                    <Button
                                        variant="outlined"
                                        color="error"
                                        disabled={isDeleting}
                                        onClick={() => void onDelete(product.id)}
                                        aria-label={`delete product ${product.id}`}
                                    >
                                        {isDeleting ? 'Deleting...' : 'Delete'}
                                    </Button>
                                </TableCell>
                            </TableRow>
                        );
                    })}
                </TableBody>
            </Table>
        </TableContainer>
    );
}
