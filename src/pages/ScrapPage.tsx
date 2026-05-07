import ListPage from '@/components/ListPage';
import {fetchAllScraps} from '@/services/backend';
import {Product} from '@/types/product';
import {toErrorMessage} from '@/utils/pageUtils';
import {Box, Card, CardContent, MenuItem, Slider, TextField, Typography} from '@mui/material';
import {DataGrid, GridColDef} from '@mui/x-data-grid';
import {useEffect, useMemo, useState} from 'react';
import {useNavigate} from 'react-router';

export default function ScrapPage() {
    const navigate = useNavigate();
    const [scraps, setScraps] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    const [lengthFilter, setLengthFilter] = useState<[number, number] | null>(null);
    const [widthFilter, setWidthFilter] = useState<[number, number]>([0, 500]);
    const [densityFilter, setDensityFilter] = useState('');
    const [thicknessFilter, setThicknessFilter] = useState('');

    useEffect(() => {
        const load = async () => {
            try {
                setScraps(await fetchAllScraps());
            } catch (err) {
                setError(toErrorMessage(err, 'Abfallstücke konnten nicht geladen werden'));
            } finally {
                setIsLoading(false);
            }
        };
        void load();
    }, []);

    const lengthBounds = useMemo((): [number, number] => {
        if (scraps.length === 0) return [0, 100];
        const lengths = scraps.map((s) => Math.round((s.length ?? 0) / 10));
        return [Math.min(...lengths), Math.max(...lengths)];
    }, [scraps]);

    const activeLengthFilter = lengthFilter ?? lengthBounds;

    const densityOptions = useMemo(
        () => [...new Set(scraps.map((s) => s.felt?.density).filter((v): v is number => v != null))].sort((a, b) => a - b),
        [scraps],
    );

    const thicknessOptions = useMemo(
        () => [...new Set(scraps.map((s) => s.felt?.thickness).filter((v): v is number => v != null))].sort((a, b) => a - b),
        [scraps],
    );

    const filteredScraps = useMemo(() => {
        return scraps.filter((s) => {
            const lengthCm = Math.round((s.length ?? 0) / 10);
            const widthCm = Math.round((s.width ?? 0) / 10);
            if (lengthCm < activeLengthFilter[0] || lengthCm > activeLengthFilter[1]) {
                return false;
            }
            if (widthCm < widthFilter[0] || widthCm > widthFilter[1]) {
                return false;
            }
            if (densityFilter && String(s.felt?.density ?? '') !== densityFilter) {
                return false;
            }
            if (thicknessFilter && String(s.felt?.thickness ?? '') !== thicknessFilter) {
                return false;
            }
            return true;
        });
    }, [scraps, activeLengthFilter, widthFilter, densityFilter, thicknessFilter]);

    const columns = useMemo<GridColDef<Product>[]>(
        () => [
            {field: 'length', headerName: 'Länge (cm)', flex: 1, valueGetter: (v: number | undefined) => (v != null ? Math.round(v / 10) : '–')},
            {field: 'width', headerName: 'Breite (cm)', flex: 1, valueGetter: (v: number | undefined) => (v != null ? Math.round(v / 10) : '–')},
            {
                field: 'density',
                headerName: 'Dichte (g/cm³)',
                flex: 1,
                valueGetter: (_v, row) => row.felt?.density ?? '–',
            },
            {
                field: 'thickness',
                headerName: 'Dicke (mm)',
                flex: 1,
                valueGetter: (_v, row) => row.felt?.thickness ?? '–',
            },
        ],
        [],
    );

    return (
        <ListPage
            title="Abfallstücke"
            description="Übersicht aller Abfallstücke."
            isLoading={isLoading}
            isEmpty={false}
            error={error}
            onErrorClose={() => setError('')}
        >
            <Card variant="outlined" sx={{mb: 2}}>
                <CardContent>
                    <Box sx={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 3}}>
                        <Box>
                            <Typography variant="body2" color="text.secondary" sx={{mb: 1}}>
                                Länge: {activeLengthFilter[0]} – {activeLengthFilter[1]} cm
                            </Typography>
                            <Slider
                                value={activeLengthFilter}
                                onChange={(_, v) => setLengthFilter(v as [number, number])}
                                min={lengthBounds[0]}
                                max={lengthBounds[1]}
                                disableSwap
                                size="small"
                                disabled={scraps.length === 0}
                            />
                        </Box>
                        <Box>
                            <Typography variant="body2" color="text.secondary" sx={{mb: 1}}>
                                Breite: {widthFilter[0]} – {widthFilter[1]} cm
                            </Typography>
                            <Slider
                                value={widthFilter}
                                onChange={(_, v) => setWidthFilter(v as [number, number])}
                                min={0}
                                max={500}
                                disableSwap
                                size="small"
                                disabled={scraps.length === 0}
                            />
                        </Box>
                        <TextField
                            select
                            label="Dichte (g/cm³)"
                            value={densityFilter}
                            onChange={(e) => setDensityFilter(e.target.value)}
                            size="small"
                            fullWidth
                        >
                            <MenuItem value="">Alle</MenuItem>
                            {densityOptions.map((v) => (
                                <MenuItem key={v} value={String(v)}>
                                    {v}
                                </MenuItem>
                            ))}
                        </TextField>
                        <TextField
                            select
                            label="Dicke (mm)"
                            value={thicknessFilter}
                            onChange={(e) => setThicknessFilter(e.target.value)}
                            size="small"
                            fullWidth
                        >
                            <MenuItem value="">Alle</MenuItem>
                            {thicknessOptions.map((v) => (
                                <MenuItem key={v} value={String(v)}>
                                    {v}
                                </MenuItem>
                            ))}
                        </TextField>
                    </Box>
                </CardContent>
            </Card>

            <DataGrid
                rows={filteredScraps}
                columns={columns}
                disableRowSelectionOnClick
                pageSizeOptions={[10, 25, 50]}
                initialState={{pagination: {paginationModel: {pageSize: 10}}}}
                localeText={{noRowsLabel: 'Noch keine Abfallstücke vorhanden.'}}
                onRowClick={({row}) => void navigate(`/scrap/${row.id}`)}
                sx={{'& .MuiDataGrid-row': {cursor: 'pointer'}, height: 500}}
            />
        </ListPage>
    );
}
