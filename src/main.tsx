import './styles/index.scss';
import App from './App';
import theme from './theme';
import {CssBaseline, ThemeProvider} from '@mui/material';
import ReactDOM from 'react-dom/client';

ReactDOM.createRoot(document.getElementById('root')!).render(
    <ThemeProvider theme={theme}>
        <CssBaseline />
        <App />
    </ThemeProvider>,
);
