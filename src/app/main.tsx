import '@/shared/styles/index.scss';
import AppRoutes from './routes';
import theme from './theme';
import {ToastProvider} from '@/shared/components/ToastProvider';
import {CssBaseline, ThemeProvider} from '@mui/material';
import ReactDOM from 'react-dom/client';
import {BrowserRouter} from 'react-router';

ReactDOM.createRoot(document.getElementById('root')!).render(
    <ThemeProvider theme={theme}>
        <ToastProvider>
            <BrowserRouter>
                <CssBaseline />
                <AppRoutes />
            </BrowserRouter>
        </ToastProvider>
    </ThemeProvider>,
);
