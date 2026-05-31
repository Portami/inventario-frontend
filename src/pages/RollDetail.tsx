import DetailPage from '@/components/DetailPage';
import {useToast} from '@/components/ToastProvider';
import {deleteRoll, fetchRollDetails, fetchRolls, splitRoll, updateRoll} from '@/services/backend';
import {FeltRollDto} from '@/types/roll';
import {toErrorMessage} from '@/utils/pageUtils';
import CallSplitIcon from '@mui/icons-material/CallSplit';
import ContentCutIcon from '@mui/icons-material/ContentCut';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import {
    Box,
    Button,
    ButtonGroup,
    Card,
    CardContent,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Divider,
    MenuItem,
    Stack,
    TextField,
    Tooltip,
    Typography,
} from '@mui/material';
import {alpha} from '@mui/material/styles';
import {ChangeEvent, useEffect, useState} from 'react';
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

type FormState = {
    length: string;
    width: string;
    batchId: string;
    storageId: string;
};

type NamedOption = {id: number; name: string};

const labelProps = {shrink: true, sx: {textTransform: 'uppercase' as const, letterSpacing: '0.05em', fontWeight: 600}};

export default function RollDetail() {
    const {id} = useParams<{id: string}>();
    const navigate = useNavigate();
    const showToast = useToast();
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [roll, setRoll] = useState<FeltRollDto | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [form, setForm] = useState<FormState>({length: '', width: '', batchId: '', storageId: ''});
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isSplitOpen, setIsSplitOpen] = useState(false);
    const [isSplitting, setIsSplitting] = useState(false);
    const [splitWidth, setSplitWidth] = useState('');
    const [navigateAfterSplit, setNavigateAfterSplit] = useState(false);
    const [storageOptions, setStorageOptions] = useState<NamedOption[]>([]);
    const [batchOptions, setBatchOptions] = useState<NamedOption[]>([]);

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
        setForm({
            length: String(roll.length),
            width: String(roll.width),
            batchId: roll.batchId == null ? '' : String(roll.batchId),
            storageId: roll.storageId == null ? '' : String(roll.storageId),
        });
        void fetchRolls().then((allRolls) => {
            const storageMap = new Map<number, string>();
            const batchMap = new Map<number, string>();
            for (const r of allRolls) {
                if (r.storageId != null && r.storageName) storageMap.set(r.storageId, r.storageName);
                if (r.batchId != null && r.batchName) batchMap.set(r.batchId, r.batchName);
            }
            setStorageOptions([...storageMap.entries()].map(([id, name]) => ({id, name})).sort((a, b) => a.name.localeCompare(b.name)));
            setBatchOptions([...batchMap.entries()].map(([id, name]) => ({id, name})).sort((a, b) => a.name.localeCompare(b.name)));
        });
        setIsEditing(true);
    };

    const setField = (field: keyof FormState) => (e: ChangeEvent<HTMLInputElement>) => setForm((prev) => ({...prev, [field]: e.target.value}));

    const handleSave = async () => {
        if (!roll || !id) return;
        const length = Number.parseFloat(form.length);
        const width = Number.parseFloat(form.width);
        if (Number.isNaN(length) || length <= 0 || Number.isNaN(width) || width <= 0) return;
        setIsSaving(true);
        try {
            await updateRoll(roll.id, {
                length,
                width,
                ...(form.batchId && {batchId: Number.parseInt(form.batchId, 10)}),
                ...(form.storageId && {storageId: Number.parseInt(form.storageId, 10)}),
            });
            setRoll(await fetchRollDetails(id));
            setIsEditing(false);
            showToast('Rolle erfolgreich gespeichert.');
        } catch (err) {
            showToast(toErrorMessage(err, 'Rolle konnte nicht gespeichert werden'), 'error');
        } finally {
            setIsSaving(false);
        }
    };

    const openSplitDialog = (shouldNavigate: boolean) => {
        setSplitWidth('');
        setNavigateAfterSplit(shouldNavigate);
        setIsSplitOpen(true);
    };

    const handleSplit = async () => {
        if (!roll || !id) return;
        const width = Number.parseFloat(splitWidth);
        if (Number.isNaN(width) || width <= 0) return;
        setIsSplitting(true);
        try {
            const newRoll = await splitRoll(roll.id, {width});
            setIsSplitOpen(false);
            setSplitWidth('');
            if (navigateAfterSplit && newRoll.id !== roll.id) {
                navigate(`/roll/${newRoll.id}`);
            } else {
                setRoll(await fetchRollDetails(id));
                showToast('Rolle erfolgreich abgeschnitten.');
            }
        } catch (err) {
            showToast(toErrorMessage(err, 'Rolle konnte nicht abgeschnitten werden'), 'error');
        } finally {
            setIsSplitting(false);
        }
    };

    const handleDelete = async () => {
        if (!id) return;
        setIsDeleting(true);
        try {
            await deleteRoll(id);
            navigate(-1);
        } catch (err) {
            showToast(toErrorMessage(err, 'Rolle konnte nicht gelöscht werden'), 'error');
            setIsDeleting(false);
            setIsDeleteOpen(false);
        }
    };

    const splitWidthNum = Number.parseFloat(splitWidth);
    const splitPreviewLength = roll && !Number.isNaN(splitWidthNum) && splitWidthNum > 0 ? roll.length - splitWidthNum : null;

    const title = roll ? `Rolle: ${roll.feltTypeName} – ${roll.color}` : 'Rollendetails';

    return (
        <DetailPage title={title} isLoading={isLoading} error={error} onBack={() => navigate(-1)} onErrorClose={() => setError('')}>
            {roll && (
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

                                <ButtonGroup variant="outlined">
                                    <Tooltip title="Länge abschneiden – Rolle bleibt geöffnet" arrow>
                                        <Button startIcon={<ContentCutIcon />} onClick={() => openSplitDialog(false)}>
                                            Abschneiden
                                        </Button>
                                    </Tooltip>
                                    <Tooltip title="Abschneiden und neue Rolle direkt öffnen" arrow>
                                        <Button startIcon={<CallSplitIcon />} onClick={() => openSplitDialog(true)}>
                                            Neue Rolle
                                        </Button>
                                    </Tooltip>
                                </ButtonGroup>

                                <Button variant="outlined" color="error" startIcon={<DeleteIcon />} onClick={() => setIsDeleteOpen(true)}>
                                    Löschen
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
                                            <TextField
                                                label="Länge (cm)"
                                                value={form.length}
                                                onChange={setField('length')}
                                                type="number"
                                                variant="outlined"
                                                size="small"
                                                required
                                                slotProps={{htmlInput: {min: 1, step: 1}, inputLabel: labelProps}}
                                            />
                                        ) : (
                                            <Field label="Länge (cm)" value={roll.length} />
                                        )}
                                        {isEditing ? (
                                            <TextField
                                                label="Breite (cm)"
                                                value={form.width}
                                                onChange={setField('width')}
                                                type="number"
                                                variant="outlined"
                                                size="small"
                                                required
                                                slotProps={{htmlInput: {min: 1, step: 1}, inputLabel: labelProps}}
                                            />
                                        ) : (
                                            <Field label="Breite (cm)" value={roll.width} />
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
                                            <TextField
                                                select
                                                label="Charge"
                                                value={form.batchId}
                                                onChange={setField('batchId')}
                                                variant="outlined"
                                                size="small"
                                                disabled
                                                slotProps={{inputLabel: labelProps, select: {displayEmpty: true}}}
                                            >
                                                <MenuItem value="">–</MenuItem>
                                                {batchOptions.map((o) => (
                                                    <MenuItem key={o.id} value={String(o.id)}>
                                                        {o.name}
                                                    </MenuItem>
                                                ))}
                                            </TextField>
                                        ) : (
                                            <Field label="Charge" value={roll.batchName} />
                                        )}
                                        {isEditing ? (
                                            <TextField
                                                select
                                                label="Lagerort"
                                                value={form.storageId}
                                                onChange={setField('storageId')}
                                                variant="outlined"
                                                size="small"
                                                slotProps={{inputLabel: labelProps, select: {displayEmpty: true}}}
                                            >
                                                <MenuItem value="">–</MenuItem>
                                                {storageOptions.map((o) => (
                                                    <MenuItem key={o.id} value={String(o.id)}>
                                                        {o.name}
                                                    </MenuItem>
                                                ))}
                                            </TextField>
                                        ) : (
                                            <Field label="Lagerort" value={roll.storageName} />
                                        )}
                                    </Box>
                                </div>
                            </Stack>
                        </CardContent>
                    </Card>
                </Stack>
            )}

            {/* Delete dialog */}
            <Dialog open={isDeleteOpen} onClose={() => setIsDeleteOpen(false)} maxWidth="xs" fullWidth>
                <DialogTitle>Rolle löschen</DialogTitle>
                <DialogContent>
                    <Typography>
                        {roll?.feltTypeName} – {roll?.color} wirklich löschen?
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setIsDeleteOpen(false)} disabled={isDeleting}>
                        Abbrechen
                    </Button>
                    <Button
                        color="error"
                        variant="contained"
                        onClick={() => void handleDelete()}
                        disabled={isDeleting}
                        startIcon={isDeleting ? <CircularProgress size={16} color="inherit" /> : undefined}
                    >
                        Löschen
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Cut / split dialog — shared by both cut buttons */}
            <Dialog open={isSplitOpen} onClose={() => setIsSplitOpen(false)} maxWidth="xs" fullWidth>
                <DialogTitle>
                    <Box sx={{display: 'flex', alignItems: 'center', gap: 1.5}}>
                        {navigateAfterSplit ? <CallSplitIcon sx={{color: 'primary.main'}} /> : <ContentCutIcon sx={{color: 'text.secondary'}} />}
                        <Box>
                            <Typography variant="h6" sx={{lineHeight: 1.2}}>
                                {navigateAfterSplit ? 'Neue Rolle abschneiden' : 'Rolle abschneiden'}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                                {navigateAfterSplit ? 'Abschnitt wird als neue Rolle geöffnet' : 'Verbleibende Länge wird aktualisiert'}
                            </Typography>
                        </Box>
                    </Box>
                </DialogTitle>
                <DialogContent sx={{pt: 1}}>
                    {/* Current roll summary with live remaining preview */}
                    <Box
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 2,
                            p: 1.5,
                            mb: 2.5,
                            borderRadius: 2,
                            border: '1px solid',
                            borderColor: 'divider',
                            bgcolor: (theme) => alpha(theme.palette.text.primary, 0.03),
                        }}
                    >
                        <Box sx={{flex: 1}}>
                            <Typography variant="caption" color="text.secondary" sx={{display: 'block', mb: 0.25}}>
                                Aktuelle Rolle
                            </Typography>
                            <Typography variant="body1" sx={{fontWeight: 700}}>
                                {roll?.length} × {roll?.width} cm
                            </Typography>
                        </Box>
                        <ContentCutIcon sx={{color: 'text.disabled', fontSize: 18, flexShrink: 0}} />
                        <Box sx={{flex: 1, textAlign: 'right'}}>
                            <Typography variant="caption" color="text.secondary" sx={{display: 'block', mb: 0.25}}>
                                Verbleibend
                            </Typography>
                            {splitPreviewLength !== null && splitPreviewLength > 0 ? (
                                <Typography variant="body1" sx={{fontWeight: 700}}>
                                    {splitPreviewLength.toFixed(splitPreviewLength % 1 === 0 ? 0 : 1)} × {roll?.width} cm
                                </Typography>
                            ) : (
                                <Typography variant="body1" sx={{fontWeight: 700, color: 'text.disabled'}}>
                                    – × {roll?.width} cm
                                </Typography>
                            )}
                        </Box>
                    </Box>

                    <TextField
                        label="Abzuschneidende Länge (cm)"
                        value={splitWidth}
                        onChange={(e) => setSplitWidth(e.target.value)}
                        type="number"
                        variant="outlined"
                        size="small"
                        fullWidth
                        autoFocus
                        slotProps={{htmlInput: {min: 0.01, step: 0.1}, inputLabel: labelProps}}
                    />

                    {navigateAfterSplit && (
                        <Box
                            sx={{
                                display: 'flex',
                                alignItems: 'flex-start',
                                gap: 1,
                                mt: 2,
                                p: 1.25,
                                borderRadius: 1.5,
                                bgcolor: (theme) => alpha(theme.palette.primary.main, 0.06),
                                border: (theme) => `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                            }}
                        >
                            <CallSplitIcon sx={{fontSize: 16, color: 'primary.main', mt: 0.1, flexShrink: 0}} />
                            <Typography variant="caption" color="primary.main">
                                Der Abschnitt wird als neue Rolle angelegt und direkt geöffnet.
                            </Typography>
                        </Box>
                    )}
                </DialogContent>
                <DialogActions sx={{px: 3, pb: 2.5}}>
                    <Button onClick={() => setIsSplitOpen(false)} disabled={isSplitting}>
                        Abbrechen
                    </Button>
                    <Button
                        variant="contained"
                        onClick={() => void handleSplit()}
                        disabled={isSplitting || !splitWidth || splitWidthNum <= 0}
                        startIcon={isSplitting ? <CircularProgress size={16} color="inherit" /> : navigateAfterSplit ? <CallSplitIcon /> : <ContentCutIcon />}
                    >
                        {navigateAfterSplit ? 'Abschneiden & öffnen' : 'Abschneiden'}
                    </Button>
                </DialogActions>
            </Dialog>
        </DetailPage>
    );
}
