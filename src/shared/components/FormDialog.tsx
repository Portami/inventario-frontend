import CloseIcon from '@mui/icons-material/Close';
import {Breakpoint, Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, Grid, IconButton} from '@mui/material';
import {ReactNode} from 'react';

type FormDialogProps = {
    readonly open: boolean;
    readonly onClose: () => void;
    readonly title: ReactNode;
    readonly onSubmit: () => void;
    readonly submitLabel: string;
    readonly busy: boolean;
    readonly submitDisabled?: boolean;
    readonly cancelLabel?: string;
    readonly maxWidth?: Breakpoint;
    readonly gridSpacing?: number;
    readonly children: ReactNode;
};

/**
 * Standard form dialog scaffold: titled header with a close button, a grid-based content
 * area, and cancel/submit actions. The submit button shows a spinner while `busy`.
 */
export default function FormDialog({
    open,
    onClose,
    title,
    onSubmit,
    submitLabel,
    busy,
    submitDisabled = false,
    cancelLabel = 'Abbrechen',
    maxWidth = 'sm',
    gridSpacing = 3,
    children,
}: FormDialogProps) {
    return (
        <Dialog open={open} onClose={onClose} maxWidth={maxWidth} fullWidth>
            <DialogTitle sx={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 4, pt: 3}}>
                {title}
                <IconButton onClick={onClose} size="small" aria-label="close" disabled={busy}>
                    <CloseIcon />
                </IconButton>
            </DialogTitle>
            <DialogContent sx={{px: 4, pb: 3}}>
                <Grid container spacing={gridSpacing} sx={{mt: 0.5}}>
                    {children}
                </Grid>
            </DialogContent>
            <DialogActions sx={{px: 4, pb: 3}}>
                <Button variant="outlined" onClick={onClose} disabled={busy}>
                    {cancelLabel}
                </Button>
                <Button
                    variant="contained"
                    onClick={onSubmit}
                    disabled={busy || submitDisabled}
                    startIcon={busy ? <CircularProgress size={16} color="inherit" /> : undefined}
                >
                    {submitLabel}
                </Button>
            </DialogActions>
        </Dialog>
    );
}
