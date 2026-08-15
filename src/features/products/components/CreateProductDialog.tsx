import {createProduct, createProductCategory, createProductVariant, fetchProductCategories} from '@/features/products/api';
import {ProductCategoryDto} from '@/features/products/types';
import FormDialog from '@/shared/components/FormDialog';
import FormSection from '@/shared/components/FormSection';
import FormTextField from '@/shared/components/FormTextField';
import {useToast} from '@/shared/components/ToastProvider';
import AddIcon from '@mui/icons-material/Add';
import {Grid, MenuItem} from '@mui/material';
import {useEffect, useState} from 'react';

type CreateProductDialogProps = {
    readonly open: boolean;
    readonly onClose: () => void;
    readonly onSaved: () => void;
};

const NEW_CATEGORY = '__new__';

export default function CreateProductDialog({open, onClose, onSaved}: CreateProductDialogProps) {
    const showToast = useToast();
    const [name, setName] = useState('');
    const [categoryId, setCategoryId] = useState('');
    const [newCategoryName, setNewCategoryName] = useState('');
    const [variantName, setVariantName] = useState('');
    const [variantPrice, setVariantPrice] = useState('');
    const [attrValues, setAttrValues] = useState<Record<string, string>>({});
    const [isSaving, setIsSaving] = useState(false);
    const [categories, setCategories] = useState<ProductCategoryDto[]>([]);

    useEffect(() => {
        if (!open) return;
        setName('');
        setCategoryId('');
        setNewCategoryName('');
        setVariantName('');
        setVariantPrice('');
        setAttrValues({});
        void fetchProductCategories()
            .then(setCategories)
            .catch(() => setCategories([]));
    }, [open]);

    const selectedCategory = categoryId === NEW_CATEGORY ? undefined : categories.find((c) => String(c.id) === categoryId);
    const categoryFields = selectedCategory?.fields ?? [];

    // Reset attribute values only when the selected category changes, not when the list re-fetches.
    useEffect(() => {
        const cat = categories.find((c) => String(c.id) === categoryId);
        const initial: Record<string, string> = {};
        for (const f of cat?.fields ?? []) initial[f.name] = '';
        setAttrValues(initial);
    }, [categoryId]);

    const handleSave = async () => {
        const price = Number.parseFloat(variantPrice);
        const isNewCategory = categoryId === NEW_CATEGORY;
        if (!name.trim() || !categoryId || (isNewCategory && !newCategoryName.trim()) || !variantName.trim() || Number.isNaN(price)) {
            showToast('Bitte alle Felder ausfüllen.', 'warning');
            return;
        }
        setIsSaving(true);
        try {
            let resolvedCategoryId: number;
            if (isNewCategory) {
                const created = await createProductCategory(newCategoryName.trim());
                resolvedCategoryId = created.id;
            } else {
                resolvedCategoryId = Number.parseInt(categoryId, 10);
            }

            const attributes = categoryFields.length > 0 ? categoryFields.map((f) => ({name: f.name})) : undefined;
            const created = await createProduct({name: name.trim(), categoryId: resolvedCategoryId, attributes});

            const variantAttributes =
                created.attributes.length > 0 ? created.attributes.map((attr) => ({attributeId: attr.id, value: attrValues[attr.name] ?? ''})) : undefined;
            await createProductVariant(created.id, {name: variantName.trim(), price, attributes: variantAttributes});

            showToast('Produkt erfolgreich erstellt.', 'success');
            onSaved();
        } catch {
            showToast('Erstellen fehlgeschlagen. Bitte versuche es erneut.', 'error');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <FormDialog open={open} onClose={onClose} title="Neues Produkt" onSubmit={() => void handleSave()} submitLabel="Erstellen" busy={isSaving}>
            <Grid size={12}>
                <FormTextField label="Produktname" value={name} onChange={(e) => setName(e.target.value)} required />
            </Grid>
            <Grid size={12}>
                <FormTextField
                    select
                    label="Kategorie"
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    required
                    slotProps={{inputLabel: {sx: {fontWeight: 600}, shrink: true}, select: {displayEmpty: true}}}
                >
                    <MenuItem value="" disabled>
                        Kategorie wählen
                    </MenuItem>
                    {categories.map((c) => (
                        <MenuItem key={c.id} value={String(c.id)}>
                            {c.name}
                        </MenuItem>
                    ))}
                    <MenuItem value={NEW_CATEGORY} sx={{color: 'primary.main', fontWeight: 600}}>
                        <AddIcon sx={{fontSize: '1rem', mr: 0.5}} />
                        Neue Kategorie erstellen
                    </MenuItem>
                </FormTextField>
            </Grid>
            {categoryId === NEW_CATEGORY && (
                <Grid size={12}>
                    <FormTextField
                        label="Name der neuen Kategorie"
                        value={newCategoryName}
                        onChange={(e) => setNewCategoryName(e.target.value)}
                        required
                        autoFocus
                    />
                </Grid>
            )}

            <FormSection label="Erste Variante" dividerSx={{mt: 1}} />

            <Grid size={6}>
                <FormTextField label="Variantenname" value={variantName} onChange={(e) => setVariantName(e.target.value)} required />
            </Grid>
            <Grid size={6}>
                <FormTextField
                    label="Preis (CHF)"
                    value={variantPrice}
                    onChange={(e) => setVariantPrice(e.target.value)}
                    type="number"
                    required
                    slotProps={{htmlInput: {min: 0, step: 0.01}}}
                />
            </Grid>

            {categoryFields.length > 0 && (
                <>
                    <FormSection label="Attribute" />
                    {categoryFields.map((f) => (
                        <Grid size={6} key={f.id}>
                            <FormTextField
                                label={f.name}
                                value={attrValues[f.name] ?? ''}
                                onChange={(e) => setAttrValues((prev) => ({...prev, [f.name]: e.target.value}))}
                            />
                        </Grid>
                    ))}
                </>
            )}
        </FormDialog>
    );
}
