import {ProductId} from '@/types/product';
import {FeltRollDto} from '@/types/roll';
import {Button} from '@mui/material';
import {DataGrid, GridColDef} from '@mui/x-data-grid';
import {useMemo} from 'react';
import {useNavigate} from 'react-router';

export type RollItem = FeltRollDto;

type RollListProps = {
    deletingIds: Set<ProductId>;

    onDelete(rollId: ProductId): Promise<void>;
    rolls: RollItem[];
};

export default function RollList({deletingIds, onDelete, rolls}: Readonly<RollListProps>) {
    const navigate = useNavigate();

    const columns = useMemo<GridColDef<RollItem>[]>(
        () => [
            {
                field: 'color',
                headerName: 'Filztyp / Farbe',
                flex: 1,
                minWidth: 160,
                renderCell: ({row}) => `${row.feltTypeName} – ${row.color}`,
            },
            {field: 'articleNumber', headerName: 'Artikelnummer', flex: 1, minWidth: 130},
            {field: 'length', headerName: 'Länge (m)', width: 100},
            {field: 'width', headerName: 'Breite (m)', width: 100},
            {field: 'batchName', headerName: 'Charge', width: 120, valueGetter: (value: string | null) => value ?? '–'},
            {field: 'storageName', headerName: 'Lagerort', width: 120, valueGetter: (value: string | null) => value ?? '–'},
            {
                field: 'actions',
                headerName: 'Aktionen',
                width: 120,
                sortable: false,
                align: 'right',
                headerAlign: 'right',
                renderCell: ({row}) => (
                    <Button
                        variant="outlined"
                        color="error"
                        size="small"
                        disabled={deletingIds.has(row.id)}
                        onClick={(e) => {
                            e.stopPropagation();
                            void onDelete(row.id);
                        }}
                        aria-label={`delete roll ${row.id}`}
                    >
                        {deletingIds.has(row.id) ? '...' : 'Löschen'}
                    </Button>
                ),
            },
        ],
        [navigate, deletingIds, onDelete],
    );

    return (
        <DataGrid
            rows={rolls}
            columns={columns}
            disableRowSelectionOnClick
            pageSizeOptions={[10, 25, 50]}
            initialState={{pagination: {paginationModel: {pageSize: 10}}}}
            localeText={{noRowsLabel: 'Noch keine Rollen vorhanden.'}}
            onRowClick={({row}) => void navigate(`/roll/${row.id}`)}
            sx={{'& .MuiDataGrid-row': {cursor: 'pointer'}, height: 600}}
        />
    );
}
