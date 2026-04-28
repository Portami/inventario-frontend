import {createRoll, updateRoll} from '@/services/backend';
import {FeltDto} from '@/types/felt';
import {FeltRollDto} from '@/types/roll';
import CloseIcon from '@mui/icons-material/Close';
import {Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, Grid, IconButton, MenuItem, TextField} from '@mui/material';
import {ChangeEvent, useEffect, useState} from 'react';

type RollDialogProps = {
    readonly open: boolean;
    readonly onClose: () => void;
    readonly onSaved: () => void;
    readonly roll?: FeltRollDto | null;
    readonly felts: FeltDto[];
};

type FormState = {
    feltId: string;
    length: string;
    width: string;
    batchId: string;
    storageId: string;
};

const emptyForm: FormState = {feltId: '', length: '', width: '', batchId: '', storageId: ''};

const labelProps = {shrink: true, sx: {textTransform: 'uppercase' as const, letterSpacing: '0.05em', fontWeight: 600}};

export default function RollDialog({open, onClose, onSaved, roll, felts}: RollDialogProps) {
    const [form, setForm] = useState<FormState>(emptyForm);
    const [isSaving, setIsSaving] = useState(false);

    const isEdit = roll != null;

    useEffect(() => {
        if (!open) return;
        setForm(
            roll
                ? {
                      feltId: String(roll.feltId),
                      length: String(roll.length),
                      width: String(roll.width),
                      batchId: roll.batchId == null ? '' : String(roll.batchId),
                      storageId: roll.storageId == null ? '' : String(roll.storageId),
                  }
                : emptyForm,
        );
    }, [open, roll]);

    const setField = (field: keyof FormState) => (e: ChangeEvent<HTMLInputElement>) => setForm((prev) => ({...prev, [field]: e.target.value}));

    const handleSave = async () => {
        const length = Number.parseFloat(form.length);
        const width = Number.parseFloat(form.width);
        if (Number.isNaN(length) || length <= 0 || Number.isNaN(width) || width <= 0) return;
        setIsSaving(true);
        try {
            if (roll == null) {
                const feltId = Number.parseInt(form.feltId, 10);
                if (Number.isNaN(feltId)) {
                    setIsSaving(false);
                    return;
                }
                await createRoll({
                    feltId,
                    length,
                    width,
                    ...(form.batchId && {batchId: Number.parseInt(form.batchId, 10)}),
                    ...(form.storageId && {storageId: Number.parseInt(form.storageId, 10)}),
                });
            } else {
                await updateRoll(roll.id, {
                    length,
                    width,
                    ...(form.batchId && {batchId: Number.parseInt(form.batchId, 10)}),
                    ...(form.storageId && {storageId: Number.parseInt(form.storageId, 10)}),
                });
            }
            onSaved();
        } catch {
            // errors will be surfaced via toast once ToastProvider is merged
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle sx={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 4, pt: 3}}>
                {isEdit ? `${roll.feltTypeName} – ${roll.color}` : 'Neue Rolle'}
                <IconButton onClick={onClose} size="small" aria-label="close" disabled={isSaving}>
                    <CloseIcon />
                </IconButton>
            </DialogTitle>
            <DialogContent sx={{px: 4, pb: 3}}>
                <Grid container spacing={3} sx={{mt: 0.5}}>
                    <Grid size={6}>
                        {isEdit ? (
                            <TextField
                                label="Filztyp"
                                value={roll.feltTypeName}
                                variant="outlined"
                                size="small"
                                fullWidth
                                slotProps={{input: {readOnly: true}, inputLabel: labelProps}}
                            />
                        ) : (
                            <TextField
                                select
                                label="Filz"
                                value={form.feltId}
                                onChange={setField('feltId')}
                                variant="outlined"
                                size="small"
                                fullWidth
                                required
                                slotProps={{inputLabel: labelProps}}
                            >
                                {felts.map((f) => (
                                    <MenuItem key={f.id} value={String(f.id)}>
                                        {`${f.feltTypeName} – ${f.color} (${f.articleNumber})`}
                                    </MenuItem>
                                ))}
                            </TextField>
                        )}
                    </Grid>
                    <Grid size={6}>
                        {isEdit ? (
                            <TextField
                                label="Farbe"
                                value={roll.color}
                                variant="outlined"
                                size="small"
                                fullWidth
                                slotProps={{input: {readOnly: true}, inputLabel: labelProps}}
                            />
                        ) : (
                            <TextField
                                label="Lieferant"
                                value={felts.find((f) => String(f.id) === form.feltId)?.supplierName ?? ''}
                                variant="outlined"
                                size="small"
                                fullWidth
                                slotProps={{input: {readOnly: true}, inputLabel: labelProps}}
                            />
                        )}
                    </Grid>
                    <Grid size={6}>
                        <TextField
                            label="Länge (m)"
                            value={form.length}
                            onChange={setField('length')}
                            type="number"
                            variant="outlined"
                            size="small"
                            fullWidth
                            required
                            slotProps={{htmlInput: {min: 0.01, step: 0.01}, inputLabel: labelProps}}
                        />
                    </Grid>
                    <Grid size={6}>
                        <TextField
                            label="Breite (m)"
                            value={form.width}
                            onChange={setField('width')}
                            type="number"
                            variant="outlined"
                            size="small"
                            fullWidth
                            required
                            slotProps={{htmlInput: {min: 0.01, step: 0.01}, inputLabel: labelProps}}
                        />
                    </Grid>
                    <Grid size={6}>
                        <TextField
                            label="Charge-ID"
                            value={form.batchId}
                            onChange={setField('batchId')}
                            type="number"
                            variant="outlined"
                            size="small"
                            fullWidth
                            slotProps={{htmlInput: {min: 1}, inputLabel: labelProps}}
                        />
                    </Grid>
                    <Grid size={6}>
                        <TextField
                            label="Lagerort-ID"
                            value={form.storageId}
                            onChange={setField('storageId')}
                            type="number"
                            variant="outlined"
                            size="small"
                            fullWidth
                            slotProps={{htmlInput: {min: 1}, inputLabel: labelProps}}
                        />
                    </Grid>
                </Grid>
            </DialogContent>
            <DialogActions sx={{px: 4, pb: 3}}>
                <Button variant="outlined" onClick={onClose} disabled={isSaving}>
                    Abbrechen
                </Button>
                <Button
                    variant="contained"
                    onClick={() => void handleSave()}
                    disabled={isSaving}
                    startIcon={isSaving ? <CircularProgress size={16} color="inherit" /> : undefined}
                >
                    Speichern
                </Button>
            </DialogActions>
        </Dialog>
    );
}
