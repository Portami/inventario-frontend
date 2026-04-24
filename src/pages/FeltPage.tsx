import ListPage from '@/components/ListPage';
import {createFelt, deleteFelt, fetchFelts} from '@/services/backend';
import {FeltDto} from '@/types/felt';
import {createDeleteHandler, toErrorMessage} from '@/utils/pageUtils';
import AddIcon from '@mui/icons-material/Add';
import {Box, Button, Paper, Stack, TextField, Typography} from '@mui/material';
import {DataGrid, GridColDef} from '@mui/x-data-grid';
import {FormEvent, useEffect, useState} from 'react';

export default function FeltPage() {
    const [felts, setFelts] = useState<FeltDto[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [deletingIds, setDeletingIds] = useState<Set<number | string>>(new Set());
    const [error, setError] = useState('');

    const [color, setColor] = useState('');
    const [supplierColor, setSupplierColor] = useState('');
    const [articleNumber, setArticleNumber] = useState('');
    const [feltTypeId, setFeltTypeId] = useState('');
    const [supplierId, setSupplierId] = useState('');
    const [thickness, setThickness] = useState('');
    const [density, setDensity] = useState('');
    const [price, setPrice] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

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

    const handleDeleteFelt = createDeleteHandler(setFelts, setDeletingIds, setError, (id) => deleteFelt(Number(id)));

    const handleCreateFelt = async (e: FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError('');
        try {
            const newFelt = await createFelt({
                color,
                supplierColor,
                articleNumber,
                feltTypeId: Number(feltTypeId),
                supplierId: Number(supplierId),
                thickness: Number(thickness),
                density: Number(density),
                price: Number(price),
            });
            setFelts((prev) => [...prev, newFelt]);
            setColor('');
            setSupplierColor('');
            setArticleNumber('');
            setFeltTypeId('');
            setSupplierId('');
            setThickness('');
            setDensity('');
            setPrice('');
        } catch (err) {
            setError(toErrorMessage(err, 'Filz konnte nicht erstellt werden'));
        } finally {
            setIsSubmitting(false);
        }
    };

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
        {
            field: 'actions',
            headerName: 'Aktionen',
            width: 140,
            sortable: false,
            align: 'right',
            headerAlign: 'right',
            renderCell: ({row}) => (
                <Button
                    variant="outlined"
                    color="error"
                    size="small"
                    disabled={deletingIds.has(row.id)}
                    onClick={() => void handleDeleteFelt(row.id)}
                    aria-label={`delete felt ${row.id}`}
                >
                    {deletingIds.has(row.id) ? 'Wird gelöscht...' : 'Löschen'}
                </Button>
            ),
        },
    ];

    return (
        <ListPage
            title="Filze"
            description="Ansicht und Verwaltung aller Filzmaterialien."
            isLoading={isLoading}
            isEmpty={false}
            error={error}
            onErrorClose={() => setError('')}
        >
            <Paper component="form" onSubmit={handleCreateFelt} sx={{p: 3}}>
                <Typography variant="h4" sx={{mb: 3}}>
                    Neuen Filz hinzufügen
                </Typography>
                <Stack spacing={2}>
                    <Stack direction="row" spacing={2}>
                        <TextField
                            label="Artikelnummer"
                            size="small"
                            value={articleNumber}
                            onChange={(e) => setArticleNumber(e.target.value)}
                            required
                            sx={{flex: 1}}
                        />
                        <TextField label="Farbe" size="small" value={color} onChange={(e) => setColor(e.target.value)} required sx={{flex: 1}} />
                        <TextField
                            label="Lieferantenfarbe"
                            size="small"
                            value={supplierColor}
                            onChange={(e) => setSupplierColor(e.target.value)}
                            required
                            sx={{flex: 1}}
                        />
                    </Stack>
                    <Stack direction="row" spacing={2}>
                        <TextField
                            label="Typ-ID"
                            type="number"
                            size="small"
                            value={feltTypeId}
                            onChange={(e) => setFeltTypeId(e.target.value)}
                            slotProps={{htmlInput: {min: 1}}}
                            required
                            sx={{flex: 1}}
                        />
                        <TextField
                            label="Lieferant-ID"
                            type="number"
                            size="small"
                            value={supplierId}
                            onChange={(e) => setSupplierId(e.target.value)}
                            slotProps={{htmlInput: {min: 1}}}
                            required
                            sx={{flex: 1}}
                        />
                        <TextField label="Preis" size="small" value={price} onChange={(e) => setPrice(e.target.value)} required sx={{flex: 1}} />
                    </Stack>
                    <Stack direction="row" spacing={2} sx={{alignItems: 'flex-end'}}>
                        <TextField
                            label="Dicke (mm)"
                            type="number"
                            size="small"
                            value={thickness}
                            onChange={(e) => setThickness(e.target.value)}
                            slotProps={{htmlInput: {min: 0.01, step: 0.01}}}
                            required
                            sx={{flex: 1}}
                        />
                        <TextField
                            label="Dichte (g/m²)"
                            type="number"
                            size="small"
                            value={density}
                            onChange={(e) => setDensity(e.target.value)}
                            slotProps={{htmlInput: {min: 0.01, step: 0.01}}}
                            required
                            sx={{flex: 1}}
                        />
                        <Box sx={{flex: 1, display: 'flex', justifyContent: 'flex-end'}}>
                            <Button type="submit" variant="contained" disabled={isSubmitting} startIcon={<AddIcon />}>
                                {isSubmitting ? 'Wird erstellt...' : 'Hinzufügen'}
                            </Button>
                        </Box>
                    </Stack>
                </Stack>
            </Paper>

            <DataGrid
                rows={felts}
                columns={columns}
                autoHeight
                disableRowSelectionOnClick
                pageSizeOptions={[10, 25, 50]}
                initialState={{pagination: {paginationModel: {pageSize: 10}}}}
                localeText={{noRowsLabel: 'Noch keine Filze vorhanden.'}}
            />
        </ListPage>
    );
}
