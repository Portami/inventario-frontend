import {ItemAuditing, StorageAuditing} from '@/types/inventoryAuditing.ts';
import {DataGrid, GridColDef} from '@mui/x-data-grid';

type ToScanItemListProps = {
    storages: StorageAuditing[];
    items: ItemAuditing[];
};

export default function StorageAuditingList({storages, items}: Readonly<ToScanItemListProps>) {
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
            renderCell: ({row}) => <h3>Problem States :)</h3>,
        },
    ];

    return (
        <DataGrid
            rows={storages}
            columns={columns}
            disableRowSelectionOnClick
            pageSizeOptions={[10, 25, 50]}
            initialState={{pagination: {paginationModel: {pageSize: 10}}}}
            localeText={{noRowsLabel: 'Keine Rollen zu scannen.'}}
            sx={{'& .MuiDataGrid-row': {cursor: 'pointer'}, height: 600}}
        />
    );
}
