import {fetchProductCategories, patchProduct} from '@/features/products/api';
import {ProductCategoryDto, ProductDto} from '@/features/products/types';
import FormDialog from '@/shared/components/FormDialog';
import FormTextField from '@/shared/components/FormTextField';
import {useToast} from '@/shared/components/ToastProvider';
import {Grid, MenuItem} from '@mui/material';
import {useEffect, useState} from 'react';

type EditProductDialogProps = {
    readonly open: boolean;
    readonly onClose: () => void;
    readonly onSaved: () => void;
    readonly product: ProductDto;
};

export default function EditProductDialog({open, onClose, onSaved, product}: EditProductDialogProps) {
    const showToast = useToast();
    const [name, setName] = useState('');
    const [categoryId, setCategoryId] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [categories, setCategories] = useState<ProductCategoryDto[]>([]);

    useEffect(() => {
        if (!open) return;
        setName(product.name);
        setCategoryId(String(product.category.id));
        void fetchProductCategories()
            .then((cats) => {
                setCategories(cats);
                if (!cats.some((c) => c.id === product.category.id)) {
                    setCategories((prev) => [...prev, product.category]);
                }
            })
            .catch(() => setCategories([product.category]));
    }, [open, product]);

    const handleSave = async () => {
        if (!name.trim() || !categoryId) {
            showToast('Bitte alle Felder ausfüllen.', 'warning');
            return;
        }
        setIsSaving(true);
        try {
            await patchProduct(product.id, {name: name.trim(), categoryId: Number.parseInt(categoryId, 10)});
            showToast('Produkt gespeichert.');
            onSaved();
        } catch {
            showToast('Speichern fehlgeschlagen. Bitte versuche es erneut.', 'error');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <FormDialog open={open} onClose={onClose} title="Produkt bearbeiten" onSubmit={() => void handleSave()} submitLabel="Speichern" busy={isSaving}>
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
                    {categories.map((c) => (
                        <MenuItem key={c.id} value={String(c.id)}>
                            {c.name}
                        </MenuItem>
                    ))}
                </FormTextField>
            </Grid>
        </FormDialog>
    );
}
