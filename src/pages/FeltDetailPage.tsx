import DetailPage from '@/components/DetailPage';
import {useToast} from '@/components/ToastProvider';
import DeleteFeltDialog from '@/pages/components/DeleteFeltDialog';
import FeltDialog from '@/pages/components/FeltDialog';
import RollDialog from '@/pages/components/RollDialog';
import {deleteFelt, deleteRoll, fetchFelts, fetchRolls, fetchScrapsByFelt} from '@/services/backend';
import {FeltDto} from '@/types/felt';
import {Product} from '@/types/product';
import {FeltRollDto} from '@/types/roll';
import {toErrorMessage} from '@/utils/pageUtils';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import EditIcon from '@mui/icons-material/Edit';
import {
    Box,
    Button,
    Card,
    CardContent,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Divider,
    IconButton,
    Stack,
    Typography,
} from '@mui/material';
import {alpha} from '@mui/material/styles';
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

export default function FeltDetailPage() {
    const {id} = useParams<{id: string}>();
    const navigate = useNavigate();
    const showToast = useToast();

    const feltId = id ? Number.parseInt(id, 10) : null;

    const [felt, setFelt] = useState<FeltDto | null>(null);
    const [allFelts, setAllFelts] = useState<FeltDto[]>([]);
    const [rolls, setRolls] = useState<FeltRollDto[]>([]);
    const [scraps, setScraps] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [feltToDelete, setFeltToDelete] = useState<FeltDto | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isCreateRollOpen, setIsCreateRollOpen] = useState(false);
    const [rollToDelete, setRollToDelete] = useState<FeltRollDto | null>(null);
    const [isDeletingRoll, setIsDeletingRoll] = useState(false);

    useEffect(() => {
        const load = async () => {
            if (feltId == null) return;
            setIsLoading(true);
            setError('');
            try {
                const [allFeltsResult, allRolls, scrapList] = await Promise.all([fetchFelts(), fetchRolls(), fetchScrapsByFelt(feltId)]);
                const found = allFeltsResult.find((f) => f.id === feltId);
                if (!found) {
                    setError('Filz nicht gefunden');
                    return;
                }
                setFelt(found);
                setAllFelts(allFeltsResult);
                setRolls(allRolls.filter((r) => r.feltId === feltId));
                setScraps(scrapList);
            } catch (err) {
                setError(toErrorMessage(err, 'Daten konnten nicht geladen werden'));
            } finally {
                setIsLoading(false);
            }
        };
        void load();
    }, [feltId]);

    const refetchFelt = () =>
        void fetchFelts()
            .then((felts) => {
                if (feltId == null) return;
                const found = felts.find((f) => f.id === feltId);
                if (found) {
                    setFelt(found);
                    setAllFelts(felts);
                }
            })
            .catch((err) => setError(toErrorMessage(err, 'Filz konnte nicht geladen werden')));

    const refetchRolls = () =>
        void fetchRolls()
            .then((allRolls) => {
                if (feltId == null) return;
                setRolls(allRolls.filter((r) => r.feltId === feltId));
            })
            .catch((err) => setError(toErrorMessage(err, 'Rollen konnten nicht geladen werden')));

    const handleFeltSaved = () => {
        setIsEditOpen(false);
        refetchFelt();
    };

    const handleFeltDelete = async () => {
        if (!feltToDelete) return;
        setIsDeleting(true);
        try {
            await deleteFelt(feltToDelete.id);
            showToast('Filz erfolgreich gelöscht.', 'success');
            navigate('/felts');
        } catch {
            showToast('Löschen fehlgeschlagen. Bitte versuche es erneut.', 'error');
        } finally {
            setIsDeleting(false);
            setFeltToDelete(null);
        }
    };

    const handleRollCreated = () => {
        setIsCreateRollOpen(false);
        refetchRolls();
    };

    const handleRollDeleteConfirm = async () => {
        if (!rollToDelete) return;
        setIsDeletingRoll(true);
        try {
            await deleteRoll(rollToDelete.id);
            setRollToDelete(null);
            refetchRolls();
            showToast('Rolle erfolgreich gelöscht.', 'success');
        } catch (err) {
            showToast(toErrorMessage(err, 'Rolle konnte nicht gelöscht werden'), 'error');
            setRollToDelete(null);
        } finally {
            setIsDeletingRoll(false);
        }
    };

    const title = felt ? `${felt.feltTypeName} – ${felt.color}` : 'Filzdetails';

    return (
        <DetailPage title={title} isLoading={isLoading} error={error} onBack={() => navigate('/felts')} onErrorClose={() => setError('')}>
            {felt && (
                <Stack spacing={3}>
                    <Box sx={{display: 'flex', justifyContent: 'flex-end', gap: 1}}>
                        <Button variant="outlined" startIcon={<EditIcon />} onClick={() => setIsEditOpen(true)}>
                            Bearbeiten
                        </Button>
                        <Button variant="outlined" color="error" startIcon={<DeleteIcon />} onClick={() => setFeltToDelete(felt)}>
                            Löschen
                        </Button>
                    </Box>

                    <Card>
                        <CardContent>
                            <Stack spacing={3}>
                                <div>
                                    <Typography variant="overline" color="textSecondary">
                                        Identifikation
                                    </Typography>
                                    <Box sx={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mt: 1}}>
                                        <Field label="Artikelnummer" value={felt.articleNumber} />
                                        <Field label="ID" value={felt.id} />
                                        <Field label="Filztyp" value={felt.feltTypeName} />
                                        <Field label="Farbe" value={felt.color} />
                                        <Field label="Lieferant" value={felt.supplierName} />
                                        <Field label="Lieferantenfarbe" value={felt.supplierColor} />
                                    </Box>
                                </div>

                                <Divider />

                                <div>
                                    <Typography variant="overline" color="textSecondary">
                                        Maße & Eigenschaften
                                    </Typography>
                                    <Box sx={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mt: 1}}>
                                        <Field label="Dicke (mm)" value={felt.thickness} />
                                        <Field label="Dichte (g/m²)" value={felt.density} />
                                        <Field label="Preis (CHF)" value={felt.price == null ? null : `CHF ${felt.price.toFixed(2)}`} />
                                    </Box>
                                </div>

                                <Divider />

                                <div>
                                    <Typography variant="overline" color="textSecondary">
                                        Status
                                    </Typography>
                                    <Box sx={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mt: 1}}>
                                        <Field label="Wenig Vorrat" value={felt.isLowOnSupply ? 'Ja' : 'Nein'} />
                                        <Field label="Nachbestellt" value={felt.hasBeenReordered ? 'Ja' : 'Nein'} />
                                    </Box>
                                </div>
                            </Stack>
                        </CardContent>
                    </Card>

                    <Box sx={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 3, alignItems: 'start'}}>
                        <Box>
                            <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2}}>
                                <Typography variant="h6">Rollen ({rolls.length})</Typography>
                                <Button variant="contained" size="small" startIcon={<AddIcon />} onClick={() => setIsCreateRollOpen(true)}>
                                    Neue Rolle
                                </Button>
                            </Box>
                            {rolls.length === 0 ? (
                                <Typography variant="body2" color="text.secondary">
                                    Noch keine Rollen vorhanden.
                                </Typography>
                            ) : (
                                <Box sx={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5}}>
                                    {[...rolls]
                                        .sort((a, b) => a.width - b.width || (a.storageName ?? '').localeCompare(b.storageName ?? ''))
                                        .map((roll) => (
                                            <Card
                                                key={roll.id}
                                                variant="outlined"
                                                onClick={() => void navigate(`/roll/${roll.id}`)}
                                                sx={{
                                                    cursor: 'pointer',
                                                    position: 'relative',
                                                    transition: 'border-color 0.15s, box-shadow 0.15s',
                                                    '&:hover': {
                                                        borderColor: 'primary.main',
                                                        boxShadow: (theme) => `0 0 0 1px ${theme.palette.primary.main}`,
                                                    },
                                                }}
                                            >
                                                <CardContent sx={{p: 2, '&:last-child': {pb: 2}}}>
                                                    <Typography sx={{fontSize: '1rem', fontWeight: 700, mb: 0.5, pr: 3, lineHeight: 1.3}}>
                                                        {Math.round(roll.length * 100)} × {Math.round(roll.width * 100)} cm
                                                    </Typography>
                                                    <Typography variant="caption" color="text.secondary" sx={{display: 'block'}}>
                                                        {roll.storageName ?? '–'}
                                                    </Typography>
                                                    {roll.batchName && (
                                                        <Typography variant="caption" color="text.secondary" sx={{display: 'block'}}>
                                                            Charge: {roll.batchName}
                                                        </Typography>
                                                    )}
                                                    <IconButton
                                                        size="small"
                                                        color="error"
                                                        aria-label="delete"
                                                        sx={{position: 'absolute', top: 6, right: 6}}
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setRollToDelete(roll);
                                                        }}
                                                    >
                                                        <DeleteOutlinedIcon fontSize="small" />
                                                    </IconButton>
                                                </CardContent>
                                            </Card>
                                        ))}
                                </Box>
                            )}
                        </Box>

                        <Box>
                            <Typography variant="h6" sx={{mb: 2}}>
                                Abfallstücke ({scraps.length})
                            </Typography>
                            {scraps.length === 0 ? (
                                <Typography variant="body2" color="text.secondary">
                                    Noch keine Abfallstücke vorhanden.
                                </Typography>
                            ) : (
                                <Box sx={{display: 'flex', flexWrap: 'wrap', gap: 1}}>
                                    {scraps.map((scrap) => (
                                        <Box
                                            key={scrap.id}
                                            onClick={() => void navigate(`/scrap/${scrap.id}`)}
                                            sx={{
                                                cursor: 'pointer',
                                                border: '1px solid',
                                                borderColor: 'divider',
                                                borderRadius: 2,
                                                px: 2,
                                                py: 1.25,
                                                transition: 'border-color 0.15s, background-color 0.15s',
                                                '&:hover': {
                                                    borderColor: 'primary.main',
                                                    bgcolor: (theme) => alpha(theme.palette.primary.main, 0.05),
                                                },
                                            }}
                                        >
                                            <Typography variant="body2" sx={{fontWeight: 600}}>
                                                {Math.round((scrap.length ?? 0) / 10)} × {Math.round((scrap.width ?? 0) / 10)} cm
                                            </Typography>
                                        </Box>
                                    ))}
                                </Box>
                            )}
                        </Box>
                    </Box>
                </Stack>
            )}

            <FeltDialog open={isEditOpen} felt={felt} felts={allFelts} onClose={() => setIsEditOpen(false)} onSaved={handleFeltSaved} />
            <DeleteFeltDialog
                open={feltToDelete !== null}
                felt={feltToDelete}
                isDeleting={isDeleting}
                onConfirm={handleFeltDelete}
                onClose={() => setFeltToDelete(null)}
            />
            <RollDialog
                open={isCreateRollOpen}
                felts={allFelts}
                defaultFeltId={feltId ?? undefined}
                onClose={() => setIsCreateRollOpen(false)}
                onSaved={handleRollCreated}
            />
            <Dialog open={rollToDelete !== null} onClose={() => setRollToDelete(null)} maxWidth="xs" fullWidth>
                <DialogTitle>
                    <Box sx={{display: 'flex', alignItems: 'center', gap: 1}}>
                        <DeleteOutlinedIcon color="error" />
                        Rolle löschen
                    </Box>
                </DialogTitle>
                <DialogContent>
                    <Typography>
                        {rollToDelete?.feltTypeName} – {rollToDelete?.color} wirklich löschen?
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setRollToDelete(null)} disabled={isDeletingRoll}>
                        Abbrechen
                    </Button>
                    <Button
                        color="error"
                        variant="contained"
                        onClick={() => void handleRollDeleteConfirm()}
                        disabled={isDeletingRoll}
                        startIcon={isDeletingRoll ? <CircularProgress size={16} color="inherit" /> : undefined}
                    >
                        Löschen
                    </Button>
                </DialogActions>
            </Dialog>
        </DetailPage>
    );
}
