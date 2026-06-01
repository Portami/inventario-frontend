import DetailPage from '@/components/DetailPage.tsx';
import ItemAuditingList from '@/components/inventoryAuditing/ItemAuditingList.tsx';
import {useToast} from '@/components/ToastProvider.tsx';
import {closeStocktakeStorage, fetchStocktakeItems} from '@/services/backend.ts';
import {FeltStocktakeItemDto, FeltStocktakeListInfoDto, ITEM_STATE} from '@/types/inventoryAuditing.ts';
import {toErrorMessage} from '@/utils/pageUtils.ts';
import {Button, Typography} from '@mui/material';
import {useEffect, useMemo, useState} from 'react';
import {useNavigate} from 'react-router';

type StorageAuditingProps = {
    inventoryId: string;
    storage: FeltStocktakeListInfoDto | undefined;
};

export default function StorageAuditingCard({inventoryId, storage}: Readonly<StorageAuditingProps>) {
    const navigate = useNavigate();
    const showToast = useToast();

    const [itemAuditings, setItemAuditings] = useState<FeltStocktakeItemDto[]>([]);
    const [itemsToScan, setItemsToScan] = useState<FeltStocktakeItemDto[]>([]);
    const [itemsScanned, setItemsScanned] = useState<FeltStocktakeItemDto[]>([]);
    const [faultyScans, setFaultyScans] = useState<FeltStocktakeItemDto[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const load = async () => {
            if (!inventoryId) return;
            if (!storage) return;
            try {
                setItemAuditings(await fetchStocktakeItems(inventoryId, storage.storageId.toString()));

                setItemsToScan(
                    useMemo(() => {
                        return itemAuditings.filter((item) => item.status === ITEM_STATE.Initial);
                    }, [itemAuditings]),
                );
                setItemsScanned(
                    useMemo(() => {
                        return itemAuditings.filter((item) => item.status === ITEM_STATE.Ok);
                    }, [itemAuditings]),
                );
                setFaultyScans(
                    useMemo(() => {
                        return itemAuditings.filter((item) => item.status !== ITEM_STATE.Ok && item.status !== ITEM_STATE.Initial);
                    }, [itemAuditings]),
                );
            } catch (err) {
                setError(toErrorMessage(err, 'Produkte konnten nicht geladen werden'));
            } finally {
                setIsLoading(false);
            }
        };
        void load();
    }, []);

    const handleStorageClose = async () => {
        try {
            if (!storage) return;
            await closeStocktakeStorage(inventoryId, storage.storageId.toString());
            showToast('Lager erfolgreich abgeschlossen.', 'success');
        } catch {
            showToast('Lager konnte nicht abgeschlossen werden.', 'error');
        }
    };

    return (
        <DetailPage title={`${storage?.storageName}`} isLoading={isLoading} error={error} onBack={() => navigate(-1)}>
            <Typography variant="h5" sx={{fontWeight: 700, color: 'text.primary'}}>
                Artikel zu scannen
            </Typography>
            <ItemAuditingList items={itemsToScan} hideStatus hideActions inventoryId={inventoryId} />

            <Typography variant="h5" sx={{fontWeight: 700, color: 'text.primary'}}>
                Gescannte Artikel
            </Typography>
            <ItemAuditingList items={itemsScanned} hideStatus hideActions inventoryId={inventoryId} />

            <Typography variant="h5" sx={{fontWeight: 700, color: 'text.primary'}}>
                Fehlerhafte Artikel
            </Typography>
            <ItemAuditingList items={faultyScans} inventoryId={inventoryId} />

            <Button variant="outlined" color="primary" size="medium" onClick={handleStorageClose}>
                Abschliessen
            </Button>
        </DetailPage>
    );
}
