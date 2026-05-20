import {useToast} from '@/components/ToastProvider';
import {changeInventory, fetchStorages, patchProductVariant} from '@/services/backend';
import {ProductAttributeDto, ProductVariantDto} from '@/types/product';
import {Storage} from '@/types/storage';
import CloseIcon from '@mui/icons-material/Close';
import {Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, Divider, Grid, IconButton, TextField, Typography} from '@mui/material';
import {ChangeEvent, useEffect, useState} from 'react';

type EditVariantDialogProps = {
    readonly open: boolean;
    readonly onClose: () => void;
    readonly onSaved: () => void;
    readonly productId: number;
    readonly variant: ProductVariantDto;
    readonly productAttributes: ProductAttributeDto[];
};

const labelProps = {sx: {fontWeight: 600}};

export default function EditVariantDialog({open, onClose, onSaved, productId, variant, productAttributes}: EditVariantDialogProps) {
    const showToast = useToast();
    const [name, setName] = useState('');
    const [price, setPrice] = useState('');
    const [attrValues, setAttrValues] = useState<Record<number, string>>({});
    const [storages, setStorages] = useState<Storage[]>([]);
    const [quantities, setQuantities] = useState<Record<number, string>>({});
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (!open) return;
        setName(variant.name);
        setPrice(String(variant.price));

        const initial: Record<number, string> = {};
        for (const attr of productAttributes) {
            initial[attr.id] = variant.attributes.find((va) => va.attributeId === attr.id)?.value ?? '';
        }
        setAttrValues(initial);

        void fetchStorages().then((all) => {
            setStorages(all);
            const qty: Record<number, string> = {};
            for (const s of all) {
                const entry = variant.inventory.find((inv) => inv.storageId === s.id);
                qty[s.id] = entry ? String(entry.quantity) : '0';
            }
            setQuantities(qty);
        });
    }, [open, variant, productAttributes]);

    const setAttr = (attrId: number) => (e: ChangeEvent<HTMLInputElement>) => setAttrValues((prev) => ({...prev, [attrId]: e.target.value}));

    const setQty = (storageId: number) => (e: ChangeEvent<HTMLInputElement>) => setQuantities((prev) => ({...prev, [storageId]: e.target.value}));

    const handleSave = async () => {
        const parsedPrice = Number.parseFloat(price);
        if (!name.trim() || Number.isNaN(parsedPrice)) {
            showToast('Bitte Name und Preis ausfüllen.', 'warning');
            return;
        }
        setIsSaving(true);
        try {
            await patchProductVariant(productId, variant.id, {
                name: name.trim(),
                price: parsedPrice,
                attributes: productAttributes.map((attr) => ({
                    attributeId: attr.id,
                    value: attrValues[attr.id] ?? '',
                })),
            });

            const inventoryChanges = storages
                .map((s) => {
                    const current = variant.inventory.find((inv) => inv.storageId === s.id)?.quantity ?? 0;
                    const desired = Number.parseInt(quantities[s.id] ?? '0', 10);
                    const delta = desired - current;
                    return {productVariantId: variant.id, storageId: s.id, quantityChange: delta};
                })
                .filter((c) => c.quantityChange !== 0);

            if (inventoryChanges.length > 0) {
                await changeInventory(inventoryChanges);
            }

            showToast('Variante gespeichert.');
            onSaved();
        } catch {
            showToast('Speichern fehlgeschlagen.', 'error');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle sx={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 4, pt: 3}}>
                Variante bearbeiten
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

                    {storages.length > 0 && (
                        <>
                            <Grid size={12}>
                                <Divider />
                                <Typography variant="overline" sx={{display: 'block', mt: 2, mb: 0.5, color: 'text.secondary'}}>
                                    Bestand pro Lagerort
                                </Typography>
                            </Grid>
                            {storages.map((s) => (
                                <Grid size={6} key={s.id}>
                                    <TextField
                                        label={s.name}
                                        value={quantities[s.id] ?? '0'}
                                        onChange={setQty(s.id)}
                                        type="number"
                                        variant="outlined"
                                        size="small"
                                        fullWidth
                                        slotProps={{htmlInput: {min: 0, step: 1}, inputLabel: labelProps}}
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
                    Speichern
                </Button>
            </DialogActions>
        </Dialog>
    );
}
