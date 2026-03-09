import {createTheme} from '@mui/material/styles';

const theme = createTheme({
    cssVariables: true,
    palette: {
        primary: {
            main: '#620077',
        },
        secondary: {
            main: '#ffffff',
        },
        link: {
            main: '#e78eff',
        },
    },
    typography: {
        fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
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
