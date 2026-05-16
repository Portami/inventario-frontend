import {fmtCHF, fmtNum, lineSubtotal} from '@/pages/constants/offerConstants';
import {LineItemDto} from '@/types/offerte';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined';
import {Box, Button, Card, Divider, InputAdornment, TextField, Typography} from '@mui/material';

interface InvoicePreviewCardProps {
    lines: LineItemDto[];
    liefergebuehren: number;
    vatPct: number;
    onLiefergebuehrenChange: (v: number) => void;
    onVatPctChange: (v: number) => void;
    onGeneratePdf: () => void;
}

export default function InvoicePreviewCard({lines, liefergebuehren, vatPct, onLiefergebuehrenChange, onVatPctChange, onGeneratePdf}: InvoicePreviewCardProps) {
    const subtotal = lines.reduce((s, l) => s + lineSubtotal(l), 0);
    const vatAmount = (subtotal + liefergebuehren) * (vatPct / 100);
    const total = subtotal + liefergebuehren + vatAmount;

    return (
        <Card variant="outlined" sx={{borderColor: 'rgba(0,0,0,0.08)', overflow: 'hidden'}}>
            <Box
                sx={{
                    bgcolor: 'rgba(21, 101, 192, 0.06)',
                    borderBottom: '1px solid rgba(0,0,0,0.08)',
                    px: 3,
                    py: 1.5,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                }}
            >
                <ReceiptLongOutlinedIcon sx={{fontSize: 16, color: '#1565c0'}} />
                <Typography sx={{fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#1565c0'}}>
                    Rechnungsposten
                </Typography>
            </Box>

            <Box sx={{px: 3, pt: 2.5, pb: 2.5}}>
                <Box sx={{display: 'flex', flexDirection: 'column', gap: 1.5, mb: 2.5}}>
                    <Box sx={{display: 'flex', alignItems: 'center', gap: 1}}>
                        <Typography variant="body2" sx={{flex: 1, color: 'text.secondary'}}>
                            Liefergebühren
                        </Typography>
                        <TextField
                            size="small"
                            type="number"
                            value={liefergebuehren}
                            onChange={(e) => onLiefergebuehrenChange(Math.max(0, Number(e.target.value)))}
                            slotProps={{
                                input: {endAdornment: <InputAdornment position="end">CHF</InputAdornment>},
                                htmlInput: {min: 0, step: 0.5, style: {textAlign: 'right', width: 56}},
                            }}
                            sx={{'& .MuiOutlinedInput-root': {fontSize: 13}}}
                        />
                    </Box>
                    <Box sx={{display: 'flex', alignItems: 'center', gap: 1}}>
                        <Typography variant="body2" sx={{flex: 1, color: 'text.secondary'}}>
                            MWST
                        </Typography>
                        <TextField
                            size="small"
                            type="number"
                            value={vatPct}
                            onChange={(e) => onVatPctChange(Math.max(0, Math.min(100, Number(e.target.value))))}
                            slotProps={{
                                input: {endAdornment: <InputAdornment position="end">%</InputAdornment>},
                                htmlInput: {min: 0, max: 100, step: 0.1, style: {textAlign: 'right', width: 56}},
                            }}
                            sx={{'& .MuiOutlinedInput-root': {fontSize: 13}}}
                        />
                    </Box>
                </Box>

                <Divider sx={{mb: 2}} />

                <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', mb: 0.5}}>
                    <Typography variant="body2" color="text.secondary">
                        Zwischensumme
                    </Typography>
                    <Typography variant="body2" sx={{fontVariantNumeric: 'tabular-nums'}}>
                        {fmtCHF(subtotal)}
                    </Typography>
                </Box>
                {liefergebuehren > 0 && (
                    <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', mb: 0.5}}>
                        <Typography variant="body2" color="text.secondary">
                            Liefergebühren
                        </Typography>
                        <Typography variant="body2" sx={{fontVariantNumeric: 'tabular-nums'}}>
                            {fmtCHF(liefergebuehren)}
                        </Typography>
                    </Box>
                )}
                {vatAmount > 0 && (
                    <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', mb: 0.5}}>
                        <Typography variant="body2" color="text.secondary">
                            MWST ({fmtNum(vatPct, 1)} %)
                        </Typography>
                        <Typography variant="body2" sx={{fontVariantNumeric: 'tabular-nums'}}>
                            {fmtCHF(vatAmount)}
                        </Typography>
                    </Box>
                )}

                <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', mt: 1, mb: 2.5}}>
                    <Typography sx={{fontWeight: 600, fontSize: 14}}>Gesamtbetrag</Typography>
                    <Typography sx={{fontWeight: 700, fontSize: 20, color: '#1565c0', fontVariantNumeric: 'tabular-nums'}}>{fmtCHF(total)}</Typography>
                </Box>

                <Button
                    variant="contained"
                    fullWidth
                    startIcon={<PictureAsPdfIcon sx={{fontSize: 18}} />}
                    onClick={onGeneratePdf}
                    sx={{textTransform: 'none', boxShadow: 'none', '&:hover': {boxShadow: 'none'}}}
                >
                    Rechnung.pdf generieren
                </Button>
            </Box>
        </Card>
    );
}
