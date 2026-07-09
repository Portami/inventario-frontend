import ListPage from '@/components/ListPage';
import ConfirmDeleteDialog from '@/components/products/ConfirmDeleteDialog';
import {useToast} from '@/components/ToastProvider';
import {createProductCategory, deleteProductCategory, fetchProductCategories, patchProductCategory} from '@/services/backend';
import {ProductCategoryDto} from '@/types/product';
import {toErrorMessage} from '@/utils/pageUtils';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import {
    Box,
    Button,
    Chip,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Divider,
    IconButton,
    InputAdornment,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    TextField,
    Tooltip,
    Typography,
} from '@mui/material';
import {KeyboardEvent, useCallback, useEffect, useState} from 'react';

type CategoryDialogProps = {
    readonly open: boolean;
    readonly onClose: () => void;
    readonly onSaved: () => void;
    readonly category?: ProductCategoryDto | null;
};

function CategoryDialog({open, onClose, onSaved, category}: CategoryDialogProps) {
    const showToast = useToast();
    const [name, setName] = useState('');
    const [fields, setFields] = useState<string[]>([]);
    const [newField, setNewField] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const isEdit = category != null;

    useEffect(() => {
        if (!open) return;
        setName(category?.name ?? '');
        setFields(category?.fields.map((f) => f.name) ?? []);
        setNewField('');
    }, [open, category]);

    const addField = () => {
        const trimmed = newField.trim();
        if (!trimmed || fields.includes(trimmed)) return;
        setFields((prev) => [...prev, trimmed]);
        setNewField('');
    };

    const removeField = (index: number) => {
        setFields((prev) => prev.filter((_, i) => i !== index));
    };

    const handleFieldKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            addField();
        }
    };

    const handleSave = async () => {
        if (!name.trim()) return;
        setIsSaving(true);
        try {
            if (isEdit && category) {
                await patchProductCategory(category.id, {name: name.trim(), fieldNames: fields});
                showToast('Kategorie gespeichert.');
            } else {
                await createProductCategory(name.trim(), fields);
                showToast('Kategorie erstellt.');
            }
            onSaved();
        } catch {
            showToast('Speichern fehlgeschlagen.', 'error');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
            <DialogTitle sx={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 4, pt: 3}}>
                {isEdit ? 'Kategorie bearbeiten' : 'Neue Kategorie'}
                <IconButton onClick={onClose} size="small" disabled={isSaving}>
                    <CloseIcon />
                </IconButton>
            </DialogTitle>
            <DialogContent sx={{px: 4, pb: 3}}>
                <TextField
                    label="Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    variant="outlined"
                    size="small"
                    fullWidth
                    autoFocus
                    sx={{mt: 1}}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') void handleSave();
                    }}
                />

                <Divider sx={{my: 2.5}} />

                <Typography variant="overline" sx={{color: 'text.secondary', display: 'block', mb: 1}}>
                    Felder (Attribute)
                </Typography>

                {fields.length > 0 && (
                    <Box sx={{display: 'flex', flexWrap: 'wrap', gap: 0.75, mb: 1.5}}>
                        {fields.map((f, i) => (
                            <Chip key={i} label={f} size="small" onDelete={() => removeField(i)} disabled={isSaving} />
                        ))}
                    </Box>
                )}

                <TextField
                    label="Neues Feld"
                    value={newField}
                    onChange={(e) => setNewField(e.target.value)}
                    onKeyDown={handleFieldKeyDown}
                    variant="outlined"
                    size="small"
                    fullWidth
                    disabled={isSaving}
                    slotProps={{
                        input: {
                            endAdornment: (
                                <InputAdornment position="end">
                                    <IconButton size="small" onClick={addField} disabled={!newField.trim() || isSaving}>
                                        <AddIcon fontSize="small" />
                                    </IconButton>
                                </InputAdornment>
                            ),
                        },
                    }}
                />
            </DialogContent>
            <DialogActions sx={{px: 4, pb: 3}}>
                <Button variant="outlined" onClick={onClose} disabled={isSaving}>
                    Abbrechen
                </Button>
                <Button
                    variant="contained"
                    onClick={() => void handleSave()}
                    disabled={isSaving || !name.trim()}
                    startIcon={isSaving ? <CircularProgress size={16} color="inherit" /> : undefined}
                >
                    {isEdit ? 'Speichern' : 'Erstellen'}
                </Button>
            </DialogActions>
        </Dialog>
    );
}

export default function CategoriesPage() {
    const showToast = useToast();
    const [categories, setCategories] = useState<ProductCategoryDto[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<ProductCategoryDto | null>(null);
    const [deletingCategory, setDeletingCategory] = useState<ProductCategoryDto | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const load = useCallback(async () => {
        setIsLoading(true);
        try {
            setCategories(await fetchProductCategories());
        } catch (err) {
            setError(toErrorMessage(err, 'Kategorien konnten nicht geladen werden'));
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        void load();
    }, [load]);

    const handleDelete = async () => {
        if (!deletingCategory) return;
        setIsDeleting(true);
        try {
            await deleteProductCategory(deletingCategory.id);
            showToast('Kategorie gelöscht.');
            setDeletingCategory(null);
            void load();
        } catch {
            showToast('Löschen fehlgeschlagen.', 'error');
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <>
            <ListPage
                title="Kategorien"
                description="Produktkategorien und deren Felder (Attribute) verwalten."
                actions={
                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={() => {
                            setEditingCategory(null);
                            setDialogOpen(true);
                        }}
                    >
                        Neue Kategorie
                    </Button>
                }
                isLoading={isLoading}
                isEmpty={!isLoading && categories.length === 0}
                emptyMessage="Keine Kategorien vorhanden."
                error={error}
                onErrorClose={() => setError('')}
            >
                <Paper variant="outlined" sx={{borderRadius: 2, overflow: 'hidden'}}>
                    <Table size="small">
                        <TableHead>
                            <TableRow sx={{'& th': {fontWeight: 700, textTransform: 'uppercase', fontSize: '0.72rem', letterSpacing: 0.5}}}>
                                <TableCell>Name</TableCell>
                                <TableCell>Felder</TableCell>
                                <TableCell align="right" />
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {categories.map((cat) => (
                                <TableRow key={cat.id} hover>
                                    <TableCell>{cat.name}</TableCell>
                                    <TableCell>
                                        {cat.fields.length === 0 ? (
                                            <Typography component="span" variant="body2" color="text.disabled">
                                                –
                                            </Typography>
                                        ) : (
                                            <Box sx={{display: 'flex', flexWrap: 'wrap', gap: 0.5}}>
                                                {cat.fields.map((f) => (
                                                    <Chip key={f.id} label={f.name} size="small" variant="outlined" />
                                                ))}
                                            </Box>
                                        )}
                                    </TableCell>
                                    <TableCell align="right" sx={{whiteSpace: 'nowrap'}}>
                                        <Tooltip title="Bearbeiten">
                                            <IconButton
                                                size="small"
                                                onClick={() => {
                                                    setEditingCategory(cat);
                                                    setDialogOpen(true);
                                                }}
                                            >
                                                <EditIcon fontSize="small" />
                                            </IconButton>
                                        </Tooltip>
                                        <Tooltip title="Löschen">
                                            <IconButton size="small" color="error" onClick={() => setDeletingCategory(cat)}>
                                                <DeleteIcon fontSize="small" />
                                            </IconButton>
                                        </Tooltip>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </Paper>
            </ListPage>

            <CategoryDialog
                open={dialogOpen}
                onClose={() => setDialogOpen(false)}
                onSaved={() => {
                    setDialogOpen(false);
                    void load();
                }}
                category={editingCategory}
            />

            <ConfirmDeleteDialog
                open={deletingCategory != null}
                title="Kategorie löschen"
                message={deletingCategory ? `„${deletingCategory.name}" wirklich löschen?` : ''}
                isDeleting={isDeleting}
                onConfirm={handleDelete}
                onClose={() => setDeletingCategory(null)}
            />
        </>
    );
}
