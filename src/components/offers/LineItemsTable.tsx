import Editable from './Editable';
import KindChip from './KindChip';
import ReservationChip from './ReservationChip';
import {fmtCHF, lineSubtotal} from '@/pages/constants/offerConstants';
import {LineItemDto} from '@/types/offerte';
import AddIcon from '@mui/icons-material/Add';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import SearchIcon from '@mui/icons-material/Search';
import {Box, Button, Card, Divider, IconButton, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography, useTheme} from '@mui/material';

interface LineItemsTableProps {
    lines: LineItemDto[];
    onPatch: (id: string, patch: Partial<LineItemDto>) => void;
    onDelete: (id: string) => void;
    onAddFelt: () => void;
    onAddProduct: () => void;
    locked?: boolean;
}

export default function LineItemsTable({lines, onPatch, onDelete, onAddFelt, onAddProduct, locked = false}: LineItemsTableProps) {
    const theme = useTheme();
    const cellPad = '12px 12px';

    return (
        <Card variant="outlined" sx={{borderColor: 'rgba(0,0,0,0.08)', overflow: 'hidden'}}>
            <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 3, pb: 2}}>
                <Box sx={{display: 'flex', alignItems: 'center', gap: 1.5}}>
                    <Typography variant="h6" sx={{fontWeight: 600}}>
                        Positionen
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        {lines.length} Position{lines.length === 1 ? '' : 'en'}
                    </Typography>
                </Box>
                {!locked && (
                    <Box sx={{display: 'flex', gap: 1}}>
                        <Button variant="outlined" size="small" startIcon={<SearchIcon sx={{fontSize: 18}} />} onClick={onAddFelt} sx={{textTransform: 'none'}}>
                            Filz suchen
                        </Button>
                        <Button
                            variant="contained"
                            size="small"
                            startIcon={<AddIcon sx={{fontSize: 18}} />}
                            onClick={onAddProduct}
                            sx={{textTransform: 'none', boxShadow: 'none', '&:hover': {boxShadow: 'none'}}}
                        >
                            Produkt
                        </Button>
                    </Box>
                )}
            </Box>
            <Divider />
            <TableContainer>
                <Table size="medium">
                    <TableHead>
                        <TableRow
                            sx={{
                                '& th': {
                                    fontSize: 10.5,
                                    fontWeight: 600,
                                    letterSpacing: '0.06em',
                                    textTransform: 'uppercase',
                                    color: 'text.secondary',
                                    bgcolor: theme.palette.background.default,
                                    borderBottom: '1px solid rgba(0,0,0,0.08)',
                                    padding: cellPad,
                                },
                            }}
                        >
                            <TableCell sx={{width: 40}}>#</TableCell>
                            <TableCell>Artikel</TableCell>
                            <TableCell sx={{width: 110}}>Typ</TableCell>
                            <TableCell align="right" sx={{width: 70}}>
                                Menge
                            </TableCell>
                            <TableCell align="right" sx={{width: 110}}>
                                Preis / Einh.
                            </TableCell>
                            <TableCell align="right" sx={{width: 100}}>
                                Zuschnitt
                            </TableCell>
                            <TableCell align="right" sx={{width: 110}}>
                                Total
                            </TableCell>
                            <TableCell sx={{width: 40}} />
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {lines.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={8} sx={{textAlign: 'center', py: 6, color: 'text.secondary'}}>
                                    <Box sx={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1}}>
                                        <Inventory2OutlinedIcon sx={{fontSize: 36, color: 'rgba(0,0,0,0.2)'}} />
                                        <Typography variant="body2">Noch keine Positionen.</Typography>
                                        <Typography variant="caption">Filz über Cut Assistant oder Suche hinzufügen.</Typography>
                                    </Box>
                                </TableCell>
                            </TableRow>
                        )}
                        {lines.map((l, i) => (
                            <TableRow key={l.id} hover sx={{'& td': {padding: cellPad, fontSize: 13, borderBottom: '1px solid rgba(0,0,0,0.05)'}}}>
                                <TableCell sx={{color: 'text.secondary', fontVariantNumeric: 'tabular-nums'}}>{i + 1}</TableCell>
                                <TableCell>
                                    <Box sx={{display: 'flex', flexDirection: 'column', gap: '2px'}}>
                                        <Box sx={{display: 'flex', alignItems: 'center', gap: 1}}>
                                            <Typography sx={{fontWeight: 600, fontSize: 13.5}}>
                                                {l.feltTypeName}
                                                {l.color ? ` · ${l.color}` : ''}
                                            </Typography>
                                            {l.reservation && <ReservationChip reservation={l.reservation} />}
                                        </Box>
                                        <Box sx={{display: 'flex', alignItems: 'center', gap: 1.5, color: 'text.secondary', fontSize: 12}}>
                                            <Typography component="span" sx={{fontFamily: "'JetBrains Mono', monospace", fontSize: 11.5}}>
                                                {l.articleNumber}
                                            </Typography>
                                            <Typography component="span" sx={{color: 'rgba(0,0,0,0.3)'}}>
                                                ·
                                            </Typography>
                                            <Typography component="span">{l.description}</Typography>
                                        </Box>
                                    </Box>
                                </TableCell>
                                <TableCell>
                                    <KindChip kind={l.kind} />
                                </TableCell>
                                <TableCell align="right">
                                    <Editable value={l.quantity} step={1} width={56} suffix={l.unit} onChange={(v) => onPatch(l.id, {quantity: v})} />
                                </TableCell>
                                <TableCell align="right">
                                    <Editable value={l.pricePerUnit} width={86} suffix="CHF" onChange={(v) => onPatch(l.id, {pricePerUnit: v})} />
                                </TableCell>
                                <TableCell align="right">
                                    <Editable value={l.cutSurcharge} width={70} suffix="CHF" onChange={(v) => onPatch(l.id, {cutSurcharge: v})} />
                                </TableCell>
                                <TableCell align="right" sx={{fontVariantNumeric: 'tabular-nums', fontWeight: 600}}>
                                    {fmtCHF(lineSubtotal(l))}
                                </TableCell>
                                <TableCell align="right">
                                    <IconButton size="small" onClick={() => onDelete(l.id)} sx={{color: 'rgba(0,0,0,0.4)', '&:hover': {color: '#d32f2f'}}}>
                                        <DeleteOutlinedIcon sx={{fontSize: 18}} />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </Card>
    );
}
