import {useToast} from '@/components/ToastProvider';
import {deleteFelt, fetchFelts} from '@/services/backend';
import {FeltDto} from '@/types/felt';
import {toErrorMessage} from '@/utils/pageUtils';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import {IconButton} from '@mui/material';
import {GridColDef, GridRenderCellParams} from '@mui/x-data-grid';
import {useEffect, useMemo, useState} from 'react';

interface UseFeltManagementReturn {
    felts: FeltDto[];
    isLoading: boolean;
    error: string;
    selectedFelt: FeltDto | null;
    setSelectedFelt: (felt: FeltDto | null) => void;
    feltToDelete: FeltDto | null;
    setFeltToDelete: (felt: FeltDto | null) => void;
    isDeleting: boolean;
    handleDelete: () => Promise<void>;
    refetch: () => Promise<void>;
    setError: (error: string) => void;
    columns: GridColDef<FeltDto>[];
    handleSaved: () => void;
    handleCreated: () => void;
}

export const useFeltManagement = (filterFn?: (felts: FeltDto[]) => FeltDto[]): UseFeltManagementReturn => {
    const showToast = useToast();
    const [felts, setFelts] = useState<FeltDto[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedFelt, setSelectedFelt] = useState<FeltDto | null>(null);
    const [feltToDelete, setFeltToDelete] = useState<FeltDto | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const load = async () => {
        try {
            setIsLoading(true);
            const allFelts = await fetchFelts();
            const filtered = filterFn ? filterFn(allFelts) : allFelts;
            setFelts(filtered);
            setError('');
        } catch (err) {
            setError(toErrorMessage(err, 'Filze konnten nicht geladen werden'));
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        void load();
    }, []);

    const refetch = async () => {
        await load();
    };

    const handleDelete = async () => {
        if (!feltToDelete) return;
        setIsDeleting(true);
        try {
            await deleteFelt(feltToDelete.id);
            showToast('Filz erfolgreich gelöscht.', 'success');
            setFeltToDelete(null);
            await refetch();
        } catch {
            showToast('Löschen fehlgeschlagen. Bitte versuche es erneut.', 'error');
        } finally {
            setIsDeleting(false);
        }
    };

    const handleSaved = () => {
        setSelectedFelt(null);
        void refetch();
    };

    const handleCreated = () => {
        void refetch();
    };

    const columns = useMemo<GridColDef<FeltDto>[]>(
        () => [
            {
                field: 'color',
                headerName: 'Farbe / Typ',
                flex: 1,
                renderCell: ({row}: GridRenderCellParams<FeltDto>) => `${row.feltTypeName} – ${row.color}`,
            },
            {field: 'articleNumber', headerName: 'Artikelnummer', flex: 1},
            {field: 'supplierName', headerName: 'Lieferant', flex: 1},
            {field: 'thickness', headerName: 'Dicke (mm)', width: 110},
            {field: 'density', headerName: 'Dichte (g/m²)', width: 130},
            {field: 'price', headerName: 'Preis', width: 100},
            {
                field: 'actions',
                headerName: '',
                width: 56,
                sortable: false,
                disableColumnMenu: true,
                renderCell: ({row}: GridRenderCellParams<FeltDto>) => (
                    <IconButton
                        size="small"
                        color="error"
                        aria-label="delete"
                        onClick={(e) => {
                            e.stopPropagation();
                            setFeltToDelete(row);
                        }}
                    >
                        <DeleteOutlinedIcon fontSize="small" />
                    </IconButton>
                ),
            },
        ],
        [setFeltToDelete],
    );

    return {
        felts,
        isLoading,
        error,
        selectedFelt,
        setSelectedFelt,
        feltToDelete,
        setFeltToDelete,
        isDeleting,
        handleDelete,
        refetch,
        setError,
        columns,
        handleSaved,
        handleCreated,
    };
};
