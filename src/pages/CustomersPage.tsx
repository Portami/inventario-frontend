import EditCustomerDialog from '@/components/offers/EditCustomerDialog';
import {useToast} from '@/components/ToastProvider';
import {fetchCustomers, updateCustomer} from '@/services/backend';
import {CustomerDto, CustomerWithIdDto} from '@/types/offerte';
import PeopleOutlinedIcon from '@mui/icons-material/PeopleOutlined';
import SearchIcon from '@mui/icons-material/Search';
import {
    Box,
    Card,
    CircularProgress,
    InputAdornment,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
    Typography,
    useTheme,
} from '@mui/material';
import {useEffect, useMemo, useState} from 'react';

export default function CustomersPage() {
    const theme = useTheme();
    const showToast = useToast();

    const [customers, setCustomers] = useState<CustomerWithIdDto[]>([]);
    const [loading, setLoading] = useState(true);
    const [q, setQ] = useState('');
    const [selected, setSelected] = useState<CustomerWithIdDto | null>(null);

    useEffect(() => {
        fetchCustomers()
            .then(setCustomers)
            .catch(() => showToast('Kunden konnten nicht geladen werden', 'error'))
            .finally(() => setLoading(false));
    }, [showToast]);

    const filtered = useMemo(() => {
        if (!q.trim()) return customers;
        const needle = q.trim().toLowerCase();
        return customers.filter(
            (c) =>
                c.name.toLowerCase().includes(needle) ||
                c.contactPerson.toLowerCase().includes(needle) ||
                c.email.toLowerCase().includes(needle) ||
                c.city.toLowerCase().includes(needle),
        );
    }, [customers, q]);

    const handleSave = async (changes: Partial<CustomerDto>) => {
        if (!selected) return;
        try {
            const updated = await updateCustomer(selected.customerNumber, changes);
            setCustomers((prev) => prev.map((c) => (c.customerNumber === updated.customerNumber ? {...c, ...updated} : c)));
            setSelected((prev) => (prev ? {...prev, ...updated} : prev));
            showToast('Kundendaten gespeichert');
        } catch {
            showToast('Kundendaten konnten nicht gespeichert werden', 'error');
        }
    };

    const cellPad = '8px 12px';

    return (
        <Box sx={{py: 4}}>
            <Box sx={{display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', mb: 3}}>
                <Box>
                    <Typography variant="caption" color="text.secondary" sx={{textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600}}>
                        Inventar
                    </Typography>
                    <Typography variant="h4" sx={{fontWeight: 600, mt: 0.25, color: 'text.primary'}}>
                        Kunden
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{mt: 0.5}}>
                        Alle Kunden — Stammdaten einsehen und bearbeiten.
                    </Typography>
                </Box>
            </Box>

            <TextField
                size="small"
                placeholder="Suchen nach Name, Ansprechperson, E-Mail oder Ort …"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                sx={{mb: 2, width: 420}}
                slotProps={{
                    input: {
                        startAdornment: (
                            <InputAdornment position="start">
                                <SearchIcon sx={{fontSize: 18, color: 'text.disabled'}} />
                            </InputAdornment>
                        ),
                    },
                }}
            />

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
                                    <TableCell>Firmenname</TableCell>
                                    <TableCell>Ansprechperson</TableCell>
                                    <TableCell>E-Mail</TableCell>
                                    <TableCell>Telefon</TableCell>
                                    <TableCell>Ort</TableCell>
                                    <TableCell>Land</TableCell>
                                    <TableCell>MWST-Nr.</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {filtered.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={7} sx={{textAlign: 'center', py: 8, color: 'text.secondary'}}>
                                            <Box sx={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1.5}}>
                                                <PeopleOutlinedIcon sx={{fontSize: 48, color: 'rgba(0,0,0,0.18)'}} />
                                                <Typography variant="body2">Keine Kunden gefunden.</Typography>
                                            </Box>
                                        </TableCell>
                                    </TableRow>
                                )}
                                {filtered.map((c) => (
                                    <TableRow
                                        key={c.customerNumber}
                                        hover
                                        onClick={() => setSelected(c)}
                                        sx={{
                                            cursor: 'pointer',
                                            '& td': {padding: cellPad, fontSize: 13, borderBottom: '1px solid rgba(0,0,0,0.05)'},
                                        }}
                                    >
                                        <TableCell sx={{fontWeight: 600}}>{c.name}</TableCell>
                                        <TableCell sx={{color: 'text.secondary'}}>{c.contactPerson || '—'}</TableCell>
                                        <TableCell sx={{color: 'text.secondary'}}>{c.email || '—'}</TableCell>
                                        <TableCell sx={{color: 'text.secondary'}}>{c.phone || '—'}</TableCell>
                                        <TableCell sx={{color: 'text.secondary'}}>{c.city || '—'}</TableCell>
                                        <TableCell sx={{color: 'text.secondary'}}>{c.country || '—'}</TableCell>
                                        <TableCell sx={{color: 'text.secondary', fontFamily: "'JetBrains Mono', monospace", fontSize: 12}}>
                                            {c.vatNumber || '—'}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                )}
            </Card>

            <Typography variant="caption" color="text.secondary" sx={{display: 'block', mt: 3, textAlign: 'center'}}>
                {filtered.length} von {customers.length} Kunden · Zeile anklicken um Daten zu bearbeiten
            </Typography>

            {selected && <EditCustomerDialog open={!!selected} customer={selected} onClose={() => setSelected(null)} onSave={handleSave} />}
        </Box>
    );
}
