import {createProductVariant} from '@/features/products/api';
import {ProductAttributeDto} from '@/features/products/types';
import FormDialog from '@/shared/components/FormDialog';
import FormSection from '@/shared/components/FormSection';
import FormTextField from '@/shared/components/FormTextField';
import {useToast} from '@/shared/components/ToastProvider';
import {Grid} from '@mui/material';
import {ChangeEvent, useEffect, useState} from 'react';

type CreateVariantDialogProps = {
    readonly open: boolean;
    readonly onClose: () => void;
    readonly onSaved: () => void;
    readonly productId: number;
    readonly productAttributes: ProductAttributeDto[];
};

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
        <FormDialog open={open} onClose={onClose} title="Neue Variante" onSubmit={() => void handleSave()} submitLabel="Erstellen" busy={isSaving}>
            <Grid size={6}>
                <FormTextField label="Name" value={name} onChange={(e) => setName(e.target.value)} required autoFocus />
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
        </FormDialog>
    );
}
