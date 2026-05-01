import ExpandableDataGrid, {ExpandableDataGridRow} from '@/components/ExpandableDataGrid.tsx';
import ListPage from '@/components/ListPage';
import SearchField from '@/components/SearchField.tsx';
import {fetchProducts} from '@/services/backend';
import {ProductDto, ProductVariantDto} from '@/types/product';
import {toErrorMessage} from '@/utils/pageUtils';
import {GridColDef} from '@mui/x-data-grid';
import {useCallback, useEffect, useState} from 'react';
import {useNavigate} from 'react-router';

type ProductRow = ExpandableDataGridRow<ProductDto, ProductVariantDto>;

export default function ProductsPage() {
    const [products, setProducts] = useState<ProductDto[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const load = async () => {
            try {
                setProducts(await fetchProducts());
            } catch (err) {
                setError(toErrorMessage(err, 'Produkte konnten nicht geladen werden'));
            } finally {
                setIsLoading(false);
            }
        };
        void load();
    }, []);

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
                return row.rowType === 'child' ? row.child.price : '';
            },
        },
    ];

    return (
        <ListPage
            title="Produkte"
            description="Übersicht aller Produkte."
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
    );
}
