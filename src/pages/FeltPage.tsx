import {useFeltManagement} from '../hooks/useFeltManagement';
import ListPage from '@/components/ListPage';
import DeleteFeltDialog from '@/pages/components/DeleteFeltDialog';
import FeltDialog from '@/pages/components/FeltDialog';
import {FeltDto} from '@/types/felt';
import AddIcon from '@mui/icons-material/Add';
import {Box, Button, Typography} from '@mui/material';
import {DataGrid, GridRowParams} from '@mui/x-data-grid';
import {useState} from 'react';

export default function FeltPage() {
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
    } = useFeltManagement();
    const [isCreateOpen, setIsCreateOpen] = useState(false);

    return (
        <ListPage
            title="Filze"
            description="Übersicht aller Filzmaterialien."
            actions={
                <Button variant="contained" startIcon={<AddIcon />} onClick={() => setIsCreateOpen(true)}>
                    Neuer Filz
                </Button>
            }
            isLoading={isLoading}
            isEmpty={false}
            error={error}
            onErrorClose={() => setError('')}
        >
            <DataGrid
                rows={felts}
                columns={columns}
                loading={isLoading}
                disableRowSelectionOnClick
                pageSizeOptions={[10, 25, 50]}
                initialState={{pagination: {paginationModel: {pageSize: 10}}}}
                localeText={{noRowsLabel: 'Noch keine Filze vorhanden.'}}
                onRowClick={(params: GridRowParams<FeltDto>) => setSelectedFelt(params.row)}
                getRowClassName={(params: GridRowParams<FeltDto>) => {
                    if (params.row.isLowOnSupply && !params.row.hasBeenReordered) return 'row-low-supply';
                    if (params.row.isLowOnSupply && params.row.hasBeenReordered) return 'row-reordered';
                    return '';
                }}
                sx={{
                    cursor: 'pointer',
                    '& .row-low-supply': {
                        backgroundColor: 'rgba(211, 47, 47, 0.15)',
                        '&:hover': {backgroundColor: 'rgba(211, 47, 47, 0.25)'},
                    },
                    '& .row-reordered': {
                        backgroundColor: 'rgba(255, 193, 7, 0.15)',
                        '&:hover': {backgroundColor: 'rgba(255, 193, 7, 0.25)'},
                    },
                    height: 600,
                }}
            />
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
            </Box>
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
