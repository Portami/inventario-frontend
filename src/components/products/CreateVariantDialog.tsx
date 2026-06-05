import {useToast} from '@/components/ToastProvider';
import {createProductVariant} from '@/services/backend';
import {ProductAttributeDto} from '@/types/product';
import CloseIcon from '@mui/icons-material/Close';
import {Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, Divider, Grid, IconButton, TextField, Typography} from '@mui/material';
import {ChangeEvent, useEffect, useState} from 'react';

type CreateVariantDialogProps = {
    readonly open: boolean;
    readonly onClose: () => void;
    readonly onSaved: () => void;
    readonly productId: number;
    readonly productAttributes: ProductAttributeDto[];
};

const labelProps = {sx: {fontWeight: 600}};

export default function CreateVariantDialog({open, onClose, onSaved, productId, productAttributes}: CreateVariantDialogProps) {
    const showToast = useToast();
    const [name, setName] = useState('');
    const [price, setPrice] = useState('');
    const [attrValues, setAttrValues] = useState<Record<number, string>>({});
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (!open) return;
        setName('');
        setPrice('');
        const initial: Record<number, string> = {};
        for (const attr of productAttributes) initial[attr.id] = '';
        setAttrValues(initial);
    }, [open, productAttributes]);

    const setAttr = (attrId: number) => (e: ChangeEvent<HTMLInputElement>) => setAttrValues((prev) => ({...prev, [attrId]: e.target.value}));

    const handleSave = async () => {
        const parsedPrice = Number.parseFloat(price);
        if (!name.trim() || Number.isNaN(parsedPrice)) {
            showToast('Bitte Name und Preis ausfüllen.', 'warning');
            return;
        }
        setIsSaving(true);
        try {
            await createProductVariant(productId, {
                name: name.trim(),
                price: parsedPrice,
                attributes: productAttributes.map((attr) => ({
                    attributeId: attr.id,
                    value: attrValues[attr.id] ?? '',
                })),
            });
            showToast('Variante erstellt.');
            onSaved();
        } catch {
            showToast('Erstellen fehlgeschlagen.', 'error');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle sx={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 4, pt: 3}}>
                Neue Variante
                <IconButton onClick={onClose} size="small" aria-label="close" disabled={isSaving}>
                    <CloseIcon />
                </IconButton>
            </DialogTitle>
            <DialogContent sx={{px: 4, pb: 3}}>
                <Grid container spacing={3} sx={{mt: 0.5}}>
                    <Grid size={6}>
                        <TextField
                            label="Name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            variant="outlined"
                            size="small"
                            fullWidth
                            required
                            autoFocus
                            slotProps={{inputLabel: labelProps}}
                        />
                    </Grid>
                    <Grid size={6}>
                        <TextField
                            label="Preis (CHF)"
                            value={price}
                            onChange={(e) => setPrice(e.target.value)}
                            type="number"
                            variant="outlined"
                            size="small"
                            fullWidth
                            required
                            slotProps={{htmlInput: {min: 0, step: 0.01}, inputLabel: labelProps}}
                        />
                    </Grid>
                    {productAttributes.length > 0 && (
                        <>
                            <Grid size={12}>
                                <Divider />
                                <Typography variant="overline" sx={{display: 'block', mt: 2, mb: 0.5, color: 'text.secondary'}}>
                                    Attribute
                                </Typography>
                            </Grid>
                            {productAttributes.map((attr) => (
                                <Grid size={6} key={attr.id}>
                                    <TextField
                                        label={attr.name}
                                        value={attrValues[attr.id] ?? ''}
                                        onChange={setAttr(attr.id)}
                                        variant="outlined"
                                        size="small"
                                        fullWidth
                                        slotProps={{inputLabel: labelProps}}
                                    />
                                </Grid>
                            ))}
                        </>
                    )}
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
                    Erstellen
                </Button>
            </DialogActions>
        </Dialog>
    );
}
