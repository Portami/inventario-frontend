import {OFFER_STATE_META} from '@/pages/constants/offerConstants';
import {OfferState} from '@/types/offerte';
import CheckIcon from '@mui/icons-material/Check';
import {Box, Step, StepConnector, stepConnectorClasses, StepLabel, Stepper, useTheme} from '@mui/material';
import {styled} from '@mui/material/styles';
import React from 'react';

const ColorConnector = styled(StepConnector)(({theme}) => ({
    [`&.${stepConnectorClasses.alternativeLabel}`]: {
        top: 14,
        left: 'calc(-50% + 18px)',
        right: 'calc(50% + 18px)',
    },
    [`&.${stepConnectorClasses.active}`]: {
        [`& .${stepConnectorClasses.line}`]: {borderColor: theme.palette.primary.main},
    },
    [`&.${stepConnectorClasses.completed}`]: {
        [`& .${stepConnectorClasses.line}`]: {borderColor: theme.palette.primary.main},
    },
    [`& .${stepConnectorClasses.line}`]: {
        borderColor: 'rgba(0,0,0,0.16)',
        borderTopWidth: 2,
        borderRadius: 1,
    },
}));

function StepIconComp({active, completed, icon}: {active?: boolean; completed?: boolean; icon?: React.ReactNode}) {
    const theme = useTheme();
    const primary = theme.palette.primary.main;
    const bg = completed || active ? primary : '#fff';
    const fg = completed || active ? '#fff' : 'rgba(0,0,0,0.45)';
    const border = completed || active ? primary : 'rgba(0,0,0,0.24)';
    return (
        <Box
            sx={{
                width: 28,
                height: 28,
                borderRadius: '50%',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: bg,
                color: fg,
                border: `2px solid ${border}`,
                fontSize: 13,
                fontWeight: 600,
                boxShadow: active ? `0 0 0 4px ${primary}22` : 'none',
            }}
        >
            {completed ? <CheckIcon sx={{fontSize: 16}} /> : icon}
        </Box>
    );
}

interface OfferStateStepperProps {
    states: OfferState[];
    currentKey: OfferState;
}

export default function OfferStateStepper({states, currentKey}: OfferStateStepperProps) {
    const theme = useTheme();
    const idx = states.indexOf(currentKey);
    return (
        <Stepper activeStep={idx} alternativeLabel connector={<ColorConnector />}>
            {states.map((key, i) => (
                <Step key={key} completed={i < idx}>
                    <StepLabel
                        slots={{stepIcon: StepIconComp}}
                        sx={{
                            '& .MuiStepLabel-label': {
                                fontSize: 12.5,
                                mt: 1,
                                color: i === idx ? theme.palette.primary.main : 'text.secondary',
                                fontWeight: i === idx ? 600 : 500,
                            },
                        }}
                    >
                        {OFFER_STATE_META[key].label}
                    </StepLabel>
                </Step>
            ))}
        </Stepper>
    );
}
