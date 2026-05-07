import {useFeltManagement} from '../hooks/useFeltManagement';
import ListPage from '@/components/ListPage';
import DeleteFeltDialog from '@/pages/components/DeleteFeltDialog';
import FeltDialog from '@/pages/components/FeltDialog';
import {fetchRolls} from '@/services/backend';
import {FeltDto} from '@/types/felt';
import {FeltRollDto} from '@/types/roll';
import AddIcon from '@mui/icons-material/Add';
import TuneRoundedIcon from '@mui/icons-material/TuneRounded';
import {Box, Button, Chip, MenuItem, Slider, TextField, Typography} from '@mui/material';
import {alpha} from '@mui/material/styles';
import {DataGrid, GridRowParams} from '@mui/x-data-grid';
import {useEffect, useMemo, useState} from 'react';
import {useNavigate} from 'react-router';

export default function FeltPage() {
    const navigate = useNavigate();
    const {felts, isLoading, error, feltToDelete, setFeltToDelete, isDeleting, handleDelete, handleCreated, setError, columns} = useFeltManagement();
    const [isCreateOpen, setIsCreateOpen] = useState(false);

    const [rolls, setRolls] = useState<FeltRollDto[]>([]);

    useEffect(() => {
        void fetchRolls()
            .then(setRolls)
            .catch(() => {});
    }, []);

    // Roll length/width bounds (in cm)
    const rollLengthBounds = useMemo((): [number, number] => {
        if (rolls.length === 0) return [0, 100];
        const lengths = rolls.map((r) => Math.round(r.length * 100));
        return [Math.min(...lengths), Math.max(...lengths)];
    }, [rolls]);

    const [lengthFilter, setLengthFilter] = useState<[number, number] | null>(null);
    const [widthFilter, setWidthFilter] = useState<[number, number]>([0, 500]);
    const [densityFilter, setDensityFilter] = useState('');
    const [thicknessFilter, setThicknessFilter] = useState('');

    const activeLengthFilter = lengthFilter ?? rollLengthBounds;

    const rollsByFeltId = useMemo(() => {
        const map = new Map<number, FeltRollDto[]>();
        for (const roll of rolls) {
            const list = map.get(roll.feltId) ?? [];
            list.push(roll);
            map.set(roll.feltId, list);
        }
        return map;
    }, [rolls]);

    // Felts that pass the dimension (length/width) filters only — used to derive dropdown options
    const feltsByDimension = useMemo(() => {
        return felts.filter((felt) => {
            const feltRolls = rollsByFeltId.get(felt.id) ?? [];
            const lengthActive = activeLengthFilter[0] !== rollLengthBounds[0] || activeLengthFilter[1] !== rollLengthBounds[1];
            if (lengthActive) {
                const match = feltRolls.some((r) => {
                    const cm = Math.round(r.length * 100);
                    return cm >= activeLengthFilter[0] && cm <= activeLengthFilter[1];
                });
                if (!match) {
                    return false;
                }
            }
            const widthActive = widthFilter[0] !== 0 || widthFilter[1] !== 500;
            if (widthActive) {
                const match = feltRolls.some((r) => {
                    const cm = Math.round(r.width * 100);
                    return cm >= widthFilter[0] && cm <= widthFilter[1];
                });
                if (!match) {
                    return false;
                }
            }
            return true;
        });
    }, [felts, rollsByFeltId, activeLengthFilter, rollLengthBounds, widthFilter]);

    // Dropdown options reflect only felts visible after dimension filtering
    const densityOptions = useMemo(() => [...new Set(feltsByDimension.map((f) => f.density))].sort((a, b) => a - b), [feltsByDimension]);
    const thicknessOptions = useMemo(() => [...new Set(feltsByDimension.map((f) => f.thickness))].sort((a, b) => a - b), [feltsByDimension]);

    // Auto-clear dropdown selection if it no longer exists in the narrowed options
    useEffect(() => {
        if (densityFilter && !densityOptions.includes(Number(densityFilter))) {
            setDensityFilter('');
        }
    }, [densityOptions, densityFilter]);

    useEffect(() => {
        if (thicknessFilter && !thicknessOptions.includes(Number(thicknessFilter))) {
            setThicknessFilter('');
        }
    }, [thicknessOptions, thicknessFilter]);

    const isFilterActive = densityFilter !== '' || thicknessFilter !== '' || lengthFilter !== null || widthFilter[0] !== 0 || widthFilter[1] !== 500;

    const resetFilters = () => {
        setLengthFilter(null);
        setWidthFilter([0, 500]);
        setDensityFilter('');
        setThicknessFilter('');
    };

    const filteredFelts = useMemo(() => {
        return feltsByDimension.filter((felt) => {
            if (densityFilter && felt.density !== Number(densityFilter)) {
                return false;
            }
            if (thicknessFilter && felt.thickness !== Number(thicknessFilter)) {
                return false;
            }
            return true;
        });
    }, [feltsByDimension, densityFilter, thicknessFilter]);

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
            <Box
                sx={{
                    background: (theme) => alpha(theme.palette.primary.main, 0.04),
                    border: (theme) => `1px solid ${alpha(theme.palette.primary.main, 0.14)}`,
                    borderRadius: 3,
                    p: 3,
                    mb: 3,
                }}
            >
                <Box sx={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2.5}}>
                    <Box sx={{display: 'flex', alignItems: 'center', gap: 1}}>
                        <TuneRoundedIcon sx={{color: 'primary.main', fontSize: 16}} />
                        <Typography sx={{fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'primary.main'}}>
                            Filter
                        </Typography>
                        {isFilterActive && <Chip label="aktiv" size="small" color="primary" sx={{height: 18, fontSize: '0.65rem'}} />}
                    </Box>
                    {isFilterActive && (
                        <Button size="small" onClick={resetFilters} sx={{fontSize: '0.75rem', py: 0.25, px: 1, minWidth: 0}}>
                            Zurücksetzen
                        </Button>
                    )}
                </Box>

                <Box sx={{display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 4}}>
                    <Box>
                        <Typography
                            sx={{fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'text.secondary', mb: 0.5}}
                        >
                            Länge der Rollen
                        </Typography>
                        <Typography sx={{fontSize: '0.8rem', fontWeight: 600, color: lengthFilter === null ? 'text.secondary' : 'primary.main', mb: 1}}>
                            {activeLengthFilter[0]} – {activeLengthFilter[1]} cm
                        </Typography>
                        <Slider
                            value={activeLengthFilter}
                            onChange={(_, v) => setLengthFilter(v as [number, number])}
                            min={rollLengthBounds[0]}
                            max={rollLengthBounds[1]}
                            disableSwap
                            size="small"
                            disabled={rolls.length === 0}
                        />
                    </Box>

                    <Box>
                        <Typography
                            sx={{fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'text.secondary', mb: 0.5}}
                        >
                            Breite der Rollen
                        </Typography>
                        <Typography
                            sx={{
                                fontSize: '0.8rem',
                                fontWeight: 600,
                                color: widthFilter[0] !== 0 || widthFilter[1] !== 500 ? 'primary.main' : 'text.secondary',
                                mb: 1,
                            }}
                        >
                            {widthFilter[0]} – {widthFilter[1]} cm
                        </Typography>
                        <Slider
                            value={widthFilter}
                            onChange={(_, v) => setWidthFilter(v as [number, number])}
                            min={0}
                            max={500}
                            disableSwap
                            size="small"
                            disabled={rolls.length === 0}
                        />
                    </Box>

                    <Box>
                        <Typography
                            sx={{fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'text.secondary', mb: 0.5}}
                        >
                            Dichte (g/m²)
                        </Typography>
                        <TextField
                            select
                            value={densityFilter}
                            onChange={(e) => setDensityFilter(e.target.value)}
                            size="small"
                            fullWidth
                            sx={{'& .MuiOutlinedInput-root': {bgcolor: 'background.paper'}}}
                            slotProps={{select: {displayEmpty: true}}}
                        >
                            <MenuItem value="">Alle</MenuItem>
                            {densityOptions.map((v) => (
                                <MenuItem key={v} value={String(v)}>
                                    {v}
                                </MenuItem>
                            ))}
                        </TextField>
                    </Box>

                    <Box>
                        <Typography
                            sx={{fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'text.secondary', mb: 0.5}}
                        >
                            Dicke (mm)
                        </Typography>
                        <TextField
                            select
                            value={thicknessFilter}
                            onChange={(e) => setThicknessFilter(e.target.value)}
                            size="small"
                            fullWidth
                            sx={{'& .MuiOutlinedInput-root': {bgcolor: 'background.paper'}}}
                            slotProps={{select: {displayEmpty: true}}}
                        >
                            <MenuItem value="">Alle</MenuItem>
                            {thicknessOptions.map((v) => (
                                <MenuItem key={v} value={String(v)}>
                                    {v}
                                </MenuItem>
                            ))}
                        </TextField>
                    </Box>
                </Box>
            </Box>

            <DataGrid
                rows={filteredFelts}
                columns={columns}
                loading={isLoading}
                disableRowSelectionOnClick
                pageSizeOptions={[10, 25, 50]}
                initialState={{pagination: {paginationModel: {pageSize: 10}}}}
                localeText={{noRowsLabel: 'Noch keine Filze vorhanden.'}}
                onRowClick={(params: GridRowParams<FeltDto>) => void navigate(`/felts/${params.row.id}`)}
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
