import {createTheme} from '@mui/material/styles';

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
        link: {
            main: '#e78eff', // light pink
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
        MuiLink: {
            styleOverrides: {
                root: ({theme}) => ({
                    textDecoration: 'none',
                    color: theme.palette.link.main,
                    fontWeight: 'bold',
                    fontStyle: 'italic',
                }),
            },
        },
    },
});

export default theme;
