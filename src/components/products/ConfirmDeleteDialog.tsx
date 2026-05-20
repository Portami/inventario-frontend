import {Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, Typography} from '@mui/material';

type ConfirmDeleteDialogProps = {
    readonly open: boolean;
    readonly title: string;
    readonly message: string;
    readonly isDeleting: boolean;
    readonly onConfirm: () => Promise<void>;
    readonly onClose: () => void;
};

export default function ConfirmDeleteDialog({open, title, message, isDeleting, onConfirm, onClose}: ConfirmDeleteDialogProps) {
    return (
        <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
            <DialogTitle>{title}</DialogTitle>
            <DialogContent>
                <Typography>{message}</Typography>
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
