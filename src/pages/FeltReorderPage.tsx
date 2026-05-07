import {useFeltManagement} from '../hooks/useFeltManagement';
import ListPage from '@/components/ListPage';
import DeleteFeltDialog from '@/pages/components/DeleteFeltDialog';
import FeltDialog from '@/pages/components/FeltDialog';
import {FeltDto} from '@/types/felt';
import AddIcon from '@mui/icons-material/Add';
import {Box, Button, CircularProgress, Typography} from '@mui/material';
import {DataGrid, GridRowParams} from '@mui/x-data-grid';
import {useMemo, useState} from 'react';

export default function FeltReorderPage() {
    const {
        felts,
        isLoading,
        error,
        selectedFelt,
        setSelectedFelt,
        feltToDelete,
        setFeltToDelete,
        isDeleting,
        handleDelete,
        handleSaved,
        handleCreated,
        setError,
        columns,
    } = useFeltManagement((felts) => felts.filter((f) => f.isLowOnSupply));
    const [isCreateOpen, setIsCreateOpen] = useState(false);

    const feltsByCategory = useMemo(() => {
        const notReordered = felts.filter((f) => !f.hasBeenReordered);
        const reorderedBySupplier = felts.filter((f) => f.hasBeenReordered);

        const groupedBySupplier = new Map<string, FeltDto[]>();
        reorderedBySupplier.forEach((felt) => {
            if (!groupedBySupplier.has(felt.supplierName)) {
                groupedBySupplier.set(felt.supplierName, []);
            }
            groupedBySupplier.get(felt.supplierName)!.push(felt);
        });

        return {notReordered, groupedBySupplier};
    }, [felts]);

    if (isLoading) {
        return (
            <ListPage
                title="Nachbestellen"
                description="Übersicht von Filzen mit niedrigem Bestand."
                isLoading
                isEmpty={false}
                error={error}
                onErrorClose={() => setError('')}
            >
                <CircularProgress />
            </ListPage>
        );
    }

    return (
        <ListPage
            title="Nachbestellen"
            description="Übersicht von Filzen mit niedrigem Bestand."
            actions={
                <Button variant="contained" startIcon={<AddIcon />} onClick={() => setIsCreateOpen(true)}>
                    Neuer Filz
                </Button>
            }
            isLoading={false}
            isEmpty={felts.length === 0}
            error={error}
            onErrorClose={() => setError('')}
        >
            <Box sx={{display: 'flex', flexDirection: 'column', gap: 4}}>
                <Box>
                    <Typography variant="h6" sx={{mb: 2, fontWeight: 600}}>
                        Noch nicht nachbestellt ({feltsByCategory.notReordered.length})
                    </Typography>
                    {feltsByCategory.notReordered.length > 0 ? (
                        <DataGrid
                            rows={feltsByCategory.notReordered}
                            columns={columns}
                            disableRowSelectionOnClick
                            pageSizeOptions={[10, 25, 50]}
                            initialState={{pagination: {paginationModel: {pageSize: 10}}}}
                            localeText={{noRowsLabel: 'Keine Filze vorhanden.'}}
                            onRowClick={(params: GridRowParams<FeltDto>) => setSelectedFelt(params.row)}
                            getRowClassName={() => 'row-low-supply'}
                            autoHeight
                            sx={{
                                cursor: 'pointer',
                                '& .row-low-supply': {
                                    backgroundColor: 'rgba(211, 47, 47, 0.15)',
                                    '&:hover': {backgroundColor: 'rgba(211, 47, 47, 0.25)'},
                                },
                            }}
                        />
                    ) : (
                        <Typography variant="body2" color="textSecondary">
                            Alle Filze mit niedrigem Bestand wurden bereits nachbestellt.
                        </Typography>
                    )}
                </Box>

                {Array.from(feltsByCategory.groupedBySupplier.entries()).map(([supplierName, supplierFelts]) => (
                    <Box key={supplierName}>
                        <Typography variant="h6" sx={{mb: 2, fontWeight: 600}}>
                            {supplierName} ({supplierFelts.length})
                        </Typography>
                        <DataGrid
                            rows={supplierFelts}
                            columns={columns}
                            disableRowSelectionOnClick
                            pageSizeOptions={[10, 25, 50]}
                            initialState={{pagination: {paginationModel: {pageSize: 10}}}}
                            localeText={{noRowsLabel: 'Keine Filze vorhanden.'}}
                            onRowClick={(params: GridRowParams<FeltDto>) => setSelectedFelt(params.row)}
                            getRowClassName={() => 'row-reordered'}
                            autoHeight
                            sx={{
                                cursor: 'pointer',
                                '& .row-reordered': {
                                    backgroundColor: 'rgba(255, 193, 7, 0.15)',
                                    '&:hover': {backgroundColor: 'rgba(255, 193, 7, 0.25)'},
                                },
                            }}
                        />
                    </Box>
                ))}
            </Box>
            <Box sx={{display: 'flex', gap: 3, mt: 1.5, ml: 0.5}}>
                <Box sx={{display: 'flex', alignItems: 'center', gap: 1}}>
                    <Box sx={{width: 14, height: 14, borderRadius: '3px', backgroundColor: 'rgba(211, 47, 47, 0.5)', flexShrink: 0}} />
                    <Typography variant="caption" color="text.secondary">
                        Nachbestellen erforderlich
                    </Typography>
                </Box>
                <Box sx={{display: 'flex', alignItems: 'center', gap: 1}}>
                    <Box sx={{width: 14, height: 14, borderRadius: '3px', backgroundColor: 'rgba(255, 193, 7, 0.5)', flexShrink: 0}} />
                    <Typography variant="caption" color="text.secondary">
                        Nachbestellt
                    </Typography>
                </Box>
            </Box>{' '}
            <FeltDialog open={selectedFelt !== null} felt={selectedFelt} felts={felts} onClose={() => setSelectedFelt(null)} onSaved={handleSaved} />
            <FeltDialog open={isCreateOpen} felts={felts} onClose={() => setIsCreateOpen(false)} onSaved={handleCreated} />
            <DeleteFeltDialog
                open={feltToDelete !== null}
                felt={feltToDelete}
                isDeleting={isDeleting}
                onConfirm={handleDelete}
                onClose={() => setFeltToDelete(null)}
            />
        </ListPage>
    );
}
