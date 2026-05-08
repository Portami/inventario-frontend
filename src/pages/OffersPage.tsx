import CreateOfferDialog from '@/components/offers/CreateOfferDialog';
import CustomerCell from '@/components/offers/CustomerCell';
import DueCell from '@/components/offers/DueCell';
import FilterBar, {DateRange, SortOption} from '@/components/offers/FilterBar';
import InventoryCell from '@/components/offers/InventoryCell';
import StateChip from '@/components/offers/StateChip';
import StatTile from '@/components/offers/StatTile';
import {useToast} from '@/components/ToastProvider';
import {useOffers} from '@/hooks/useOffers';
import {daysFromNow, fmtCHF, fmtDate, OFFER_STATE, OFFER_STATE_META, PAGE_SIZE} from '@/pages/constants/offerConstants';
import {OfferState} from '@/types/offerte';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import ForwardIcon from '@mui/icons-material/Forward';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined';
import {
    Box,
    Button,
    Card,
    Checkbox,
    CircularProgress,
    Divider,
    IconButton,
    Pagination,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography,
    useTheme,
} from '@mui/material';
import {useMemo, useState} from 'react';
import {useNavigate} from 'react-router';

type StateFilter = 'ALL' | 'OPEN' | 'OVERDUE' | OfferState;

export default function OffersPage() {
    const theme = useTheme();
    const primary = theme.palette.primary.main;
    const navigate = useNavigate();
    const showToast = useToast();

    const {offers, loading} = useOffers();

    const [q, setQ] = useState('');
    const [stateFilter, setStateFilter] = useState<StateFilter>('ALL');
    const [sort, setSort] = useState<SortOption>('created_desc');
    const [dateRange, setDateRange] = useState<DateRange>('all');
    const [page, setPage] = useState(1);
    const [selected, setSelected] = useState<string[]>([]);
    const [createDlgOpen, setCreateDlgOpen] = useState(false);

    const stats = useMemo(() => {
        const open = offers.filter((o) => o.state !== OFFER_STATE.BEZAHLT);
        const overdue = offers.filter((o) => o.overdue > 0);
        const offerten = offers.filter((o) => o.state === OFFER_STATE.OFFERTE);
        const paid = offers.filter((o) => o.state === OFFER_STATE.BEZAHLT);
        return {
            all: offers.length,
            open: open.length,
            openSum: open.reduce((s, o) => s + o.total, 0),
            overdue: overdue.length,
            offerten: offerten.length,
            paid: paid.length,
            paidSum: paid.reduce((s, o) => s + o.total, 0),
        };
    }, [offers]);

    const filtered = useMemo(() => {
        let rows = offers.slice();
        if (q.trim()) {
            const needle = q.trim().toLowerCase();
            rows = rows.filter(
                (o) =>
                    o.id.toLowerCase().includes(needle) ||
                    o.customer.toLowerCase().includes(needle) ||
                    o.contact.toLowerCase().includes(needle) ||
                    o.city.toLowerCase().includes(needle),
            );
        }
        if (stateFilter === 'OPEN') {
            rows = rows.filter((o) => o.state !== OFFER_STATE.BEZAHLT);
        } else if (stateFilter === 'OVERDUE') {
            rows = rows.filter((o) => o.overdue > 0);
        } else if (stateFilter !== 'ALL') {
            rows = rows.filter((o) => o.state === stateFilter);
        }
        if (dateRange === '7d') {
            rows = rows.filter((o) => daysFromNow(o.createdISO) >= -7);
        } else if (dateRange === '30d') {
            rows = rows.filter((o) => daysFromNow(o.createdISO) >= -30);
        } else if (dateRange === 'overdue') {
            rows = rows.filter((o) => o.overdue > 0);
        }
        rows.sort((a, b) => {
            switch (sort) {
                case 'created_asc':
                    return a.createdISO.localeCompare(b.createdISO);
                case 'due_asc':
                    return a.dueISO.localeCompare(b.dueISO);
                case 'total_desc':
                    return b.total - a.total;
                case 'customer':
                    return a.customer.localeCompare(b.customer);
                default:
                    return b.createdISO.localeCompare(a.createdISO);
            }
        });
        return rows;
    }, [offers, q, stateFilter, sort, dateRange]);

    const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
    const currentPage = Math.min(page, totalPages);
    const pageRows = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

    const hasActiveFilter = q !== '' || stateFilter !== 'ALL' || dateRange !== 'all';

    const resetFilters = () => {
        setQ('');
        setStateFilter('ALL');
        setDateRange('all');
        setPage(1);
        setSelected([]);
    };

    const handleStateFilter = (key: StateFilter) => {
        setStateFilter(key);
        setPage(1);
        setSelected([]);
    };

    const toggleAll = () => {
        if (selected.length === pageRows.length) setSelected([]);
        else setSelected(pageRows.map((r) => r.id));
    };

    const toggleOne = (id: string) => {
        setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));
    };

    const cellPad = '8px 12px';

    return (
        <Box sx={{py: 4}}>
            {/* Page header */}
            <Box sx={{display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', mb: 3}}>
                <Box>
                    <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{
                            textTransform: 'uppercase',
                            letterSpacing: '0.06em',
                            fontWeight: 600,
                        }}
                    >
                        Inventar
                    </Typography>
                    <Typography variant="h4" sx={{fontWeight: 600, mt: 0.25, color: 'text.primary'}}>
                        Offerten
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{mt: 0.5}}>
                        Alle Kundenanfragen — von der Offerte bis zur zweiten Mahnung.
                    </Typography>
                </Box>
                <Button
                    variant="contained"
                    startIcon={<AddIcon sx={{fontSize: 18}} />}
                    onClick={() => setCreateDlgOpen(true)}
                    sx={{textTransform: 'none', boxShadow: 'none', '&:hover': {boxShadow: 'none'}}}
                >
                    Neue Offerte
                </Button>
            </Box>

            {/* Stat tiles */}
            <Box sx={{display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 2, mb: 3}}>
                <StatTile label="Alle Offerten" value={stats.all} sub="Gesamtbestand" active={stateFilter === 'ALL'} onClick={() => handleStateFilter('ALL')} />
                <StatTile
                    label="Offen"
                    value={stats.open}
                    sub={`${fmtCHF(stats.openSum)} offen`}
                    color="#0288d1"
                    active={stateFilter === 'OPEN'}
                    onClick={() => handleStateFilter('OPEN')}
                />
                <StatTile
                    label="Neue Offerten"
                    value={stats.offerten}
                    sub="zur Bearbeitung"
                    color={OFFER_STATE_META.OFFERTE.color}
                    active={stateFilter === OFFER_STATE.OFFERTE}
                    onClick={() => handleStateFilter(OFFER_STATE.OFFERTE)}
                />
                <StatTile
                    label="Überfällig"
                    value={stats.overdue}
                    sub="Mahnung erforderlich"
                    color="#c62828"
                    active={stateFilter === 'OVERDUE'}
                    onClick={() => handleStateFilter('OVERDUE')}
                />
                <StatTile
                    label="Bezahlt"
                    value={stats.paid}
                    sub={fmtCHF(stats.paidSum)}
                    color={OFFER_STATE_META.BEZAHLT.color}
                    active={stateFilter === OFFER_STATE.BEZAHLT}
                    onClick={() => handleStateFilter(OFFER_STATE.BEZAHLT)}
                />
            </Box>

            <FilterBar q={q} setQ={setQ} sort={sort} setSort={setSort} dateRange={dateRange} setDateRange={setDateRange} />

            {/* Result count + bulk action bar */}
            <Box sx={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5, px: 0.5}}>
                <Typography variant="body2" color="text.secondary">
                    <strong style={{color: 'rgba(0,0,0,0.87)'}}>{filtered.length}</strong> von {offers.length} Offerten
                    {hasActiveFilter && (
                        <Button
                            size="small"
                            startIcon={<CloseIcon sx={{fontSize: 16}} />}
                            onClick={resetFilters}
                            sx={{textTransform: 'none', ml: 1, color: primary}}
                        >
                            Filter zurücksetzen
                        </Button>
                    )}
                </Typography>
                {selected.length > 0 && (
                    <Box
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1,
                            bgcolor: `${primary}10`,
                            px: 2,
                            py: 0.5,
                            borderRadius: 1,
                            border: `1px solid ${primary}55`,
                        }}
                    >
                        <Typography sx={{fontSize: 13, fontWeight: 500, color: primary}}>{selected.length} ausgewählt</Typography>
                        <Divider orientation="vertical" flexItem />
                        <Button
                            size="small"
                            startIcon={<PictureAsPdfIcon sx={{fontSize: 16}} />}
                            onClick={() => showToast('PDFs werden erzeugt (noch nicht implementiert)', 'info')}
                            sx={{textTransform: 'none', color: primary}}
                        >
                            PDFs erzeugen
                        </Button>
                        <Button
                            size="small"
                            startIcon={<ForwardIcon sx={{fontSize: 16}} />}
                            onClick={() => showToast('Status ändern (noch nicht implementiert)', 'info')}
                            sx={{textTransform: 'none', color: primary}}
                        >
                            Status ändern
                        </Button>
                        <IconButton size="small" onClick={() => setSelected([])}>
                            <CloseIcon sx={{fontSize: 16}} />
                        </IconButton>
                    </Box>
                )}
            </Box>

            {/* Main table */}
            <Card variant="outlined" sx={{borderColor: 'rgba(0,0,0,0.08)', overflow: 'hidden'}}>
                {loading && (
                    <Box sx={{display: 'flex', justifyContent: 'center', py: 6}}>
                        <CircularProgress size={32} />
                    </Box>
                )}
                {!loading && (
                    <TableContainer>
                        <Table size="small">
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
                                    <TableCell sx={{width: 40}}>
                                        <Checkbox
                                            size="small"
                                            indeterminate={selected.length > 0 && selected.length < pageRows.length}
                                            checked={pageRows.length > 0 && selected.length === pageRows.length}
                                            onChange={toggleAll}
                                            sx={{p: 0.5, color: 'rgba(0,0,0,0.4)'}}
                                        />
                                    </TableCell>
                                    <TableCell sx={{width: 130}}>Offerte-Nr.</TableCell>
                                    <TableCell>Kunde</TableCell>
                                    <TableCell sx={{width: 200}}>Status</TableCell>
                                    <TableCell align="right" sx={{width: 70}}>
                                        Pos.
                                    </TableCell>
                                    <TableCell sx={{width: 110}}>Lager</TableCell>
                                    <TableCell sx={{width: 130}}>Erstellt</TableCell>
                                    <TableCell sx={{width: 150}}>Fällig</TableCell>
                                    <TableCell align="right" sx={{width: 130}}>
                                        Total
                                    </TableCell>
                                    <TableCell sx={{width: 56}} />
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {pageRows.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={10} sx={{textAlign: 'center', py: 8, color: 'text.secondary'}}>
                                            <Box sx={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1.5}}>
                                                <ReceiptLongOutlinedIcon sx={{fontSize: 48, color: 'rgba(0,0,0,0.18)'}} />
                                                <Typography variant="body2">Keine Offerten gefunden.</Typography>
                                                <Typography variant="caption">Filter anpassen oder neue Offerte erstellen.</Typography>
                                            </Box>
                                        </TableCell>
                                    </TableRow>
                                )}
                                {pageRows.map((o) => {
                                    const sel = selected.includes(o.id);
                                    return (
                                        <TableRow
                                            key={o.id}
                                            hover
                                            selected={sel}
                                            onClick={() => navigate(`/offers/${o.id}`)}
                                            sx={{
                                                cursor: 'pointer',
                                                '& td': {padding: cellPad, fontSize: 13, borderBottom: '1px solid rgba(0,0,0,0.05)'},
                                                '&.Mui-selected': {
                                                    bgcolor: `${primary}08`,
                                                    '&:hover': {bgcolor: `${primary}10`},
                                                },
                                            }}
                                        >
                                            <TableCell onClick={(e) => e.stopPropagation()}>
                                                <Checkbox size="small" checked={sel} onChange={() => toggleOne(o.id)} sx={{p: 0.5}} />
                                            </TableCell>
                                            <TableCell
                                                sx={{
                                                    fontFamily: "'JetBrains Mono', monospace",
                                                    fontSize: 12,
                                                    fontWeight: 600,
                                                    color: primary,
                                                }}
                                            >
                                                {o.id}
                                            </TableCell>
                                            <TableCell>
                                                <CustomerCell customer={o.customer} contact={o.contact} city={o.city} />
                                            </TableCell>
                                            <TableCell>
                                                <StateChip stateKey={o.state} />
                                            </TableCell>
                                            <TableCell align="right" sx={{color: 'text.secondary', fontVariantNumeric: 'tabular-nums'}}>
                                                {o.lines}
                                            </TableCell>
                                            <TableCell>
                                                <InventoryCell reserved={o.reservedScraps} tagged={o.taggedRolls} />
                                            </TableCell>
                                            <TableCell sx={{color: 'text.secondary'}}>{fmtDate(o.createdISO)}</TableCell>
                                            <TableCell>
                                                <DueCell dueISO={o.dueISO} overdue={o.overdue} state={o.state} />
                                            </TableCell>
                                            <TableCell align="right" sx={{fontWeight: 600, fontSize: 13.5, fontVariantNumeric: 'tabular-nums'}}>
                                                {fmtCHF(o.total)}
                                            </TableCell>
                                            <TableCell align="right" onClick={(e) => e.stopPropagation()}>
                                                <IconButton size="small" sx={{color: 'rgba(0,0,0,0.45)'}}>
                                                    <MoreHorizIcon sx={{fontSize: 18}} />
                                                </IconButton>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </TableContainer>
                )}
                {filtered.length > PAGE_SIZE && (
                    <Box
                        sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            p: 2,
                            borderTop: '1px solid rgba(0,0,0,0.06)',
                        }}
                    >
                        <Typography variant="caption" color="text.secondary">
                            Seite {currentPage} von {totalPages} · zeigt {pageRows.length} von {filtered.length}
                        </Typography>
                        <Pagination count={totalPages} page={currentPage} onChange={(_, p) => setPage(p)} size="small" color="primary" shape="rounded" />
                    </Box>
                )}
            </Card>

            <Typography variant="caption" color="text.secondary" sx={{display: 'block', mt: 3, textAlign: 'center'}}>
                Zeile anklicken um die Offerte zu öffnen · Bulk-Aktionen über die Auswahl-Spalte
            </Typography>

            <CreateOfferDialog
                open={createDlgOpen}
                onClose={() => setCreateDlgOpen(false)}
                onCreated={(id) => {
                    setCreateDlgOpen(false);
                    navigate(`/offers/${id}`);
                }}
            />
        </Box>
    );
}
