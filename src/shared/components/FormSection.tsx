import {Divider, Grid, Typography} from '@mui/material';
import {SxProps, Theme} from '@mui/material/styles';

type FormSectionProps = {
    readonly label: string;
    readonly dividerSx?: SxProps<Theme>;
};

/** A full-width section header (divider + overline label) for use inside a FormDialog grid. */
export default function FormSection({label, dividerSx}: FormSectionProps) {
    return (
        <Grid size={12}>
            <Divider sx={dividerSx} />
            <Typography variant="overline" sx={{display: 'block', mt: 2, mb: 0.5, color: 'text.secondary'}}>
                {label}
            </Typography>
        </Grid>
    );
}
