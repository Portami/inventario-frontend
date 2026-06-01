import {AuditingResolveDialog} from '@/components/inventoryAuditing/AuditingResolveDialog.tsx';
import {FeltStocktakeItemDto} from '@/types/inventoryAuditing.ts';
import {Box, Button} from '@mui/material';
import {DataGrid, GridColDef} from '@mui/x-data-grid';
import {useState} from 'react';

type ItemListProps = {
    inventoryId: string;
    items: FeltStocktakeItemDto[];
    hideStatus?: boolean;
    hideActions?: boolean;
};

export default function ItemAuditingList({inventoryId, items, hideStatus, hideActions}: Readonly<ItemListProps>) {
    const [isResolveOpen, setIsResolveOpen] = useState(false);
    const [itemId, setItemId] = useState('');

    const columns: GridColDef<FeltStocktakeItemDto>[] = [
        {
            field: 'status',
            headerName: 'Status',
            flex: 2,
        },
        {
            field: 'length',
            headerName: 'Länge (cm)',
            width: 100,
            renderCell: ({row}) => row.rollOrScrapDto.length,
        },
        {
            field: 'width',
            headerName: 'Breite (cm)',
            width: 100,
            renderCell: ({row}) => row.rollOrScrapDto.width,
        },
        {
            field: 'color',
            headerName: 'Farbe',
            width: 100,
            renderCell: ({row}) => row.rollOrScrapDto.color,
        },
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
                    color="info"
                    size="small"
                    onClick={(e) => {
                        e.stopPropagation();
                        setItemId(row.itemId.toString());
                        setIsResolveOpen(true);
                    }}
                >
                    Problem lösen
                </Button>
            ),
        },
    ];

    return (
        <Box sx={{p: 3}}>
            <DataGrid
                rows={items}
                columns={columns}
                columnVisibilityModel={{
                    status: !hideStatus,
                    actions: !hideActions,
                }}
                disableRowSelectionOnClick
                pageSizeOptions={[10, 25, 50]}
                initialState={{pagination: {paginationModel: {pageSize: 10}}}}
                localeText={{noRowsLabel: 'Keine Elemente.'}}
                sx={{'& .MuiDataGrid-row': {cursor: 'pointer'}, height: 600}}
            />

            <AuditingResolveDialog itemId={itemId} inventoryId={inventoryId} open={isResolveOpen} onClose={() => setIsResolveOpen(false)} />
        </Box>
    );
}
