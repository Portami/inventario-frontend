import OfferStateStepper from './OfferStateStepper';
import {fmtDate, OFFER_STATE_META} from '@/pages/constants/offerConstants';
import {OfferDto, OfferState} from '@/types/offerte';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import {Box, Button, Card, CardContent, Chip, Typography, useTheme} from '@mui/material';

interface OfferHeaderProps {
    offer: OfferDto;
    onChangeState: (key: OfferState) => void;
    onRegen: (doc: string) => void;
    onBack: () => void;
}

export default function OfferHeader({offer, onChangeState, onRegen, onBack}: OfferHeaderProps) {
    const theme = useTheme();
    const primary = theme.palette.primary.main;
    const currentIdx = offer.path.indexOf(offer.state);
    const nextKey = offer.path[currentIdx + 1] ?? null;
    const nextLabel = nextKey ? OFFER_STATE_META[nextKey].label : null;
    const currentDoc = OFFER_STATE_META[offer.state].doc;

    return (
        <Box sx={{mb: 3}}>
            <Box
                onClick={onBack}
                sx={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 1,
                    mb: 1,
                    color: 'text.secondary',
                    fontSize: 13,
                    cursor: 'pointer',
                }}
            >
                <ArrowBackIcon sx={{fontSize: 18}} />
                <Typography component="span" sx={{fontSize: 13}}>
                    Offerten
                </Typography>
                <Typography component="span" sx={{color: 'text.disabled'}}>
                    /
                </Typography>
                <Typography component="span" sx={{fontSize: 13}}>
                    {offer.number}
                </Typography>
            </Box>

            <Box sx={{display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 2, mb: 3}}>
                <Box>
                    <Box sx={{display: 'flex', alignItems: 'center', gap: 1.5}}>
                        <Typography variant="h5" sx={{fontWeight: 700, color: 'text.primary'}}>
                            Offerte {offer.number}
                        </Typography>
                        <Chip
                            size="small"
                            label={OFFER_STATE_META[offer.state].label}
                            sx={{
                                fontWeight: 600,
                                fontSize: 11.5,
                                height: 24,
                                bgcolor: `${primary}14`,
                                color: primary,
                                border: `1px solid ${primary}66`,
                            }}
                        />
                    </Box>
                    <Typography variant="body2" color="text.secondary" sx={{mt: 0.5}}>
                        Erstellt {fmtDate(offer.createdISO)} · {offer.customer.name} · {offer.lines.length} Position{offer.lines.length === 1 ? '' : 'en'}
                    </Typography>
                </Box>
                <Box sx={{display: 'flex', gap: 1, flexShrink: 0}}>
                    <Button
                        variant="outlined"
                        startIcon={<PictureAsPdfIcon sx={{fontSize: 18}} />}
                        onClick={() => onRegen(currentDoc)}
                        sx={{textTransform: 'none'}}
                    >
                        {currentDoc}
                    </Button>
                    {nextKey && (
                        <Button
                            variant="contained"
                            onClick={() => onChangeState(nextKey)}
                            endIcon={<ArrowForwardIcon sx={{fontSize: 18}} />}
                            sx={{textTransform: 'none', boxShadow: 'none', '&:hover': {boxShadow: 'none'}}}
                        >
                            Weiter zu {nextLabel}
                        </Button>
                    )}
                </Box>
            </Box>

            <Card variant="outlined" sx={{borderColor: 'rgba(0,0,0,0.08)'}}>
                <CardContent sx={{py: 2.5, px: 4}}>
                    <OfferStateStepper states={offer.path} currentKey={offer.state} onJump={onChangeState} />
                </CardContent>
            </Card>
        </Box>
    );
}
