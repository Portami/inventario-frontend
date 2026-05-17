import {fmtCHF} from '@/pages/constants/offerConstants';
import {ProductCatalogItem} from '@/types/offerte';
import CloseIcon from '@mui/icons-material/Close';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';
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
    Stack,
    TextField,
    Typography,
    useTheme,
} from '@mui/material';
import {useState} from 'react';

interface ProductSearchDialogProps {
    open: boolean;
    catalog: ProductCatalogItem[];
    onClose: () => void;
    onPick: (p: ProductCatalogItem) => void;
}

export default function ProductSearchDialog({open, catalog, onClose, onPick}: ProductSearchDialogProps) {
    const theme = useTheme();
    const primary = theme.palette.primary.main;
    const [q, setQ] = useState('');
    const filtered = catalog.filter((p) => !q || `${p.name} ${p.articleNumber}`.toLowerCase().includes(q.toLowerCase()));

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle sx={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 4, pt: 3}}>
                <Typography variant="h6" component="span" sx={{fontWeight: 600}}>
                    Produkt hinzufügen
                </Typography>
                <IconButton onClick={onClose} size="small">
                    <CloseIcon />
                </IconButton>
            </DialogTitle>
            <DialogContent sx={{px: 4, pb: 0}}>
                <TextField
                    fullWidth
                    size="small"
                    autoFocus
                    sx={{mt: 1, mb: 2}}
                    label="Suche"
                    placeholder="Versand, Verpackung, …"
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
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
                <Stack spacing={1} sx={{maxHeight: 320, overflowY: 'auto'}}>
                    {filtered.map((p) => (
                        <Box
                            key={p.id}
                            onClick={() => onPick(p)}
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 2,
                                p: 1.5,
                                borderRadius: 1,
                                border: '1px solid rgba(0,0,0,0.08)',
                                cursor: 'pointer',
                                '&:hover': {bgcolor: `${primary}08`, borderColor: `${primary}55`},
                            }}
                        >
                            <Box
                                sx={{
                                    width: 32,
                                    height: 32,
                                    borderRadius: 1,
                                    flexShrink: 0,
                                    bgcolor: '#2e7d3214',
                                    color: '#2e7d32',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}
                            >
                                <LocalShippingOutlinedIcon sx={{fontSize: 18}} />
                            </Box>
                            <Box sx={{flex: 1, minWidth: 0}}>
                                <Typography sx={{fontSize: 13.5, fontWeight: 500}}>{p.name}</Typography>
                                <Typography variant="caption" color="text.secondary" sx={{fontFamily: "'JetBrains Mono', monospace"}}>
                                    {p.articleNumber}
                                </Typography>
                            </Box>
                            <Typography sx={{fontWeight: 600, fontVariantNumeric: 'tabular-nums'}}>{fmtCHF(p.price)}</Typography>
                        </Box>
                    ))}
                    {filtered.length === 0 && (
                        <Typography variant="body2" color="text.secondary" sx={{py: 2, textAlign: 'center'}}>
                            Keine Treffer.
                        </Typography>
                    )}
                </Stack>
            </DialogContent>
            <DialogActions sx={{px: 4, py: 2}}>
                <Button variant="outlined" onClick={onClose} sx={{textTransform: 'none'}}>
                    Schliessen
                </Button>
            </DialogActions>
        </Dialog>
    );
}
