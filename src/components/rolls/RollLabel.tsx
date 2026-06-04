import DataMatrix from '../DataMatrix.tsx';
import {Product} from '@/types/product.ts';
import {Box, Card, Divider, Typography, useTheme} from '@mui/material';

type RollLabelProps = {
    product: Product;
    width?: number;
    height?: number;
};

function InfoRow({label, value}: Readonly<{label: string; value: string}>) {
    return (
        <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 1, minWidth: 0}}>
            <Typography sx={{fontSize: '0.6rem', color: 'text.secondary', flexShrink: 0, textTransform: 'uppercase', letterSpacing: '0.04em'}}>
                {label}
            </Typography>
            <Typography sx={{fontSize: '0.72rem', fontWeight: 700, color: 'text.primary', textAlign: 'right', wordBreak: 'break-word'}}>{value}</Typography>
        </Box>
    );
}

export default function RollLabel({product, width, height}: Readonly<RollLabelProps>) {
    const theme = useTheme();

    return (
        <Card
            sx={{
                width: width ? `${width}mm` : '100%',
                height: height ? `${height}mm` : 'auto',
                maxWidth: 400,
                mx: 'auto',
                display: 'flex',
                flexDirection: 'column',
                backgroundColor: theme.palette.background.paper,
                border: `1px solid ${theme.palette.divider}`,
                boxShadow: theme.shadows[2],
                overflow: 'hidden',
                '@media print': {boxShadow: 'none', pageBreakInside: 'avoid'},
            }}
        >
            {/* Header */}
            <Box
                sx={{
                    px: 1.5,
                    py: 0.75,
                    bgcolor: theme.palette.text.primary,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}
            >
                <Typography
                    sx={{
                        fontSize: '0.7rem',
                        fontWeight: 800,
                        textTransform: 'uppercase',
                        letterSpacing: '0.1em',
                        color: theme.palette.background.paper,
                        textAlign: 'center',
                        lineHeight: 1.2,
                    }}
                >
                    {product.name ?? 'ROLL LABEL'}
                </Typography>
            </Box>

            {/* Body: barcode left, info right */}
            <Box sx={{display: 'flex', flex: 1, p: 1, gap: 1.25, alignItems: 'center'}}>
                {/* DataMatrix */}
                <Box sx={{flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                    <DataMatrix id={String(product.id)} width={90} height={90} />
                </Box>

                <Divider orientation="vertical" flexItem />

                {/* Info fields */}
                <Box sx={{flex: 1, display: 'flex', flexDirection: 'column', gap: 0.6, minWidth: 0}}>
                    <InfoRow label="Filztyp" value={product.feltTypeName ?? '-'} />
                    <InfoRow label="Farbe" value={product.color ?? '-'} />
                    <InfoRow label="Stärke" value={product.thickness == null ? '-' : `${product.thickness} mm`} />
                    <InfoRow label="Dichte" value={product.density == null ? '-' : `${product.density} g/m²`} />
                    <InfoRow label="Lieferant" value={product.supplierName ?? '-'} />
                </Box>
            </Box>

            {/* Footer */}
            <Box
                sx={{
                    px: 1.5,
                    py: 0.4,
                    borderTop: `1px solid ${theme.palette.divider}`,
                    display: 'flex',
                    justifyContent: 'center',
                }}
            >
                <Typography sx={{fontSize: '0.55rem', color: 'text.disabled', letterSpacing: '0.05em'}}>
                    ID {product.id} · {product.articleNumber}
                </Typography>
            </Box>
        </Card>
    );
}
