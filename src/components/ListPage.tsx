/**
 * Generic List Page Component
 * Provides consistent structure for pages displaying lists with delete functionality
 */

import {Alert, Box, CircularProgress, Stack, Typography} from '@mui/material';
import {ReactNode} from 'react';

type ListPageProps = {
    readonly title: string;
    readonly description?: string;
    readonly actions?: ReactNode;
    readonly isLoading: boolean;
    readonly isEmpty: boolean;
    readonly emptyMessage?: string;
    readonly error: string;
    readonly onErrorClose: () => void;
    readonly children: ReactNode;
};

export default function ListPage({
    title,
    description,
    actions,
    isLoading,
    isEmpty,
    emptyMessage = 'Keine Elemente gefunden',
    error,
    onErrorClose,
    children,
}: Readonly<ListPageProps>) {
    return (
        <Box sx={{p: 3}}>
            <Stack spacing={3}>
                {/* Header */}
                <Box sx={{display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between'}}>
                    <Box>
                        <Typography variant="h3" component="h1" sx={{mb: 1}}>
                            {title}
                        </Typography>
                        {description && (
                            <Typography variant="body1" color="textSecondary">
                                {description}
                            </Typography>
                        )}
                    </Box>
                    {actions && <Box>{actions}</Box>}
                </Box>

                {/* Error Alert */}
                {error && (
                    <Alert severity="error" onClose={onErrorClose}>
                        {error}
                    </Alert>
                )}

                {/* Loading State */}
                {isLoading && (
                    <Box sx={{display: 'flex', justifyContent: 'center', py: 4}}>
                        <CircularProgress />
                    </Box>
                )}

                {/* Empty State */}
                {!isLoading && isEmpty && <Alert severity="info">{emptyMessage}</Alert>}

                {/* Content */}
                {!isLoading && !isEmpty && children}
            </Stack>
        </Box>
    );
}
