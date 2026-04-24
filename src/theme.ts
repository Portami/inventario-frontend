import {createTheme} from '@mui/material/styles';
import type {} from '@mui/x-data-grid/themeAugmentation';

const theme = createTheme({
    cssVariables: true,
    palette: {
        primary: {
            main: '#7D55C7', // accent-purple
        },
        secondary: {
            main: '#ffffff', // white
        },
        success: {
            main: '#2e7d32', // text color for "in stock"
            light: '#e8f5e9', // background for "in stock"
        },
        warning: {
            main: '#ed6c02', // text color for "low stock"
            light: '#fff3e0', // background for "low stock"
        },
        text: {
            primary: '#23254f', // dark blue
            secondary: '#505D68', // light grey
        },
        background: {
            default: '#f9f9fb', // off-white/light grey background
            paper: '#ffffff', // white
        },
        divider: '#E1E3E8', // light-grey
    },
    typography: {
        fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
        h1: {fontSize: '2.5rem', fontWeight: 800, color: '#7D55C7'}, // accent-purple
        h2: {fontSize: '2rem', fontWeight: 700, color: '#23254f'}, // dark blue
        h3: {fontSize: '1.5rem', fontWeight: 600, color: '#23254f'}, // dark blue
        h4: {fontSize: '1.25rem', fontWeight: 600, color: '#505D68'}, // light grey
        body1: {fontSize: '1rem', color: '#505D68', lineHeight: 1.6}, // light grey
    },
    shape: {
        borderRadius: 12,
    },
    components: {
        MuiDataGrid: {
            styleOverrides: {
                root: {
                    borderRadius: 12,
                    border: '1px solid #E1E3E8',
                    '& .MuiDataGrid-columnHeader': {
                        backgroundColor: '#7D55C7',
                        color: '#ffffff',
                    },
                    '& .MuiDataGrid-columnHeaderTitle': {
                        fontWeight: 600,
                    },
                    '& .MuiDataGrid-filler': {
                        backgroundColor: '#7D55C7',
                    },
                    '& .MuiDataGrid-scrollbarFiller': {
                        backgroundColor: '#7D55C7',
                    },
                    '& .MuiDataGrid-columnHeader svg': {
                        fill: '#ffffff',
                        color: '#ffffff',
                    },
                    '& .MuiDataGrid-columnHeader .MuiDataGrid-sortIcon': {
                        fill: '#ffffff !important',
                        opacity: '1 !important',
                    },
                    '& .MuiDataGrid-iconButtonContainer .MuiIconButton-root': {
                        color: '#ffffff',
                        '&:hover': {
                            backgroundColor: 'rgba(255, 255, 255, 0.15)',
                        },
                    },
                    '& .MuiDataGrid-columnHeaderCheckbox .MuiCheckbox-root': {
                        color: '#ffffff',
                    },
                    '& .MuiDataGrid-row:hover': {
                        backgroundColor: 'rgba(0, 0, 0, 0.02)',
                    },
                },
            },
        },
        MuiLink: {
            styleOverrides: {
                root: ({theme}) => ({
                    textDecoration: 'none',
                    color: theme.palette.primary.main,
                    fontWeight: 'bold',
                    fontStyle: 'italic',
                }),
            },
        },
        MuiButton: {
            styleOverrides: {
                root: ({theme}) => ({
                    borderRadius: theme.shape.borderRadius,
                    textTransform: 'none',
                    fontWeight: 600,
                }),
            },
        },
        MuiCard: {
            styleOverrides: {
                root: ({theme}) => ({
                    borderRadius: theme.shape.borderRadius,
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                }),
            },
        },
    },
});

export default theme;
