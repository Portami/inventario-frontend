import ListPage from '@/components/ListPage';
import {useToast} from '@/components/ToastProvider';
import FeltDialog from '@/pages/components/FeltDialog';
import {deleteFelt, fetchFelts} from '@/services/backend';
import {FeltDto} from '@/types/felt';
import {toErrorMessage} from '@/utils/pageUtils';
import AddIcon from '@mui/icons-material/Add';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import {Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, Typography} from '@mui/material';
import {DataGrid, GridColDef, GridRenderCellParams, GridRowParams} from '@mui/x-data-grid';
import {useEffect, useState} from 'react';

export default function FeltPage() {
    const showToast = useToast();
    const [felts, setFelts] = useState<FeltDto[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedFelt, setSelectedFelt] = useState<FeltDto | null>(null);
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [feltToDelete, setFeltToDelete] = useState<FeltDto | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        const load = async () => {
            try {
                setFelts(await fetchFelts());
            } catch (err) {
                setError(toErrorMessage(err, 'Filze konnten nicht geladen werden'));
            } finally {
                setIsLoading(false);
            }
        };
        void load();
    }, []);

    const refetch = () => void fetchFelts().then(setFelts);

    const handleSaved = () => {
        setSelectedFelt(null);
        refetch();
    };

    const handleCreated = () => {
        setIsCreateOpen(false);
        refetch();
    };

    const handleDelete = async () => {
        if (!feltToDelete) return;
        setIsDeleting(true);
        try {
            await deleteFelt(feltToDelete.id);
            showToast('Filz erfolgreich gelöscht.', 'success');
            setFeltToDelete(null);
            refetch();
        } catch {
            showToast('Löschen fehlgeschlagen. Bitte versuche es erneut.', 'error');
        } finally {
            setIsDeleting(false);
        }
    };

    const columns: GridColDef<FeltDto>[] = [
        {
            field: 'color',
            headerName: 'Farbe / Typ',
            flex: 1,
            renderCell: ({row}: GridRenderCellParams<FeltDto>) => `${row.feltTypeName} – ${row.color}`,
        },
        {field: 'articleNumber', headerName: 'Artikelnummer', flex: 1},
        {field: 'supplierName', headerName: 'Lieferant', flex: 1},
        {field: 'thickness', headerName: 'Dicke (mm)', width: 110},
        {field: 'density', headerName: 'Dichte (g/m²)', width: 130},
        {field: 'price', headerName: 'Preis', width: 100},
        {
            field: 'actions',
            headerName: '',
            width: 56,
            sortable: false,
            disableColumnMenu: true,
            renderCell: ({row}: GridRenderCellParams<FeltDto>) => (
                <IconButton
                    size="small"
                    color="error"
                    aria-label="delete"
                    onClick={(e) => {
                        e.stopPropagation();
                        setFeltToDelete(row);
                    }}
                >
                    <DeleteOutlinedIcon fontSize="small" />
                </IconButton>
            ),
        },
    ];

    return (
        <ListPage
            title="Filze"
            description="Übersicht aller Filzmaterialien."
            actions={
                <Button variant="contained" startIcon={<AddIcon />} onClick={() => setIsCreateOpen(true)}>
                    Neuer Filz
                </Button>
            }
            isLoading={isLoading}
            isEmpty={false}
            error={error}
            onErrorClose={() => setError('')}
        >
            <DataGrid
                rows={felts}
                columns={columns}
                loading={isLoading}
                autoHeight
                disableRowSelectionOnClick
                pageSizeOptions={[10, 25, 50]}
                initialState={{pagination: {paginationModel: {pageSize: 10}}}}
                localeText={{noRowsLabel: 'Noch keine Filze vorhanden.'}}
                onRowClick={(params: GridRowParams<FeltDto>) => setSelectedFelt(params.row)}
                sx={{cursor: 'pointer'}}
            />
            <FeltDialog open={selectedFelt !== null} felt={selectedFelt} felts={felts} onClose={() => setSelectedFelt(null)} onSaved={handleSaved} />
            <FeltDialog open={isCreateOpen} felts={felts} onClose={() => setIsCreateOpen(false)} onSaved={handleCreated} />

            <Dialog open={feltToDelete !== null} onClose={() => setFeltToDelete(null)} maxWidth="xs" fullWidth>
                <DialogTitle>Filz löschen</DialogTitle>
                <DialogContent>
                    <Typography>
                        {feltToDelete?.feltTypeName} – {feltToDelete?.color} wirklich löschen?
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setFeltToDelete(null)} disabled={isDeleting}>
                        Abbrechen
                    </Button>
                    <Button
                        color="error"
                        variant="contained"
                        onClick={handleDelete}
                        disabled={isDeleting}
                        startIcon={isDeleting ? <CircularProgress size={16} color="inherit" /> : undefined}
                    >
                        Löschen
                    </Button>
                </DialogActions>
            </Dialog>
        </ListPage>
    );
}
