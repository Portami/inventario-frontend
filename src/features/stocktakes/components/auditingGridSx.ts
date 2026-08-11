import {PROBLEM_STATE_COLORS} from '@/features/stocktakes/types';
import {SxProps, Theme} from '@mui/material/styles';

/** Shared DataGrid styling for the stocktake auditing lists: row cursor, bold status cell, and per-problem-state row colors. */
export const auditingGridSx: SxProps<Theme> = {
    '& .MuiDataGrid-row': {
        cursor: 'pointer',
    },
    '& .bold-cell': {
        fontWeight: 700,
    },
    '& .row-resolved': {
        backgroundColor: '#e8f5e9',
    },
    '& .row-resolved:hover': {
        backgroundColor: '#e8f5e9',
    },
    ...Object.entries(PROBLEM_STATE_COLORS).reduce(
        (styles, [state, colors]) => ({
            ...styles,
            [`& .row-state-${state}`]: {
                backgroundColor: colors.backgroundColor,
                color: colors.color,
            },
            [`& .row-state-${state}:hover`]: {
                backgroundColor: colors.backgroundColor,
            },
        }),
        {},
    ),
};
