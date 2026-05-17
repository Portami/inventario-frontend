import {Avatar, Box, Typography, useTheme} from '@mui/material';

interface CustomerCellProps {
    customer: string;
    contact: string;
    city: string;
}

export default function CustomerCell({customer, contact, city}: CustomerCellProps) {
    const theme = useTheme();
    const primary = theme.palette.primary.main;
    const initials = customer
        .split(/\s+/)
        .slice(0, 2)
        .map((s) => s[0])
        .join('')
        .toUpperCase();
    return (
        <Box sx={{display: 'flex', alignItems: 'center', gap: 1.5}}>
            <Avatar sx={{bgcolor: `${primary}14`, color: primary, width: 32, height: 32, fontSize: 12, fontWeight: 600}}>{initials}</Avatar>
            <Box sx={{minWidth: 0}}>
                <Typography
                    sx={{
                        fontSize: 13.5,
                        fontWeight: 500,
                        lineHeight: 1.2,
                        whiteSpace: 'nowrap',
                        textOverflow: 'ellipsis',
                        overflow: 'hidden',
                    }}
                >
                    {customer}
                </Typography>
                <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{
                        display: 'block',
                        whiteSpace: 'nowrap',
                        textOverflow: 'ellipsis',
                        overflow: 'hidden',
                    }}
                >
                    {contact} · {city}
                </Typography>
            </Box>
        </Box>
    );
}
