import {Box, Typography} from '@mui/material';

interface LabeledFieldProps {
    label: string;
    value: string | null;
    mono?: boolean;
}

export default function LabeledField({label, value, mono}: LabeledFieldProps) {
    return (
        <Box>
            <Typography
                sx={{
                    fontSize: 10.5,
                    fontWeight: 600,
                    letterSpacing: '0.06em',
                    textTransform: 'uppercase',
                    color: 'text.secondary',
                    mb: 0.25,
                }}
            >
                {label}
            </Typography>
            <Typography sx={{fontSize: 14, fontFamily: mono ? "'JetBrains Mono', monospace" : 'inherit'}}>
                {value ?? <span style={{color: 'rgba(0,0,0,0.38)'}}>–</span>}
            </Typography>
        </Box>
    );
}
