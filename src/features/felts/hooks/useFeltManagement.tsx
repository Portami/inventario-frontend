import {deleteFelt, feltKeys, fetchFelts} from '@/features/felts/api';
import {FeltDto} from '@/features/felts/types';
import {useToast} from '@/shared/components/ToastProvider';
import {toErrorMessage} from '@/shared/utils/pageUtils';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import {IconButton} from '@mui/material';
import {GridColDef, GridRenderCellParams} from '@mui/x-data-grid';
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
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
    const queryClient = useQueryClient();
    const [selectedFelt, setSelectedFelt] = useState<FeltDto | null>(null);
    const [feltToDelete, setFeltToDelete] = useState<FeltDto | null>(null);
    // Overrides the query-derived error (e.g. '' after the user dismisses the banner).
    const [errorOverride, setErrorOverride] = useState<string | null>(null);

    const query = useQuery({queryKey: feltKeys.all, queryFn: fetchFelts});

    useEffect(() => {
        setErrorOverride(null);
    }, [query.errorUpdatedAt]);

    const felts = useMemo(() => {
        const all = query.data ?? [];
        return filterFn ? filterFn(all) : all;
    }, [query.data, filterFn]);

    const error = errorOverride ?? (query.error ? toErrorMessage(query.error, 'Filze konnten nicht geladen werden') : '');

    const refetch = async () => {
        await queryClient.invalidateQueries({queryKey: feltKeys.all});
    };

    const deleteMutation = useMutation({
        mutationFn: (feltId: number) => deleteFelt(feltId),
        onSuccess: async () => {
            showToast('Filz erfolgreich gelöscht.', 'success');
            setFeltToDelete(null);
            await queryClient.invalidateQueries({queryKey: feltKeys.all});
        },
        onError: () => {
            showToast('Löschen fehlgeschlagen. Bitte versuche es erneut.', 'error');
        },
    });

    const handleDelete = async () => {
        if (!feltToDelete) return;
        await deleteMutation.mutateAsync(feltToDelete.id).catch(() => {
            // Failure is reported via the toast in onError.
        });
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
            {field: 'articleNumber', headerName: 'Art.-Nr.', width: 100},
            {
                field: 'color',
                headerName: 'Farbe / Typ',
                flex: 1,
                renderCell: ({row}: GridRenderCellParams<FeltDto>) => `${row.feltTypeName} – ${row.color}`,
            },
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
        isLoading: query.isPending,
        error,
        selectedFelt,
        setSelectedFelt,
        feltToDelete,
        setFeltToDelete,
        isDeleting: deleteMutation.isPending,
        handleDelete,
        refetch,
        setError: setErrorOverride,
        columns,
        handleSaved,
        handleCreated,
    };
};
