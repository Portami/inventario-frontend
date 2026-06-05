import ItemAuditingList from '@/components/inventoryAuditing/ItemAuditingList.tsx';
import ProblemStateCounts from '@/components/inventoryAuditing/ProblemStateCount.tsx';
import {fetchStocktakeItems} from '@/services/backend.ts';
import {FeltStocktakeItemDto, FeltStocktakeListInfoDto, ITEM_STATE, STORAGE_STATE, StorageState} from '@/types/inventoryAuditing.ts';
import {toErrorMessage} from '@/utils/pageUtils.ts';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import {Alert, Box, Button, CircularProgress, Stack, Typography} from '@mui/material';
import {DataGrid, GridColDef} from '@mui/x-data-grid';
import React, {useEffect, useState} from 'react';
import {useNavigate} from 'react-router';

type StorageAuditingListProps = {
    inventoryId: string;
    storages: FeltStocktakeListInfoDto[] | undefined;
};

type StorageAuditing = {
    id: number;
    name: string;
    status: StorageState;
};

export default function StorageAuditingList({inventoryId, storages}: Readonly<StorageAuditingListProps>) {
    const navigate = useNavigate();

    const [storageAuditings, setStorageAuditings] = useState<StorageAuditing[]>([]);
    const [itemAuditings, setItemAuditings] = useState<FeltStocktakeItemDto[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    const load = async () => {
        if (!inventoryId || !storages) return;

        try {
            setStorageAuditings(
                storages.map((storage) => ({
                    id: storage.storageId,
                    name: storage.storageName,
                    status: storage.isClosed ? STORAGE_STATE.Closed : STORAGE_STATE.Open,
                })),
            );
            setItemAuditings(await fetchStocktakeItems(inventoryId, ''));
        } catch (err) {
            setError(toErrorMessage(err, 'Inventur konnte nicht geladen werden.'));
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        void load();
    }, []);

    const refetch = async () => {
        void load();
    };

    const columns: GridColDef<StorageAuditing>[] = [
        {
            field: 'status',
            headerName: 'Status',
            width: 150,
            cellClassName: 'bold-cell',
        },
        {
            field: 'name',
            headerName: 'Name',
            flex: 1,
            minWidth: 160,
        },
        {
            field: 'problems',
            headerName: 'Probleme',
            flex: 2,
            minWidth: 160,
            renderCell: ({row}) => (
                <ProblemStateCounts
                    items={itemAuditings.filter((item) => {
                        return item.expectedStorageId === row.id || item.scans.some((scan) => scan.scannedStorageId === row.id);
                    })}
                />
            ),
        },
    ];

    return (
        <Box sx={{p: 3}}>
            <Stack spacing={3}>
                <Box sx={{display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 2}}>
                    <Box>
                        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate(-1)} variant="text" sx={{mb: 1, ml: -1}}>
                            Zurück
                        </Button>
                        <Typography variant="h3" component="h1" sx={{mb: 1}}>
                            Lager
                        </Typography>
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

                {!isLoading && (
                    <Box>
                        <DataGrid
                            rows={storageAuditings}
                            columns={columns}
                            disableRowSelectionOnClick
                            pageSizeOptions={[10, 25, 50]}
                            initialState={{pagination: {paginationModel: {pageSize: 10}}}}
                            localeText={{noRowsLabel: 'Keine Lager.'}}
                            sx={{
                                '& .MuiDataGrid-row': {
                                    cursor: 'pointer',
                                },
                                '& .bold-cell': {
                                    fontWeight: 700,
                                },
                            }}
                            onRowClick={({row}) => void navigate(`/inventory/${inventoryId}/storage/${row.id}`)}
                        />
                        <Typography variant="h3" component="h3" sx={{fontWeight: 600, color: 'text.primary', pt: 3, pb: 2}}>
                            Fehlerhafte Artikel
                        </Typography>
                        <ItemAuditingList
                            inventoryId={inventoryId}
                            items={itemAuditings.filter((item) => item.status !== ITEM_STATE.OK && item.status != ITEM_STATE.INITIAL && !item.resolution)}
                            onResolve={refetch}
                        />
                    </Box>
                )}
            </Stack>
        </Box>
    );
}
