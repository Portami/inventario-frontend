import {KIND_CHIP_STYLES} from '@/pages/constants/offerConstants';
import {LineItemKind} from '@/types/offerte';
import {Chip} from '@mui/material';

export default function KindChip({kind}: Readonly<{kind: LineItemKind}>) {
    const c = KIND_CHIP_STYLES[kind];
    return (
        <Chip
            size="small"
            label={c.label}
            sx={{
                height: 20,
                fontSize: 10.5,
                fontWeight: 600,
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
                bgcolor: c.bg,
                color: c.color,
                border: 'none',
            }}
        />
    );
}
