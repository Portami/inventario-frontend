import DetailPage from '@/components/DetailPage';
import {deleteRoll, fetchRollDetails, updateRoll} from '@/services/backend';
import {FeltRollDto, UpdateFeltRollRequest} from '@/types/roll';
import {toErrorMessage} from '@/utils/pageUtils';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import {Box, Button, Card, CardContent, Divider, Stack, TextField, Typography} from '@mui/material';
import {useEffect, useState} from 'react';
import {useNavigate, useParams} from 'react-router';

function Field({label, value}: {readonly label: string; readonly value: string | number | null | undefined}) {
    return (
        <div>
            <Typography variant="body2" color="textSecondary" sx={{fontWeight: 500, mb: 0.25}}>
                {label}
            </Typography>
            <Typography variant="body1">{value ?? '–'}</Typography>
        </div>
    );
}

export default function RollDetail() {
    const {id} = useParams<{id: string}>();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [roll, setRoll] = useState<FeltRollDto | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const [editLength, setEditLength] = useState('');
    const [editWidth, setEditWidth] = useState('');
    const [editBatchId, setEditBatchId] = useState('');
    const [editStorageId, setEditStorageId] = useState('');

    useEffect(() => {
        const load = async () => {
            if (!id) return;
            setIsLoading(true);
            setError('');
            try {
                setRoll(await fetchRollDetails(id));
            } catch (err) {
                setError(toErrorMessage(err, 'Rolle konnte nicht geladen werden'));
            } finally {
                setIsLoading(false);
            }
        };
        void load();
    }, [id]);

    const startEdit = () => {
        if (!roll) return;
        setEditLength(String(roll.length));
        setEditWidth(String(roll.width));
        setEditBatchId(roll.batchId == null ? '' : String(roll.batchId));
        setEditStorageId(roll.storageId == null ? '' : String(roll.storageId));
        setIsEditing(true);
    };

    const handleSave = async () => {
        if (!roll || !id) return;
        setIsSaving(true);
        setError('');
        try {
            const payload: UpdateFeltRollRequest = {
                length: Number(editLength),
                width: Number(editWidth),
                ...(editBatchId && {batchId: Number(editBatchId)}),
                ...(editStorageId && {storageId: Number(editStorageId)}),
            };
            setRoll(await updateRoll(id, payload));
            setIsEditing(false);
        } catch (err) {
            setError(toErrorMessage(err, 'Rolle konnte nicht gespeichert werden'));
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!id) return;
        setIsDeleting(true);
        setError('');
        try {
            await deleteRoll(id);
            navigate('/rolls');
        } catch (err) {
            setError(toErrorMessage(err, 'Rolle konnte nicht gelöscht werden'));
            setIsDeleting(false);
        }
    };

    const title = roll ? `Rolle: ${roll.feltTypeName} – ${roll.color}` : 'Rollendetails';

    return (
        <DetailPage title={title} isLoading={isLoading} error={error} onBack={() => navigate(-1)} onErrorClose={() => setError('')}>
            {roll && (
                <Stack spacing={2}>
                    <Box sx={{display: 'flex', justifyContent: 'flex-end', gap: 1}}>
                        {isEditing ? (
                            <>
                                <Button variant="text" onClick={() => setIsEditing(false)} disabled={isSaving}>
                                    Abbrechen
                                </Button>
                                <Button variant="contained" startIcon={<SaveIcon />} onClick={() => void handleSave()} disabled={isSaving}>
                                    {isSaving ? 'Wird gespeichert...' : 'Speichern'}
                                </Button>
                            </>
                        ) : (
                            <>
                                <Button variant="outlined" startIcon={<EditIcon />} onClick={startEdit} disabled={isDeleting}>
                                    Bearbeiten
                                </Button>
                                <Button variant="outlined" color="error" startIcon={<DeleteIcon />} onClick={() => void handleDelete()} disabled={isDeleting}>
                                    {isDeleting ? 'Wird gelöscht...' : 'Löschen'}
                                </Button>
                            </>
                        )}
                    </Box>

                    <Card>
                        <CardContent>
                            <Stack spacing={3}>
                                <div>
                                    <Typography variant="overline" color="textSecondary">
                                        Identifikation
                                    </Typography>
                                    <Box sx={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mt: 1}}>
                                        <Field label="Artikelnummer" value={roll.articleNumber} />
                                        <Field label="ID" value={roll.id} />
                                        <Field label="Filztyp" value={roll.feltTypeName} />
                                        <Field label="Farbe" value={roll.color} />
                                        <Field label="Lieferant" value={roll.supplierName} />
                                        <Field label="Lieferantenfarbe" value={roll.supplierColor} />
                                    </Box>
                                </div>

                                <Divider />

                                <div>
                                    <Typography variant="overline" color="textSecondary">
                                        Maße & Eigenschaften
                                    </Typography>
                                    <Box sx={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mt: 1}}>
                                        {isEditing ? (
                                            <>
                                                <TextField
                                                    label="Länge (m)"
                                                    type="number"
                                                    size="small"
                                                    value={editLength}
                                                    onChange={(e) => setEditLength(e.target.value)}
                                                    slotProps={{htmlInput: {min: 0.01, step: 0.01}}}
                                                    required
                                                />
                                                <TextField
                                                    label="Breite (m)"
                                                    type="number"
                                                    size="small"
                                                    value={editWidth}
                                                    onChange={(e) => setEditWidth(e.target.value)}
                                                    slotProps={{htmlInput: {min: 0.01, step: 0.01}}}
                                                    required
                                                />
                                            </>
                                        ) : (
                                            <>
                                                <Field label="Länge (m)" value={roll.length} />
                                                <Field label="Breite (m)" value={roll.width} />
                                            </>
                                        )}
                                        <Field label="Dicke (mm)" value={roll.thickness} />
                                        <Field label="Dichte (g/m²)" value={roll.density} />
                                        <Field label="Preis (CHF)" value={roll.price == null ? null : `CHF ${roll.price.toFixed(2)}`} />
                                    </Box>
                                </div>

                                <Divider />

                                <div>
                                    <Typography variant="overline" color="textSecondary">
                                        Lagerung
                                    </Typography>
                                    <Box sx={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mt: 1}}>
                                        {isEditing ? (
                                            <>
                                                <TextField
                                                    label="Charge-ID"
                                                    type="number"
                                                    size="small"
                                                    value={editBatchId}
                                                    onChange={(e) => setEditBatchId(e.target.value)}
                                                    slotProps={{htmlInput: {min: 1}}}
                                                />
                                                <TextField
                                                    label="Lagerort-ID"
                                                    type="number"
                                                    size="small"
                                                    value={editStorageId}
                                                    onChange={(e) => setEditStorageId(e.target.value)}
                                                    slotProps={{htmlInput: {min: 1}}}
                                                />
                                            </>
                                        ) : (
                                            <>
                                                <Field label="Charge" value={roll.batchName} />
                                                <Field label="Lagerort" value={roll.storageName} />
                                            </>
                                        )}
                                    </Box>
                                </div>
                            </Stack>
                        </CardContent>
                    </Card>
                </Stack>
            )}
        </DetailPage>
    );
}
