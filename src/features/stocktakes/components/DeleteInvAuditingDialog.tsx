import {FeltStocktakeDto} from '@/types/inventoryAuditing.ts';
import {Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, Typography} from '@mui/material';

interface DeleteInvAuditingDialogProps {
    open: boolean;
    inventoryAuditing: FeltStocktakeDto | null;
    isDeleting: boolean;
    onConfirm: () => Promise<void>;
    onClose: () => void;
}

export function DeleteInvAuditingDialog({open, inventoryAuditing, isDeleting, onConfirm, onClose}: DeleteInvAuditingDialogProps) {
    return (
        <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
            <DialogTitle>Bestandsprüfung löschen</DialogTitle>
            <DialogContent>
                <Typography>{inventoryAuditing?.description} wirklich löschen?</Typography>
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
