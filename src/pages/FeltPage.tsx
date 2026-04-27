import ListPage from '@/components/ListPage';
import FeltDetailDialog from '@/pages/components/FeltDetailDialog';
import {fetchFelts} from '@/services/backend';
import {FeltDto} from '@/types/felt';
import {toErrorMessage} from '@/utils/pageUtils';
import {DataGrid, GridColDef, GridRowParams} from '@mui/x-data-grid';
import {useEffect, useState} from 'react';

const columns: GridColDef<FeltDto>[] = [
    {field: 'id', headerName: 'ID', width: 80},
    {
        field: 'color',
        headerName: 'Farbe / Typ',
        flex: 1,
        renderCell: ({row}) => `${row.feltTypeName} – ${row.color}`,
    },
    {field: 'articleNumber', headerName: 'Artikelnummer', flex: 1},
    {field: 'supplierName', headerName: 'Lieferant', flex: 1},
    {field: 'thickness', headerName: 'Dicke (mm)', width: 110},
    {field: 'density', headerName: 'Dichte (g/m²)', width: 130},
    {field: 'price', headerName: 'Preis', width: 100},
];

export default function FeltPage() {
    const [felts, setFelts] = useState<FeltDto[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedFelt, setSelectedFelt] = useState<FeltDto | null>(null);

    useEffect(() => {
        const load = async () => {
            try {
                setFelts(await fetchFelts());
            } catch (err) {
                setError(toErrorMessage(err, 'Filze konnten nicht geladen werden'));
            } finally {
                setIsLoading(false);
            }
        };
        void load();
    }, []);

    const handleSaved = () => {
        setSelectedFelt(null);
        void fetchFelts().then(setFelts);
    };

    return (
        <ListPage
            title="Filze"
            description="Übersicht aller Filzmaterialien."
            isLoading={isLoading}
            isEmpty={false}
            error={error}
            onErrorClose={() => setError('')}
        >
            <DataGrid
                rows={felts}
                columns={columns}
                loading={isLoading}
                autoHeight
                disableRowSelectionOnClick
                pageSizeOptions={[10, 25, 50]}
                initialState={{pagination: {paginationModel: {pageSize: 10}}}}
                localeText={{noRowsLabel: 'Noch keine Filze vorhanden.'}}
                onRowClick={(params: GridRowParams<FeltDto>) => setSelectedFelt(params.row)}
                sx={{cursor: 'pointer'}}
            />
            <FeltDetailDialog felt={selectedFelt} onClose={() => setSelectedFelt(null)} onSaved={handleSaved} />
        </ListPage>
    );
}
