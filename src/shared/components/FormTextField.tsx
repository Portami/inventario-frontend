import {TextField, TextFieldProps} from '@mui/material';

const labelProps = {sx: {fontWeight: 600}};

/**
 * TextField with the form defaults used across the app (outlined, small, full width,
 * bold input label). Any prop can be overridden by the caller; a caller-supplied
 * `slotProps.inputLabel` replaces the default label styling.
 */
export default function FormTextField({slotProps, ...props}: TextFieldProps) {
    return <TextField variant="outlined" size="small" fullWidth {...props} slotProps={{inputLabel: labelProps, ...slotProps}} />;
}
