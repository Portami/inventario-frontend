import {daysFromNow, fmtCHF, fmtDate, lineSubtotal, OFFER_STATE_META} from '@/pages/constants/offerConstants';
import {OfferDto} from '@/types/offerte';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import PhoneOutlinedIcon from '@mui/icons-material/PhoneOutlined';
import PictureAsPdfOutlinedIcon from '@mui/icons-material/PictureAsPdfOutlined';
import {Box, Button, Card, Divider, Typography} from '@mui/material';

type DunningState = 'PAYMENT_REMINDER' | 'FIRST_DUNNING_NOTICE' | 'SECOND_DUNNING_NOTICE';

interface Props {
    offer: OfferDto;
    state: DunningState;
    onGeneratePdf: () => void;
}

const LATE_FEE = 30;

export default function DunningSidebarCard({offer, state, onGeneratePdf}: Props) {
    const meta = OFFER_STATE_META[state];
    const color = meta.color;
    const subtotal = offer.lines.reduce((s, l) => s + lineSubtotal(l), 0);
    const isSecondDunning = state === 'SECOND_DUNNING_NOTICE';
    const total = isSecondDunning ? subtotal + LATE_FEE : subtotal;

    const daysOverdue = offer.dueISO ? Math.max(0, Math.round(-daysFromNow(offer.dueISO))) : 0;

    return (
        <Card variant="outlined" sx={{borderRadius: 2, overflow: 'hidden'}}>
            {/* Header bar */}
            <Box
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    px: 2,
                    py: 1.5,
                    bgcolor: `${color}0f`,
                    borderBottom: `1px solid ${color}30`,
                }}
            >
                {meta.Icon && <meta.Icon sx={{fontSize: 18, color}} />}
                <Typography sx={{fontSize: 12, fontWeight: 700, letterSpacing: 0.8, color, textTransform: 'uppercase'}}>{meta.label}</Typography>
            </Box>

            <Box sx={{px: 2.5, py: 2.5, display: 'flex', flexDirection: 'column', gap: 2.5}}>
                {/* Days overdue */}
                <Box>
                    <Typography sx={{fontSize: 11, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: 0.5, mb: 0.5}}>
                        Überfällig seit
                    </Typography>
                    <Typography sx={{fontSize: 36, fontWeight: 800, color, lineHeight: 1}}>{daysOverdue}</Typography>
                    <Typography sx={{fontSize: 12, color, mb: 0.5}}>Tagen</Typography>
                    {offer.dueISO && <Typography sx={{fontSize: 11, color: 'text.secondary'}}>Fällig war: {fmtDate(offer.dueISO)}</Typography>}
                </Box>

                <Divider />

                {/* Amount due */}
                <Box>
                    <Typography sx={{fontSize: 11, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: 0.5, mb: 0.75}}>
                        Ausstehender Betrag
                    </Typography>
                    <Box sx={{display: 'flex', justifyContent: 'space-between', mb: 0.25}}>
                        <Typography sx={{fontSize: 12, color: 'text.secondary'}}>Rechnungsbetrag</Typography>
                        <Typography sx={{fontSize: 12, fontVariantNumeric: 'tabular-nums', color: 'text.secondary'}}>{fmtCHF(subtotal)}</Typography>
                    </Box>
                    {isSecondDunning && (
                        <Box sx={{display: 'flex', justifyContent: 'space-between', mb: 0.25}}>
                            <Typography sx={{fontSize: 12, color: 'text.secondary'}}>Mahngebühren</Typography>
                            <Typography sx={{fontSize: 12, fontVariantNumeric: 'tabular-nums', color: 'text.secondary'}}>{fmtCHF(LATE_FEE)}</Typography>
                        </Box>
                    )}
                    <Box sx={{display: 'flex', justifyContent: 'space-between', pt: 0.5, borderTop: '1px solid rgba(0,0,0,0.08)'}}>
                        <Typography sx={{fontSize: 13, fontWeight: 700}}>Total</Typography>
                        <Typography sx={{fontSize: 13, fontWeight: 700, fontVariantNumeric: 'tabular-nums', color}}>{fmtCHF(total)}</Typography>
                    </Box>
                </Box>

                <Divider />

                {/* Customer contact */}
                <Box>
                    <Typography sx={{fontSize: 11, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: 0.5, mb: 1}}>Kundenkontakt</Typography>
                    <Box sx={{display: 'flex', flexDirection: 'column', gap: 0.75}}>
                        {offer.customer.phone && (
                            <Box
                                component="a"
                                href={`tel:${offer.customer.phone}`}
                                sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 1,
                                    px: 1.5,
                                    py: 0.75,
                                    border: '1px solid rgba(0,0,0,0.15)',
                                    borderRadius: 1,
                                    textDecoration: 'none',
                                    color: 'text.primary',
                                    fontSize: 12,
                                    '&:hover': {bgcolor: 'action.hover'},
                                }}
                            >
                                <PhoneOutlinedIcon sx={{fontSize: 15, color: 'text.secondary'}} />
                                {offer.customer.phone}
                            </Box>
                        )}
                        {offer.customer.email && (
                            <Box
                                component="a"
                                href={`mailto:${offer.customer.email}`}
                                sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 1,
                                    px: 1.5,
                                    py: 0.75,
                                    border: '1px solid rgba(0,0,0,0.15)',
                                    borderRadius: 1,
                                    textDecoration: 'none',
                                    color: 'text.primary',
                                    fontSize: 12,
                                    '&:hover': {bgcolor: 'action.hover'},
                                }}
                            >
                                <EmailOutlinedIcon sx={{fontSize: 15, color: 'text.secondary'}} />
                                {offer.customer.email}
                            </Box>
                        )}
                    </Box>
                </Box>

                {/* PDF button */}
                <Button
                    variant="contained"
                    fullWidth
                    startIcon={<PictureAsPdfOutlinedIcon />}
                    onClick={onGeneratePdf}
                    sx={{
                        textTransform: 'none',
                        boxShadow: 'none',
                        bgcolor: color,
                        '&:hover': {bgcolor: color, filter: 'brightness(0.88)', boxShadow: 'none'},
                    }}
                >
                    {meta.doc} generieren
                </Button>
            </Box>
        </Card>
    );
}
