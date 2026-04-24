import ListPage from '@/components/ListPage';
import Scanner from '@/components/Scanner';
import {ScanResult} from '@/types/scanner';
import QrCodeIcon from '@mui/icons-material/QrCode';
import {Button, Stack} from '@mui/material';
import {useState} from 'react';
import {useNavigate, useSearchParams} from 'react-router';

/**
 * Scan Page - Entry point for roll/scrap code scanning
 *
 * This page provides the UI to trigger the scanner modal.
 * The Scanner component is reusable and can be embedded in other pages/modals.
 * Supports Bluetooth scanner, manual entry, and dev simulation modes.
 * After scanning successfully, the user is automatically redirected to the detail page.
 */
export default function ScanPage() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [isScannerOpen, setIsScannerOpen] = useState(searchParams.get('open') === 'true');
    const [lastError, setLastError] = useState('');

    const handleScanSuccess = (result: ScanResult) => {
        // Auto-redirect based on scan type
        const path = result.type === 'roll' ? `/roll/${result.id}` : `/scrap/${result.id}`;
        navigate(path);
    };

    const handleScanError = (message: string) => {
        setLastError(message);
    };

    return (
        <ListPage
            title="Rollcode scannen"
            description="Verwenden Sie Ihren Bluetooth-Scanner, um einen Rollcode für die Bestandsverwaltung zu scannen."
            isLoading={false}
            isEmpty={false}
            error={lastError}
            onErrorClose={() => setLastError('')}
        >
            <Stack spacing={2} sx={{alignItems: 'center'}}>
                <Button variant="contained" size="large" startIcon={<QrCodeIcon />} onClick={() => setIsScannerOpen(true)}>
                    Scanner öffnen
                </Button>
            </Stack>

            <Scanner isOpen={isScannerOpen} onClose={() => setIsScannerOpen(false)} onSuccess={handleScanSuccess} onError={handleScanError} />
        </ListPage>
    );
}
