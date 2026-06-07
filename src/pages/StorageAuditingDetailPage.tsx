import StorageAuditingCard from '@/components/inventoryAuditing/StorageAuditingCard.tsx';
import {fetchStocktakeById} from '@/services/backend.ts';
import {FeltStocktakeDto} from '@/types/inventoryAuditing.ts';
import {toErrorMessage} from '@/utils/pageUtils.ts';
import {Alert, Box, CircularProgress} from '@mui/material';
import {useEffect, useState} from 'react';
import {useParams} from 'react-router';

export default function StorageAuditingDetailPage() {
    const {inventoryId, id} = useParams<{inventoryId: string; id: string}>();

    const [inventoryAuditing, setInventoryAuditing] = useState<FeltStocktakeDto>();
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const load = async () => {
            if (!inventoryId) return;
            try {
                setInventoryAuditing(await fetchStocktakeById(inventoryId));
            } catch (err) {
                setError(toErrorMessage(err, 'Lager konnte nicht gefunden werden.'));
            } finally {
                setIsLoading(false);
            }
        };
        void load();
    }, [inventoryId, id]);

    if (!inventoryId) {
        setError('Bestandsprüfung nicht gefunden.');
        setIsLoading(false);
        return null;
    }

    if (!id) {
        setError('Lager nicht gefunden.');
        setIsLoading(false);
        return null;
    }

    return (
        <Box sx={{py: 3}}>
            {error && (
                <Alert severity="error" onClose={() => setError('')}>
                    {error}
                </Alert>
            )}

            {isLoading && (
                <Box sx={{display: 'flex', justifyContent: 'center', py: 4}}>
                    <CircularProgress />
                </Box>
            )}

            {!isLoading && (
                <StorageAuditingCard inventoryId={inventoryId} storage={inventoryAuditing?.storageLists.find((storage) => storage.storageId == Number(id))} />
            )}
        </Box>
    );
}
