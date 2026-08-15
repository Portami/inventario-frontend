import {Box, Card, CardContent, Typography, useTheme} from '@mui/material';

interface StatTileProps {
    label: string;
    value: number | string;
    sub?: string;
    color?: string;
    active: boolean;
    onClick: () => void;
}

export default function StatTile({label, value, sub, color, active, onClick}: Readonly<StatTileProps>) {
    const theme = useTheme();
    const primary = theme.palette.primary.main;
    return (
        <Card
            variant="outlined"
            onClick={onClick}
            sx={{
                cursor: 'pointer',
                borderColor: active ? primary : 'rgba(0,0,0,0.08)',
                borderWidth: active ? '1.5px' : '1px',
                transition: 'all .15s',
                bgcolor: active ? `${primary}08` : 'transparent',
                '&:hover': {borderColor: primary, bgcolor: `${primary}06`},
            }}
        >
            <CardContent sx={{p: 2.5, '&:last-child': {pb: 2.5}}}>
                <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1}}>
                    <Typography
                        sx={{
                            fontSize: 11,
                            fontWeight: 600,
                            letterSpacing: '0.05em',
                            textTransform: 'uppercase',
                            color: 'text.secondary',
                        }}
                    >
                        {label}
                    </Typography>
                    {color && <Box sx={{width: 8, height: 8, borderRadius: '50%', bgcolor: color, mt: 0.5}} />}
                </Box>
                <Typography
                    sx={{
                        fontSize: 28,
                        fontWeight: 700,
                        lineHeight: 1.1,
                        color: active ? primary : 'text.primary',
                        fontVariantNumeric: 'tabular-nums',
                    }}
                >
                    {value}
                </Typography>
                {sub && (
                    <Typography variant="caption" color="text.secondary" sx={{display: 'block', mt: 0.5}}>
                        {sub}
                    </Typography>
                )}
            </CardContent>
        </Card>
    );
}
