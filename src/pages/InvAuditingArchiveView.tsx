import {InvChangelogList} from '@/components/inventoryAuditing/InvChangelogList.tsx';
import {fetchStocktakeById} from '@/services/backend.ts';
import {FeltStocktakeDto} from '@/types/inventoryAuditing.ts';
import {formatDate, toErrorMessage} from '@/utils/pageUtils.ts';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import {Alert, Box, Button, CircularProgress, Typography} from '@mui/material';
import React, {useEffect, useState} from 'react';
import {useNavigate, useParams} from 'react-router';

export default function InvAuditingArchiveView() {
    const navigate = useNavigate();
    const {id} = useParams<{id: string}>();

    const [inventoryAuditing, setinventoryAuditing] = useState<FeltStocktakeDto>();
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

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

    useEffect(() => {
        void load();
    }, [id]);

    if (!id) {
        setError('Bestandsprüfung nicht gefunden.');
        setIsLoading(false);
        return null;
    }

    return (
        <Box sx={{p: 3}}>
            <Box>
                <Typography variant="h2" component="h1" sx={{mb: 2}}>
                    {`${inventoryAuditing?.description} - ${formatDate(inventoryAuditing?.createdAt)}`}
                </Typography>
                <Button startIcon={<ArrowBackIcon />} onClick={() => navigate(-1)} variant="text" sx={{mb: 1, ml: -1}}>
                    Zurück
                </Button>
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

            {!isLoading && <InvChangelogList inventoryId={id} />}
        </Box>
    );
}
