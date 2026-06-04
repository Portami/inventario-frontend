import OfferFlowDiagram from './OfferFlowDiagram';
import {fmtDate, OFFER_CLOSE_STATES, OFFER_STATE, OFFER_STATE_META, OFFER_TRANSITIONS} from '@/pages/constants/offerConstants';
import {OfferDto, OfferState} from '@/types/offerte';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';
import EditIcon from '@mui/icons-material/EditOutlined';
import MarkEmailReadOutlinedIcon from '@mui/icons-material/MarkEmailReadOutlined';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import SendOutlinedIcon from '@mui/icons-material/SendOutlined';
import UndoIcon from '@mui/icons-material/Undo';
import {Box, Button, Card, CardContent, Chip, Divider, IconButton, Typography} from '@mui/material';
import {useState} from 'react';

interface OfferHeaderProps {
    offer: OfferDto;
    prevState: OfferState | null;
    onChangeState: (key: OfferState) => void;
    onRegen?: (doc: string) => void;
    onBack: () => void;
    onEditDueDate?: (dueISO: string) => Promise<void>;
    onToggleSent?: () => void;
}

export default function OfferHeader({offer, prevState, onChangeState, onRegen, onBack, onEditDueDate, onToggleSent}: OfferHeaderProps) {
    const [editingDue, setEditingDue] = useState(false);

    const isCompleted = offer.state === OFFER_STATE.COMPLETED;
    const currentDoc = OFFER_STATE_META[offer.state].doc;
    const stateMeta = OFFER_STATE_META[offer.state];

    const transitions = OFFER_TRANSITIONS[offer.state];
    const forwardStates = transitions.filter((s) => s !== OFFER_STATE.COMPLETED);
    const canMarkPaid = transitions.includes(OFFER_STATE.COMPLETED);

    return (
        <Box sx={{mb: 3}}>
            {/* Breadcrumb */}
            <Box
                onClick={onBack}
                sx={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 0.75,
                    mb: 1.5,
                    color: 'text.disabled',
                    fontSize: 13,
                    cursor: 'pointer',
                    '&:hover': {color: 'text.secondary'},
                }}
            >
                <ArrowBackIcon sx={{fontSize: 16}} />
                <Typography component="span" sx={{fontSize: 13}}>
                    Offerten
                </Typography>
                <Typography component="span" sx={{color: 'text.disabled', mx: 0.25}}>
                    /
                </Typography>
                <Typography component="span" sx={{fontSize: 13, color: 'text.secondary'}}>
                    {offer.number}
                </Typography>
            </Box>

            {/* Title + metadata */}
            <Box sx={{display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.5, flexWrap: 'wrap'}}>
                <Typography variant="h5" sx={{fontWeight: 700, color: 'text.primary'}}>
                    Offerte {offer.number}
                </Typography>
                <Chip
                    size="small"
                    label={stateMeta.label}
                    sx={{
                        fontWeight: 600,
                        fontSize: 11.5,
                        height: 22,
                        bgcolor: `${stateMeta.color}14`,
                        color: stateMeta.color,
                        border: `1px solid ${stateMeta.color}55`,
                    }}
                />
            </Box>
            <Box sx={{display: 'flex', alignItems: 'center', gap: 0.5, mb: 2.5, flexWrap: 'wrap'}}>
                <Typography variant="body2" color="text.secondary">
                    Erstellt {fmtDate(offer.createdISO)} · {offer.customer.name} · {offer.lines.length} Position{offer.lines.length === 1 ? '' : 'en'}
                </Typography>
                {offer.dueISO && !editingDue && (
                    <>
                        <Typography variant="body2" color="text.disabled">
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
                            if (e.target.value && onEditDueDate) void onEditDueDate(e.target.value);
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

            {/* Status card: diagram + actions */}
            <Card variant="outlined" sx={{borderColor: 'rgba(0,0,0,0.08)'}}>
                <CardContent sx={{py: 2.5, px: 3, '&:last-child': {pb: 2}}}>
                    {/* Flow diagram — topmost */}
                    <OfferFlowDiagram visitedPath={offer.path} currentState={offer.state} />

                    <Divider sx={{my: 2}} />

                    {/* Action bar */}
                    <Box sx={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2}}>
                        {/* Left: back / undo */}
                        <Box sx={{minWidth: 0}}>
                            {prevState ? (
                                <Button
                                    size="small"
                                    startIcon={<UndoIcon sx={{fontSize: 15}} />}
                                    onClick={() => onChangeState(prevState)}
                                    sx={{textTransform: 'none', color: 'text.secondary', fontWeight: 500, px: 1}}
                                >
                                    {isCompleted ? 'Abschluss rückgängig' : `Zurück zu ${OFFER_STATE_META[prevState].label}`}
                                </Button>
                            ) : (
                                <Box /> /* placeholder to keep flex layout */
                            )}
                        </Box>

                        {/* Right: secondary + primary actions */}
                        <Box sx={{display: 'flex', gap: 1, alignItems: 'center', flexShrink: 0, flexWrap: 'wrap', justifyContent: 'flex-end'}}>
                            {/* PDF */}
                            {onRegen && (
                                <Button
                                    variant="outlined"
                                    size="small"
                                    startIcon={<PictureAsPdfIcon sx={{fontSize: 16}} />}
                                    onClick={() => onRegen(currentDoc)}
                                    sx={{textTransform: 'none', color: 'text.secondary', borderColor: 'rgba(0,0,0,0.23)'}}
                                >
                                    {currentDoc}
                                </Button>
                            )}

                            {/* Sent toggle */}
                            {!isCompleted &&
                                onToggleSent &&
                                (offer.offerSent ? (
                                    <Chip
                                        icon={<MarkEmailReadOutlinedIcon sx={{fontSize: 15}} />}
                                        label="Gesendet"
                                        size="small"
                                        onClick={onToggleSent}
                                        sx={{
                                            fontWeight: 600,
                                            fontSize: 11.5,
                                            height: 28,
                                            cursor: 'pointer',
                                            color: 'success.dark',
                                            bgcolor: '#f0faf0',
                                            border: '1px solid',
                                            borderColor: '#a5d6a7',
                                        }}
                                    />
                                ) : (
                                    <Button
                                        variant="outlined"
                                        size="small"
                                        startIcon={<SendOutlinedIcon sx={{fontSize: 15}} />}
                                        onClick={onToggleSent}
                                        sx={{textTransform: 'none', color: 'text.secondary', borderColor: 'rgba(0,0,0,0.23)'}}
                                    >
                                        Als gesendet markieren
                                    </Button>
                                ))}

                            {/* Mark as paid */}
                            {canMarkPaid && (
                                <Button
                                    variant="outlined"
                                    size="small"
                                    startIcon={<CheckCircleOutlinedIcon sx={{fontSize: 16}} />}
                                    onClick={() => onChangeState(OFFER_STATE.COMPLETED)}
                                    sx={{
                                        textTransform: 'none',
                                        color: OFFER_STATE_META.COMPLETED.color,
                                        borderColor: `${OFFER_STATE_META.COMPLETED.color}55`,
                                        '&:hover': {
                                            borderColor: OFFER_STATE_META.COMPLETED.color,
                                            bgcolor: OFFER_STATE_META.COMPLETED.bg,
                                        },
                                    }}
                                >
                                    Als bezahlt markieren
                                </Button>
                            )}

                            {/* Close-state buttons (Absage / Keine Rückmeldung) — only from OFFER */}
                            {offer.state === OFFER_STATE.OFFER &&
                                OFFER_CLOSE_STATES.map((key) => {
                                    const m = OFFER_STATE_META[key];
                                    return (
                                        <Button
                                            key={key}
                                            variant="outlined"
                                            size="small"
                                            startIcon={<m.Icon sx={{fontSize: 16}} />}
                                            onClick={() => onChangeState(key)}
                                            sx={{
                                                textTransform: 'none',
                                                color: m.color,
                                                borderColor: `${m.color}55`,
                                                '&:hover': {borderColor: m.color, bgcolor: m.bg},
                                            }}
                                        >
                                            {m.label}
                                        </Button>
                                    );
                                })}

                            {/* Forward transitions */}
                            {forwardStates.map((key) => (
                                <Button
                                    key={key}
                                    variant="contained"
                                    size="small"
                                    onClick={() => onChangeState(key)}
                                    endIcon={<ArrowForwardIcon sx={{fontSize: 16}} />}
                                    sx={{textTransform: 'none', boxShadow: 'none', '&:hover': {boxShadow: 'none'}}}
                                >
                                    Weiter zu {OFFER_STATE_META[key].label}
                                </Button>
                            ))}
                        </Box>
                    </Box>
                </CardContent>
            </Card>
        </Box>
    );
}
