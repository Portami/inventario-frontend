import ConfirmDeleteDialog from '@/components/products/ConfirmDeleteDialog';
import CreateVariantDialog from '@/components/products/CreateVariantDialog';
import EditProductDialog from '@/components/products/EditProductDialog';
import EditVariantDialog from '@/components/products/EditVariantDialog';
import {useToast} from '@/components/ToastProvider';
import {deleteProduct, deleteProductVariant, fetchProductById} from '@/services/backend';
import {ProductDto, ProductVariantDto} from '@/types/product';
import AddIcon from '@mui/icons-material/Add';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import InventoryIcon from '@mui/icons-material/Inventory';
import {
    Box,
    Button,
    Chip,
    CircularProgress,
    Container,
    Divider,
    IconButton,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    Tooltip,
    Typography,
} from '@mui/material';
import {useEffect, useState} from 'react';
import {useNavigate, useParams} from 'react-router';

export default function ProductDetailView() {
    const {id} = useParams<{id: string}>();
    const navigate = useNavigate();
    const showToast = useToast();

    const [product, setProduct] = useState<ProductDto | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    const [editProductOpen, setEditProductOpen] = useState(false);
    const [deleteProductOpen, setDeleteProductOpen] = useState(false);
    const [isDeletingProduct, setIsDeletingProduct] = useState(false);

    const [createVariantOpen, setCreateVariantOpen] = useState(false);
    const [editingVariant, setEditingVariant] = useState<ProductVariantDto | null>(null);
    const [deletingVariant, setDeletingVariant] = useState<ProductVariantDto | null>(null);
    const [isDeletingVariant, setIsDeletingVariant] = useState(false);

    const load = async () => {
        if (!id) return;
        setIsLoading(true);
        try {
            setProduct(await fetchProductById(id));
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Produkt konnte nicht geladen werden');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        void load();
    }, [id]);

    const handleDeleteProduct = async () => {
        if (!product) return;
        setIsDeletingProduct(true);
        try {
            await deleteProduct(product.id);
            showToast('Produkt gelöscht.');
            navigate('/products');
        } catch {
            showToast('Löschen fehlgeschlagen.', 'error');
            setIsDeletingProduct(false);
        }
    };

    const handleDeleteVariant = async () => {
        if (!deletingVariant) return;
        setIsDeletingVariant(true);
        try {
            await deleteProductVariant(product!.id, deletingVariant.id);
            showToast('Variante gelöscht.');
            setDeletingVariant(null);
            void load();
        } catch {
            showToast('Löschen fehlgeschlagen.', 'error');
        } finally {
            setIsDeletingVariant(false);
        }
    };

    if (isLoading) {
        return (
            <Box sx={{display: 'flex', justifyContent: 'center', pt: 10}}>
                <CircularProgress />
            </Box>
        );
    }

    if (error || !product) {
        return (
            <Box sx={{p: 6}}>
                <Typography color="error">{error || 'Produkt nicht gefunden'}</Typography>
                <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/products')} sx={{mt: 2}}>
                    Zurück zu Produkten
                </Button>
            </Box>
        );
    }

    const variantCount = product.variants.length;
    const minPrice = variantCount > 0 ? Math.min(...product.variants.map((v) => v.price)) : null;
    const priceLabel = minPrice != null ? `CHF ${minPrice.toFixed(2)}${variantCount > 1 ? '+' : ''}` : '–';

    return (
        <Box sx={{minHeight: '100vh', backgroundColor: 'background.default', py: 6}}>
            <Container maxWidth="lg">
                {/* top nav row */}
                <Box sx={{mb: 4}}>
                    <Button
                        startIcon={<ArrowBackIcon />}
                        sx={{color: 'text.secondary', textTransform: 'none', fontWeight: 600}}
                        onClick={() => navigate('/products')}
                    >
                        Zurück zur Produktübersicht
                    </Button>
                </Box>

                {/* product identity */}
                <Box sx={{display: 'flex', alignItems: 'center', gap: 1, mb: 1}}>
                    <Typography variant="h1" sx={{m: 0}}>
                        {product.name}
                    </Typography>
                    <Tooltip title="Produkt bearbeiten">
                        <IconButton size="small" onClick={() => setEditProductOpen(true)}>
                            <EditIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Produkt löschen">
                        <IconButton size="small" color="error" onClick={() => setDeleteProductOpen(true)}>
                            <DeleteIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                </Box>
                <Typography variant="body1" sx={{fontWeight: 600, color: 'text.secondary', mb: 3}}>
                    Kategorie: {product.category.name}
                </Typography>

                {/* price + variant count */}
                <Box sx={{display: 'flex', gap: 2, alignItems: 'center', mb: 4}}>
                    <Typography variant="h2" sx={{m: 0}}>
                        {priceLabel}
                    </Typography>
                    <Chip
                        icon={<InventoryIcon sx={{fontSize: '1rem'}} />}
                        label={`${variantCount} Variante${variantCount !== 1 ? 'n' : ''}`}
                        sx={{
                            backgroundColor: variantCount > 0 ? 'success.light' : 'warning.light',
                            color: variantCount > 0 ? 'success.main' : 'warning.main',
                            fontWeight: 'bold',
                            borderRadius: '16px',
                        }}
                    />
                </Box>

                <Divider sx={{mb: 4}} />

                {/* variants table */}
                <Box sx={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2}}>
                    <Typography variant="h3">Varianten</Typography>
                    <Button variant="outlined" size="small" startIcon={<AddIcon />} onClick={() => setCreateVariantOpen(true)}>
                        Neue Variante
                    </Button>
                </Box>

                {variantCount === 0 ? (
                    <Typography color="text.secondary">Keine Varianten vorhanden.</Typography>
                ) : (
                    <Paper variant="outlined" sx={{borderRadius: 2, overflow: 'hidden'}}>
                        <Table size="small">
                            <TableHead>
                                <TableRow sx={{'& th': {fontWeight: 700, textTransform: 'uppercase', fontSize: '0.72rem', letterSpacing: 0.5}}}>
                                    <TableCell>Name</TableCell>
                                    <TableCell>Preis</TableCell>
                                    <TableCell>Bestand</TableCell>
                                    {product.attributes.map((attr) => (
                                        <TableCell key={attr.id}>{attr.name}</TableCell>
                                    ))}
                                    <TableCell align="right" />
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {product.variants.map((variant) => (
                                    <TableRow key={variant.id} hover>
                                        <TableCell>{variant.name}</TableCell>
                                        <TableCell>CHF {variant.price.toFixed(2)}</TableCell>
                                        <TableCell>
                                            {variant.inventory.length > 0 ? (
                                                variant.inventory.reduce((sum, inv) => sum + inv.quantity, 0)
                                            ) : (
                                                <Typography component="span" color="text.disabled" variant="body2">
                                                    –
                                                </Typography>
                                            )}
                                        </TableCell>
                                        {product.attributes.map((attr) => {
                                            const val = variant.attributes.find((va) => va.attributeId === attr.id)?.value;
                                            return (
                                                <TableCell key={attr.id}>
                                                    {val ?? (
                                                        <Typography component="span" color="text.disabled" variant="body2">
                                                            –
                                                        </Typography>
                                                    )}
                                                </TableCell>
                                            );
                                        })}
                                        <TableCell align="right" sx={{whiteSpace: 'nowrap'}}>
                                            <Tooltip title="Variante bearbeiten">
                                                <IconButton size="small" onClick={() => setEditingVariant(variant)}>
                                                    <EditIcon fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title="Variante löschen">
                                                <IconButton size="small" color="error" onClick={() => setDeletingVariant(variant)}>
                                                    <DeleteIcon fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </Paper>
                )}
            </Container>

            {/* edit product dialog */}
            <EditProductDialog
                open={editProductOpen}
                onClose={() => setEditProductOpen(false)}
                onSaved={() => {
                    setEditProductOpen(false);
                    void load();
                }}
                product={product}
            />

            {/* delete product confirmation */}
            <ConfirmDeleteDialog
                open={deleteProductOpen}
                title="Produkt löschen"
                message={`„${product.name}" wirklich löschen? Alle Varianten werden ebenfalls entfernt.`}
                isDeleting={isDeletingProduct}
                onConfirm={handleDeleteProduct}
                onClose={() => setDeleteProductOpen(false)}
            />

            {/* create variant dialog */}
            <CreateVariantDialog
                open={createVariantOpen}
                onClose={() => setCreateVariantOpen(false)}
                onSaved={() => {
                    setCreateVariantOpen(false);
                    void load();
                }}
                productId={product.id}
                productAttributes={product.attributes}
            />

            {/* edit variant dialog */}
            {editingVariant && (
                <EditVariantDialog
                    open
                    onClose={() => setEditingVariant(null)}
                    onSaved={() => {
                        setEditingVariant(null);
                        void load();
                    }}
                    productId={product.id}
                    variant={editingVariant}
                    productAttributes={product.attributes}
                />
            )}

            {/* delete variant confirmation */}
            <ConfirmDeleteDialog
                open={deletingVariant != null}
                title="Variante löschen"
                message={deletingVariant ? `Variante „${deletingVariant.name}" wirklich löschen?` : ''}
                isDeleting={isDeletingVariant}
                onConfirm={handleDeleteVariant}
                onClose={() => setDeletingVariant(null)}
            />
        </Box>
    );
}
