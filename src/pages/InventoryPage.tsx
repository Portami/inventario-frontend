import {InventoryAuditingDialog} from '@/components/inventoryAuditing/InventoryAuditingDialog.tsx';
import ListPage from '@/components/ListPage.tsx';
import {fetchStocktakes} from '@/services/backend.ts';
import {FeltStocktakeDto} from '@/types/inventoryAuditing.ts';
import {toErrorMessage} from '@/utils/pageUtils.ts';
import AddIcon from '@mui/icons-material/Add';
import {Button} from '@mui/material';
import {DataGrid, GridColDef} from '@mui/x-data-grid';
import {useEffect, useState} from 'react';
import {useNavigate} from 'react-router';

export default function InventoryPage() {
    const navigate = useNavigate();

    const [inventoryAuditings, setInventoryAuditings] = useState<FeltStocktakeDto[]>([]);
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const load = async () => {
            try {
                const stocktakes = await fetchStocktakes();
                setInventoryAuditings(stocktakes.filter((stocktake) => !stocktake.isCompleted));
            } catch (err) {
                setError(toErrorMessage(err, 'Inventur konnte nicht geladen werden.'));
            } finally {
                setIsLoading(false);
            }
        };
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
            title="Bestandsverwaltung"
            description="Übersicht aller offenen Bestandsprüfungen"
            isLoading={isLoading}
            isEmpty={false}
            error={error}
            onErrorClose={() => setError('')}
            actions={
                <Button variant="contained" startIcon={<AddIcon />} onClick={() => setIsCreateOpen(true)}>
                    Neue Bestandsprüfung
                </Button>
            }
        >
            <DataGrid
                rows={inventoryAuditings}
                columns={columns}
                disableRowSelectionOnClick
                pageSizeOptions={[10, 25, 50]}
                initialState={{pagination: {paginationModel: {pageSize: 10}}}}
                localeText={{noRowsLabel: 'Keine Bestandsprüfungen.'}}
                sx={{'& .MuiDataGrid-row': {cursor: 'pointer'}, height: 600}}
                onRowClick={({row}) => void navigate(`/inventory/${row.id}`)}
            />
            <InventoryAuditingDialog
                open={isCreateOpen}
                onClose={() => setIsCreateOpen(false)}
                onSaved={() => {
                    () => setIsCreateOpen(false);
                }}
            />
        </ListPage>
    );
}
