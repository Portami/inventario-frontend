import ListPage from '@/components/ListPage';
import {fetchProducts} from '@/services/backend';
import {ProductDto} from '@/types/product';
import {toErrorMessage} from '@/utils/pageUtils';
import {DataGrid, GridColDef, GridRowParams} from '@mui/x-data-grid';
import {useEffect, useState} from 'react';
import {useNavigate} from 'react-router';

const columns: GridColDef<ProductDto>[] = [
    {field: 'name', headerName: 'Name', flex: 2},
    {
        field: 'category',
        headerName: 'Kategorie',
        flex: 1,
        valueGetter: (_value, row) => row.category.name,
    },
    {
        field: 'variants',
        headerName: 'Varianten',
        width: 110,
        valueGetter: (_value, row) => row.variants.length,
    },
    {
        field: 'attributes',
        headerName: 'Attribute',
        flex: 2,
        valueGetter: (_value, row) => row.attributes.map((a) => a.name).join(', '),
        sortable: false,
    },
];

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

    return (
        <ListPage
            title="Produkte"
            description="Übersicht aller Produkte."
            isLoading={isLoading}
            isEmpty={false}
            error={error}
            onErrorClose={() => setError('')}
        >
            <DataGrid
                rows={products}
                columns={columns}
                loading={isLoading}
                onRowClick={(params: GridRowParams<ProductDto>) => void navigate(`/product/${params.row.id}`)}
                sx={{cursor: 'pointer'}}
                pageSizeOptions={[25, 50, 100]}
                initialState={{pagination: {paginationModel: {pageSize: 25}}}}
                disableRowSelectionOnClick
            />
        </ListPage>
    );
}
