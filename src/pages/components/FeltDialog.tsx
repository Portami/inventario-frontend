import {useToast} from '@/components/ToastProvider';
import {createFelt, updateFelt} from '@/services/backend';
import {FeltDto} from '@/types/felt';
import CloseIcon from '@mui/icons-material/Close';
import {Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, Grid, IconButton, MenuItem, TextField} from '@mui/material';
import {ChangeEvent, useEffect, useMemo, useState} from 'react';

type FeltDialogProps = {
    readonly open: boolean;
    readonly onClose: () => void;
    readonly onSaved: () => void;
    readonly felt?: FeltDto | null;
    readonly felts: FeltDto[];
};

type FormState = {
    articleNumber: string;
    color: string;
    supplierColor: string;
    price: string;
    thickness: string;
    density: string;
    supplierId: string;
    feltTypeId: string;
};

const emptyForm: FormState = {
    articleNumber: '',
    color: '',
    supplierColor: '',
    price: '',
    thickness: '',
    density: '',
    supplierId: '',
    feltTypeId: '',
};

const labelProps = {shrink: true, sx: {textTransform: 'uppercase' as const, letterSpacing: '0.05em', fontWeight: 600}};

export default function FeltDialog({open, onClose, onSaved, felt, felts}: FeltDialogProps) {
    const showToast = useToast();
    const [form, setForm] = useState<FormState>(emptyForm);
    const [isSaving, setIsSaving] = useState(false);

    const isEdit = felt != null;

    useEffect(() => {
        if (!open) return;
        setForm(
            felt
                ? {
                      articleNumber: felt.articleNumber,
                      color: felt.color,
                      supplierColor: felt.supplierColor,
                      price: String(felt.price),
                      thickness: String(felt.thickness),
                      density: String(felt.density),
                      supplierId: String(felt.supplierId),
                      feltTypeId: String(felt.feltTypeId),
                  }
                : emptyForm,
        );
    }, [open, felt]);

    const supplierOptions = useMemo(() => {
        const seen = new Set<number>();
        return felts
            .filter((f) => {
                if (seen.has(f.supplierId)) return false;
                seen.add(f.supplierId);
                return true;
            })
            .map((f) => ({id: f.supplierId, name: f.supplierName}));
    }, [felts]);

    const feltTypeOptions = useMemo(() => {
        const seen = new Set<number>();
        return felts
            .filter((f) => {
                if (seen.has(f.feltTypeId)) return false;
                seen.add(f.feltTypeId);
                return true;
            })
            .map((f) => ({id: f.feltTypeId, name: f.feltTypeName}));
    }, [felts]);

    const setField = (field: keyof FormState) => (e: ChangeEvent<HTMLInputElement>) => setForm((prev) => ({...prev, [field]: e.target.value}));

    const handleSave = async () => {
        const thickness = Number.parseFloat(form.thickness);
        const density = Number.parseFloat(form.density);
        const price = Number.parseFloat(form.price);
        if (Number.isNaN(thickness) || Number.isNaN(density) || Number.isNaN(price)) {
            showToast('Bitte gültige Zahlen für Dicke, Dichte und Preis eingeben.', 'warning');
            return;
        }
        setIsSaving(true);
        try {
            if (felt == null) {
                const supplierId = Number.parseInt(form.supplierId, 10);
                const feltTypeId = Number.parseInt(form.feltTypeId, 10);
                if (Number.isNaN(supplierId) || Number.isNaN(feltTypeId)) {
                    showToast('Bitte Lieferant und Material-Typ auswählen.', 'warning');
                    setIsSaving(false);
                    return;
                }
                await createFelt({
                    articleNumber: form.articleNumber,
                    color: form.color,
                    supplierColor: form.supplierColor,
                    price,
                    thickness,
                    density,
                    supplierId,
                    feltTypeId,
                });
                showToast('Filz erfolgreich erstellt.', 'success');
            } else {
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
            }
            onSaved();
        } catch {
            showToast(isEdit ? 'Speichern fehlgeschlagen. Bitte versuche es erneut.' : 'Erstellen fehlgeschlagen. Bitte versuche es erneut.', 'error');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle sx={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 4, pt: 3}}>
                {isEdit ? `${felt.feltTypeName} – ${felt.color}` : 'Neuer Filz'}
                <IconButton onClick={onClose} size="small" aria-label="close" disabled={isSaving}>
                    <CloseIcon />
                </IconButton>
            </DialogTitle>
            <DialogContent sx={{px: 4, pb: 3}}>
                <Grid container spacing={3} sx={{mt: 0.5}}>
                    <Grid size={6}>
                        <TextField
                            label="Artikelnummer"
                            value={form.articleNumber}
                            onChange={setField('articleNumber')}
                            variant="outlined"
                            size="small"
                            fullWidth
                            slotProps={{inputLabel: labelProps}}
                        />
                    </Grid>
                    <Grid size={6}>
                        {isEdit ? (
                            <TextField
                                label="Material-Typ"
                                value={felt.feltTypeName}
                                variant="outlined"
                                size="small"
                                fullWidth
                                slotProps={{input: {readOnly: true}, inputLabel: labelProps}}
                            />
                        ) : (
                            <TextField
                                select
                                label="Material-Typ"
                                value={form.feltTypeId}
                                onChange={setField('feltTypeId')}
                                variant="outlined"
                                size="small"
                                fullWidth
                                slotProps={{inputLabel: labelProps}}
                            >
                                {feltTypeOptions.map((opt) => (
                                    <MenuItem key={opt.id} value={String(opt.id)}>
                                        {opt.name}
                                    </MenuItem>
                                ))}
                            </TextField>
                        )}
                    </Grid>
                    <Grid size={6}>
                        <TextField
                            label="Farbe"
                            value={form.color}
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
                            value={form.supplierColor}
                            onChange={setField('supplierColor')}
                            variant="outlined"
                            size="small"
                            fullWidth
                            slotProps={{inputLabel: labelProps}}
                        />
                    </Grid>
                    <Grid size={6}>
                        {isEdit ? (
                            <TextField
                                label="Lieferant"
                                value={felt.supplierName}
                                variant="outlined"
                                size="small"
                                fullWidth
                                slotProps={{input: {readOnly: true}, inputLabel: labelProps}}
                            />
                        ) : (
                            <TextField
                                select
                                label="Lieferant"
                                value={form.supplierId}
                                onChange={setField('supplierId')}
                                variant="outlined"
                                size="small"
                                fullWidth
                                slotProps={{inputLabel: labelProps}}
                            >
                                {supplierOptions.map((opt) => (
                                    <MenuItem key={opt.id} value={String(opt.id)}>
                                        {opt.name}
                                    </MenuItem>
                                ))}
                            </TextField>
                        )}
                    </Grid>
                    <Grid size={6}>
                        <TextField
                            label="Preis (CHF)"
                            value={form.price}
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
                            value={form.thickness}
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
                            value={form.density}
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
                    Speichern
                </Button>
            </DialogActions>
        </Dialog>
    );
}
