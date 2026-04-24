import {
    DEFAULT_LABEL_HEIGHT_MM,
    DEFAULT_LABEL_WIDTH_MM,
    MAX_LABEL_HEIGHT_MM,
    MAX_LABEL_WIDTH_MM,
    MIN_LABEL_HEIGHT_MM,
    MIN_LABEL_WIDTH_MM,
} from '../constants/labelConstants';
import {Box, Paper, Stack, Typography, useTheme} from '@mui/material';

type LabelDimensionControlsProps = {
    readonly labelWidth: number;
    readonly labelHeight: number;
    // eslint-disable-next-line no-unused-vars -- Parameters required for callback signature even if not used in type definition
    readonly onWidthChange: (width: number) => void;
    // eslint-disable-next-line no-unused-vars -- Parameters required for callback signature even if not used in type definition
    readonly onHeightChange: (height: number) => void;
};

export default function LabelDimensionControls({labelWidth, labelHeight, onWidthChange, onHeightChange}: LabelDimensionControlsProps) {
    const theme = useTheme();

    return (
        <Paper sx={{p: 2, backgroundColor: theme.palette.background.default}}>
            <Typography variant="subtitle2" sx={{mb: 2, fontWeight: 600}}>
                Etikett-Abmessungen
            </Typography>
            <Stack direction="row" spacing={3}>
                <Box sx={{flex: 1}}>
                    <Typography variant="body2" color="textSecondary" sx={{mb: 1}}>
                        Breite (mm)
                    </Typography>
                    <input
                        type="number"
                        min={MIN_LABEL_WIDTH_MM}
                        max={MAX_LABEL_WIDTH_MM}
                        value={labelWidth}
                        onChange={(e) => onWidthChange(Number.parseInt(e.target.value) || DEFAULT_LABEL_WIDTH_MM)}
                        style={{
                            width: '100%',
                            padding: '8px',
                            border: `1px solid ${theme.palette.divider}`,
                            borderRadius: `${theme.shape.borderRadius}px`,
                            fontSize: '14px',
                        }}
                    />
                </Box>
                <Box sx={{flex: 1}}>
                    <Typography variant="body2" color="textSecondary" sx={{mb: 1}}>
                        Höhe (mm)
                    </Typography>
                    <input
                        type="number"
                        min={MIN_LABEL_HEIGHT_MM}
                        max={MAX_LABEL_HEIGHT_MM}
                        value={labelHeight}
                        onChange={(e) => onHeightChange(Number.parseInt(e.target.value) || DEFAULT_LABEL_HEIGHT_MM)}
                        style={{
                            width: '100%',
                            padding: '8px',
                            border: `1px solid ${theme.palette.divider}`,
                            borderRadius: `${theme.shape.borderRadius}px`,
                            fontSize: '14px',
                        }}
                    />
                </Box>
            </Stack>
        </Paper>
    );
}
