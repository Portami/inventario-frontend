import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditIcon from '@mui/icons-material/Edit';
import InventoryIcon from '@mui/icons-material/Inventory';
import HistoryIcon from '@mui/icons-material/History';
import {
    Box,
    Button,
    Chip,
    Container,
    createTheme,
    Divider,
    Grid,
    Paper,
    ThemeProvider,
    Typography} from '@mui/material';
import React from 'react';

const theme = createTheme({
    palette: {
        primary: {
            main: '#8b5cf6',
        },
        text: {
            primary: '#23254f', // dark blue
            secondary: '#505D68', // light grey
        },
        background: {
            default: '#f9f9fb',
            paper: '#ffffff',
        },
        divider: '#E1E3E8', // light-grey
    },
    typography: {
        fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
        h1: { fontSize: '2.5rem', fontWeight: 800, color: '#8b5cf6' },
        h2: { fontSize: '2rem', fontWeight: 700, color: '#23254f' },
        h3: { fontSize: '1.5rem', fontWeight: 600, color: '#23254f' },
        h4: { fontSize: '1.25rem', fontWeight: 600, color: '#505D68' },
        body1: { fontSize: '1rem', color: '#505D68', lineHeight: 1.6 },
    },
    shape: {
        borderRadius: 12,
    },
});

export default function ProductDetailView() {
    // Mock-Daten für ein Filzprodukt
    const product = {
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
        <ThemeProvider theme={theme}>
            <Box sx={{ minHeight: '100vh', backgroundColor: 'background.default', py: 6 }}>
                <Container maxWidth="lg">

                    {/* Header & Zurück-Button */}
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 4 }}>
                        <Button
                            startIcon={<ArrowBackIcon />}
                            sx={{ color: '#505D68', textTransform: 'none', fontWeight: 600 }}
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
                                borderColor: '#E1E3E8',
                                color: '#505D68',
                                '&:hover': { borderColor: '#9BA5B7', backgroundColor: 'transparent' }
                            }}
                        >
                            Verlauf anzeigen
                        </Button>
                    </Box>

                    <Grid container spacing={6}>
                        {/* Linke Seite: Produktbild (Platzhalter) */}
                        <Grid item xs={12} md={6}>
                            <Paper
                                elevation={0}
                                sx={{
                                    width: '100%',
                                    aspectRatio: '1 / 1',
                                    backgroundColor: '#E1E3E8', // secondary-light-grey
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    border: '1px solid #E1E3E8',
                                    borderRadius: 4
                                }}
                            >
                                <Typography variant="h4" sx={{ color: '#9BA5B7' }}>
                                    Bildplatzhalter
                                </Typography>
                            </Paper>
                        </Grid>

                        {/* Rechte Seite: Produktdetails */}
                        <Grid item xs={12} md={6}>
                            <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>

                                {/* Titel und SKU */}
                                <Typography variant="h1" gutterBottom>
                                    {product.name}
                                </Typography>
                                <Typography variant="body1" sx={{ fontWeight: 600, color: '#9BA5B7', mb: 3 }}>
                                    Artikelnummer: {product.sku}
                                </Typography>

                                {/* Preis und Lagerbestand */}
                                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 4 }}>
                                    <Typography variant="h2" sx={{ m: 0 }}>
                                        {product.price}
                                    </Typography>
                                    <Chip
                                        icon={<InventoryIcon sx={{ fontSize: '1rem' }}/>}
                                        label={`${product.stock} auf Lager`}
                                        sx={{
                                            backgroundColor: product.stock > 10 ? '#e8f5e9' : '#fff3e0',
                                            color: product.stock > 10 ? '#2e7d32' : '#ed6c02',
                                            fontWeight: 'bold',
                                            borderRadius: '16px'
                                        }}
                                    />
                                </Box>

                                {/* Beschreibung */}
                                <Typography variant="body1" paragraph sx={{ mb: 4 }}>
                                    {product.description}
                                </Typography>

                                <Divider sx={{ mb: 4 }} />

                                {/* Spezifikationen (Die Filter aus deinem Figma-Design) */}
                                <Typography variant="h3" gutterBottom sx={{ mb: 2 }}>
                                    Spezifikationen
                                </Typography>
                                <Grid container spacing={2} sx={{ mb: 5 }}>
                                    {product.attributes.map((attr, index) => (
                                        <Grid item xs={6} key={index}>
                                            <Typography variant="body2" sx={{ color: '#9BA5B7', textTransform: 'uppercase', letterSpacing: 1, fontSize: '0.75rem' }}>
                                                {attr.label}
                                            </Typography>
                                            <Typography variant="body1" sx={{ fontWeight: 600, color: '#23254f' }}>
                                                {attr.value}
                                            </Typography>
                                        </Grid>
                                    ))}
                                </Grid>

                                {/* Aktionen / Buttons */}
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
                                            '&:hover': { boxShadow: '0 4px 12px rgba(139, 92, 246, 0.3)' }
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
                                            borderColor: '#E1E3E8',
                                            color: '#23254f',
                                            '&:hover': { borderColor: '#9BA5B7', backgroundColor: 'transparent' }
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
        </ThemeProvider>
    );
}