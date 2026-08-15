/**
 * Generic Detail Page Component
 * Provides consistent structure for detail/view pages
 */

import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import {Alert, Box, Button, CircularProgress, Stack, Typography} from '@mui/material';
import {ReactNode} from 'react';

type DetailPageProps = {
    readonly title: string;
    readonly isLoading: boolean;
    readonly error: string;
    readonly onBack: () => void;
    readonly onErrorClose?: () => void;
    readonly children: ReactNode;
    readonly actions?: ReactNode;
};

export default function DetailPage({title, isLoading, error, onBack, onErrorClose, children, actions}: Readonly<DetailPageProps>) {
    return (
        <Box sx={{p: 3}}>
            <Stack spacing={3}>
                <Box>
                    <Button startIcon={<ArrowBackIcon />} onClick={onBack} variant="text" sx={{mb: 1, ml: -1}}>
                        Zurück
                    </Button>
                    <Box sx={{display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 2}}>
                        <Typography variant="h3" component="h1">
                            {title}
                        </Typography>
                        {actions && <Box sx={{flexShrink: 0}}>{actions}</Box>}
                    </Box>
                </Box>

                {error && (
                    <Alert severity="error" onClose={onErrorClose}>
                        {error}
                    </Alert>
                )}

                {isLoading && (
                    <Box sx={{display: 'flex', justifyContent: 'center', py: 4}}>
                        <CircularProgress />
                    </Box>
                )}

                {/* Content */}
                {!isLoading && children}
            </Stack>
        </Box>
    );
}
