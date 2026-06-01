import {useToast} from '@/components/ToastProvider.tsx';
import {createStocktake, fetchStorages} from '@/services/backend.ts';
import {toErrorMessage} from '@/utils/pageUtils.ts';
import CloseIcon from '@mui/icons-material/Close';
import {
    Button,
    Checkbox,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    FormControlLabel,
    Grid,
    IconButton,
    TextField,
} from '@mui/material';
import {DataGrid, GridColDef} from '@mui/x-data-grid';
import {ChangeEvent, useEffect, useState} from 'react';

type InventoryAuditingDialogProps = {
    readonly open: boolean;
    readonly onClose: () => void;
    readonly onSaved: () => void;
};

type StorageSelection = {
    id: number;
    selected: boolean;
    storageName: string;
};

type FormState = {
    description: string;
    includeScrap: boolean;
};

const emptyForm: FormState = {
    description: '',
    includeScrap: false,
};

const labelProps = {shrink: true, sx: {textTransform: 'uppercase' as const, letterSpacing: '0.05em', fontWeight: 600}};

export function InventoryAuditingDialog({open, onClose, onSaved}: InventoryAuditingDialogProps) {
    const showToast = useToast();
    const [storages, setStorages] = useState<StorageSelection[]>([]);
    const [form, setForm] = useState<FormState>(emptyForm);
    const [isSaving, setIsSaving] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const setField = (field: keyof FormState) => (e: ChangeEvent<HTMLInputElement>) => setForm((prev) => ({...prev, [field]: e.target.value}));

    useEffect(() => {
        if (!open) return;
        setForm(emptyForm);
    }, [open]);

    const handleSave = async () => {
        const storageIds = storages.filter((storage) => storage.selected && !Number.isNaN(storage.id)).map((storage) => storage.id);

        if (storageIds.length === 0) {
            showToast('Bitte ein Lager auswählen.', 'error');
            setIsSaving(false);
            return;
        }

        setIsSaving(true);
        try {
            await createStocktake({
                description: form.description,
                includeScrap: form.includeScrap,
                storageIds: storageIds,
            });
            showToast('Bestandsprüfung erstellt.', 'success');
            onSaved();
        } catch {
            showToast('Erstellen fehlgeschlagen', 'error');
        } finally {
            setIsSaving(false);
        }
    };

    useEffect(() => {
        const load = async () => {
            try {
                const storageDtos = await fetchStorages();
                setStorages(
                    storageDtos.map((storage) => ({
                        selected: false,
                        id: storage.id,
                        storageName: storage.name,
                    })),
                );
            } catch (err) {
                setError(toErrorMessage(err, 'Lager konnten nicht geladen werden.'));
            } finally {
                setIsLoading(false);
            }
        };
        void load();
    }, []);

    const columns: GridColDef<StorageSelection>[] = [
        {
            field: 'selected',
            headerName: 'Auswahl',
            width: 100,
            renderCell: (value) => (
                <Checkbox
                    checked={value.row.selected}
                    onChange={(e) => {
                        const checked = e.target.checked;
                        setStorages((prev) => prev.map((storage) => (storage.id === value.row.id ? {...storage, selected: checked} : storage)));
                    }}
                />
            ),
        },
        {
            field: 'storageName',
            headerName: 'Lager',
            flex: 3,
        },
    ];

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle sx={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 4, pt: 3}}>
                Neue Bestandsprüfung
                <IconButton onClick={onClose} size="small" aria-label="close" disabled={isSaving}>
                    <CloseIcon />
                </IconButton>
            </DialogTitle>
            <DialogContent sx={{px: 4, pb: 3}}>
                <Grid container spacing={3} sx={{mt: 0.5}}>
                    <Grid size={6}>
                        <TextField
                            label="Beschreibung"
                            value={form.description}
                            onChange={setField('description')}
                            variant="outlined"
                            size="small"
                            fullWidth
                            slotProps={{inputLabel: labelProps}}
                        />
                    </Grid>
                    <Grid size={6}>
                        <FormControlLabel
                            control={<Checkbox checked={form.includeScrap} onChange={(e) => setForm((prev) => ({...prev, includeScrap: e.target.checked}))} />}
                            label="Reststück inkludieren"
                        />
                    </Grid>
                </Grid>
                <DataGrid
                    rows={storages}
                    columns={columns}
                    disableRowSelectionOnClick
                    pageSizeOptions={[10, 25, 50]}
                    initialState={{pagination: {paginationModel: {pageSize: 10}}}}
                    localeText={{noRowsLabel: 'Keine Lager'}}
                />
            </DialogContent>
            <DialogActions sx={{px: 4, pb: 3}}>
                <Button variant="outlined" onClick={onClose} disabled={isSaving}>
                    Abbrechen
                </Button>
                <Button
                    variant="contained"
                    onClick={handleSave}
                    disabled={isSaving}
                    startIcon={isSaving ? <CircularProgress size={16} color="inherit" /> : undefined}
                >
                    Erstellen
                </Button>
            </DialogActions>
        </Dialog>
    );
}
