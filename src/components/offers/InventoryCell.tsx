import BookmarkBorderOutlinedIcon from '@mui/icons-material/BookmarkBorderOutlined';
import LockClockOutlinedIcon from '@mui/icons-material/LockClockOutlined';
import {Box, Chip, Tooltip, Typography, useTheme} from '@mui/material';

interface InventoryCellProps {
    reserved: number;
    tagged: number;
}

export default function InventoryCell({reserved, tagged}: InventoryCellProps) {
    const theme = useTheme();
    const primary = theme.palette.primary.main;

    if (!reserved && !tagged) {
        return (
            <Typography variant="caption" color="text.disabled">
                -
            </Typography>
        );
    }

    return (
        <Box sx={{display: 'flex', gap: 0.75, alignItems: 'center', flexWrap: 'wrap'}}>
            {reserved > 0 && (
                <Tooltip title={`${reserved} Reststück${reserved === 1 ? '' : 'e'} reserviert (10 Tage)`} arrow>
                    <Chip
                        size="small"
                        icon={<LockClockOutlinedIcon sx={{fontSize: '13px !important', ml: '4px !important', color: `${primary} !important`}} />}
                        label={reserved}
                        sx={{
                            height: 20,
                            fontSize: 11,
                            fontWeight: 600,
                            bgcolor: `${primary}14`,
                            color: primary,
                            border: `1px solid ${primary}55`,
                            '& .MuiChip-label': {px: 0.75},
                        }}
                    />
                </Tooltip>
            )}
            {tagged > 0 && (
                <Tooltip title={`${tagged} Rolle${tagged === 1 ? '' : 'n'} markiert`} arrow>
                    <Chip
                        size="small"
                        icon={<BookmarkBorderOutlinedIcon sx={{fontSize: '13px !important', ml: '4px !important'}} />}
                        label={tagged}
                        sx={{
                            height: 20,
                            fontSize: 11,
                            fontWeight: 600,
                            bgcolor: 'rgba(0,0,0,0.05)',
                            color: 'text.secondary',
                            border: '1px solid rgba(0,0,0,0.16)',
                            '& .MuiChip-label': {px: 0.75},
                        }}
                    />
                </Tooltip>
            )}
        </Box>
    );
}
