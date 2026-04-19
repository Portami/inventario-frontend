import LabelDimensionControls from './components/LabelDimensionControls';
import LabelsPreview from './components/LabelsPreview';
import ProductSelectionTable from './components/ProductSelectionTable';
import {DEFAULT_LABEL_HEIGHT_MM, DEFAULT_LABEL_WIDTH_MM} from './constants/labelConstants';
import ListPage from '@/components/ListPage';
import {fetchProducts} from '@/services/backend';
import {generateLabelsPDF} from '@/services/labelPdfService';
import {Product} from '@/types/product';
import DownloadIcon from '@mui/icons-material/Download';
import {Alert, Box, Button, Stack} from '@mui/material';
import {useEffect, useState} from 'react';

/**
 * Label Generation Page
 * Allows users to select single or multiple rolls and generate printable labels with Data Matrix codes
 * Labels are generated as PDF for clean printing without navigation interference
 */

export default function LabelGeneratorPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
    const [labelWidth, setLabelWidth] = useState(DEFAULT_LABEL_WIDTH_MM);
    const [labelHeight, setLabelHeight] = useState(DEFAULT_LABEL_HEIGHT_MM);

    useEffect(() => {
        const loadProducts = async () => {
            setIsLoading(true);
            setError('');
            try {
                const fetchedProducts = await fetchProducts();
                setProducts(fetchedProducts);
            } catch (err) {
                const message = err instanceof Error ? err.message : 'Failed to load rolls';
                setError(message);
            } finally {
                setIsLoading(false);
            }
        };

        void loadProducts();
    }, []);

    const selectedProducts = products.filter((p) => selectedIds.has(String(p.id)));

    const handleSelectAll = () => {
        if (selectedIds.size === products.length) {
            setSelectedIds(new Set());
        } else {
            setSelectedIds(new Set(products.map((p) => String(p.id))));
        }
    };

    const handleSelectProduct = (productId: string) => {
        const newSelectedIds = new Set(selectedIds);
        if (newSelectedIds.has(productId)) {
            newSelectedIds.delete(productId);
        } else {
            newSelectedIds.add(productId);
        }
        setSelectedIds(newSelectedIds);
    };

    const handleDownloadPDF = async () => {
        setIsGeneratingPDF(true);
        try {
            const timestamp = new Date().toISOString().slice(0, 10);
            await generateLabelsPDF(selectedProducts, `roll-labels-${timestamp}`, labelWidth, labelHeight);
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Failed to generate PDF';
            setError(message);
        } finally {
            setIsGeneratingPDF(false);
        }
    };

    return (
        <ListPage
            title="Rollenetiketten generieren"
            description="Wählen Sie eine oder mehrere Rollen aus, um druckbare PDF-Etiketten mit Data-Matrix-Codes zu generieren."
            isLoading={isLoading}
            isEmpty={products.length === 0}
            emptyMessage="Keine Rollen gefunden. Bitte erstellen Sie zunächst eine Rolle."
            error={error}
            onErrorClose={() => setError('')}
        >
            <Stack spacing={3}>
                <ProductSelectionTable products={products} selectedIds={selectedIds} onSelectAll={handleSelectAll} onSelectProduct={handleSelectProduct} />

                {/* Selection Info */}
                {selectedIds.size > 0 && (
                    <Alert severity="info">
                        {selectedIds.size} Rolle{selectedIds.size === 1 ? '' : 'n'} für die Etikettengenerierung ausgewählt
                    </Alert>
                )}

                {selectedIds.size > 0 && (
                    <LabelDimensionControls labelWidth={labelWidth} labelHeight={labelHeight} onWidthChange={setLabelWidth} onHeightChange={setLabelHeight} />
                )}

                {selectedIds.size > 0 && (
                    <Box>
                        <Button variant="contained" startIcon={<DownloadIcon />} onClick={handleDownloadPDF} disabled={isGeneratingPDF}>
                            {isGeneratingPDF ? 'PDF wird generiert...' : 'PDF herunterladen'}
                        </Button>
                    </Box>
                )}

                {/* Labels Preview */}
                {selectedProducts.length > 0 && <LabelsPreview products={selectedProducts} labelWidth={labelWidth} labelHeight={labelHeight} />}
            </Stack>
        </ListPage>
    );
}
