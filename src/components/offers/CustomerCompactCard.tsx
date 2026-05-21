import {CustomerDto} from '@/types/offerte';
import BusinessOutlinedIcon from '@mui/icons-material/BusinessOutlined';
import EditIcon from '@mui/icons-material/Edit';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import PersonOutlinedIcon from '@mui/icons-material/PersonOutlined';
import PhoneOutlinedIcon from '@mui/icons-material/PhoneOutlined';
import {Box, Card, IconButton, Typography} from '@mui/material';
import React from 'react';

interface Props {
    customer: CustomerDto;
    onEdit: () => void;
}

function ContactRow({icon, href, children}: {icon: React.ReactNode; href?: string; children: React.ReactNode}) {
    return (
        <Box
            component={href ? 'a' : 'div'}
            href={href}
            sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                mb: 0.75,
                textDecoration: 'none',
                color: 'inherit',
                ...(href && {'&:hover': {color: 'primary.main'}}),
            }}
        >
            <Box sx={{color: 'text.secondary', display: 'flex', alignItems: 'center', flexShrink: 0}}>{icon}</Box>
            <Typography sx={{fontSize: 12, lineHeight: 1.4}}>{children}</Typography>
        </Box>
    );
}

export default function CustomerCompactCard({customer, onEdit}: Props) {
    const {name, contactPerson, phone, email, street, zip, city} = customer;

    return (
        <Card variant="outlined" sx={{borderRadius: 2, overflow: 'hidden'}}>
            {/* Header */}
            <Box
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    px: 2,
                    py: 1.25,
                    bgcolor: 'rgba(0,0,0,0.02)',
                    borderBottom: '1px solid rgba(0,0,0,0.08)',
                }}
            >
                <BusinessOutlinedIcon sx={{fontSize: 16, color: 'text.secondary', flexShrink: 0}} />
                <Typography sx={{fontSize: 13, fontWeight: 600, flex: 1, lineHeight: 1.3}}>{name}</Typography>
                <IconButton size="small" onClick={onEdit} sx={{ml: 'auto', color: 'text.secondary'}}>
                    <EditIcon sx={{fontSize: 16}} />
                </IconButton>
            </Box>

            {/* Contact fields */}
            <Box sx={{px: 2, py: 1.5}}>
                {contactPerson && <ContactRow icon={<PersonOutlinedIcon sx={{fontSize: 14}} />}>{contactPerson}</ContactRow>}
                {phone && (
                    <ContactRow icon={<PhoneOutlinedIcon sx={{fontSize: 14}} />} href={`tel:${phone}`}>
                        {phone}
                    </ContactRow>
                )}
                {email && (
                    <ContactRow icon={<EmailOutlinedIcon sx={{fontSize: 14}} />} href={`mailto:${email}`}>
                        {email}
                    </ContactRow>
                )}
                {street && (
                    <ContactRow icon={<LocationOnOutlinedIcon sx={{fontSize: 14}} />}>
                        {street}, {zip} {city}
                    </ContactRow>
                )}
            </Box>
        </Card>
    );
}
