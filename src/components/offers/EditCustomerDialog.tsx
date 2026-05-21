import {CustomerDto} from '@/types/offerte';
import CloseIcon from '@mui/icons-material/Close';
import {Box, Button, CircularProgress, Dialog, DialogContent, DialogTitle, Divider, Grid, IconButton, MenuItem, TextField, Typography} from '@mui/material';
import {ChangeEvent, useEffect, useState} from 'react';

const COUNTRIES = [
    {code: 'CH', label: 'Schweiz'},
    {code: 'DE', label: 'Deutschland'},
    {code: 'IT', label: 'Italien'},
    {code: 'FR', label: 'Frankreich'},
    {code: 'AT', label: 'Österreich'},
] as const;

const VALID_CODES = COUNTRIES.map((c) => c.code) as string[];

interface Props {
    open: boolean;
    customer: CustomerDto;
    onClose: () => void;
    onSave: (changes: Partial<CustomerDto>) => Promise<void>;
}

const labelSx = {shrink: true, sx: {textTransform: 'uppercase' as const, letterSpacing: '0.05em', fontWeight: 600}};

export default function EditCustomerDialog({open, customer, onClose, onSave}: Props) {
    const [form, setForm] = useState<CustomerDto>(customer);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (open) setForm({...customer, country: VALID_CODES.includes(customer.country) ? customer.country : 'CH'});
    }, [open, customer]);

    const setField = (f: keyof CustomerDto) => (e: ChangeEvent<HTMLInputElement>) => setForm((prev) => ({...prev, [f]: e.target.value}));

    const handleSave = async () => {
        setSaving(true);
        try {
            await onSave({
                name: form.name.trim(),
                contactPerson: form.contactPerson,
                email: form.email,
                phone: form.phone,
                street: form.street,
                zip: form.zip,
                city: form.city,
                country: form.country,
                vatNumber: form.vatNumber,
            });
            onClose();
        } finally {
            setSaving(false);
        }
    };

    return (
        <Dialog open={open} onClose={saving ? undefined : onClose} maxWidth="sm" fullWidth>
            <DialogTitle sx={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 4, pt: 3, pb: 2}}>
                <Typography variant="h6" component="span" sx={{fontWeight: 600}}>
                    Kundendaten bearbeiten
                </Typography>
                <IconButton onClick={onClose} size="small" disabled={saving}>
                    <CloseIcon />
                </IconButton>
            </DialogTitle>

            <Divider />

            <DialogContent sx={{px: 4, py: 3}}>
                <Grid container spacing={2.5}>
                    <Grid size={12}>
                        <TextField
                            label="Firmenname"
                            value={form.name}
                            onChange={setField('name')}
                            size="small"
                            fullWidth
                            required
                            slotProps={{inputLabel: labelSx}}
                        />
                    </Grid>
                    <Grid size={6}>
                        <TextField
                            label="Ansprechperson"
                            value={form.contactPerson}
                            onChange={setField('contactPerson')}
                            size="small"
                            fullWidth
                            slotProps={{inputLabel: labelSx}}
                        />
                    </Grid>
                    <Grid size={6}>
                        <TextField
                            label="MWST-Nr."
                            value={form.vatNumber}
                            onChange={setField('vatNumber')}
                            size="small"
                            fullWidth
                            slotProps={{inputLabel: labelSx}}
                        />
                    </Grid>
                    <Grid size={6}>
                        <TextField
                            label="E-Mail"
                            value={form.email}
                            onChange={setField('email')}
                            type="email"
                            size="small"
                            fullWidth
                            slotProps={{inputLabel: labelSx}}
                        />
                    </Grid>
                    <Grid size={6}>
                        <TextField label="Telefon" value={form.phone} onChange={setField('phone')} size="small" fullWidth slotProps={{inputLabel: labelSx}} />
                    </Grid>
                    <Grid size={8}>
                        <TextField label="Strasse" value={form.street} onChange={setField('street')} size="small" fullWidth slotProps={{inputLabel: labelSx}} />
                    </Grid>
                    <Grid size={4}>
                        <TextField label="PLZ" value={form.zip} onChange={setField('zip')} size="small" fullWidth slotProps={{inputLabel: labelSx}} />
                    </Grid>
                    <Grid size={6}>
                        <TextField label="Ort" value={form.city} onChange={setField('city')} size="small" fullWidth slotProps={{inputLabel: labelSx}} />
                    </Grid>
                    <Grid size={6}>
                        <TextField
                            select
                            label="Land"
                            value={form.country}
                            onChange={setField('country')}
                            size="small"
                            fullWidth
                            slotProps={{inputLabel: labelSx}}
                        >
                            {COUNTRIES.map(({code, label}) => (
                                <MenuItem key={code} value={code}>
                                    {label}
                                </MenuItem>
                            ))}
                        </TextField>
                    </Grid>
                </Grid>
            </DialogContent>

            <Divider />
            <Box sx={{display: 'flex', justifyContent: 'flex-end', gap: 1.5, px: 4, py: 2}}>
                <Button variant="outlined" onClick={onClose} disabled={saving} sx={{textTransform: 'none'}}>
                    Abbrechen
                </Button>
                <Button
                    variant="contained"
                    onClick={handleSave}
                    disabled={saving || !form.name.trim()}
                    startIcon={saving ? <CircularProgress size={16} color="inherit" /> : undefined}
                    sx={{textTransform: 'none', boxShadow: 'none', '&:hover': {boxShadow: 'none'}}}
                >
                    Speichern
                </Button>
            </Box>
        </Dialog>
    );
}
