import ExpandableDataGrid, {ExpandableDataGridRow} from '@/components/ExpandableDataGrid.tsx';
import ListPage from '@/components/ListPage';
import ConfirmDeleteDialog from '@/components/products/ConfirmDeleteDialog';
import CreateProductDialog from '@/components/products/CreateProductDialog';
import SearchField from '@/components/SearchField.tsx';
import {useToast} from '@/components/ToastProvider';
import {deleteProduct, fetchProducts} from '@/services/backend';
import {ProductDto, ProductVariantDto} from '@/types/product';
import {toErrorMessage} from '@/utils/pageUtils';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import {Button, IconButton, Tooltip} from '@mui/material';
import {GridColDef} from '@mui/x-data-grid';
import {useCallback, useEffect, useState} from 'react';
import {useNavigate} from 'react-router';

type ProductRow = ExpandableDataGridRow<ProductDto, ProductVariantDto>;

export default function ProductsPage() {
    const showToast = useToast();
    const [products, setProducts] = useState<ProductDto[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [createOpen, setCreateOpen] = useState(false);
    const [deletingProduct, setDeletingProduct] = useState<ProductDto | null>(null);
    const [isDeletingProduct, setIsDeletingProduct] = useState(false);
    const navigate = useNavigate();

    const load = useCallback(async () => {
        setIsLoading(true);
        try {
            setProducts(await fetchProducts());
        } catch (err) {
            setError(toErrorMessage(err, 'Produkte konnten nicht geladen werden'));
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        void load();
    }, [load]);

    const getProductSearchableValues = useCallback((product: ProductDto) => {
        return [product.id, product.name, product.category?.name, product.variants?.length, ...product.variants.map((variant) => variant.name)];
    }, []);

    const columns: GridColDef<ProductRow>[] = [
        {
            field: 'name',
            headerName: 'Name',
            flex: 2,
            valueGetter: (_value, row) => {
                return row.rowType === 'parent' ? row.parent.name : row.child.name;
            },
            renderCell: ({row}) => {
                const name = row.rowType === 'parent' ? row.parent.name : row.child.name;

                return row.rowType === 'child' ? <span style={{paddingLeft: 32}}>{name}</span> : name;
            },
        },
        {
            field: 'category',
            headerName: 'Kategorie',
            flex: 1,
            valueGetter: (_value, row) => {
                return row.rowType === 'parent' ? row.parent.category.name : '';
            },
        },
        {
            field: 'variants',
            headerName: 'Varianten',
            width: 110,
            valueGetter: (_value, row) => {
                return row.rowType === 'parent' ? row.parent.variants.length : '';
            },
        },
        {
            field: 'price',
            headerName: 'Preis',
            width: 120,
            valueGetter: (_value, row) => {
                if (row.rowType === 'child') return row.child.price;
                const first = row.parent.variants[0];
                return first ? first.price : '';
            },
            valueFormatter: (value) => (value === '' ? '' : `CHF ${Number(value).toFixed(2)}`),
        },
        {
            field: 'actions',
            headerName: '',
            width: 56,
            sortable: false,
            renderCell: ({row}) =>
                row.rowType === 'parent' ? (
                    <Tooltip title="Produkt löschen">
                        <IconButton
                            size="small"
                            color="error"
                            onClick={(e) => {
                                e.stopPropagation();
                                setDeletingProduct(row.parent);
                            }}
                        >
                            <DeleteIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                ) : null,
        },
    ];

    return (
        <>
            <ListPage
                title="Produkte"
                description="Übersicht aller Produkte."
                actions={
                    <Button variant="contained" startIcon={<AddIcon />} onClick={() => setCreateOpen(true)}>
                        Neues Produkt
                    </Button>
                }
                isLoading={isLoading}
                isEmpty={false}
                error={error}
                onErrorClose={() => setError('')}
            >
                <SearchField items={products} getSearchableValues={getProductSearchableValues}>
                    {(filteredProducts) => (
                        <ExpandableDataGrid
                            items={filteredProducts}
                            columns={columns}
                            loading={isLoading}
                            getParentId={(product) => product.id}
                            getChildren={(product) => product.variants}
                            getChildId={(variant) => variant.id}
                            onParentRowClick={(product) => {
                                void navigate(`/product/${product.id}`);
                            }}
                            getParentSortValue={(product, field) => {
                                switch (field) {
                                    case 'name':
                                        return product.name;
                                    case 'category':
                                        return product.category.name;
                                    case 'variants':
                                        return product.variants.length;
                                    default:
                                        return undefined;
                                }
                            }}
                            sx={{
                                cursor: 'pointer',
                                '& .expandable-grid-child-row': {
                                    bgcolor: 'action.hover',
                                },
                            }}
                            pageSizeOptions={[25, 50, 100]}
                            initialState={{
                                pagination: {
                                    paginationModel: {
                                        pageSize: 25,
                                    },
                                },
                            }}
                        />
                    )}
                </SearchField>
            </ListPage>
            <CreateProductDialog
                open={createOpen}
                onClose={() => setCreateOpen(false)}
                onSaved={() => {
                    setCreateOpen(false);
                    void load();
                }}
            />
            <ConfirmDeleteDialog
                open={deletingProduct != null}
                title="Produkt löschen"
                message={deletingProduct ? `„${deletingProduct.name}" wirklich löschen? Alle Varianten werden ebenfalls entfernt.` : ''}
                isDeleting={isDeletingProduct}
                onConfirm={async () => {
                    if (!deletingProduct) return;
                    setIsDeletingProduct(true);
                    try {
                        await deleteProduct(deletingProduct.id);
                        showToast('Produkt gelöscht.');
                        setDeletingProduct(null);
                        void load();
                    } catch {
                        showToast('Löschen fehlgeschlagen.', 'error');
                    } finally {
                        setIsDeletingProduct(false);
                    }
                }}
                onClose={() => setDeletingProduct(null)}
            />
        </>
    );
}
