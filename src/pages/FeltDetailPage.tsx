import DetailPage from '@/components/DetailPage';
import DeleteFeltDialog from '@/components/felts/DeleteFeltDialog';
import FeltDialog from '@/components/felts/FeltDialog';
import PieceCard from '@/components/pieces/PieceCard';
import RollDialog from '@/components/rolls/RollDialog';
import {useToast} from '@/components/ToastProvider';
import {deleteFelt, deleteRoll, deleteScrap, fetchFelts, fetchRolls, fetchRollsByFelt, fetchScrapsByFelt, splitRoll} from '@/services/backend';
import {FeltDto} from '@/types/felt';
import {FeltRollDto, ScrapPieceDto} from '@/types/roll';
import {toErrorMessage} from '@/utils/pageUtils';
import AddIcon from '@mui/icons-material/Add';
import CallSplitIcon from '@mui/icons-material/CallSplit';
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
    Stack,
    TextField,
    Typography,
} from '@mui/material';
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

    const parsed = id == null ? Number.NaN : Number.parseInt(id, 10);
    const feltId = Number.isNaN(parsed) ? null : parsed;

    const [felt, setFelt] = useState<FeltDto | null>(null);
    const [allFelts, setAllFelts] = useState<FeltDto[]>([]);
    const [rolls, setRolls] = useState<FeltRollDto[]>([]);
    const [scraps, setScraps] = useState<ScrapPieceDto[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [feltToDelete, setFeltToDelete] = useState<FeltDto | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isCreateRollOpen, setIsCreateRollOpen] = useState(false);
    const [rollToDelete, setRollToDelete] = useState<FeltRollDto | null>(null);
    const [isDeletingRoll, setIsDeletingRoll] = useState(false);
    const [rollToSplit, setRollToSplit] = useState<FeltRollDto | null>(null);
    const [splitWidthInput, setSplitWidthInput] = useState('');
    const [isSplitting, setIsSplitting] = useState(false);
    const [scrapToDelete, setScrapToDelete] = useState<ScrapPieceDto | null>(null);
    const [isDeletingScrap, setIsDeletingScrap] = useState(false);

    useEffect(() => {
        const load = async () => {
            if (feltId == null) {
                setError('Ungültige Filz-ID');
                setIsLoading(false);
                return;
            }
            setIsLoading(true);
            setError('');
            setFelt(null);
            setAllFelts([]);
            setRolls([]);
            setScraps([]);
            try {
                const [allFeltsResult, allRolls, scrapList] = await Promise.all([fetchFelts(), fetchRollsByFelt(feltId), fetchScrapsByFelt(feltId)]);
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

    const refetchFelt = async () => {
        if (feltId == null) return;
        try {
            const felts = await fetchFelts();
            const found = felts.find((f) => f.id === feltId);
            if (found) {
                setFelt(found);
                setAllFelts(felts);
            }
        } catch (err) {
            setError(toErrorMessage(err, 'Filz konnte nicht geladen werden'));
        }
    };

    const refetchRolls = async () => {
        if (feltId == null) return;
        try {
            const allRolls = await fetchRolls();
            setRolls(allRolls.filter((r) => r.feltId === feltId));
        } catch (err) {
            setError(toErrorMessage(err, 'Rollen konnten nicht geladen werden'));
        }
    };

    const refetchScraps = async () => {
        if (feltId == null) return;
        try {
            setScraps(await fetchScrapsByFelt(feltId));
        } catch (err) {
            setError(toErrorMessage(err, 'Reststücke konnten nicht geladen werden'));
        }
    };

    const handleFeltSaved = () => {
        setIsEditOpen(false);
        void refetchFelt();
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

    const handleRollCreated = (roll: FeltRollDto) => {
        setIsCreateRollOpen(false);
        navigate(`/roll/${roll.id}`);
    };

    const handleRollDeleteConfirm = async () => {
        if (!rollToDelete) return;
        setIsDeletingRoll(true);
        try {
            await deleteRoll(rollToDelete.id);
            setRollToDelete(null);
            void refetchRolls();
            showToast('Rolle erfolgreich gelöscht.', 'success');
        } catch (err) {
            showToast(toErrorMessage(err, 'Rolle konnte nicht gelöscht werden'), 'error');
            setRollToDelete(null);
        } finally {
            setIsDeletingRoll(false);
        }
    };

    const handleScrapDeleteConfirm = async () => {
        if (!scrapToDelete) return;
        setIsDeletingScrap(true);
        try {
            await deleteScrap(scrapToDelete.id);
            setScrapToDelete(null);
            void refetchScraps();
            showToast('Reststück erfolgreich gelöscht.', 'success');
        } catch (err) {
            showToast(toErrorMessage(err, 'Reststück konnte nicht gelöscht werden'), 'error');
            setScrapToDelete(null);
        } finally {
            setIsDeletingScrap(false);
        }
    };

    const handleCutAway = async () => {
        if (!rollToSplit) return;
        const width = Number.parseFloat(splitWidthInput);
        if (Number.isNaN(width) || width <= 0) return;
        setIsSplitting(true);
        try {
            const newRoll = await splitRoll(rollToSplit.id, {width});
            setRollToSplit(null);
            setSplitWidthInput('');
            if (newRoll.id === rollToSplit.id) {
                void refetchRolls();
                showToast('Rolle erfolgreich abgeschnitten.');
            } else {
                navigate(`/roll/${newRoll.id}`);
            }
        } catch (err) {
            showToast(toErrorMessage(err, 'Rolle konnte nicht abgeschnitten werden'), 'error');
        } finally {
            setIsSplitting(false);
        }
    };

    const sortedRolls = [...rolls].sort((a, b) => {
        const aIs180 = a.width === 180 ? 1 : 0;
        const bIs180 = b.width === 180 ? 1 : 0;
        if (aIs180 !== bIs180) return aIs180 - bIs180;
        return a.width - b.width || (a.storageName ?? '').localeCompare(b.storageName ?? '');
    });

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
                                        Masse & Eigenschaften
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
                                    {sortedRolls.map((roll) => (
                                        <PieceCard
                                            key={roll.id}
                                            piece={roll}
                                            onOpen={() => void navigate(`/roll/${roll.id}`)}
                                            onDelete={() => setRollToDelete(roll)}
                                        />
                                    ))}
                                </Box>
                            )}
                        </Box>

                        <Box>
                            <Typography variant="h6" sx={{mb: 2}}>
                                Reststücke ({scraps.length})
                            </Typography>
                            {scraps.length === 0 ? (
                                <Typography variant="body2" color="text.secondary">
                                    Noch keine Reststücke vorhanden.
                                </Typography>
                            ) : (
                                <Box sx={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5}}>
                                    {scraps.map((scrap) => (
                                        <PieceCard
                                            key={scrap.id}
                                            piece={scrap}
                                            onOpen={() => void navigate(`/scrap/${scrap.id}`)}
                                            onDelete={() => setScrapToDelete(scrap)}
                                        />
                                    ))}
                                </Box>
                            )}
                        </Box>
                    </Box>
                </Stack>
            )}

            <FeltDialog open={isEditOpen} felt={felt} onClose={() => setIsEditOpen(false)} onSaved={handleFeltSaved} />
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
                    <Typography>{rollToDelete && `Rolle ${rollToDelete.length} × ${rollToDelete.width} cm wirklich löschen?`}</Typography>
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

            <Dialog open={scrapToDelete !== null} onClose={() => setScrapToDelete(null)} maxWidth="xs" fullWidth>
                <DialogTitle>
                    <Box sx={{display: 'flex', alignItems: 'center', gap: 1}}>
                        <DeleteOutlinedIcon color="error" />
                        Reststück löschen
                    </Box>
                </DialogTitle>
                <DialogContent>
                    <Typography>{scrapToDelete && `Reststück ${scrapToDelete.length} × ${scrapToDelete.width} cm wirklich löschen?`}</Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setScrapToDelete(null)} disabled={isDeletingScrap}>
                        Abbrechen
                    </Button>
                    <Button
                        color="error"
                        variant="contained"
                        onClick={() => void handleScrapDeleteConfirm()}
                        disabled={isDeletingScrap}
                        startIcon={isDeletingScrap ? <CircularProgress size={16} color="inherit" /> : undefined}
                    >
                        Löschen
                    </Button>
                </DialogActions>
            </Dialog>

            <Dialog open={rollToSplit !== null} onClose={() => setRollToSplit(null)} maxWidth="xs" fullWidth>
                <DialogTitle>
                    <Box sx={{display: 'flex', alignItems: 'center', gap: 1}}>
                        <CallSplitIcon fontSize="small" />
                        Rolle abschneiden
                    </Box>
                </DialogTitle>
                <DialogContent>
                    {rollToSplit && (
                        <Typography variant="body2" color="text.secondary" sx={{mb: 2}}>
                            {rollToSplit.length} × {rollToSplit.width} cm
                        </Typography>
                    )}
                    <TextField
                        label="Abzuschneidende Breite (cm)"
                        value={splitWidthInput}
                        onChange={(e) => setSplitWidthInput(e.target.value)}
                        type="number"
                        size="small"
                        fullWidth
                        autoFocus
                        slotProps={{htmlInput: {min: 0.01, step: 0.1}}}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setRollToSplit(null)} disabled={isSplitting}>
                        Abbrechen
                    </Button>
                    <Button
                        variant="contained"
                        onClick={() => void handleCutAway()}
                        disabled={isSplitting || !splitWidthInput || Number.parseFloat(splitWidthInput) <= 0}
                        startIcon={isSplitting ? <CircularProgress size={16} color="inherit" /> : <CallSplitIcon />}
                    >
                        Abschneiden
                    </Button>
                </DialogActions>
            </Dialog>
        </DetailPage>
    );
}
