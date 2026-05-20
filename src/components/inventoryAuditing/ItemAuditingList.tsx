import {ItemAuditing} from '@/types/inventoryAuditing.ts';
import {DataGrid, GridColDef} from '@mui/x-data-grid';

type ToScanItemListProps = {
    items: ItemAuditing[];
};

export default function ItemAuditingList({items}: Readonly<ToScanItemListProps>) {
    const columns: GridColDef<ItemAuditing>[] = [
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
            field: 'actions',
            headerName: 'Aktionen',
            width: 120,
            sortable: false,
            align: 'right',
            headerAlign: 'right',
        },
    ];

    return (
        <DataGrid
            rows={items}
            columns={columns}
            disableRowSelectionOnClick
            pageSizeOptions={[10, 25, 50]}
            initialState={{pagination: {paginationModel: {pageSize: 10}}}}
            localeText={{noRowsLabel: 'Keine Rollen zu scannen.'}}
            sx={{'& .MuiDataGrid-row': {cursor: 'pointer'}, height: 600}}
        />
    );
}
