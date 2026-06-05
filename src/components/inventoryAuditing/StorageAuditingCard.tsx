import DetailPage from '@/components/DetailPage.tsx';
import ItemAuditingList from '@/components/inventoryAuditing/ItemAuditingList.tsx';
import {useToast} from '@/components/ToastProvider.tsx';
import {useHidScanner} from '@/hooks/useHidScanner.ts';
import {closeStocktakeStorage, createFeltStocktakeScan, fetchStocktakeItems} from '@/services/backend.ts';
import {FeltStocktakeItemDto, FeltStocktakeListInfoDto, ITEM_STATE, STORAGE_STATE} from '@/types/inventoryAuditing.ts';
import {toErrorMessage} from '@/utils/pageUtils.ts';
import CheckIcon from '@mui/icons-material/Check';
import VerifiedIcon from '@mui/icons-material/Verified';
import {Alert, Button, Snackbar, Stack, Typography} from '@mui/material';
import React, {useEffect, useState} from 'react';
import {useNavigate} from 'react-router';

type StorageAuditingProps = {
    inventoryId: string;
    storage: FeltStocktakeListInfoDto | undefined;
};

export default function StorageAuditingCard({inventoryId, storage}: Readonly<StorageAuditingProps>) {
    const navigate = useNavigate();
    const showToast = useToast();

    const [itemsToScan, setItemsToScan] = useState<FeltStocktakeItemDto[]>([]);
    const [scannedItems, setScannedItems] = useState<FeltStocktakeItemDto[]>([]);
    const [faultyItems, setFaultyItems] = useState<FeltStocktakeItemDto[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [scanError, setScanError] = useState('');

    const load = async () => {
        if (!inventoryId) return;
        if (!storage) return;

        setIsLoading(true);
        setError('');

        try {
            const itemAuditings = await fetchStocktakeItems(inventoryId, storage.storageId.toString());
            setItemsToScan(itemAuditings.filter((item) => item.status == ITEM_STATE.INITIAL));
            setScannedItems(itemAuditings.filter((item) => item.status === ITEM_STATE.OK));
            setFaultyItems(itemAuditings.filter((item) => item.status !== ITEM_STATE.OK && item.status != ITEM_STATE.INITIAL));
        } catch (err) {
            setError(toErrorMessage(err, 'Produkte konnten nicht geladen werden'));
        } finally {
            setIsLoading(false);
        }
    };

    useHidScanner(!storage?.isClosed, async (code: string) => {
        await handleScan(code);
    });

    useEffect(() => {
        void load();
    }, [inventoryId, storage?.storageId]);

    const refetch = async () => {
        await load();
    };

    const handleScan = async (code: string) => {
        if (!storage) return;
        const trimmed = code.trim();
        const padded = /^\d+$/.test(trimmed) ? trimmed.padStart(5, '0') : trimmed;

        try {
            await createFeltStocktakeScan(inventoryId, {
                scannedStorageId: storage?.storageId,
                barcode: code,
            });
            await refetch();
            showToast('Scan erfolgreich.', 'success');
        } catch {
            setScanError(`Code nicht gefunden ${padded}`);
        }
    };

    const handleStorageClose = async () => {
        try {
            if (!storage) return;
            await closeStocktakeStorage(inventoryId, storage.storageId.toString());
            await refetch();
            showToast('Lager erfolgreich abgeschlossen.', 'success');
        } catch {
            showToast('Lager konnte nicht abgeschlossen werden.', 'error');
        }
    };

    const actions = storage?.isClosed ? (
        <Button disabled variant="outlined" startIcon={<VerifiedIcon />}>
            Lager abgeschlossen
        </Button>
    ) : (
        <Button variant="contained" startIcon={<CheckIcon />} onClick={handleStorageClose}>
            Lager abschliessen
        </Button>
    );

    return (
        <DetailPage
            title={`${storage?.storageName} - ${storage?.isClosed ? STORAGE_STATE.Closed : STORAGE_STATE.Open}`}
            isLoading={isLoading}
            error={error}
            onBack={() => navigate(-1)}
            actions={actions}
        >
            <Stack spacing={3}>
                <Typography variant="h3" sx={{color: 'text.primary'}}>
                    Artikel zu scannen
                </Typography>
                <ItemAuditingList items={itemsToScan} hideStatus hideResolutions inventoryId={inventoryId} onResolve={refetch} sx={{p: 3}} />

                <Typography variant="h3" sx={{color: 'text.primary'}}>
                    Gescannte Artikel
                </Typography>
                <ItemAuditingList items={scannedItems} hideStatus hideResolutions inventoryId={inventoryId} onResolve={refetch} sx={{p: 3}} />

                <Typography variant="h3" sx={{color: 'text.primary'}}>
                    Fehlerhafte Artikel
                </Typography>
                <ItemAuditingList items={faultyItems} inventoryId={inventoryId} onResolve={refetch} sx={{p: 3}} />

                <Snackbar open={!!scanError} autoHideDuration={4000} onClose={() => setScanError('')} anchorOrigin={{vertical: 'top', horizontal: 'center'}}>
                    <Alert severity="error" onClose={() => setScanError('')}>
                        {scanError}
                    </Alert>
                </Snackbar>
            </Stack>
        </DetailPage>
    );
}
