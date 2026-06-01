import ProblemStateCounts from '@/components/inventoryAuditing/ProblemStateCount.tsx';
import {fetchStocktakeItems} from '@/services/backend.ts';
import {FeltStocktakeItemDto, FeltStocktakeListInfoDto, STORAGE_STATE, StorageState} from '@/types/inventoryAuditing.ts';
import {toErrorMessage} from '@/utils/pageUtils.ts';
import {DataGrid, GridColDef} from '@mui/x-data-grid';
import {useEffect, useState} from 'react';
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

    useEffect(() => {
        const load = async () => {
            if (!inventoryId) return;
            if (!storages) return;
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
        void load();
    }, []);

    const columns: GridColDef<StorageAuditing>[] = [
        {
            field: 'state',
            headerName: 'Status',
            width: 150,
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
            flex: 1,
            minWidth: 160,
            renderCell: ({row}) => <ProblemStateCounts items={itemAuditings.filter((item) => item.expectedStorageId === row.id)} />,
        },
    ];

    return (
        <DataGrid
            rows={storageAuditings}
            columns={columns}
            disableRowSelectionOnClick
            pageSizeOptions={[10, 25, 50]}
            initialState={{pagination: {paginationModel: {pageSize: 10}}}}
            localeText={{noRowsLabel: 'Keine Lager.'}}
            sx={{'& .MuiDataGrid-row': {cursor: 'pointer'}, height: 600}}
            onRowClick={({row}) => void navigate(`/inventory/${inventoryId}/storage/${row.storageId}`)}
        />
    );
}
