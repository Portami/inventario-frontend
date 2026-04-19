import { ProductDetail } from '../types/productDetail';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditIcon from '@mui/icons-material/Edit';
import HistoryIcon from '@mui/icons-material/History';
import InventoryIcon from '@mui/icons-material/Inventory';
import {Box, Button, Chip, Container, Divider, Grid, Paper, Typography} from '@mui/material';
import React from 'react';

export default function ProductDetailView() {
    // mock data for the felt product
    const product: ProductDetail = {
        name: 'Shopper Uno',
        sku: 'FLZ-BG-001',
        description: 'Handgefertigte, nachhaltige Tragetasche aus 100% natürlichem Wollfilz. Bietet extrem hohen Tragekomfort und ist wasserabweisend. Perfekt für den täglichen Einkauf oder als robuster Begleiter ins Büro.',
        stock: 24,
        price: 'CHF 168.00',
        attributes: [
            { label: 'Material', value: 'Wollfilz' },
            { label: 'Dicke', value: '3 mm' },
            { label: 'Farbe', value: 'Grau' },
            { label: 'Abmessungen', value: '40 x 30 x 15 cm' }
        ]
    };

    return (
        <Box sx={{ minHeight: '100vh', backgroundColor: 'background.default', py: 6 }}>
            <Container maxWidth="lg">

                {/* header & return button */}
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 4 }}>
                    <Button
                        startIcon={<ArrowBackIcon />}
                        sx={{ color: 'text.secondary', textTransform: 'none', fontWeight: 600 }}
                        onClick={() => window.history.back()}
                    >
                        Zurück zur Lagerverwaltung
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
                            '&:hover': { borderColor: 'text.secondary', backgroundColor: 'transparent' }
                        }}
                    >
                        Verlauf anzeigen
                    </Button>
                </Box>

                <Grid container spacing={6}>
                    {/* left side: product image (placeholder) */}
                    <Grid size={{ xs: 12, md: 6 }}>
                        <Paper
                            elevation={0}
                            sx={{
                                width: '100%',
                                aspectRatio: '1 / 1',
                                backgroundColor: 'divider', // secondary-light-grey
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                border: '1px solid',
                                borderColor: 'divider',
                                borderRadius: 4
                            }}
                        >
                            <Typography variant="h4" sx={{ color: 'text.secondary' }}>
                                Bildplatzhalter
                            </Typography>
                        </Paper>
                    </Grid>

                    {/* right side: product details */}
                    <Grid size={{ xs: 12, md: 6 }}>
                        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>

                            {/* title and SKU */}
                            <Typography variant="h1" gutterBottom>
                                {product.name}
                            </Typography>
                            <Typography variant="body1" sx={{ fontWeight: 600, color: 'text.secondary', mb: 3 }}>
                                Artikelnummer: {product.sku}
                            </Typography>

                            {/* price and current stock */}
                            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 4 }}>
                                <Typography variant="h2" sx={{ m: 0 }}>
                                    {product.price}
                                </Typography>
                                <Chip
                                    icon={<InventoryIcon sx={{ fontSize: '1rem' }}/>}
                                    label={`${product.stock} auf Lager`}
                                    sx={{
                                        backgroundColor: product.stock > 10 ? 'success.light' : 'warning.light',
                                        color: product.stock > 10 ? 'success.main' : 'warning.main',
                                        fontWeight: 'bold',
                                        borderRadius: '16px'
                                    }}
                                />
                            </Box>

                            {/* description */}
                            <Typography variant="body1" sx={{ mb: 4 }}>
                                {product.description}
                            </Typography>

                            <Divider sx={{ mb: 4 }} />

                            {/* specifications (filter) */}
                            <Typography variant="h3" gutterBottom sx={{ mb: 2 }}>
                                Spezifikationen
                            </Typography>
                            <Grid container spacing={2} sx={{ mb: 5 }}>
                                {product.attributes.map((attr, index) => (
                                    <Grid size={{ xs: 6 }} key={index}>
                                        <Typography variant="body2" sx={{
                                            color: 'text.secondary',
                                            textTransform: 'uppercase',
                                            letterSpacing: 1,
                                            fontSize: '0.75rem'
                                        }}>
                                            {attr.label}
                                        </Typography>
                                        <Typography variant="body1" sx={{ fontWeight: 600, color: 'text.primary' }}>
                                            {attr.value}
                                        </Typography>
                                    </Grid>
                                ))}
                            </Grid>

                            {/* actions (buttons) */}
                            <Box sx={{ display: 'flex', gap: 2, mt: 'auto' }}>
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
                                        '&:hover': { boxShadow: '0 4px 12px rgba(125, 85, 199, 0.3)' } // using the new accent-purple rgb
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
                                        '&:hover': { borderColor: 'text.secondary', backgroundColor: 'transparent' }
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