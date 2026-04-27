import LabelDimensionControls from './components/LabelDimensionControls';
import LabelsPreview from './components/LabelsPreview';
import ProductSelectionTable from './components/ProductSelectionTable';
import {DEFAULT_LABEL_HEIGHT_MM, DEFAULT_LABEL_WIDTH_MM} from './constants/labelConstants';
import ListPage from '@/components/ListPage';
import {useToast} from '@/components/ToastProvider';
import {fetchRolls} from '@/services/backend';
import {generateLabelsPDF} from '@/services/labelPdfService';
import {Product} from '@/types/product';
import {FeltRollDto} from '@/types/roll';
import DownloadIcon from '@mui/icons-material/Download';
import {Alert, Box, Button, Stack} from '@mui/material';
import {useEffect, useState} from 'react';

const toProduct = (roll: FeltRollDto): Product => ({
    id: roll.id,
    articleNumber: roll.articleNumber,
    name: `${roll.feltTypeName} – ${roll.color}`,
    length: roll.length * 1000, // meters → mm
    width: roll.width * 1000, // meters → mm
});

export default function LabelGeneratorPage() {
    const showToast = useToast();
    const [rolls, setRolls] = useState<FeltRollDto[]>([]);
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
    const [labelWidth, setLabelWidth] = useState(DEFAULT_LABEL_WIDTH_MM);
    const [labelHeight, setLabelHeight] = useState(DEFAULT_LABEL_HEIGHT_MM);

    useEffect(() => {
        const load = async () => {
            try {
                setRolls(await fetchRolls());
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Rollen konnten nicht geladen werden');
            } finally {
                setIsLoading(false);
            }
        };
        void load();
    }, []);

    const selectedProducts: Product[] = rolls.filter((r) => selectedIds.has(String(r.id))).map(toProduct);

    const handleDownloadPDF = async () => {
        setIsGeneratingPDF(true);
        try {
            const timestamp = new Date().toISOString().slice(0, 10);
            await generateLabelsPDF(selectedProducts, `roll-labels-${timestamp}`, labelWidth, labelHeight);
            showToast('PDF erfolgreich heruntergeladen.', 'success');
        } catch (err) {
            showToast(err instanceof Error ? err.message : 'PDF konnte nicht generiert werden', 'error');
        } finally {
            setIsGeneratingPDF(false);
        }
    };

    return (
        <ListPage
            title="Rollenetiketten generieren"
            description="Wählen Sie eine oder mehrere Rollen aus, um druckbare PDF-Etiketten mit Data-Matrix-Codes zu generieren."
            isLoading={isLoading}
            isEmpty={rolls.length === 0}
            emptyMessage="Keine Rollen gefunden. Bitte erstellen Sie zunächst eine Rolle."
            error={error}
            onErrorClose={() => setError('')}
        >
            <Stack spacing={3}>
                <ProductSelectionTable rolls={rolls} selectedIds={selectedIds} onSelectionChange={setSelectedIds} />

                {selectedIds.size > 0 && (
                    <Alert severity="info">
                        {selectedIds.size} Rolle{selectedIds.size === 1 ? '' : 'n'} für die Etikettengenerierung ausgewählt
                    </Alert>
                )}

                {selectedIds.size > 0 && (
                    <>
                        <LabelDimensionControls
                            labelWidth={labelWidth}
                            labelHeight={labelHeight}
                            onWidthChange={setLabelWidth}
                            onHeightChange={setLabelHeight}
                        />
                        <Box>
                            <Button variant="contained" startIcon={<DownloadIcon />} onClick={handleDownloadPDF} disabled={isGeneratingPDF}>
                                {isGeneratingPDF ? 'PDF wird generiert...' : 'PDF herunterladen'}
                            </Button>
                        </Box>
                    </>
                )}

                {selectedProducts.length > 0 && <LabelsPreview products={selectedProducts} labelWidth={labelWidth} labelHeight={labelHeight} />}
            </Stack>
        </ListPage>
    );
}
