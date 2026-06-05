import {DeleteInvAuditingDialog} from '@/components/inventoryAuditing/DeleteInvAuditingDialog.tsx';
import {InventoryAuditingDialog} from '@/components/inventoryAuditing/InventoryAuditingDialog.tsx';
import ListPage from '@/components/ListPage.tsx';
import {useToast} from '@/components/ToastProvider.tsx';
import {deleteStocktake, fetchStocktakes} from '@/services/backend.ts';
import {FeltStocktakeDto} from '@/types/inventoryAuditing.ts';
import {formatDate, toErrorMessage} from '@/utils/pageUtils.ts';
import AddIcon from '@mui/icons-material/Add';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import {Button, IconButton} from '@mui/material';
import {DataGrid, GridColDef} from '@mui/x-data-grid';
import {useEffect, useState} from 'react';
import {useNavigate} from 'react-router';

export default function InventoryPage() {
    const navigate = useNavigate();
    const showToast = useToast();

    const [inventoryAuditings, setInventoryAuditings] = useState<FeltStocktakeDto[]>([]);
    const [invAuditingToDelete, setInvAuditingToDelete] = useState<FeltStocktakeDto | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

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

    const handleDelete = async () => {
        if (!invAuditingToDelete) return;
        setIsDeleting(true);

        try {
            await deleteStocktake(invAuditingToDelete.id.toString());
            showToast('Bestandsprüfung erfolgreich gelöscht.', 'success');
            setInvAuditingToDelete(null);
            await refetch();
        } catch {
            showToast('Löschen fehlgeschlagen. Bitte versuche es erneut.', 'error');
        } finally {
            setIsDeleting(false);
        }
    };

    useEffect(() => {
        void load();
    }, []);

    const refetch = async () => {
        await load();
    };

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
            field: 'storages',
            headerName: 'Lager',
            flex: 3,
            renderCell: ({row}) => row.storageLists?.map((storage) => storage.storageName).join(', ') ?? '',
        },
        {
            field: 'actions',
            headerName: '',
            width: 56,
            sortable: false,
            disableColumnMenu: true,
            renderCell: ({row}) => (
                <IconButton
                    size="small"
                    color="error"
                    aria-label="delete"
                    onClick={(e) => {
                        e.stopPropagation();
                        setInvAuditingToDelete(row);
                    }}
                >
                    <DeleteOutlinedIcon fontSize="small" />
                </IconButton>
            ),
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
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => {
                        setIsCreateOpen(true);
                    }}
                >
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
                onCreated={(id) => {
                    setIsCreateOpen(false);
                    navigate(`/inventory/${id}`);
                }}
            />
            <DeleteInvAuditingDialog
                open={invAuditingToDelete !== null}
                inventoryAuditing={invAuditingToDelete}
                isDeleting={isDeleting}
                onConfirm={handleDelete}
                onClose={() => setInvAuditingToDelete(null)}
            />
        </ListPage>
    );
}
