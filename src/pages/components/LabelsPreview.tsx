import {A4_HEIGHT_MM, A4_WIDTH_MM, LABEL_GAP_MM, PAGE_MARGINS_MM} from '../constants/labelConstants';
import RollLabel from '@/components/RollLabel';
import {Product} from '@/types/product';
import {Box, Typography, useTheme} from '@mui/material';

type LabelsPreviewProps = {
    readonly products: Product[];
    readonly labelWidth: number;
    readonly labelHeight: number;
};

export default function LabelsPreview({products, labelWidth, labelHeight}: LabelsPreviewProps) {
    const theme = useTheme();

    if (products.length === 0) {
        return null;
    }

    // Calculate page layout
    const labelsPerRow = Math.max(1, Math.floor(A4_WIDTH_MM / labelWidth));
    const labelHeightWithGap = labelHeight + LABEL_GAP_MM;
    const pageHeightMm = A4_HEIGHT_MM - 2 * PAGE_MARGINS_MM;
    const maxLabelsPerPage = Math.max(1, Math.floor(pageHeightMm / labelHeightWithGap)) * labelsPerRow;

    // Split products into pages
    const pages: Product[][] = [];
    for (let i = 0; i < products.length; i += maxLabelsPerPage) {
        pages.push(products.slice(i, i + maxLabelsPerPage));
    }

    return (
        <Box
            sx={{
                mt: 4,
                backgroundColor: theme.palette.background.default,
                borderRadius: theme.shape.borderRadius,
                p: 3,
            }}
        >
            <Typography variant="subtitle2" sx={{mb: 2}}>
                PDF Preview ({products.length} label{products.length === 1 ? '' : 's'}) - {labelWidth}mm × {labelHeight}mm (A4:
                {A4_WIDTH_MM}mm × {A4_HEIGHT_MM}mm):
            </Typography>

            {pages.map((pageProducts) => {
                const pageKey = `page-${pageProducts.at(0)?.id}-${pageProducts.at(-1)?.id}`;
                return (
                    <Box key={pageKey} sx={{mb: 3}}>
                        {/* Page Container - Simulates A4 paper */}
                        <Box
                            sx={{
                                display: 'flex',
                                flexWrap: 'wrap',
                                gap: `${LABEL_GAP_MM}px`,
                                p: `${PAGE_MARGINS_MM}px`,
                                backgroundColor: '#ffffff',
                                border: `2px solid ${theme.palette.divider}`,
                                borderRadius: 1,
                                // Simulate A4 page
                                maxWidth: '800px',
                                aspectRatio: `${A4_WIDTH_MM} / ${A4_HEIGHT_MM}`,
                                alignContent: 'flex-start',
                            }}
                        >
                            {pageProducts.map((product) => {
                                const labelWidthPercent = (labelWidth / A4_WIDTH_MM) * 100;

                                return (
                                    <Box
                                        key={product.id}
                                        sx={{
                                            flex: `0 0 calc(${labelWidthPercent}% - ${LABEL_GAP_MM}px)`,
                                            minWidth: 0,
                                            display: 'flex',
                                            justifyContent: 'center',
                                            alignItems: 'flex-start',
                                        }}
                                    >
                                        <RollLabel product={product} width={labelWidth} height={labelHeight} />
                                    </Box>
                                );
                            })}
                        </Box>

                        {/* Page Number */}
                        <Typography variant="caption" color="textSecondary" sx={{mt: 1, textAlign: 'center', display: 'block'}}>
                            Page {pages.indexOf(pageProducts) + 1} of {pages.length}
                        </Typography>
                    </Box>
                );
            })}

            <Typography variant="caption" color="textSecondary" sx={{mt: 3, display: 'block'}}>
                Etiketten werden automatisch basierend auf der A4-Seitenbreite ({A4_WIDTH_MM}mm) umgebrochen und wechseln zu neuen Seiten bei ({A4_HEIGHT_MM}mm)
                Höhe. Passen Sie die Etikett-Abmessungen an, um das Layout für den Druck zu optimieren.
            </Typography>
        </Box>
    );
}
