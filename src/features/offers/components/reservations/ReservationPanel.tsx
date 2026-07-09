import {fmtDate, RESERVATION_DAYS, RESERVATION_KIND} from '@/pages/constants/offerConstants';
import {LineItemDto} from '@/types/offerte';
import BookmarkBorderOutlinedIcon from '@mui/icons-material/BookmarkBorderOutlined';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import LayersOutlinedIcon from '@mui/icons-material/LayersOutlined';
import LockClockOutlinedIcon from '@mui/icons-material/LockClockOutlined';
import {Box, Card, CardContent, Divider, Stack, Typography, useTheme} from '@mui/material';
import React from 'react';

function ReservationItem({title, sub, icon, color}: Readonly<{title: string; sub: string; icon: React.ReactNode; color: string}>) {
    return (
        <Box sx={{display: 'flex', gap: 1.5, alignItems: 'flex-start', py: 1}}>
            <Box
                sx={{
                    width: 28,
                    height: 28,
                    borderRadius: 1,
                    flexShrink: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: `${color}14`,
                    color,
                }}
            >
                {icon}
            </Box>
            <Box sx={{minWidth: 0}}>
                <Typography sx={{fontSize: 13, fontWeight: 500}}>{title}</Typography>
                <Typography variant="caption" color="text.secondary" sx={{display: 'block'}}>
                    {sub}
                </Typography>
            </Box>
        </Box>
    );
}

export default function ReservationPanel({lines}: Readonly<{lines: LineItemDto[]}>) {
    const theme = useTheme();
    const primary = theme.palette.primary.main;
    const reserved = lines.filter((l) => l.reservation?.kind === RESERVATION_KIND.RESERVED);
    const tagged = lines.filter((l) => l.reservation?.kind === RESERVATION_KIND.TAGGED);

    return (
        <Card variant="outlined" sx={{borderColor: 'rgba(0,0,0,0.08)'}}>
            <CardContent sx={{p: 3}}>
                <Typography
                    sx={{
                        fontSize: 11,
                        fontWeight: 600,
                        letterSpacing: '0.05em',
                        textTransform: 'uppercase',
                        color: 'text.secondary',
                        mb: 1,
                    }}
                >
                    Lagerstatus
                </Typography>
                <Stack divider={<Divider flexItem />} spacing={0}>
                    {reserved.length > 0 && (
                        <Box sx={{py: 1}}>
                            <Box sx={{display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5}}>
                                <LockClockOutlinedIcon sx={{fontSize: 14, color: primary}} />
                                <Typography sx={{fontSize: 12, fontWeight: 600, color: primary}}>
                                    {reserved.length} Reststück{reserved.length === 1 ? '' : 'e'} reserviert
                                </Typography>
                            </Box>
                            {reserved.map((l) => (
                                <ReservationItem
                                    key={l.id}
                                    title={`${l.feltTypeName} · ${l.color}`}
                                    sub={`bis ${fmtDate(l.reservation!.untilISO!)} · ${l.articleNumber}`}
                                    icon={<LayersOutlinedIcon sx={{fontSize: 16}} />}
                                    color={primary}
                                />
                            ))}
                        </Box>
                    )}
                    {tagged.length > 0 && (
                        <Box sx={{py: 1}}>
                            <Box sx={{display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5}}>
                                <BookmarkBorderOutlinedIcon sx={{fontSize: 14, color: 'text.secondary'}} />
                                <Typography sx={{fontSize: 12, fontWeight: 600, color: 'text.secondary'}}>
                                    {tagged.length} Rolle{tagged.length === 1 ? '' : 'n'} markiert
                                </Typography>
                            </Box>
                            {tagged.map((l) => (
                                <ReservationItem
                                    key={l.id}
                                    title={`${l.feltTypeName} · ${l.color}`}
                                    sub={`${l.reservation!.sourceLabel} · keine Reservation`}
                                    icon={<Inventory2OutlinedIcon sx={{fontSize: 16}} />}
                                    color="#1565c0"
                                />
                            ))}
                        </Box>
                    )}
                    {reserved.length === 0 && tagged.length === 0 && (
                        <Typography variant="body2" color="text.secondary" sx={{py: 1}}>
                            Keine Lagerbindungen.
                        </Typography>
                    )}
                </Stack>
                <Box sx={{mt: 1, pt: 2, borderTop: '1px dashed rgba(0,0,0,0.08)'}}>
                    <Typography variant="caption" color="text.secondary">
                        Reststücke werden für {RESERVATION_DAYS} Tage reserviert. Rollen werden lediglich markiert und bleiben verkäuflich. Reststücke haben
                        Vorrang.
                    </Typography>
                </Box>
            </CardContent>
        </Card>
    );
}
