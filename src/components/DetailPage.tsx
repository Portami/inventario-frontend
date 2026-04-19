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
};

export default function DetailPage({title, isLoading, error, onBack, onErrorClose, children}: Readonly<DetailPageProps>) {
    return (
        <Box sx={{p: 3}}>
            <Stack spacing={3}>
                <Box>
                    <Button startIcon={<ArrowBackIcon />} onClick={onBack} variant="text" sx={{mb: 1, ml: -1}}>
                        Zurück
                    </Button>
                    <Typography variant="h3" component="h1">
                        {title}
                    </Typography>
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
