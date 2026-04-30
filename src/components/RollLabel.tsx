import DataMatrix from './DataMatrix';
import {Product} from '@/types/product';
import {Box, Card, CardContent, Stack, Typography, useTheme} from '@mui/material';

type RollLabelProps = {
    product: Product;
    width?: number; // Width in mm
    height?: number; // Height in mm
};

/**
 * Roll Label Component
 * Displays printable label with product information and Data Matrix code
 * Format:
 * - Name
 * - Farbe (Color)
 * - Dicke (Type/Material)
 * - Länge (Article Number as reference)
 * - Breite (ID)
 * - Data Matrix code based on ID
 */
export default function RollLabel({product, width, height}: Readonly<RollLabelProps>) {
    const theme = useTheme();

    return (
        <Card
            sx={{
                width: width ? `${width}mm` : '100%',
                height: height ? `${height}mm` : 'auto',
                maxWidth: 400,
                mx: 'auto',
                p: 2,
                display: 'flex',
                flexDirection: 'column',
                backgroundColor: theme.palette.background.paper,
                // Add border for PDF generation and visual definition
                border: `1px solid ${theme.palette.divider}`,
                '@media print': {
                    boxShadow: 'none',
                    pageBreakInside: 'avoid',
                },
                // Enable shadow by default (for PDF generation via html2canvas)
                boxShadow: theme.shadows[2],
            }}
        >
            <CardContent
                sx={{
                    '@media print': {
                        padding: 1,
                    },
                }}
            >
                <Stack spacing={2}>
                    {/* Header */}
                    <Box sx={{textAlign: 'center', borderBottom: `2px solid ${theme.palette.text.primary}`, pb: 1}}>
                        <Typography
                            variant="subtitle2"
                            sx={{
                                fontWeight: 'bold',
                                fontSize: '0.75rem',
                                textTransform: 'uppercase',
                                letterSpacing: 1,
                                color: theme.palette.text.primary,
                            }}
                        >
                            {product.name ? product.name.toUpperCase() : 'ROLL LABEL'}
                        </Typography>
                    </Box>

                    {/* Product Information */}
                    <Stack spacing={1}>
                        <Box>
                            <Typography variant="caption" sx={{fontSize: '0.65rem', color: theme.palette.text.secondary}}>
                                Länge:
                            </Typography>
                            <Typography variant="body2" sx={{fontWeight: 600, fontSize: '0.9rem', color: theme.palette.text.primary}}>
                                {product.length ? `${product.length / 10} cm` : '-'}
                            </Typography>
                        </Box>

                        <Box>
                            <Typography variant="caption" sx={{fontSize: '0.65rem', color: theme.palette.text.secondary}}>
                                Breite:
                            </Typography>
                            <Typography variant="body2" sx={{fontWeight: 600, fontSize: '0.9rem', color: theme.palette.text.primary}}>
                                {product.width ? `${product.width / 10} cm` : '-'}
                            </Typography>
                        </Box>

                        <Box>
                            <Typography variant="caption" sx={{fontSize: '0.65rem', color: theme.palette.text.secondary}}>
                                Artikelnummer:
                            </Typography>
                            <Typography variant="body2" sx={{fontWeight: 600, fontSize: '0.9rem', fontFamily: 'monospace', color: theme.palette.text.primary}}>
                                {product.articleNumber}
                            </Typography>
                        </Box>
                    </Stack>

                    {/* Data Matrix Code */}
                    <Box
                        sx={{
                            display: 'flex',
                            justifyContent: 'center',
                            py: 1,
                            borderTop: `1px solid ${theme.palette.divider}`,
                            borderBottom: `1px solid ${theme.palette.divider}`,
                        }}
                    >
                        <DataMatrix id={String(product.id)} width={120} height={120} />
                    </Box>

                    {/* Footer */}
                    <Box sx={{textAlign: 'center', pt: 1}}>
                        <Typography variant="caption" sx={{fontSize: '0.6rem', color: theme.palette.text.secondary}}>
                            ID: {product.id}
                        </Typography>
                    </Box>
                </Stack>
            </CardContent>
        </Card>
    );
}
