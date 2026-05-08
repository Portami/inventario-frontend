import {fmtCHF} from '@/pages/constants/offerConstants';
import {FeltCatalogItem} from '@/types/offerte';
import CloseIcon from '@mui/icons-material/Close';
import SearchIcon from '@mui/icons-material/Search';
import {
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    IconButton,
    InputAdornment,
    MenuItem,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
    ToggleButton,
    ToggleButtonGroup,
    Typography,
} from '@mui/material';
import {useState} from 'react';

interface FeltSearchDialogProps {
    open: boolean;
    catalog: FeltCatalogItem[];
    onClose: () => void;
    onPick: (felt: FeltCatalogItem) => void;
}

export default function FeltSearchDialog({open, catalog, onClose, onPick}: FeltSearchDialogProps) {
    const [q, setQ] = useState('');
    const [typeFilter, setTypeFilter] = useState('');
    const [thicknessFilter, setThicknessFilter] = useState('');
    const [source, setSource] = useState<'any' | 'reststueck' | 'rolle'>('any');

    const feltTypes = [...new Set(catalog.map((f) => f.feltTypeName))];
    const thicknesses = [...new Set(catalog.map((f) => f.thickness))].sort((a, b) => a - b);

    const filtered = catalog.filter((f) => {
        if (q && !`${f.feltTypeName} ${f.color} ${f.articleNumber}`.toLowerCase().includes(q.toLowerCase())) return false;
        if (typeFilter && f.feltTypeName !== typeFilter) return false;
        if (thicknessFilter && f.thickness !== Number(thicknessFilter)) return false;
        return true;
    });

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle sx={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 4, pt: 3}}>
                <Box>
                    <Typography variant="h6" sx={{fontWeight: 600}}>
                        Filz suchen
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                        Manuelle Suche · Reststücke werden gegenüber Rollen priorisiert
                    </Typography>
                </Box>
                <IconButton onClick={onClose} size="small">
                    <CloseIcon />
                </IconButton>
            </DialogTitle>
            <DialogContent sx={{px: 4, pb: 0}}>
                <Box sx={{display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1.4fr', gap: 2, mt: 1, mb: 2}}>
                    <TextField
                        label="Suche"
                        placeholder="Artikel-Nr., Filztyp, Farbe …"
                        value={q}
                        onChange={(e) => setQ(e.target.value)}
                        size="small"
                        autoFocus
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
                    <TextField
                        select
                        label="Filztyp"
                        value={typeFilter}
                        onChange={(e) => setTypeFilter(e.target.value)}
                        size="small"
                        slotProps={{inputLabel: {shrink: true}}}
                    >
                        <MenuItem value="">Alle</MenuItem>
                        {feltTypes.map((t) => (
                            <MenuItem key={t} value={t}>
                                {t}
                            </MenuItem>
                        ))}
                    </TextField>
                    <TextField
                        select
                        label="Dicke"
                        value={thicknessFilter}
                        onChange={(e) => setThicknessFilter(e.target.value)}
                        size="small"
                        slotProps={{inputLabel: {shrink: true}}}
                    >
                        <MenuItem value="">Alle</MenuItem>
                        {thicknesses.map((t) => (
                            <MenuItem key={t} value={t}>
                                {t} mm
                            </MenuItem>
                        ))}
                    </TextField>
                    <ToggleButtonGroup value={source} exclusive onChange={(_, v: typeof source) => v && setSource(v)} size="small" sx={{height: 40}}>
                        <ToggleButton value="any" sx={{textTransform: 'none', fontSize: 12.5, px: 1.5}}>
                            Alle
                        </ToggleButton>
                        <ToggleButton value="reststueck" sx={{textTransform: 'none', fontSize: 12.5, px: 1.5}}>
                            Reststück
                        </ToggleButton>
                        <ToggleButton value="rolle" sx={{textTransform: 'none', fontSize: 12.5, px: 1.5}}>
                            Rolle
                        </ToggleButton>
                    </ToggleButtonGroup>
                </Box>
                <TableContainer component={Paper} variant="outlined" sx={{maxHeight: 360, borderColor: 'rgba(0,0,0,0.08)'}}>
                    <Table size="small" stickyHeader>
                        <TableHead>
                            <TableRow
                                sx={{
                                    '& th': {
                                        fontSize: 10.5,
                                        fontWeight: 600,
                                        letterSpacing: '0.06em',
                                        textTransform: 'uppercase',
                                        color: 'text.secondary',
                                        bgcolor: '#fafafa',
                                    },
                                }}
                            >
                                <TableCell>Artikel-Nr.</TableCell>
                                <TableCell>Filztyp</TableCell>
                                <TableCell>Farbe</TableCell>
                                <TableCell align="right">Dicke</TableCell>
                                <TableCell align="right">Dichte</TableCell>
                                <TableCell align="right">Preis / m²</TableCell>
                                <TableCell>Lieferant</TableCell>
                                <TableCell />
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {filtered.map((f) => (
                                <TableRow key={f.id} hover sx={{'& td': {fontSize: 13}}}>
                                    <TableCell sx={{fontFamily: "'JetBrains Mono', monospace", fontSize: 11.5}}>{f.articleNumber}</TableCell>
                                    <TableCell sx={{fontWeight: 500}}>{f.feltTypeName}</TableCell>
                                    <TableCell>{f.color}</TableCell>
                                    <TableCell align="right" sx={{fontVariantNumeric: 'tabular-nums'}}>
                                        {f.thickness} mm
                                    </TableCell>
                                    <TableCell align="right" sx={{fontVariantNumeric: 'tabular-nums'}}>
                                        {f.density} g/m²
                                    </TableCell>
                                    <TableCell align="right" sx={{fontVariantNumeric: 'tabular-nums'}}>
                                        {fmtCHF(f.pricePerSqm)}
                                    </TableCell>
                                    <TableCell sx={{color: 'text.secondary'}}>{f.supplierName}</TableCell>
                                    <TableCell align="right">
                                        <Button
                                            size="small"
                                            variant="contained"
                                            onClick={() => onPick(f)}
                                            sx={{textTransform: 'none', boxShadow: 'none', minWidth: 0, '&:hover': {boxShadow: 'none'}}}
                                        >
                                            Hinzufügen
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {filtered.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={8} sx={{textAlign: 'center', py: 4, color: 'text.secondary'}}>
                                        Keine Treffer.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </DialogContent>
            <DialogActions sx={{px: 4, py: 2}}>
                <Typography variant="caption" color="text.secondary" sx={{flex: 1}}>
                    {filtered.length} Treffer
                </Typography>
                <Button variant="outlined" onClick={onClose} sx={{textTransform: 'none'}}>
                    Schliessen
                </Button>
            </DialogActions>
        </Dialog>
    );
}
