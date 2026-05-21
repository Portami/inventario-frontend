import {useToast} from '@/components/ToastProvider';
import {fetchProductCategories, patchProduct} from '@/services/backend';
import {ProductCategoryDto, ProductDto} from '@/types/product';
import CloseIcon from '@mui/icons-material/Close';
import {Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, Grid, IconButton, MenuItem, TextField} from '@mui/material';
import {useEffect, useState} from 'react';

type EditProductDialogProps = {
    readonly open: boolean;
    readonly onClose: () => void;
    readonly onSaved: () => void;
    readonly product: ProductDto;
};

const labelProps = {sx: {fontWeight: 600}};

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
                if (!cats.find((c) => c.id === product.category.id)) {
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
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle sx={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 4, pt: 3}}>
                Produkt bearbeiten
                <IconButton onClick={onClose} size="small" aria-label="close" disabled={isSaving}>
                    <CloseIcon />
                </IconButton>
            </DialogTitle>
            <DialogContent sx={{px: 4, pb: 3}}>
                <Grid container spacing={3} sx={{mt: 0.5}}>
                    <Grid size={12}>
                        <TextField
                            label="Produktname"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            variant="outlined"
                            size="small"
                            fullWidth
                            required
                            slotProps={{inputLabel: labelProps}}
                        />
                    </Grid>
                    <Grid size={12}>
                        <TextField
                            select
                            label="Kategorie"
                            value={categoryId}
                            onChange={(e) => setCategoryId(e.target.value)}
                            variant="outlined"
                            size="small"
                            fullWidth
                            required
                            slotProps={{inputLabel: {...labelProps, shrink: true}, select: {displayEmpty: true}}}
                        >
                            {categories.map((c) => (
                                <MenuItem key={c.id} value={String(c.id)}>
                                    {c.name}
                                </MenuItem>
                            ))}
                        </TextField>
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
