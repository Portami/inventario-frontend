import ListPage from '@/components/ListPage';
import RollList, {RollItem} from '@/components/RollList';
import {useToast} from '@/components/ToastProvider';
import RollDialog from '@/pages/components/RollDialog';
import {deleteRoll, fetchFelts, fetchRolls} from '@/services/backend';
import {FeltDto} from '@/types/felt';
import {toErrorMessage} from '@/utils/pageUtils';
import AddIcon from '@mui/icons-material/Add';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import {Box, Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, Typography} from '@mui/material';
import {useEffect, useState} from 'react';

export default function RollPage() {
    const showToast = useToast();
    const [rolls, setRolls] = useState<RollItem[]>([]);
    const [felts, setFelts] = useState<FeltDto[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [rollToDelete, setRollToDelete] = useState<RollItem | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

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

    const refetch = () =>
        void fetchRolls()
            .then(setRolls)
            .catch((err) => setError(toErrorMessage(err, 'Rollen konnten nicht geladen werden')));

    const handleCreated = () => {
        setIsCreateOpen(false);
        refetch();
    };

    const handleDeleteConfirm = async () => {
        if (!rollToDelete) return;
        setIsDeleting(true);
        try {
            await deleteRoll(rollToDelete.id);
            setRollToDelete(null);
            refetch();
            showToast('Rolle erfolgreich gelöscht.', 'success');
        } catch (err) {
            showToast(toErrorMessage(err, 'Rolle konnte nicht gelöscht werden'), 'error');
            setRollToDelete(null);
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <ListPage
            title="Rollen"
            description="Ansicht und Verwaltung aller Rollenbestände."
            actions={
                <Button variant="contained" startIcon={<AddIcon />} onClick={() => setIsCreateOpen(true)}>
                    Neue Rolle
                </Button>
            }
            isLoading={isLoading}
            isEmpty={false}
            error={error}
            onErrorClose={() => setError('')}
        >
            <RollList
                rolls={rolls}
                onDelete={(rollId) => {
                    const roll = rolls.find((r) => r.id === rollId);
                    if (roll) setRollToDelete(roll);
                    return Promise.resolve();
                }}
                deletingIds={new Set()}
            />

            <RollDialog open={isCreateOpen} felts={felts} onClose={() => setIsCreateOpen(false)} onSaved={handleCreated} />

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
                    <Button onClick={() => setRollToDelete(null)} disabled={isDeleting}>
                        Abbrechen
                    </Button>
                    <Button
                        color="error"
                        variant="contained"
                        onClick={() => void handleDeleteConfirm()}
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
