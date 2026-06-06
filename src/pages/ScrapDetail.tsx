import DetailPage from '@/components/DetailPage';
import PieceDetailCard, {NamedOption, PieceFormState} from '@/components/pieces/PieceDetailCard';
import {useToast} from '@/components/ToastProvider';
import {deleteScrap, fetchScrapDetails, fetchStorages, updateScrap} from '@/services/backend';
import {ScrapPieceDto} from '@/types/roll';
import {toErrorMessage} from '@/utils/pageUtils';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import {Box, Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, Stack, Typography} from '@mui/material';
import {ChangeEvent, useEffect, useState} from 'react';
import {useNavigate, useParams} from 'react-router';

interface DeleteScrapDialogProps {
    open: boolean;
    scrap: ScrapPieceDto | null;
    isDeleting: boolean;
    onClose: () => void;
    onConfirm: () => void;
}

function DeleteScrapDialog({open, scrap, isDeleting, onClose, onConfirm}: Readonly<DeleteScrapDialogProps>) {
    return (
        <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
            <DialogTitle>Reststück löschen</DialogTitle>
            <DialogContent>
                <Typography>{`${scrap?.feltTypeName ?? ''} – ${scrap?.color ?? ''} wirklich löschen?`}</Typography>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} disabled={isDeleting}>
                    Abbrechen
                </Button>
                <Button
                    color="error"
                    variant="contained"
                    onClick={onConfirm}
                    disabled={isDeleting}
                    startIcon={isDeleting ? <CircularProgress size={16} color="inherit" /> : undefined}
                >
                    Löschen
                </Button>
            </DialogActions>
        </Dialog>
    );
}

export default function ScrapDetail() {
    const {id} = useParams<{id: string}>();
    const navigate = useNavigate();
    const showToast = useToast();
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [scrap, setScrap] = useState<ScrapPieceDto | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [form, setForm] = useState<PieceFormState>({length: '', width: '', batchId: '', storageId: ''});
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [storageOptions, setStorageOptions] = useState<NamedOption[]>([]);
    const [batchOptions, setBatchOptions] = useState<NamedOption[]>([]);

    useEffect(() => {
        const load = async () => {
            if (!id) return;
            setIsLoading(true);
            setError('');
            try {
                setScrap(await fetchScrapDetails(Number.parseInt(id, 10)));
            } catch (err) {
                setError(toErrorMessage(err, 'Reststück konnte nicht geladen werden'));
            } finally {
                setIsLoading(false);
            }
        };
        void load();
    }, [id]);

    const startEdit = () => {
        if (!scrap) return;
        setForm({
            length: String(scrap.length),
            width: String(scrap.width),
            batchId: scrap.batchId == null ? '' : String(scrap.batchId),
            storageId: scrap.storageId == null ? '' : String(scrap.storageId),
        });
        setBatchOptions(scrap.batchId != null && scrap.batchName ? [{id: scrap.batchId, name: scrap.batchName}] : []);
        void fetchStorages().then((allStorages) => {
            setStorageOptions(allStorages.map(({id: sid, name}) => ({id: sid, name})).sort((a, b) => a.name.localeCompare(b.name)));
        });
        setIsEditing(true);
    };

    const setField = (field: keyof PieceFormState) => (e: ChangeEvent<HTMLInputElement>) => setForm((prev) => ({...prev, [field]: e.target.value}));

    const handleSave = async () => {
        if (!scrap) return;
        const length = Number.parseFloat(form.length);
        const width = Number.parseFloat(form.width);
        if (Number.isNaN(length) || length <= 0 || Number.isNaN(width) || width <= 0) return;
        setIsSaving(true);
        try {
            const updated = await updateScrap(scrap.id, {
                length,
                width,
                ...(form.batchId && {batchId: Number.parseInt(form.batchId, 10)}),
                ...(form.storageId && {storageId: Number.parseInt(form.storageId, 10)}),
            });
            setScrap(updated);
            setIsEditing(false);
            showToast('Reststück erfolgreich gespeichert.');
        } catch (err) {
            showToast(toErrorMessage(err, 'Reststück konnte nicht gespeichert werden'), 'error');
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!scrap) return;
        setIsDeleting(true);
        try {
            await deleteScrap(scrap.id);
            navigate(-1);
        } catch (err) {
            showToast(toErrorMessage(err, 'Reststück konnte nicht gelöscht werden'), 'error');
            setIsDeleting(false);
            setIsDeleteOpen(false);
        }
    };

    const title = scrap ? `Reststück: ${scrap.feltTypeName} – ${scrap.color}` : 'Reststückdetails';

    return (
        <DetailPage title={title} isLoading={isLoading} error={error} onBack={() => navigate(-1)} onErrorClose={() => setError('')}>
            {scrap && (
                <Stack spacing={2}>
                    <Box sx={{display: 'flex', justifyContent: 'flex-end', gap: 1, flexWrap: 'wrap'}}>
                        {isEditing ? (
                            <>
                                <Button variant="outlined" onClick={() => setIsEditing(false)} disabled={isSaving}>
                                    Abbrechen
                                </Button>
                                <Button
                                    variant="contained"
                                    onClick={() => void handleSave()}
                                    disabled={isSaving}
                                    startIcon={isSaving ? <CircularProgress size={16} color="inherit" /> : <SaveIcon />}
                                >
                                    Speichern
                                </Button>
                            </>
                        ) : (
                            <>
                                <Button variant="outlined" startIcon={<EditIcon />} onClick={startEdit}>
                                    Bearbeiten
                                </Button>
                                <Button variant="outlined" color="error" startIcon={<DeleteIcon />} onClick={() => setIsDeleteOpen(true)}>
                                    Löschen
                                </Button>
                            </>
                        )}
                    </Box>

                    <PieceDetailCard
                        piece={scrap}
                        isEditing={isEditing}
                        form={form}
                        onField={setField}
                        storageOptions={storageOptions}
                        batchOptions={batchOptions}
                    />
                </Stack>
            )}

            <DeleteScrapDialog
                open={isDeleteOpen}
                scrap={scrap}
                isDeleting={isDeleting}
                onClose={() => setIsDeleteOpen(false)}
                onConfirm={() => void handleDelete()}
            />
        </DetailPage>
    );
}
