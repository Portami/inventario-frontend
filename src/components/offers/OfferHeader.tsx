import OfferStateStepper from './OfferStateStepper';
import {fmtDate, OFFER_STATE, OFFER_STATE_META} from '@/pages/constants/offerConstants';
import {OfferDto, OfferState} from '@/types/offerte';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';
import EditIcon from '@mui/icons-material/EditOutlined';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import UndoIcon from '@mui/icons-material/Undo';
import {Box, Button, Card, CardContent, Chip, IconButton, Typography, useTheme} from '@mui/material';
import {useState} from 'react';

interface OfferHeaderProps {
    offer: OfferDto;
    onChangeState: (key: OfferState) => void;
    onRegen: (doc: string) => void;
    onBack: () => void;
    onEditDueDate?: (dueISO: string) => Promise<void>;
}

export default function OfferHeader({offer, onChangeState, onRegen, onBack, onEditDueDate}: OfferHeaderProps) {
    const theme = useTheme();
    const primary = theme.palette.primary.main;
    const [editingDue, setEditingDue] = useState(false);
    const currentIdx = offer.path.indexOf(offer.state);
    const nextKey = offer.path[currentIdx + 1] ?? null;
    const nextLabel = nextKey ? OFFER_STATE_META[nextKey].label : null;
    const currentDoc = OFFER_STATE_META[offer.state].doc;
    const isCompleted = offer.state === OFFER_STATE.COMPLETED;
    const prevKey = isCompleted && currentIdx > 0 ? offer.path[currentIdx - 1] : null;
    const payableStates: OfferState[] = [
        OFFER_STATE.INVOICE,
        OFFER_STATE.PAYMENT_REMINDER,
        OFFER_STATE.FIRST_DUNNING_NOTICE,
        OFFER_STATE.SECOND_DUNNING_NOTICE,
    ];
    const canMarkPaid = !isCompleted && payableStates.includes(offer.state) && nextKey !== OFFER_STATE.COMPLETED;

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
                    <Box sx={{display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5, flexWrap: 'wrap'}}>
                        <Typography variant="body2" color="text.secondary">
                            Erstellt {fmtDate(offer.createdISO)} · {offer.customer.name} · {offer.lines.length} Position{offer.lines.length === 1 ? '' : 'en'}
                        </Typography>
                        {offer.dueISO && !editingDue && (
                            <>
                                <Typography variant="body2" color="text.secondary">
                                    ·
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Fällig {fmtDate(offer.dueISO)}
                                </Typography>
                                {!isCompleted && onEditDueDate && (
                                    <IconButton size="small" onClick={() => setEditingDue(true)} sx={{p: 0.25}}>
                                        <EditIcon sx={{fontSize: 13}} />
                                    </IconButton>
                                )}
                            </>
                        )}
                        {editingDue && (
                            <input
                                type="date"
                                defaultValue={offer.dueISO}
                                autoFocus
                                onBlur={(e) => {
                                    if (e.target.value && onEditDueDate) {
                                        void onEditDueDate(e.target.value);
                                    }
                                    setEditingDue(false);
                                }}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') e.currentTarget.blur();
                                    if (e.key === 'Escape') setEditingDue(false);
                                }}
                                style={{
                                    fontSize: 13,
                                    borderRadius: 4,
                                    border: '1px solid rgba(0,0,0,0.23)',
                                    padding: '2px 6px',
                                    fontFamily: 'inherit',
                                    color: 'inherit',
                                }}
                            />
                        )}
                    </Box>
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
                    {isCompleted && prevKey && (
                        <Button
                            variant="outlined"
                            size="small"
                            onClick={() => onChangeState(prevKey)}
                            startIcon={<UndoIcon sx={{fontSize: 16}} />}
                            sx={{textTransform: 'none', color: 'text.secondary', borderColor: 'rgba(0,0,0,0.23)'}}
                        >
                            Abschluss rückgängig
                        </Button>
                    )}
                    {canMarkPaid && (
                        <Button
                            variant="outlined"
                            onClick={() => onChangeState(OFFER_STATE.COMPLETED)}
                            startIcon={<CheckCircleOutlinedIcon sx={{fontSize: 18}} />}
                            sx={{
                                textTransform: 'none',
                                color: OFFER_STATE_META.COMPLETED.color,
                                borderColor: `${OFFER_STATE_META.COMPLETED.color}66`,
                                '&:hover': {borderColor: OFFER_STATE_META.COMPLETED.color, bgcolor: OFFER_STATE_META.COMPLETED.bg},
                            }}
                        >
                            Als bezahlt markieren
                        </Button>
                    )}
                    {!isCompleted && nextKey && (
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
                    <OfferStateStepper states={offer.path} currentKey={offer.state} onJump={onChangeState} locked={isCompleted} />
                </CardContent>
            </Card>
        </Box>
    );
}
