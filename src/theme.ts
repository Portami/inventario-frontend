import {createTheme} from '@mui/material/styles';

const theme = createTheme({
    cssVariables: true,
    palette: {
        primary: {
            main: '#8b5cf6',
        },
        text: {
            primary: '#23254f', // dark blue
            secondary: '#505D68', // light grey
        },
        background: {
            default: '#f9f9fb',
            paper: '#ffffff',
        },
        divider: '#E1E3E8', // light-grey
    },
    typography: {
        fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
        h1: {fontSize: '2.5rem', fontWeight: 800, color: '#8b5cf6'},
        h2: {fontSize: '2rem', fontWeight: 700, color: '#23254f'},
        h3: {fontSize: '1.5rem', fontWeight: 600, color: '#23254f'},
        h4: {fontSize: '1.25rem', fontWeight: 600, color: '#505D68'},
        body1: {fontSize: '1rem', color: '#505D68', lineHeight: 1.6},
    },
    shape: {
        borderRadius: 12,
    },
    components: {
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
