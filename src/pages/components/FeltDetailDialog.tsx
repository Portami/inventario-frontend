import {useToast} from '@/components/ToastProvider';
import {updateFelt} from '@/services/backend';
import {FeltDto} from '@/types/felt';
import CloseIcon from '@mui/icons-material/Close';
import {Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, Grid, IconButton, TextField} from '@mui/material';
import {ChangeEvent, useEffect, useState} from 'react';

type FeltDetailDialogProps = {
    readonly felt: FeltDto | null;
    readonly onClose: () => void;
    readonly onSaved: () => void;
};

type FormState = {
    articleNumber: string;
    color: string;
    supplierColor: string;
    price: string;
    thickness: string;
    density: string;
};

const labelProps = {shrink: true, sx: {textTransform: 'uppercase' as const, letterSpacing: '0.05em', fontWeight: 600}};

export default function FeltDetailDialog({felt, onClose, onSaved}: FeltDetailDialogProps) {
    const showToast = useToast();
    const [form, setForm] = useState<FormState | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (felt) {
            setForm({
                articleNumber: felt.articleNumber,
                color: felt.color,
                supplierColor: felt.supplierColor,
                price: String(felt.price),
                thickness: String(felt.thickness),
                density: String(felt.density),
            });
        }
    }, [felt]);

    const setField = (field: keyof FormState) => (e: ChangeEvent<HTMLInputElement>) => setForm((prev) => (prev ? {...prev, [field]: e.target.value} : prev));

    const handleSave = async () => {
        if (!felt || !form) return;
        const thickness = Number.parseFloat(form.thickness);
        const density = Number.parseFloat(form.density);
        const price = Number.parseFloat(form.price);
        if (Number.isNaN(thickness) || Number.isNaN(density) || Number.isNaN(price)) {
            showToast('Bitte gültige Zahlen für Dicke, Dichte und Preis eingeben.', 'warning');
            return;
        }
        setIsSaving(true);
        try {
            await updateFelt(felt.id, {
                articleNumber: form.articleNumber,
                color: form.color,
                supplierColor: form.supplierColor,
                price,
                thickness,
                density,
                supplierId: felt.supplierId,
                feltTypeId: felt.feltTypeId,
            });
            showToast('Filz erfolgreich gespeichert.', 'success');
            onSaved();
        } catch {
            showToast('Speichern fehlgeschlagen. Bitte versuche es erneut.', 'error');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <Dialog open={felt !== null} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle sx={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
                {felt ? `${felt.feltTypeName} – ${felt.color}` : ''}
                <IconButton onClick={onClose} size="small" aria-label="close" disabled={isSaving}>
                    <CloseIcon />
                </IconButton>
            </DialogTitle>
            <DialogContent>
                <Grid container spacing={2} sx={{mt: 0.5}}>
                    <Grid size={6}>
                        <TextField
                            label="Artikelnummer"
                            value={form?.articleNumber ?? ''}
                            onChange={setField('articleNumber')}
                            variant="outlined"
                            size="small"
                            fullWidth
                            slotProps={{inputLabel: labelProps}}
                        />
                    </Grid>
                    <Grid size={6}>
                        <TextField
                            label="Material-Typ"
                            value={felt?.feltTypeName ?? ''}
                            variant="outlined"
                            size="small"
                            fullWidth
                            slotProps={{input: {readOnly: true}, inputLabel: labelProps}}
                        />
                    </Grid>
                    <Grid size={6}>
                        <TextField
                            label="Farbe"
                            value={form?.color ?? ''}
                            onChange={setField('color')}
                            variant="outlined"
                            size="small"
                            fullWidth
                            slotProps={{inputLabel: labelProps}}
                        />
                    </Grid>
                    <Grid size={6}>
                        <TextField
                            label="Lieferantenfarbe"
                            value={form?.supplierColor ?? ''}
                            onChange={setField('supplierColor')}
                            variant="outlined"
                            size="small"
                            fullWidth
                            slotProps={{inputLabel: labelProps}}
                        />
                    </Grid>
                    <Grid size={6}>
                        <TextField
                            label="Lieferant"
                            value={felt?.supplierName ?? ''}
                            variant="outlined"
                            size="small"
                            fullWidth
                            slotProps={{input: {readOnly: true}, inputLabel: labelProps}}
                        />
                    </Grid>
                    <Grid size={6}>
                        <TextField
                            label="Preis (CHF)"
                            value={form?.price ?? ''}
                            onChange={setField('price')}
                            type="number"
                            variant="outlined"
                            size="small"
                            fullWidth
                            slotProps={{inputLabel: labelProps}}
                        />
                    </Grid>
                    <Grid size={6}>
                        <TextField
                            label="Dicke (mm)"
                            value={form?.thickness ?? ''}
                            onChange={setField('thickness')}
                            type="number"
                            variant="outlined"
                            size="small"
                            fullWidth
                            slotProps={{inputLabel: labelProps}}
                        />
                    </Grid>
                    <Grid size={6}>
                        <TextField
                            label="Dichte (g/m²)"
                            value={form?.density ?? ''}
                            onChange={setField('density')}
                            type="number"
                            variant="outlined"
                            size="small"
                            fullWidth
                            slotProps={{inputLabel: labelProps}}
                        />
                    </Grid>
                </Grid>
            </DialogContent>
            <DialogActions>
                <Button variant="outlined" onClick={onClose} disabled={isSaving}>
                    Abbrechen
                </Button>
                <Button
                    variant="contained"
                    onClick={handleSave}
                    disabled={isSaving}
                    startIcon={isSaving ? <CircularProgress size={16} color="inherit" /> : undefined}
                >
                    Speichern
                </Button>
            </DialogActions>
        </Dialog>
    );
}
