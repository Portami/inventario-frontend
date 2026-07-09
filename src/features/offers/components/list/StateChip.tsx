import {OFFER_STATE_META} from '@/pages/constants/offerConstants';
import {OfferState} from '@/types/offerte';
import {Chip} from '@mui/material';

export default function StateChip({stateKey}: Readonly<{stateKey: OfferState}>) {
    const m = OFFER_STATE_META[stateKey];
    if (!m) return null;
    const {Icon} = m;
    return (
        <Chip
            size="small"
            icon={<Icon sx={{fontSize: '14px !important', ml: '6px !important', color: `${m.color} !important`}} />}
            label={m.label}
            sx={{
                height: 24,
                fontSize: 11.5,
                fontWeight: 600,
                bgcolor: m.bg,
                color: m.color,
                border: `1px solid ${m.color}33`,
            }}
        />
    );
}
