import LabeledField from './LabeledField';
import {CustomerDto} from '@/types/offerte';
import BusinessOutlinedIcon from '@mui/icons-material/BusinessOutlined';
import EditIcon from '@mui/icons-material/Edit';
import {Avatar, Box, Button, Card, CardContent, Typography, useTheme} from '@mui/material';

interface CustomerCardProps {
    customer: CustomerDto;
    onEdit: () => void;
}

export default function CustomerCard({customer, onEdit}: CustomerCardProps) {
    const theme = useTheme();
    const primary = theme.palette.primary.main;
    return (
        <Card variant="outlined" sx={{borderColor: 'rgba(0,0,0,0.08)'}}>
            <CardContent sx={{p: 3}}>
                <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2}}>
                    <Box sx={{display: 'flex', alignItems: 'center', gap: 1.5}}>
                        <Avatar sx={{bgcolor: `${primary}14`, color: primary, width: 36, height: 36}}>
                            <BusinessOutlinedIcon sx={{fontSize: 20}} />
                        </Avatar>
                        <Box>
                            <Typography
                                sx={{
                                    fontSize: 11,
                                    fontWeight: 600,
                                    letterSpacing: '0.05em',
                                    textTransform: 'uppercase',
                                    color: 'text.secondary',
                                }}
                            >
                                Kunde
                            </Typography>
                            <Typography variant="h6" sx={{fontWeight: 600, lineHeight: 1.2}}>
                                {customer.name}
                            </Typography>
                        </Box>
                    </Box>
                    <Button
                        size="small"
                        variant="text"
                        startIcon={<EditIcon sx={{fontSize: 16}} />}
                        onClick={onEdit}
                        sx={{textTransform: 'none', color: 'text.secondary'}}
                    >
                        Bearbeiten
                    </Button>
                </Box>
                <Box sx={{display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 2.5, rowGap: 2}}>
                    <LabeledField label="Kundennummer" value={customer.customerNumber} mono />
                    <LabeledField label="Ansprechperson" value={customer.contactPerson} />
                    <LabeledField label="MWST-Nr." value={customer.vatNumber} mono />
                    <LabeledField label="E-Mail" value={customer.email} />
                    <LabeledField label="Telefon" value={customer.phone} />
                    <LabeledField label="Adresse" value={`${customer.street}, ${customer.zip} ${customer.city}, ${customer.country}`} />
                </Box>
            </CardContent>
        </Card>
    );
}
