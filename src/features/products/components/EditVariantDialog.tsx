import {changeInventory, patchProductVariant} from '../api';
import {ProductAttributeDto, ProductVariantDto} from '@/features/products/types';
import {fetchStorages} from '@/features/storage';
import {Storage} from '@/features/storage/types';
import FormDialog from '@/shared/components/FormDialog';
import FormSection from '@/shared/components/FormSection';
import FormTextField from '@/shared/components/FormTextField';
import {useToast} from '@/shared/components/ToastProvider';
import {Grid} from '@mui/material';
import {ChangeEvent, useEffect, useState} from 'react';

type EditVariantDialogProps = {
    readonly open: boolean;
    readonly onClose: () => void;
    readonly onSaved: () => void;
    readonly productId: number;
    readonly variant: ProductVariantDto;
    readonly productAttributes: ProductAttributeDto[];
};

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

        let active = true;
        fetchStorages()
            .then((all) => {
                if (!active) return;
                setStorages(all);
                const qty: Record<number, string> = {};
                for (const s of all) {
                    const entry = variant.inventory.find((inv) => inv.storageId === s.id);
                    qty[s.id] = entry ? String(entry.quantity) : '0';
                }
                setQuantities(qty);
            })
            .catch(() => {
                if (!active) return;
                showToast('Lagerorte konnten nicht geladen werden.', 'error');
            });
        return () => {
            active = false;
        };
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
                    const parsed = Number.parseInt(quantities[s.id] ?? '0', 10);
                    const desired = Number.isFinite(parsed) ? parsed : 0;
                    const delta = desired - current;
                    return {productVariantId: variant.id, storageId: s.id, quantityChange: delta};
                })
                .filter((c) => Number.isFinite(c.quantityChange) && c.quantityChange !== 0);

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
        <FormDialog open={open} onClose={onClose} title="Variante bearbeiten" onSubmit={() => void handleSave()} submitLabel="Speichern" busy={isSaving}>
            <Grid size={6}>
                <FormTextField label="Name" value={name} onChange={(e) => setName(e.target.value)} required />
            </Grid>
            <Grid size={6}>
                <FormTextField
                    label="Preis (CHF)"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    type="number"
                    required
                    slotProps={{htmlInput: {min: 0, step: 0.01}}}
                />
            </Grid>

            {productAttributes.length > 0 && (
                <>
                    <FormSection label="Attribute" />
                    {productAttributes.map((attr) => (
                        <Grid size={6} key={attr.id}>
                            <FormTextField label={attr.name} value={attrValues[attr.id] ?? ''} onChange={setAttr(attr.id)} />
                        </Grid>
                    ))}
                </>
            )}

            {storages.length > 0 && (
                <>
                    <FormSection label="Bestand pro Lagerort" />
                    {storages.map((s) => (
                        <Grid size={6} key={s.id}>
                            <FormTextField
                                label={s.name}
                                value={quantities[s.id] ?? '0'}
                                onChange={setQty(s.id)}
                                type="number"
                                slotProps={{htmlInput: {min: 0, step: 1}}}
                            />
                        </Grid>
                    ))}
                </>
            )}
        </FormDialog>
    );
}
