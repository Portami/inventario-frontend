import {daysFromNow, fmtDate, OFFER_STATE} from '@/pages/constants/offerConstants';
import {OfferState} from '@/types/offerte';
import {Box, Typography} from '@mui/material';

interface DueCellProps {
    dueISO: string;
    overdue: number;
    state: OfferState;
}

export default function DueCell({dueISO, overdue, state}: DueCellProps) {
    if (state === OFFER_STATE.PAID) {
        return <Typography sx={{fontSize: 13, color: '#2e7d32'}}>{fmtDate(dueISO)}</Typography>;
    }
    if (overdue > 0) {
        return (
            <Box>
                <Typography sx={{fontSize: 13, color: '#c62828', fontWeight: 600}}>{fmtDate(dueISO)}</Typography>
                <Typography variant="caption" sx={{color: '#c62828'}}>
                    {overdue} Tag{overdue === 1 ? '' : 'e'} überfällig
                </Typography>
            </Box>
        );
    }
    const days = daysFromNow(dueISO);
    const dueLabel = days <= 0 ? 'heute fällig' : `in ${days} Tag${days === 1 ? '' : 'en'}`;
    return (
        <Box>
            <Typography sx={{fontSize: 13}}>{fmtDate(dueISO)}</Typography>
            <Typography variant="caption" color="text.secondary">
                {dueLabel}
            </Typography>
        </Box>
    );
}
