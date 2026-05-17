import {PORTAMI} from '@/constants/companyConstants';
import {fmtCHF, fmtDate, fmtNum, lineSubtotal} from '@/pages/constants/offerConstants';
import {LineItemDto, OfferDto} from '@/types/offerte';
import {Box, Divider, Typography} from '@mui/material';

const TEXT = {
    subtitle: 'Für die bei uns bestellten Artikel stellen wir Ihnen wie folgt Rechnung:',
    thanks: 'Herzlichen Dank für Ihren Auftrag und das entgegengebrachte Vertrauen in unsere Manufaktur.',
    sign: 'Freundliche Grüsse, Flurina Vitali',
    payment: 'Rechnung bezahlbar innert 10 Tagen rein netto',
    delivery: 'inkl. Versand und Verpackung',
    agb: 'www.portami.ch/agb',
} as const;

interface Props {
    offer: OfferDto;
    shippingFee: number;
    vatRate: number;
}

function SmLine({label, value, dim}: {label: string; value: string; dim?: boolean}) {
    return (
        <Box sx={{display: 'flex', justifyContent: 'space-between', mb: 0.25}}>
            <Typography sx={{fontSize: 12, color: dim ? 'text.secondary' : 'text.primary'}}>{label}</Typography>
            <Typography sx={{fontSize: 12, fontVariantNumeric: 'tabular-nums', color: dim ? 'text.secondary' : 'text.primary'}}>{value}</Typography>
        </Box>
    );
}

function CondRow({label, value}: {label: string; value: string}) {
    return (
        <Box sx={{display: 'flex', gap: 1, mb: 0.25}}>
            <Typography sx={{fontSize: 11, fontWeight: 600, color: 'text.secondary', minWidth: 100, flexShrink: 0}}>{label}</Typography>
            <Typography sx={{fontSize: 11, color: 'text.secondary'}}>{value}</Typography>
        </Box>
    );
}

export default function InvoiceDocumentPreview({offer, shippingFee, vatRate}: Props) {
    const {customer, lines} = offer;
    const subtotal = lines.reduce((s, l) => s + lineSubtotal(l), 0);
    const vatBase = subtotal + shippingFee;
    const vatAmount = vatBase * vatRate;
    const total = vatBase + vatAmount;

    return (
        <Box
            sx={{
                bgcolor: '#fff',
                border: '1px solid rgba(0,0,0,0.1)',
                borderRadius: 2,
                boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
                p: {xs: 3, md: 5},
                fontFamily: 'Helvetica, Arial, sans-serif',
            }}
        >
            {/* Company header — right-aligned */}
            <Box sx={{textAlign: 'right', mb: 4}}>
                <Typography sx={{fontSize: 13, fontWeight: 700, color: 'text.primary'}}>{PORTAMI.name}</Typography>
                <Typography sx={{fontSize: 11.5, color: 'text.secondary', mt: 0.5}}>{PORTAMI.owners}</Typography>
                <Typography sx={{fontSize: 11.5, color: 'text.secondary'}}>{PORTAMI.addr}</Typography>
                <Typography sx={{fontSize: 11.5, color: 'text.secondary'}}>{PORTAMI.phone}</Typography>
                <Typography sx={{fontSize: 11.5, color: 'text.secondary'}}>{PORTAMI.emailWeb}</Typography>
            </Box>

            {/* Customer + order info — two columns */}
            <Box sx={{display: 'flex', justifyContent: 'space-between', gap: 3, mb: 3}}>
                <Box>
                    <Typography sx={{fontSize: 13, fontWeight: 700}}>{customer.name}</Typography>
                    {customer.contactPerson && <Typography sx={{fontSize: 12, color: 'text.secondary'}}>{customer.contactPerson}</Typography>}
                    {customer.street && <Typography sx={{fontSize: 12, color: 'text.secondary'}}>{customer.street}</Typography>}
                    {(customer.zip || customer.city) && (
                        <Typography sx={{fontSize: 12, color: 'text.secondary'}}>{`${customer.zip} ${customer.city}`.trim()}</Typography>
                    )}
                </Box>
                <Box sx={{textAlign: 'right', flexShrink: 0}}>
                    {(
                        [
                            ['Auftragsnummer:', offer.number],
                            ['Datum:', fmtDate(offer.createdISO)],
                            ...(offer.dueISO ? [['Fällig bis:', fmtDate(offer.dueISO)]] : []),
                        ] as [string, string][]
                    ).map(([lbl, val]) => (
                        <Box key={lbl} sx={{display: 'flex', gap: 2, justifyContent: 'flex-end', mb: 0.25}}>
                            <Typography sx={{fontSize: 12, color: 'text.secondary'}}>{lbl}</Typography>
                            <Typography sx={{fontSize: 12}}>{val}</Typography>
                        </Box>
                    ))}
                </Box>
            </Box>

            <Divider sx={{mb: 3}} />

            {/* Document title */}
            <Typography sx={{fontSize: 20, fontWeight: 700, letterSpacing: '0.02em', mb: 1}}>RECHNUNG</Typography>
            <Typography sx={{fontSize: 12, color: 'text.secondary', mb: 3}}>{TEXT.subtitle}</Typography>

            {/* Line items table */}
            <Box
                component="table"
                sx={{
                    width: '100%',
                    borderCollapse: 'collapse',
                    mb: 0,
                    '& th': {
                        fontSize: 10,
                        fontWeight: 700,
                        letterSpacing: '0.06em',
                        textTransform: 'uppercase',
                        color: 'text.secondary',
                        bgcolor: 'rgba(0,0,0,0.03)',
                        borderTop: '1px solid rgba(0,0,0,0.1)',
                        borderBottom: '1px solid rgba(0,0,0,0.1)',
                        py: 1,
                        px: '10px',
                        whiteSpace: 'nowrap',
                    },
                    '& td': {
                        fontSize: 12,
                        py: '8px',
                        px: '10px',
                        borderBottom: '1px solid rgba(0,0,0,0.05)',
                        verticalAlign: 'top',
                    },
                }}
            >
                <thead>
                    <tr>
                        <th style={{width: 28, textAlign: 'left'}}>#</th>
                        <th style={{textAlign: 'left'}}>Artikel</th>
                        <th style={{width: 64, textAlign: 'right'}}>Menge</th>
                        <th style={{width: 96, textAlign: 'right'}}>Preis / Einh.</th>
                        <th style={{width: 80, textAlign: 'right'}}>Zuschnitt</th>
                        <th style={{width: 90, textAlign: 'right'}}>Gesamt</th>
                    </tr>
                </thead>
                <tbody>
                    {lines.length === 0 && (
                        <tr>
                            <td colSpan={6} style={{textAlign: 'center', padding: '24px', color: 'rgba(0,0,0,0.4)'}}>
                                Keine Positionen vorhanden
                            </td>
                        </tr>
                    )}
                    {lines.map((l: LineItemDto, i: number) => {
                        const descPart = l.description !== l.feltTypeName ? l.description : null;
                        const secondary = [l.articleNumber, descPart].filter(Boolean).join(' · ');
                        return (
                            <tr key={l.id} style={{backgroundColor: i % 2 === 1 ? 'rgba(0,0,0,0.015)' : undefined}}>
                                <td style={{color: 'rgba(0,0,0,0.4)', fontVariantNumeric: 'tabular-nums'}}>{i + 1}</td>
                                <td>
                                    <Box sx={{fontWeight: 600, fontSize: 12.5}}>
                                        {l.feltTypeName}
                                        {l.color ? ` · ${l.color}` : ''}
                                    </Box>
                                    {secondary && (
                                        <Box sx={{fontSize: 11, color: 'text.secondary', mt: '2px', fontFamily: "'JetBrains Mono', monospace"}}>
                                            {secondary}
                                        </Box>
                                    )}
                                </td>
                                <td style={{textAlign: 'right', fontVariantNumeric: 'tabular-nums'}}>
                                    {l.quantity} {l.unit}
                                </td>
                                <td style={{textAlign: 'right', fontVariantNumeric: 'tabular-nums'}}>{fmtCHF(l.pricePerUnit)}</td>
                                <td style={{textAlign: 'right', fontVariantNumeric: 'tabular-nums', color: l.cutSurcharge > 0 ? 'inherit' : 'rgba(0,0,0,0.3)'}}>
                                    {l.cutSurcharge > 0 ? fmtCHF(l.cutSurcharge) : '—'}
                                </td>
                                <td style={{textAlign: 'right', fontVariantNumeric: 'tabular-nums', fontWeight: 600}}>{fmtCHF(lineSubtotal(l))}</td>
                            </tr>
                        );
                    })}
                </tbody>
            </Box>

            {/* Totals — right-aligned block */}
            <Box sx={{display: 'flex', justifyContent: 'flex-end', mt: 1, mb: 4}}>
                <Box sx={{minWidth: 260}}>
                    <Divider sx={{mb: 1.5}} />
                    <SmLine label="Zwischensumme" value={fmtCHF(subtotal)} dim />
                    {shippingFee > 0 && <SmLine label="Liefergebühren" value={fmtCHF(shippingFee)} dim />}
                    {vatRate > 0 && <SmLine label={`MWST (${fmtNum(vatRate * 100, 1)} %)`} value={fmtCHF(vatAmount)} dim />}
                    <Divider sx={{my: 1}} />
                    <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'baseline'}}>
                        <Typography sx={{fontSize: 13, fontWeight: 700}}>Total CHF</Typography>
                        <Typography sx={{fontSize: 19, fontWeight: 800, fontVariantNumeric: 'tabular-nums', color: '#1565c0'}}>{fmtCHF(total)}</Typography>
                    </Box>
                    {vatRate === 0 && (
                        <Typography sx={{fontSize: 10, color: 'text.disabled', textAlign: 'right', mt: 0.5}}>Nicht mehrwertsteuerpflichtig</Typography>
                    )}
                </Box>
            </Box>

            <Divider sx={{mb: 2}} />

            {/* Footer */}
            <Typography sx={{fontSize: 12, color: 'text.secondary', mb: 0.5}}>{TEXT.thanks}</Typography>
            <Typography sx={{fontSize: 12, color: 'text.secondary', mb: 2}}>{TEXT.sign}</Typography>
            <CondRow label="Zahlungsart:" value={TEXT.payment} />
            <CondRow label="Lieferung:" value={TEXT.delivery} />
            <CondRow label="AGB:" value={TEXT.agb} />
            <CondRow label="UID:" value={`${PORTAMI.uid} · ${vatRate === 0 ? 'Nicht mehrwertsteuerpflichtig' : ''}`} />
        </Box>
    );
}
