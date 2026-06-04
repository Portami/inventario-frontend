import {fmtCHF, fmtNum, lineSubtotal, VAT_RATE} from '@/pages/constants/offerConstants';
import {LineItemDto} from '@/types/offerte';
import {Box, Card, CardContent, Divider, Stack, Typography, useTheme} from '@mui/material';

function TotalsRow({label, value, strong, muted}: Readonly<{label: string; value: string; strong?: boolean; muted?: boolean}>) {
    return (
        <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', py: 0.5}}>
            <Typography
                sx={{
                    fontSize: strong ? 14 : 13,
                    fontWeight: strong ? 600 : 400,
                    color: muted ? 'text.secondary' : 'text.primary',
                }}
            >
                {label}
            </Typography>
            <Typography
                sx={{
                    fontSize: strong ? 16 : 13,
                    fontWeight: strong ? 600 : 500,
                    fontVariantNumeric: 'tabular-nums',
                    color: muted ? 'text.secondary' : 'text.primary',
                }}
            >
                {value}
            </Typography>
        </Box>
    );
}

export default function TotalsCard({lines}: Readonly<{lines: LineItemDto[]}>) {
    const theme = useTheme();
    const primary = theme.palette.primary.main;
    const subtotal = lines.reduce((s, l) => s + lineSubtotal(l), 0);
    const cutTotal = lines.reduce((s, l) => s + l.cutSurcharge * l.quantity, 0);
    const discount = lines.reduce((s, l) => s + (l.discount ?? 0), 0);
    const vat = subtotal * VAT_RATE;
    const total = subtotal + vat;

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
                        mb: 1.5,
                    }}
                >
                    Zusammenfassung
                </Typography>
                <Stack divider={<Divider flexItem />}>
                    <Box sx={{pb: 1}}>
                        <TotalsRow label="Filz / Produkt netto" value={fmtCHF(subtotal - cutTotal + discount)} muted />
                        <TotalsRow label="Zuschnittpauschale" value={fmtCHF(cutTotal)} muted />
                        {discount > 0 && <TotalsRow label="Rabatt" value={`− ${fmtCHF(discount)}`} muted />}
                    </Box>
                    <Box sx={{py: 1}}>
                        <TotalsRow label="Zwischensumme" value={fmtCHF(subtotal)} strong />
                        <TotalsRow label={`MWST ${fmtNum(VAT_RATE * 100, 1)} %`} value={fmtCHF(vat)} muted />
                    </Box>
                    <Box sx={{pt: 1.5}}>
                        <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'baseline'}}>
                            <Typography sx={{fontSize: 15, fontWeight: 600}}>Gesamtbetrag</Typography>
                            <Typography
                                sx={{
                                    fontSize: 22,
                                    fontWeight: 700,
                                    color: primary,
                                    fontVariantNumeric: 'tabular-nums',
                                }}
                            >
                                {fmtCHF(total)}
                            </Typography>
                        </Box>
                        <Typography variant="caption" color="text.secondary">
                            inkl. MWST · CHF
                        </Typography>
                    </Box>
                </Stack>
            </CardContent>
        </Card>
    );
}
