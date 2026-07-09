import {daysFromNow, fmtDate, OFFER_STATE} from '@/features/offers/constants';
import {OfferState} from '@/features/offers/types';
import {Box, Typography} from '@mui/material';

interface DueCellProps {
    dueISO: string;
    overdue: number;
    state: OfferState;
}

export default function DueCell({dueISO, overdue, state}: Readonly<DueCellProps>) {
    if (state === OFFER_STATE.COMPLETED) {
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
    const dayPlural = days === 1 ? '' : 'en';
    const dueLabel = days <= 0 ? 'heute fällig' : `in ${days} Tag${dayPlural}`;
    return (
        <Box>
            <Typography sx={{fontSize: 13}}>{fmtDate(dueISO)}</Typography>
            <Typography variant="caption" color="text.secondary">
                {dueLabel}
            </Typography>
        </Box>
    );
}
