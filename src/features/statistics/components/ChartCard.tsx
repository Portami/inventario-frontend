import type {SxProps} from '@mui/material';
import {Card, CardContent, Typography} from '@mui/material';
import type {ReactNode} from 'react';

interface ChartCardProps {
    title: string;
    subtitle?: string;
    children: ReactNode;
    sx?: SxProps;
}

export default function ChartCard({title, subtitle, children, sx}: Readonly<ChartCardProps>) {
    return (
        <Card variant="outlined" sx={{borderColor: 'rgba(0,0,0,0.08)', ...sx}}>
            <CardContent sx={{p: 3, '&:last-child': {pb: 3}}}>
                <Typography
                    sx={{
                        fontSize: 10.5,
                        fontWeight: 600,
                        letterSpacing: '0.06em',
                        textTransform: 'uppercase',
                        color: 'text.secondary',
                        mb: subtitle ? 0.25 : 2,
                    }}
                >
                    {title}
                </Typography>
                {subtitle && (
                    <Typography variant="body2" color="text.disabled" sx={{mb: 2, fontSize: 12}}>
                        {subtitle}
                    </Typography>
                )}
                {children}
            </CardContent>
        </Card>
    );
}
