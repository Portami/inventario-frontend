import {PORTAMI} from '@/constants/companyConstants';
import {fmtCHF, fmtDate, lineSubtotal} from '@/pages/constants/offerConstants';
import {OfferDto} from '@/types/offerte';
import {Box, Divider, Typography} from '@mui/material';

type DunningState = 'PAYMENT_REMINDER' | 'FIRST_DUNNING_NOTICE' | 'SECOND_DUNNING_NOTICE';

interface Props {
    offer: OfferDto;
    state: DunningState;
}

const DUNNING_CONTENT: Record<DunningState, {title: string; subtitle: string; paymentTerm: string; signoff: string; lateFee: boolean}> = {
    PAYMENT_REMINDER: {
        title: `ZAHLUNGSERINNERUNG`,
        subtitle:
            'Verlegt oder vergessen, beides kann passieren. Darum erlauben wir uns, ' +
            'Ihnen einen neuen Einzahlungsschein zuzustellen, mit der Bitte den ' +
            'ausstehenden Betrag zu begleichen.',
        paymentTerm: 'Wir bitten Sie, den offenen Betrag innert 5 Tagen zu begleichen.',
        signoff: 'Herzlichen Dank für Ihr Verständnis und Ihre baldige Zahlung.',
        lateFee: false,
    },
    FIRST_DUNNING_NOTICE: {
        title: '1. MAHNUNG',
        subtitle:
            'Leider haben wir den ausstehenden Betrag trotz Zahlungserinnerung nicht erhalten. ' +
            'Wir bitten Sie, die offene Rechnung umgehend zu begleichen.',
        paymentTerm: 'Bitte begleichen Sie den ausstehenden Betrag innert 10 Tagen.',
        signoff: 'Freundliche Grüsse, Flurina Vitali',
        lateFee: false,
    },
    SECOND_DUNNING_NOTICE: {
        title: '2. MAHNUNG',
        subtitle:
            'Wir bitten Sie, die Einzahlung inkl. Mahngebühren von CHF 30.00 jetzt nachzuholen. ' +
            'Bei weiterem Ausbleiben der Zahlung sehen wir uns gezwungen, rechtliche Schritte einzuleiten.',
        paymentTerm: 'Sofortige Zahlung inkl. Mahngebühren CHF 30.00.',
        signoff: 'Freundliche Grüsse, Flurina Vitali',
        lateFee: true,
    },
};

function SmLine({label, value, dim, bold}: {label: string; value: string; dim?: boolean; bold?: boolean}) {
    return (
        <Box sx={{display: 'flex', justifyContent: 'space-between', mb: 0.25}}>
            <Typography sx={{fontSize: 12, color: dim ? 'text.secondary' : 'text.primary', fontWeight: bold ? 700 : 400}}>{label}</Typography>
            <Typography sx={{fontSize: 12, fontVariantNumeric: 'tabular-nums', color: dim ? 'text.secondary' : 'text.primary', fontWeight: bold ? 700 : 400}}>
                {value}
            </Typography>
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

export default function DunningDocumentPreview({offer, state}: Props) {
    const {customer, lines, number, createdISO, dueISO} = offer;
    const content = DUNNING_CONTENT[state];
    const subtotal = lines.reduce((s, l) => s + lineSubtotal(l), 0);
    const lateFee = content.lateFee ? 30 : 0;
    const total = subtotal + lateFee;

    const fullTitle = state === 'PAYMENT_REMINDER' && createdISO ? `${content.title} / RECHNUNG VOM ${fmtDate(createdISO)}` : content.title;

    return (
        <Box
            sx={{
                bgcolor: '#fff',
                border: '1px solid rgba(0,0,0,0.1)',
                borderRadius: 2,
                boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
                p: {xs: 3, sm: 5},
                fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
            }}
        >
            {/* Company header */}
            <Box sx={{display: 'flex', justifyContent: 'flex-end', mb: 4}}>
                <Box sx={{textAlign: 'right'}}>
                    <Typography sx={{fontSize: 13, fontWeight: 700}}>{PORTAMI.name}</Typography>
                    <Typography sx={{fontSize: 11.5, color: 'text.secondary', mt: 0.5}}>{PORTAMI.owners}</Typography>
                    <Typography sx={{fontSize: 11.5, color: 'text.secondary'}}>{PORTAMI.addr}</Typography>
                    <Typography sx={{fontSize: 11.5, color: 'text.secondary'}}>{PORTAMI.phone}</Typography>
                    <Typography sx={{fontSize: 11.5, color: 'text.secondary'}}>{PORTAMI.emailWeb}</Typography>
                </Box>
            </Box>

            {/* Customer + order info */}
            <Box sx={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 3, mb: 4}}>
                <Box>
                    <Typography sx={{fontSize: 11, fontWeight: 600, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: 0.5, mb: 0.75}}>
                        Rechnungsadresse
                    </Typography>
                    <Typography sx={{fontSize: 13, fontWeight: 600}}>{customer.name}</Typography>
                    {customer.contactPerson && <Typography sx={{fontSize: 12, color: 'text.secondary'}}>{customer.contactPerson}</Typography>}
                    <Typography sx={{fontSize: 12, color: 'text.secondary'}}>{customer.street}</Typography>
                    <Typography sx={{fontSize: 12, color: 'text.secondary'}}>
                        {customer.zip} {customer.city}
                    </Typography>
                    {customer.country && customer.country !== 'CH' && <Typography sx={{fontSize: 12, color: 'text.secondary'}}>{customer.country}</Typography>}
                </Box>
                <Box sx={{textAlign: 'right'}}>
                    <CondRow label="Auftragsnr.:" value={number} />
                    <CondRow label="Datum:" value={fmtDate(createdISO)} />
                    {dueISO && <CondRow label="Fällig bis:" value={fmtDate(dueISO)} />}
                </Box>
            </Box>

            <Divider sx={{mb: 3}} />

            {/* Document title */}
            <Typography sx={{fontSize: 20, fontWeight: 700, mb: 1.5}}>{fullTitle}</Typography>
            <Typography sx={{fontSize: 12, color: 'text.secondary', mb: 3, lineHeight: 1.6}}>{content.subtitle}</Typography>

            {/* Invoice reference block */}
            <Box
                sx={{
                    bgcolor: 'rgba(0,0,0,0.03)',
                    border: '1px solid rgba(0,0,0,0.08)',
                    borderRadius: 1,
                    p: 2,
                    mb: 3,
                }}
            >
                <Typography sx={{fontSize: 11, fontWeight: 600, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: 0.5, mb: 1}}>
                    Offener Betrag
                </Typography>
                <CondRow label="Bezug:" value={`Rechnung Nr. ${number} vom ${fmtDate(createdISO)}`} />
                <Box sx={{mt: 1.5}}>
                    <SmLine label="Rechnungsbetrag" value={fmtCHF(subtotal)} dim />
                    {lateFee > 0 && <SmLine label="Mahngebühren" value={fmtCHF(lateFee)} dim />}
                    <SmLine label="Offener Betrag" value={fmtCHF(total)} bold />
                </Box>
            </Box>

            {/* Payment instructions */}
            <Box sx={{mb: 4}}>
                <Typography sx={{fontSize: 11, fontWeight: 600, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: 0.5, mb: 1}}>
                    Zahlungsangaben
                </Typography>
                <CondRow label="IBAN:" value={PORTAMI.ibanFormatted} />
                <CondRow label="Bank:" value={PORTAMI.bank} />
                <CondRow label="Zahlungszweck:" value={`Rechnung ${number}`} />
            </Box>

            {/* Footer */}
            <Divider sx={{mb: 2}} />
            <Typography sx={{fontSize: 12, color: 'text.secondary', mb: 2, lineHeight: 1.6}}>{content.signoff}</Typography>
            <CondRow label="Zahlungsart:" value={content.paymentTerm} />
            <CondRow label="AGB:" value={`www.portami.ch/agb`} />
            <CondRow label="UID:" value={PORTAMI.uid} />
        </Box>
    );
}
