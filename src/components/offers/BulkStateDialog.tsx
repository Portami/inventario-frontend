import {OFFER_STATE, OFFER_STATE_META} from '@/pages/constants/offerConstants';
import {OfferState} from '@/types/offerte';
import {Box, Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, Typography} from '@mui/material';
import {useState} from 'react';

interface Props {
    open: boolean;
    count: number;
    loading: boolean;
    onClose: () => void;
    onConfirm: (state: OfferState) => void;
}

const ALL_STATES = Object.values(OFFER_STATE) as OfferState[];

export default function BulkStateDialog({open, count, loading, onClose, onConfirm}: Readonly<Props>) {
    const [selected, setSelected] = useState<OfferState | null>(null);

    const handleClose = () => {
        setSelected(null);
        onClose();
    };

    const handleConfirm = () => {
        if (selected) onConfirm(selected);
    };

    return (
        <Dialog open={open} onClose={loading ? undefined : handleClose} maxWidth="xs" fullWidth>
            <DialogTitle sx={{pb: 1}}>
                Status für {count} Offerte{count === 1 ? '' : 'n'} setzen
            </DialogTitle>
            <DialogContent>
                <Typography variant="body2" color="text.secondary" sx={{mb: 2}}>
                    Wähle den Zielstatus für alle ausgewählten Offerten.
                </Typography>
                <Box sx={{display: 'flex', flexDirection: 'column', gap: 1}}>
                    {ALL_STATES.map((state) => {
                        const meta = OFFER_STATE_META[state];
                        const isSelected = selected === state;
                        return (
                            <Box
                                key={state}
                                onClick={() => !loading && setSelected(state)}
                                sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 1.5,
                                    px: 2,
                                    py: 1,
                                    borderRadius: 1,
                                    border: isSelected ? `2px solid ${meta.color}` : '2px solid rgba(0,0,0,0.08)',
                                    bgcolor: isSelected ? meta.bg : 'transparent',
                                    cursor: loading ? 'default' : 'pointer',
                                    transition: 'all 0.1s ease',
                                    '&:hover': loading ? {} : {bgcolor: meta.bg, borderColor: meta.color},
                                }}
                            >
                                <meta.Icon sx={{fontSize: 18, color: meta.color}} />
                                <Typography sx={{fontSize: 13, fontWeight: isSelected ? 600 : 400, color: isSelected ? meta.color : 'text.primary'}}>
                                    {meta.label}
                                </Typography>
                            </Box>
                        );
                    })}
                </Box>
            </DialogContent>
            <DialogActions sx={{px: 3, pb: 2.5}}>
                <Button onClick={handleClose} disabled={loading} sx={{textTransform: 'none'}}>
                    Abbrechen
                </Button>
                <Button
                    variant="contained"
                    disabled={!selected || loading}
                    onClick={handleConfirm}
                    startIcon={loading ? <CircularProgress size={14} color="inherit" /> : undefined}
                    sx={{textTransform: 'none', boxShadow: 'none', '&:hover': {boxShadow: 'none'}}}
                >
                    Übernehmen
                </Button>
            </DialogActions>
        </Dialog>
    );
}
