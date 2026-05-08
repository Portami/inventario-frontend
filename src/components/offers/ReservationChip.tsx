import {fmtDate, RESERVATION_DAYS, RESERVATION_KIND} from '@/pages/constants/offerConstants';
import {ReservationDto} from '@/types/offerte';
import BookmarkBorderOutlinedIcon from '@mui/icons-material/BookmarkBorderOutlined';
import LockClockOutlinedIcon from '@mui/icons-material/LockClockOutlined';
import {Chip, Tooltip, useTheme} from '@mui/material';

export default function ReservationChip({reservation}: {reservation: ReservationDto}) {
    const theme = useTheme();
    const primary = theme.palette.primary.main;

    if (reservation.kind === RESERVATION_KIND.RESERVED && reservation.untilISO) {
        return (
            <Tooltip title={`Reserviert bis ${fmtDate(reservation.untilISO)} · ${RESERVATION_DAYS} Tage ab Erstellung`} arrow>
                <Chip
                    size="small"
                    icon={<LockClockOutlinedIcon sx={{fontSize: '14px !important', ml: '6px !important'}} />}
                    label={`bis ${fmtDate(reservation.untilISO)}`}
                    sx={{
                        height: 22,
                        fontSize: 11,
                        fontWeight: 500,
                        bgcolor: `${primary}14`,
                        color: primary,
                        border: `1px solid ${primary}55`,
                        '& .MuiChip-icon': {color: primary},
                    }}
                />
            </Tooltip>
        );
    }

    return (
        <Tooltip title={`Markiert · ${reservation.sourceLabel ?? ''} · keine Reservation`} arrow>
            <Chip
                size="small"
                icon={<BookmarkBorderOutlinedIcon sx={{fontSize: '14px !important', ml: '6px !important'}} />}
                label="markiert"
                sx={{
                    height: 22,
                    fontSize: 11,
                    fontWeight: 500,
                    bgcolor: 'rgba(0,0,0,0.05)',
                    color: 'text.secondary',
                    border: '1px solid rgba(0,0,0,0.16)',
                }}
            />
        </Tooltip>
    );
}
