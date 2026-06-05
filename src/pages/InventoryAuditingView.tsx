import StorageAuditingCard from '@/components/inventoryAuditing/StorageAuditingCard.tsx';
import StorageAuditingList from '@/components/inventoryAuditing/StorageAuditingList.tsx';
import {useToast} from '@/components/ToastProvider.tsx';
import {completeStocktake, fetchStocktakeById, fetchStocktakeItems} from '@/services/backend.ts';
import {FeltStocktakeDto, ITEM_STATE} from '@/types/inventoryAuditing.ts';
import {formatDate, toErrorMessage} from '@/utils/pageUtils.ts';
import CheckIcon from '@mui/icons-material/Check';
import {Alert, Box, Button, CircularProgress, Stack, Typography} from '@mui/material';
import React, {useEffect, useState} from 'react';
import {useNavigate, useParams} from 'react-router';

export default function InventoryAuditingView() {
    const {id} = useParams<{id: string}>();
    const showToast = useToast();
    const navigate = useNavigate();

    const [inventoryAuditing, setinventoryAuditing] = useState<FeltStocktakeDto | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const load = async () => {
            if (!id) return;
            try {
                setinventoryAuditing(await fetchStocktakeById(id));
            } catch (err) {
                setError(toErrorMessage(err, 'Inventur konnte nicht geladen werden.'));
            } finally {
                setIsLoading(false);
            }
        };
        void load();
    }, []);

    const handleInventoryComplete = async () => {
        try {
            if (!inventoryAuditing) return;

            if (inventoryAuditing.storageLists.some((storage) => !storage.isClosed)) {
                showToast('Es gibt noch offene Lager.', 'error');
                return;
            }

            const items = await fetchStocktakeItems(inventoryAuditing.id.toString(), '');
            if (items.some((item) => item.status !== ITEM_STATE.OK && item.status != ITEM_STATE.INITIAL && !item.resolution)) {
                showToast('Es gibt noch fehlerhafte Artikel.', 'error');
                return;
            }

            await completeStocktake(inventoryAuditing.id.toString());
            showToast('Bestandsprüfung erfolgeich abgeschlossen.', 'success');
            void navigate('/inventory');
        } catch {
            showToast('Bestandsprüfung konnte nicht abgeschlossen werden.', 'error');
        }
    };

    const mainLoad =
        inventoryAuditing && inventoryAuditing.storageLists.length > 1 ? (
            <StorageAuditingList inventoryId={inventoryAuditing.id.toString()} storages={inventoryAuditing.storageLists} />
        ) : inventoryAuditing && inventoryAuditing.storageLists.length === 1 ? (
            <StorageAuditingCard inventoryId={inventoryAuditing.id.toString()} storage={inventoryAuditing.storageLists[0]} />
        ) : null;

    return (
        <Box sx={{p: 3}}>
            <Stack spacing={3}>
                <Box sx={{display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 2}}>
                    <Typography variant="h2" component="h1">
                        {`Bestandsprüfung ${formatDate(inventoryAuditing?.createdAt)}`}
                    </Typography>
                    <Box sx={{flexShrink: 0}}>
                        <Button variant="contained" startIcon={<CheckIcon />} onClick={handleInventoryComplete}>
                            Bestandsprüfung Abschliessen
                        </Button>
                    </Box>
                </Box>

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

                {!isLoading && mainLoad}
            </Stack>
        </Box>
    );
}
