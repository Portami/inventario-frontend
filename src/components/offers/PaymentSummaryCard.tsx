import LabeledField from './LabeledField';
import {fmtCHF, fmtDate, lineSubtotal} from '@/pages/constants/offerConstants';
import {OfferDto} from '@/types/offerte';
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';
import {Box, Card, Divider, Typography} from '@mui/material';

const COLOR = '#2e7d32';

interface Props {
    offer: OfferDto;
}

export default function PaymentSummaryCard({offer}: Props) {
    const {number, createdISO, customer, lines, path} = offer;
    const subtotal = lines.reduce((s, l) => s + lineSubtotal(l), 0);
    const pathLabel = path.includes('ORDER_CONFIRMATION') ? 'Offerte → AB → Rechnung' : 'Offerte → Rechnung';

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
                <CheckCircleOutlinedIcon sx={{fontSize: 18, color: COLOR}} />
                <Typography sx={{fontSize: 12, fontWeight: 700, letterSpacing: 0.8, color: COLOR, textTransform: 'uppercase'}}>Bezahlt</Typography>
            </Box>

            {/* Success block */}
            <Box sx={{textAlign: 'center', py: 4, px: 3}}>
                <CheckCircleOutlinedIcon sx={{fontSize: 56, color: COLOR, mb: 1}} />
                <Typography variant="h6" sx={{fontWeight: 700, mb: 0.5}}>
                    Auftrag abgeschlossen
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    Zahlung erhalten
                </Typography>
            </Box>

            <Divider />

            {/* Summary grid */}
            <Box
                sx={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    gap: 2.5,
                    px: 3,
                    py: 2.5,
                }}
            >
                <LabeledField label="Auftragsnummer" value={number} />
                <LabeledField label="Kunde" value={customer.name} />
                <LabeledField label="Erstellt am" value={fmtDate(createdISO)} />
                <LabeledField label="Gesamtbetrag" value={fmtCHF(subtotal)} mono />
                <LabeledField label="Positionen" value={`${lines.length} Positionen`} />
                <LabeledField label="Durchlauf" value={pathLabel} />
            </Box>
        </Card>
    );
}
