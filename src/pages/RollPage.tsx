import ListPage from '@/components/ListPage';
import RollList, {RollItem} from '@/components/RollList';
import {useToast} from '@/components/ToastProvider';
import {createRoll, deleteRoll, fetchFelts, fetchRolls} from '@/services/backend';
import {FeltDto} from '@/types/felt';
import {toErrorMessage} from '@/utils/pageUtils';
import AddIcon from '@mui/icons-material/Add';
import {Button, FormControl, InputLabel, MenuItem, Paper, Select, Stack, TextField} from '@mui/material';
import {useEffect, useState} from 'react';

export default function RollPage() {
    const showToast = useToast();
    const [rolls, setRolls] = useState<RollItem[]>([]);
    const [felts, setFelts] = useState<FeltDto[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [deletingIds, setDeletingIds] = useState<Set<number | string>>(new Set());
    const [error, setError] = useState('');

    const [feltId, setFeltId] = useState('');
    const [length, setLength] = useState('');
    const [width, setWidth] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        const load = async () => {
            try {
                const [fetchedRolls, fetchedFelts] = await Promise.all([fetchRolls(), fetchFelts()]);
                setRolls(fetchedRolls);
                setFelts(fetchedFelts);
            } catch (err) {
                setError(toErrorMessage(err, 'Daten konnten nicht geladen werden'));
            } finally {
                setIsLoading(false);
            }
        };
        void load();
    }, []);

    const handleDeleteRoll = async (rollId: string | number) => {
        setDeletingIds((prev) => new Set(prev).add(rollId));
        try {
            await deleteRoll(rollId);
            setRolls((prev) => prev.filter((r) => r.id !== rollId));
            showToast('Rolle erfolgreich gelöscht.', 'success');
        } catch {
            showToast('Löschen fehlgeschlagen. Bitte versuche es erneut.', 'error');
        } finally {
            setDeletingIds((prev) => {
                const next = new Set(prev);
                next.delete(rollId);
                return next;
            });
        }
    };

    const handleCreateRoll = async () => {
        setIsSubmitting(true);
        try {
            const newRoll = await createRoll({feltId: Number(feltId), length: Number(length), width: Number(width)});
            setRolls((prev) => [...prev, newRoll]);
            setFeltId('');
            setLength('');
            setWidth('');
            showToast('Rolle erfolgreich erstellt.', 'success');
        } catch (err) {
            showToast(toErrorMessage(err, 'Rolle konnte nicht erstellt werden'), 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <ListPage
            title="Rollen"
            description="Ansicht und Verwaltung aller Rollenbestände."
            isLoading={isLoading}
            isEmpty={false}
            error={error}
            onErrorClose={() => setError('')}
        >
            <Paper
                component="form"
                onSubmit={(e) => {
                    e.preventDefault();
                    void handleCreateRoll();
                }}
                sx={{p: 2}}
            >
                <Stack direction="row" spacing={2} sx={{alignItems: 'flex-end'}}>
                    <FormControl size="small" required sx={{minWidth: 220}}>
                        <InputLabel>Filz</InputLabel>
                        <Select label="Filz" value={feltId} onChange={(e) => setFeltId(String(e.target.value))}>
                            {felts.map((felt) => (
                                <MenuItem key={felt.id} value={felt.id}>
                                    {`${felt.feltTypeName} – ${felt.color} (${felt.articleNumber})`}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    <TextField
                        label="Länge (m)"
                        type="number"
                        size="small"
                        value={length}
                        onChange={(e) => setLength(e.target.value)}
                        slotProps={{htmlInput: {min: 0.01, step: 0.01}}}
                        required
                        sx={{width: 120}}
                    />
                    <TextField
                        label="Breite (m)"
                        type="number"
                        size="small"
                        value={width}
                        onChange={(e) => setWidth(e.target.value)}
                        slotProps={{htmlInput: {min: 0.01, step: 0.01}}}
                        required
                        sx={{width: 120}}
                    />
                    <Button type="submit" variant="contained" disabled={isSubmitting} startIcon={<AddIcon />}>
                        {isSubmitting ? 'Wird erstellt...' : 'Hinzufügen'}
                    </Button>
                </Stack>
            </Paper>
            <RollList rolls={rolls} onDelete={handleDeleteRoll} deletingIds={deletingIds} />
        </ListPage>
    );
}
