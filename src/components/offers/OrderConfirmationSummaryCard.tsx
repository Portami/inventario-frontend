import {fmtCHF, fmtDate, lineSubtotal, VAT_RATE} from '@/pages/constants/offerConstants';
import {OfferDto} from '@/types/offerte';
import AssignmentTurnedInOutlinedIcon from '@mui/icons-material/AssignmentTurnedInOutlined';
import {Box, Card, Divider, Typography} from '@mui/material';

const COLOR = '#0288d1';

interface Props {
    offer: OfferDto;
}

export default function OrderConfirmationSummaryCard({offer}: Props) {
    const {lines, number, createdISO, dueISO} = offer;
    const subtotal = lines.reduce((s, l) => s + lineSubtotal(l), 0);
    const total = subtotal * (1 + VAT_RATE);

    return (
        <Card variant="outlined" sx={{borderRadius: 2, overflow: 'hidden'}}>
            {/* Header bar */}
            <Box
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    px: 2.5,
                    py: 1.5,
                    bgcolor: `${COLOR}0f`,
                    borderBottom: `1px solid ${COLOR}30`,
                }}
            >
                <AssignmentTurnedInOutlinedIcon sx={{fontSize: 18, color: COLOR}} />
                <Typography sx={{fontSize: 12, fontWeight: 700, letterSpacing: 0.8, color: COLOR, textTransform: 'uppercase'}}>Auftragsbestätigung</Typography>
            </Box>

            <Box sx={{px: 3, py: 2.5}}>
                {/* Line items table */}
                <Box component="table" sx={{width: '100%', borderCollapse: 'collapse', mb: 3, fontSize: 13}}>
                    <Box component="thead">
                        <Box
                            component="tr"
                            sx={{
                                '& th': {
                                    py: 0.75,
                                    fontWeight: 600,
                                    color: 'text.secondary',
                                    fontSize: 11,
                                    textTransform: 'uppercase',
                                    letterSpacing: 0.5,
                                    borderBottom: '1px solid rgba(0,0,0,0.1)',
                                },
                            }}
                        >
                            <Box component="th" sx={{textAlign: 'left', width: 32}}>
                                #
                            </Box>
                            <Box component="th" sx={{textAlign: 'left'}}>
                                Artikel
                            </Box>
                            <Box component="th" sx={{textAlign: 'right', width: 80}}>
                                Menge
                            </Box>
                            <Box component="th" sx={{textAlign: 'right', width: 100}}>
                                Gesamt
                            </Box>
                        </Box>
                    </Box>
                    <Box component="tbody">
                        {lines.map((line, i) => (
                            <Box component="tr" key={line.id} sx={{'& td': {py: 1, borderBottom: '1px solid rgba(0,0,0,0.05)'}}}>
                                <Box component="td" sx={{color: 'text.secondary', fontSize: 12}}>
                                    {i + 1}
                                </Box>
                                <Box component="td">
                                    <Typography sx={{fontSize: 13, fontWeight: 500}}>
                                        {line.feltTypeName ? `${line.feltTypeName} · ${line.color}` : line.description}
                                    </Typography>
                                    {line.articleNumber && <Typography sx={{fontSize: 11, color: 'text.secondary'}}>{line.articleNumber}</Typography>}
                                </Box>
                                <Box component="td" sx={{textAlign: 'right', fontVariantNumeric: 'tabular-nums', color: 'text.secondary', fontSize: 12}}>
                                    {line.quantity} {line.unit}
                                </Box>
                                <Box component="td" sx={{textAlign: 'right', fontVariantNumeric: 'tabular-nums', fontSize: 13}}>
                                    {fmtCHF(lineSubtotal(line))}
                                </Box>
                            </Box>
                        ))}
                    </Box>
                </Box>

                <Divider sx={{mb: 2}} />

                {/* Totals */}
                <Box sx={{display: 'flex', justifyContent: 'flex-end', mb: 3}}>
                    <Box sx={{minWidth: 200}}>
                        <Box sx={{display: 'flex', justifyContent: 'space-between', mb: 0.5}}>
                            <Typography sx={{fontSize: 12, color: 'text.secondary'}}>Zwischensumme</Typography>
                            <Typography sx={{fontSize: 12, fontVariantNumeric: 'tabular-nums', color: 'text.secondary'}}>{fmtCHF(subtotal)}</Typography>
                        </Box>
                        <Box sx={{display: 'flex', justifyContent: 'space-between'}}>
                            <Typography sx={{fontSize: 13, fontWeight: 700}}>Gesamtbetrag</Typography>
                            <Typography sx={{fontSize: 13, fontWeight: 700, fontVariantNumeric: 'tabular-nums', color: COLOR}}>{fmtCHF(total)}</Typography>
                        </Box>
                    </Box>
                </Box>

                <Divider sx={{mb: 2}} />

                {/* Metadata grid */}
                <Box sx={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0.5}}>
                    {[
                        ['Auftragsnummer', number],
                        ['Erstellt', fmtDate(createdISO)],
                        ['Fällig bis', dueISO ? fmtDate(dueISO) : '—'],
                        ['Versandart', 'Economy'],
                        ['Liefertermin', 'ca. 10–12 Arbeitstage'],
                    ].map(([label, value]) => (
                        <Box key={label} sx={{display: 'flex', gap: 1}}>
                            <Typography sx={{fontSize: 11, fontWeight: 600, color: 'text.secondary', minWidth: 110, flexShrink: 0}}>{label}</Typography>
                            <Typography sx={{fontSize: 11, color: 'text.secondary'}}>{value}</Typography>
                        </Box>
                    ))}
                </Box>
            </Box>
        </Card>
    );
}
