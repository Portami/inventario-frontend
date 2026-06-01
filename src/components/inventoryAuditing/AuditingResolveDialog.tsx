import {useToast} from '@/components/ToastProvider.tsx';
import {resolveStocktakeItem} from '@/services/backend.ts';
import {RESOLUTION_TYPE, ResolutionType} from '@/types/inventoryAuditing.ts';
import CloseIcon from '@mui/icons-material/Close';
import {Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, MenuItem, TextField} from '@mui/material';
import {ChangeEvent, useEffect, useState} from 'react';

interface AuditingResolveDialogProps {
    itemId: string;
    inventoryId: string;
    open: boolean;
    onClose: () => void;
}

type FormState = {
    resolutionType: ResolutionType;
    comment: string;
};

const emptyForm: FormState = {
    resolutionType: 'Acknowledge',
    comment: '',
};

const labelProps = {shrink: true, sx: {textTransform: 'uppercase' as const, letterSpacing: '0.05em', fontWeight: 600}};

export function AuditingResolveDialog({open, onClose, itemId, inventoryId}: AuditingResolveDialogProps) {
    const showToast = useToast();
    const [form, setForm] = useState<FormState>(emptyForm);
    const [isSaving, setIsSaving] = useState(false);
    const setField = (field: keyof FormState) => (e: ChangeEvent<HTMLInputElement>) => setForm((prev) => ({...prev, [field]: e.target.value}));

    useEffect(() => {
        if (!open) return;
        setForm(emptyForm);
    }, [open]);

    const handleSave = async () => {
        try {
            setIsSaving(true);
            await resolveStocktakeItem(inventoryId, itemId, {
                resolution: form.resolutionType,
                comment: form.comment,
            });
            showToast('Lösung erfolgreicht übernommen.', 'success');
        } catch {
            showToast('Lösung konnte nicht vorgenommen werden.', 'error');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle sx={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 4, pt: 3}}>
                Problem lösen
                <IconButton onClick={onClose} size="small" aria-label="close" disabled={isSaving}>
                    <CloseIcon />
                </IconButton>
            </DialogTitle>
            <DialogContent sx={{px: 4, pb: 3}}>
                <TextField
                    select
                    label="Lösungsart"
                    value={form.resolutionType}
                    onChange={setField('resolutionType')}
                    variant="outlined"
                    size="small"
                    fullWidth
                    slotProps={{inputLabel: labelProps}}
                >
                    {Object.entries(RESOLUTION_TYPE).map(([id, name]) => (
                        <MenuItem key={id} value={id}>
                            {name}
                        </MenuItem>
                    ))}
                </TextField>
                <TextField
                    label="Bemerkung"
                    value={form.comment}
                    onChange={setField('comment')}
                    variant="outlined"
                    size="small"
                    fullWidth
                    slotProps={{inputLabel: labelProps}}
                />
            </DialogContent>
            <DialogActions sx={{px: 4, pb: 3}}>
                <Button variant="outlined" onClick={onClose} disabled={isSaving}>
                    Abbrechen
                </Button>
                <Button
                    variant="contained"
                    onClick={handleSave}
                    disabled={isSaving}
                    startIcon={isSaving ? <CircularProgress size={16} color="inherit" /> : undefined}
                >
                    Übernehmen
                </Button>
            </DialogActions>
        </Dialog>
    );
}
