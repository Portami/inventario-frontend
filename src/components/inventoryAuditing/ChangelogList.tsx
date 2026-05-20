import ListPage from '@/components/ListPage.tsx';
import {Changelog, ItemAuditing} from '@/types/inventoryAuditing.ts';
import {toErrorMessage} from '@/utils/pageUtils.ts';
import {DataGrid, GridColDef} from '@mui/x-data-grid';
import {useEffect, useState} from 'react';

export default function ChangelogList() {
    const [changelog, setChangelog] = useState<Changelog[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const load = async () => {
            try {
                //setChangelog()
            } catch (err) {
                setError(toErrorMessage(err, 'Produkte konnten nicht geladen werden'));
            } finally {
                setIsLoading(false);
            }
        };
        void load();
    }, []);

    const columns: GridColDef<Changelog>[] = [
        {
            field: 'state',
            headerName: 'Status',
            width: 150,
        },
        {
            field: 'felt',
            headerName: 'Filz',
            flex: 1,
            minWidth: 160,
            renderCell: ({row}) => `${row.felt.type} – ${row.felt.color}`,
        },
        {
            field: 'length',
            headerName: 'Länge (cm)',
            width: 100,
        },
        {
            field: 'width',
            headerName: 'Breite (cm)',
            width: 100,
        },
        {
            field: 'actionTaken',
            headerName: 'Vorgenommene Aktion',
            width: 120,
            sortable: false,
            align: 'right',
            headerAlign: 'right',
        },
    ];

    return (
        <ListPage title={'Changelog'} isLoading={isLoading} isEmpty={false} error={error} onErrorClose={() => setError('')}>
            <DataGrid
                rows={changelog}
                columns={columns}
                disableRowSelectionOnClick
                pageSizeOptions={[10, 25, 50]}
                initialState={{pagination: {paginationModel: {pageSize: 10}}}}
                localeText={{noRowsLabel: 'Keine Rollen zu scannen.'}}
                sx={{'& .MuiDataGrid-row': {cursor: 'pointer'}, height: 600}}
            />
        </ListPage>
    );
}
