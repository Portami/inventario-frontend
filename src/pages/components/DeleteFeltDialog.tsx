import {Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, Typography} from '@mui/material';
import {FeltDto} from '@/types/felt';

interface DeleteFeltDialogProps {
    open: boolean;
    felt: FeltDto | null;
    isDeleting: boolean;
    onConfirm: () => Promise<void>;
    onClose: () => void;
}

export default function DeleteFeltDialog({open, felt, isDeleting, onConfirm, onClose}: DeleteFeltDialogProps) {
    return (
        <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
            <DialogTitle>Filz löschen</DialogTitle>
            <DialogContent>
                <Typography>
                    {felt?.feltTypeName} – {felt?.color} wirklich löschen?
                </Typography>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} disabled={isDeleting}>
                    Abbrechen
                </Button>
                <Button
                    color="error"
                    variant="contained"
                    onClick={() => void onConfirm()}
                    disabled={isDeleting}
                    startIcon={isDeleting ? <CircularProgress size={16} color="inherit" /> : undefined}
                >
                    Löschen
                </Button>
            </DialogActions>
        </Dialog>
    );
}
