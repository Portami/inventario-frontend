import {useFeltManagement} from '../hooks/useFeltManagement';
import DeleteFeltDialog from '@/components/felts/DeleteFeltDialog';
import FeltDialog from '@/components/felts/FeltDialog';
import ListPage from '@/components/ListPage';
import {fetchRolls} from '@/services/backend';
import {FeltDto} from '@/types/felt';
import {FeltRollDto} from '@/types/roll';
import {toErrorMessage} from '@/utils/pageUtils';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import TuneRoundedIcon from '@mui/icons-material/TuneRounded';
import {Box, Button, Chip, InputAdornment, MenuItem, Slider, TextField, Tooltip, Typography} from '@mui/material';
import {alpha} from '@mui/material/styles';
import {DataGrid, GridColDef, GridRenderCellParams, GridRowParams} from '@mui/x-data-grid';
import {useEffect, useMemo, useState} from 'react';
import {useNavigate} from 'react-router';

const CHIP_PALETTE = ['#1565C0', '#2E7D32', '#C62828', '#E65100', '#00695C', '#558B2F', '#AD1457', '#37474F', '#0277BD', '#00838F'];

function rollColorToChipBg(color: string): string {
    let hash = 0;
    for (let i = 0; i < color.length; i++) {
        hash = color.charCodeAt(i) + ((hash << 5) - hash);
    }
    return CHIP_PALETTE[Math.abs(hash) % CHIP_PALETTE.length];
}

export default function FeltPage() {
    const navigate = useNavigate();
    const {felts, isLoading, error, feltToDelete, setFeltToDelete, isDeleting, handleDelete, handleCreated, setError, columns} = useFeltManagement();
    const [isCreateOpen, setIsCreateOpen] = useState(false);

    const [rolls, setRolls] = useState<FeltRollDto[]>([]);

    useEffect(() => {
        void fetchRolls()
            .then(setRolls)
            .catch((err) => setError(toErrorMessage(err, 'Rollen konnten nicht geladen werden')));
    }, []);

    const rollLengthBounds = useMemo((): [number, number] => {
        if (rolls.length === 0) return [0, 100];
        const lengths = rolls.map((r) => r.length);
        return [Math.min(...lengths), Math.max(...lengths)];
    }, [rolls]);

    const [searchQuery, setSearchQuery] = useState('');
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

    const storageColorMap = useMemo(() => {
        const map = new Map<string, string>();
        for (const roll of rolls) {
            if (!roll.storageName) continue;
            if (!map.has(roll.storageName)) map.set(roll.storageName, rollColorToChipBg(roll.storageName));
        }
        return map;
    }, [rolls]);

    const rollsColumn = useMemo<GridColDef<FeltDto>>(
        () => ({
            field: 'rolls',
            headerName: 'Rollen',
            flex: 2,
            minWidth: 200,
            sortable: false,
            disableColumnMenu: true,
            renderCell: ({row}: GridRenderCellParams<FeltDto>) => {
                const feltRolls = rollsByFeltId.get(row.id) ?? [];
                if (feltRolls.length === 0)
                    return (
                        <Typography variant="caption" color="text.disabled">
                            -
                        </Typography>
                    );
                const sorted = [...feltRolls].sort((a, b) => {
                    const aIs180 = a.width === 180 ? 1 : 0;
                    const bIs180 = b.width === 180 ? 1 : 0;
                    return aIs180 - bIs180;
                });
                const visible = sorted.slice(0, 6);
                const overflow = feltRolls.length - visible.length;
                return (
                    <Box sx={{display: 'flex', flexWrap: 'wrap', gap: 0.5, py: 0.75, alignContent: 'center'}}>
                        {visible.map((roll) => {
                            const bg = roll.storageName ? storageColorMap.get(roll.storageName) : undefined;
                            const widthBorder = roll.width === 180 ? '2px solid #FF8F00' : roll.width === 100 ? '2px solid #0277BD' : undefined;
                            return (
                                <Tooltip key={roll.id} title={roll.storageName ?? 'Kein Lagerort'} arrow>
                                    <Chip
                                        size="small"
                                        label={`${roll.length}×${roll.width}`}
                                        sx={{
                                            bgcolor: bg ?? 'action.selected',
                                            color: bg ? '#fff' : 'text.secondary',
                                            fontSize: '0.7rem',
                                            height: 22,
                                            border: widthBorder,
                                            '& .MuiChip-label': {px: 1},
                                        }}
                                    />
                                </Tooltip>
                            );
                        })}
                        {overflow > 0 && (
                            <Typography variant="caption" color="text.secondary" sx={{alignSelf: 'center'}}>
                                +{overflow}
                            </Typography>
                        )}
                    </Box>
                );
            },
        }),
        [rollsByFeltId, storageColorMap],
    );

    // Felts that pass the dimension (length/width) filters only - used to derive dropdown options
    const feltsByDimension = useMemo(() => {
        const lengthActive = activeLengthFilter[0] !== rollLengthBounds[0] || activeLengthFilter[1] !== rollLengthBounds[1];
        const widthActive = widthFilter[0] !== 0 || widthFilter[1] !== 500;

        return felts.filter((felt) => {
            const feltRolls = rollsByFeltId.get(felt.id) ?? [];

            if (lengthActive) {
                const inRange = feltRolls.some((r) => r.length >= activeLengthFilter[0] && r.length <= activeLengthFilter[1]);
                if (!inRange) return false;
            }

            if (widthActive) {
                const inRange = feltRolls.some((r) => r.width >= widthFilter[0] && r.width <= widthFilter[1]);
                if (!inRange) return false;
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

    const isFilterActive =
        searchQuery !== '' || densityFilter !== '' || thicknessFilter !== '' || lengthFilter !== null || widthFilter[0] !== 0 || widthFilter[1] !== 500;

    const resetFilters = () => {
        setSearchQuery('');
        setLengthFilter(null);
        setWidthFilter([0, 500]);
        setDensityFilter('');
        setThicknessFilter('');
    };

    const filteredFelts = useMemo(() => {
        return feltsByDimension.filter((felt) => {
            if (
                searchQuery &&
                !`${felt.feltTypeName} ${felt.color} ${felt.thickness} ${felt.density} ${felt.supplierName}`.toLowerCase().includes(searchQuery.toLowerCase())
            ) {
                return false;
            }
            if (densityFilter && felt.density !== Number(densityFilter)) {
                return false;
            }
            if (thicknessFilter && felt.thickness !== Number(thicknessFilter)) {
                return false;
            }
            return true;
        });
    }, [feltsByDimension, searchQuery, densityFilter, thicknessFilter]);

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

                <TextField
                    label="Suche"
                    placeholder="Filztyp, Farbe, Dicke, Dichte, Lieferant …"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    size="small"
                    fullWidth
                    sx={{'& .MuiOutlinedInput-root': {bgcolor: 'background.paper'}, mb: 3}}
                    slotProps={{
                        input: {
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon sx={{fontSize: 18, color: 'rgba(0,0,0,0.45)'}} />
                                </InputAdornment>
                            ),
                        },
                        inputLabel: {shrink: true},
                    }}
                />

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
                columns={[...columns.slice(1, -1), rollsColumn, columns[columns.length - 1]]}
                getRowHeight={() => 'auto'}
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
            {storageColorMap.size > 0 && (
                <Box sx={{display: 'flex', flexWrap: 'wrap', gap: 2, mt: 1, ml: 0.5}}>
                    {Array.from(storageColorMap.entries()).map(([name, color]) => (
                        <Box key={name} sx={{display: 'flex', alignItems: 'center', gap: 0.75}}>
                            <Box sx={{width: 10, height: 10, borderRadius: '50%', backgroundColor: color, flexShrink: 0}} />
                            <Typography variant="caption" color="text.secondary">
                                {name}
                            </Typography>
                        </Box>
                    ))}
                </Box>
            )}
            <Box sx={{display: 'flex', flexWrap: 'wrap', gap: 2, mt: 0.5, ml: 0.5}}>
                <Box sx={{display: 'flex', alignItems: 'center', gap: 0.75}}>
                    <Box sx={{width: 10, height: 10, borderRadius: '50%', border: '2px solid #0277BD', flexShrink: 0}} />
                    <Typography variant="caption" color="text.secondary">
                        1m Breite
                    </Typography>
                </Box>
                <Box sx={{display: 'flex', alignItems: 'center', gap: 0.75}}>
                    <Box sx={{width: 10, height: 10, borderRadius: '50%', border: '2px solid #FF8F00', flexShrink: 0}} />
                    <Typography variant="caption" color="text.secondary">
                        1.8m Breite
                    </Typography>
                </Box>
            </Box>

            <FeltDialog open={isCreateOpen} onClose={() => setIsCreateOpen(false)} onSaved={handleCreated} />
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
