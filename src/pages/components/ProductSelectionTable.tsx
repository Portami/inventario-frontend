import {FeltRollDto} from '@/types/roll';
import {DataGrid, GridColDef, GridRowId, GridRowSelectionModel} from '@mui/x-data-grid';

type ProductSelectionTableProps = {
    readonly rolls: FeltRollDto[];
    readonly selectedIds: Set<string>;
    // eslint-disable-next-line no-unused-vars -- Parameter is part of the callback signature
    readonly onSelectionChange: (ids: Set<string>) => void;
};

export default function ProductSelectionTable({rolls, selectedIds, onSelectionChange}: ProductSelectionTableProps) {
    const columns: GridColDef<FeltRollDto>[] = [
        {
            field: 'color',
            headerName: 'Farbe / Typ',
            flex: 1,
            renderCell: ({row}) => `${row.feltTypeName} – ${row.color}`,
        },
        {field: 'articleNumber', headerName: 'Artikelnummer', flex: 1},
        {field: 'length', headerName: 'Länge (m)', width: 110},
        {field: 'width', headerName: 'Breite (m)', width: 110},
        {field: 'id', headerName: 'ID', width: 100, renderCell: ({value}) => <span style={{fontFamily: 'monospace'}}>{String(value)}</span>},
    ];

    const handleSelectionChange = (model: GridRowSelectionModel) => {
        const included = model.type === 'include' ? [...model.ids] : rolls.map((r) => r.id as GridRowId).filter((id) => !model.ids.has(id));
        onSelectionChange(new Set(included.map(String)));
    };

    return (
        <DataGrid
            rows={rolls}
            columns={columns}
            checkboxSelection
            disableRowSelectionOnClick
            rowSelectionModel={{type: 'include', ids: new Set<GridRowId>([...selectedIds].map(Number))}}
            onRowSelectionModelChange={handleSelectionChange}
            autoHeight
            pageSizeOptions={[10, 25, 50]}
            initialState={{pagination: {paginationModel: {pageSize: 10}}}}
            localeText={{noRowsLabel: 'Keine Rollen vorhanden.'}}
        />
    );
}
