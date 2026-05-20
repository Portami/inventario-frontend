import {useToast} from '@/components/ToastProvider';
import {createProduct, createProductCategory, createProductVariant, fetchProductCategories} from '@/services/backend';
import {ProductCategoryDto} from '@/types/product';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import {
    Button,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Divider,
    Grid,
    IconButton,
    MenuItem,
    TextField,
    Typography,
} from '@mui/material';
import {useEffect, useState} from 'react';

type CreateProductDialogProps = {
    readonly open: boolean;
    readonly onClose: () => void;
    readonly onSaved: () => void;
};

const NEW_CATEGORY = '__new__';

const labelProps = {sx: {fontWeight: 600}};

export default function CreateProductDialog({open, onClose, onSaved}: CreateProductDialogProps) {
    const showToast = useToast();
    const [name, setName] = useState('');
    const [categoryId, setCategoryId] = useState('');
    const [newCategoryName, setNewCategoryName] = useState('');
    const [variantName, setVariantName] = useState('');
    const [variantPrice, setVariantPrice] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [categories, setCategories] = useState<ProductCategoryDto[]>([]);

    useEffect(() => {
        if (!open) return;
        setName('');
        setCategoryId('');
        setNewCategoryName('');
        setVariantName('');
        setVariantPrice('');
        void fetchProductCategories()
            .then(setCategories)
            .catch(() => setCategories([]));
    }, [open]);

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
            const created = await createProduct({
                name: name.trim(),
                categoryId: resolvedCategoryId,
            });
            await createProductVariant(created.id, {name: variantName.trim(), price});
            showToast('Produkt erfolgreich erstellt.', 'success');
            onSaved();
        } catch {
            showToast('Erstellen fehlgeschlagen. Bitte versuche es erneut.', 'error');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle sx={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 4, pt: 3}}>
                Neues Produkt
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
                        </TextField>
                    </Grid>
                    {categoryId === NEW_CATEGORY && (
                        <Grid size={12}>
                            <TextField
                                label="Name der neuen Kategorie"
                                value={newCategoryName}
                                onChange={(e) => setNewCategoryName(e.target.value)}
                                variant="outlined"
                                size="small"
                                fullWidth
                                required
                                autoFocus
                                slotProps={{inputLabel: labelProps}}
                            />
                        </Grid>
                    )}

                    <Grid size={12}>
                        <Divider sx={{mt: 1}} />
                        <Typography variant="overline" sx={{display: 'block', mt: 2, mb: 0.5, color: 'text.secondary'}}>
                            Erste Variante
                        </Typography>
                    </Grid>

                    <Grid size={6}>
                        <TextField
                            label="Variantenname"
                            value={variantName}
                            onChange={(e) => setVariantName(e.target.value)}
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
                            value={variantPrice}
                            onChange={(e) => setVariantPrice(e.target.value)}
                            type="number"
                            variant="outlined"
                            size="small"
                            fullWidth
                            required
                            slotProps={{htmlInput: {min: 0, step: 0.01}, inputLabel: labelProps}}
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
                    Erstellen
                </Button>
            </DialogActions>
        </Dialog>
    );
}
