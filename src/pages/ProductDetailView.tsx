import {fetchProductById} from '@/services/backend';
import {ProductDto} from '@/types/product';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditIcon from '@mui/icons-material/Edit';
import HistoryIcon from '@mui/icons-material/History';
import InventoryIcon from '@mui/icons-material/Inventory';
import {Box, Button, Chip, CircularProgress, Container, Divider, Grid, Paper, Typography} from '@mui/material';
import {useEffect, useState} from 'react';
import {useNavigate, useParams} from 'react-router';

export default function ProductDetailView() {
    const {id} = useParams<{id: string}>();
    const navigate = useNavigate();
    const [product, setProduct] = useState<ProductDto | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const load = async () => {
            if (!id) return;
            try {
                setProduct(await fetchProductById(id));
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Produkt konnte nicht geladen werden');
            } finally {
                setIsLoading(false);
            }
        };
        void load();
    }, [id]);

    const firstVariant = product?.variants[0];
    const price = firstVariant ? `CHF ${firstVariant.price.toFixed(2)}` : '–';
    const variantCount = product?.variants.length ?? 0;

    const specs =
        product?.attributes.map((attr) => {
            const val = firstVariant?.attributes.find((va) => va.attributeId === attr.id)?.value ?? '–';
            return {label: attr.name, value: val};
        }) ?? [];

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

    return (
        <Box sx={{minHeight: '100vh', backgroundColor: 'background.default', py: 6}}>
            <Container maxWidth="lg">
                {/* header & return button */}
                <Box sx={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 4}}>
                    <Button
                        startIcon={<ArrowBackIcon />}
                        sx={{color: 'text.secondary', textTransform: 'none', fontWeight: 600}}
                        onClick={() => navigate('/products')}
                    >
                        Zurück zur Produktübersicht
                    </Button>
                    <Button
                        startIcon={<HistoryIcon />}
                        variant="outlined"
                        sx={{
                            borderRadius: '24px',
                            padding: '6px 16px',
                            textTransform: 'none',
                            fontWeight: 600,
                            borderColor: 'divider',
                            color: 'text.secondary',
                            '&:hover': {borderColor: 'text.secondary', backgroundColor: 'transparent'},
                        }}
                    >
                        Verlauf anzeigen
                    </Button>
                </Box>

                <Grid container spacing={6}>
                    {/* product image (placeholder) */}
                    <Grid size={{xs: 12, md: 12}}>
                        <Paper
                            elevation={0}
                            sx={{
                                width: '100%',
                                maxWidth: '300px',
                                mx: 'left',
                                aspectRatio: '1 / 1',
                                backgroundColor: 'divider',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                border: '1px solid',
                                borderColor: 'divider',
                                borderRadius: 4,
                            }}
                        >
                            <Typography variant="h4" sx={{color: 'text.secondary'}}>
                                Bildplatzhalter
                            </Typography>
                        </Paper>
                    </Grid>

                    {/* product details */}
                    <Grid size={{xs: 12, md: 6}}>
                        <Box sx={{display: 'flex', flexDirection: 'column', height: '100%'}}>
                            {/* title and category */}
                            <Typography variant="h1" gutterBottom>
                                {product.name}
                            </Typography>
                            <Typography variant="body1" sx={{fontWeight: 600, color: 'text.secondary', mb: 3}}>
                                Kategorie: {product.category.name}
                            </Typography>

                            {/* price and variant count */}
                            <Box sx={{display: 'flex', gap: 2, alignItems: 'center', mb: 4}}>
                                <Typography variant="h2" sx={{m: 0}}>
                                    {price}
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

                            {/* specifications */}
                            {specs.length > 0 && (
                                <>
                                    <Typography variant="h3" gutterBottom sx={{mb: 2}}>
                                        Spezifikationen
                                    </Typography>
                                    <Grid container spacing={2} sx={{mb: 5}}>
                                        {specs.map((attr) => (
                                            <Grid size={{xs: 6}} key={attr.label}>
                                                <Typography
                                                    variant="body2"
                                                    sx={{
                                                        color: 'text.secondary',
                                                        textTransform: 'uppercase',
                                                        letterSpacing: 1,
                                                        fontSize: '0.75rem',
                                                    }}
                                                >
                                                    {attr.label}
                                                </Typography>
                                                <Typography variant="body1" sx={{fontWeight: 600, color: 'text.primary'}}>
                                                    {attr.value}
                                                </Typography>
                                            </Grid>
                                        ))}
                                    </Grid>
                                </>
                            )}

                            {/* actions */}
                            <Box sx={{display: 'flex', gap: 2, mt: 'auto'}}>
                                <Button
                                    variant="contained"
                                    color="primary"
                                    startIcon={<EditIcon />}
                                    sx={{
                                        borderRadius: '24px',
                                        padding: '10px 24px',
                                        textTransform: 'none',
                                        fontWeight: 'bold',
                                        boxShadow: 'none',
                                        '&:hover': {boxShadow: '0 4px 12px rgba(125, 85, 199, 0.3)'},
                                    }}
                                >
                                    Bestand bearbeiten
                                </Button>
                                <Button
                                    variant="outlined"
                                    sx={{
                                        borderRadius: '24px',
                                        padding: '10px 24px',
                                        textTransform: 'none',
                                        fontWeight: 'bold',
                                        borderColor: 'divider',
                                        color: 'text.primary',
                                        '&:hover': {borderColor: 'text.secondary', backgroundColor: 'transparent'},
                                    }}
                                >
                                    Als PDF exportieren
                                </Button>
                            </Box>
                        </Box>
                    </Grid>
                </Grid>
            </Container>
        </Box>
    );
}
