import ListPage from '@/components/ListPage.tsx';
import {fetchStocktakes} from '@/services/backend.ts';
import {FeltStocktakeDto} from '@/types/inventoryAuditing.ts';
import {formatDate, toErrorMessage} from '@/utils/pageUtils.ts';
import {DataGrid, GridColDef} from '@mui/x-data-grid';
import {useEffect, useState} from 'react';
import {useNavigate} from 'react-router';

export default function InvAuditingArchive() {
    const navigate = useNavigate();

    const [inventoryAuditings, setInventoryAuditings] = useState<FeltStocktakeDto[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    const load = async () => {
        try {
            const stocktakes = await fetchStocktakes();
            setInventoryAuditings(stocktakes.filter((stocktake) => stocktake.isCompleted));
        } catch (err) {
            setError(toErrorMessage(err, 'Inventur konnte nicht geladen werden.'));
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        void load();
    }, []);

    const columns: GridColDef<FeltStocktakeDto>[] = [
        {
            field: 'description',
            headerName: 'Beschreibung',
            flex: 2,
        },
        {
            field: 'createdAt',
            headerName: 'Erstellt am',
            width: 150,
            valueGetter: (value, row) => {
                return formatDate(row.createdAt);
            },
        },
        {
            field: 'completedAt',
            headerName: 'Abgeschlossen am',
            width: 150,
            valueGetter: (value, row) => {
                return formatDate(row.completedAt);
            },
        },
        {
            field: 'storages',
            headerName: 'Lager',
            flex: 3,
            renderCell: ({row}) => row.storageLists?.map((storage) => storage.storageName).join(', ') ?? '',
        },
    ];

    return (
        <ListPage
            title="Inventur Archiv"
            description="Übersicht aller abgeschlossenen Bestandsprüfungen"
            isLoading={isLoading}
            isEmpty={false}
            error={error}
            onErrorClose={() => setError('')}
        >
            <DataGrid
                rows={inventoryAuditings}
                columns={columns}
                disableRowSelectionOnClick
                pageSizeOptions={[10, 25, 50]}
                initialState={{pagination: {paginationModel: {pageSize: 10}}}}
                localeText={{noRowsLabel: 'Keine Bestandsprüfungen.'}}
                sx={{'& .MuiDataGrid-row': {cursor: 'pointer'}, height: 600}}
                onRowClick={({row}) => void navigate(`/inventoryArchive/${row.id}`)}
            />
        </ListPage>
    );
}
