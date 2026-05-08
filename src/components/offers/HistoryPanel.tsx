import {HistoryEntry} from '@/types/offerte';
import {Box, Card, CardContent, Stack, Typography, useTheme} from '@mui/material';

export default function HistoryPanel({history}: {history: HistoryEntry[]}) {
    const theme = useTheme();
    const primary = theme.palette.primary.main;
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
                        mb: 2,
                    }}
                >
                    Verlauf
                </Typography>
                {history.length === 0 && (
                    <Typography variant="body2" color="text.secondary">
                        Kein Verlauf vorhanden.
                    </Typography>
                )}
                <Stack spacing={2}>
                    {history.map((h, i) => (
                        <Box key={i} sx={{display: 'flex', gap: 1.5}}>
                            <Box sx={{width: 8, mt: '6px', position: 'relative', flexShrink: 0}}>
                                <Box
                                    sx={{
                                        width: 8,
                                        height: 8,
                                        borderRadius: '50%',
                                        bgcolor: i === 0 ? primary : 'rgba(0,0,0,0.16)',
                                    }}
                                />
                                {i < history.length - 1 && (
                                    <Box
                                        sx={{
                                            position: 'absolute',
                                            top: 12,
                                            left: 3.5,
                                            bottom: -16,
                                            width: 1,
                                            bgcolor: 'rgba(0,0,0,0.08)',
                                        }}
                                    />
                                )}
                            </Box>
                            <Box sx={{minWidth: 0, pb: 1}}>
                                <Typography sx={{fontSize: 13}}>{h.what}</Typography>
                                <Typography variant="caption" color="text.secondary">
                                    {h.who} · {h.ts}
                                </Typography>
                            </Box>
                        </Box>
                    ))}
                </Stack>
            </CardContent>
        </Card>
    );
}
