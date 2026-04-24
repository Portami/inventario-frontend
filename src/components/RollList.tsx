import {ProductId} from '@/types/product';
import {FeltRollDto} from '@/types/roll';
import {Button} from '@mui/material';
import {DataGrid, GridColDef} from '@mui/x-data-grid';

export type RollItem = FeltRollDto;

type RollListProps = {
    deletingIds: Set<ProductId>;
    // eslint-disable-next-line no-unused-vars -- Parameter is part of the callback signature for consumers to know what ID was deleted
    onDelete(rollId: ProductId): Promise<void>;
    rolls: RollItem[];
};

export default function RollList({deletingIds, onDelete, rolls}: Readonly<RollListProps>) {
    const columns: GridColDef<RollItem>[] = [
        {field: 'id', headerName: 'ID', width: 80},
        {
            field: 'color',
            headerName: 'Farbe / Typ',
            flex: 1,
            renderCell: ({row}) => `${row.feltTypeName} – ${row.color}`,
        },
        {field: 'articleNumber', headerName: 'Artikelnummer', flex: 1},
        {field: 'batchName', headerName: 'Charge', flex: 1, valueGetter: (value: string | null) => value ?? '-'},
        {field: 'storageName', headerName: 'Lagerort', flex: 1, valueGetter: (value: string | null) => value ?? '-'},
        {
            field: 'actions',
            headerName: 'Aktionen',
            width: 140,
            sortable: false,
            align: 'right',
            headerAlign: 'right',
            renderCell: ({row}) => (
                <Button
                    variant="outlined"
                    color="error"
                    size="small"
                    disabled={deletingIds.has(row.id)}
                    onClick={() => void onDelete(row.id)}
                    aria-label={`delete roll ${row.id}`}
                >
                    {deletingIds.has(row.id) ? 'Wird gelöscht...' : 'Löschen'}
                </Button>
            ),
        },
    ];

    return (
        <DataGrid
            rows={rolls}
            columns={columns}
            autoHeight
            disableRowSelectionOnClick
            pageSizeOptions={[10, 25, 50]}
            initialState={{pagination: {paginationModel: {pageSize: 10}}}}
            localeText={{noRowsLabel: 'Noch keine Rollen vorhanden.'}}
        />
    );
}
