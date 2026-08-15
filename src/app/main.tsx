import '@/shared/styles/index.scss';
import AppRoutes from './routes';
import theme from './theme';
import {ToastProvider} from '@/shared/components/ToastProvider';
import {CssBaseline, ThemeProvider} from '@mui/material';
import {QueryClient, QueryClientProvider} from '@tanstack/react-query';
import ReactDOM from 'react-dom/client';
import {BrowserRouter} from 'react-router';

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            // Matches the 5-minute TTL of the previous hand-rolled services cache.
            staleTime: 5 * 60 * 1000,
            retry: 1,
        },
    },
});

ReactDOM.createRoot(document.getElementById('root')!).render(
    <ThemeProvider theme={theme}>
        <QueryClientProvider client={queryClient}>
            <ToastProvider>
                <BrowserRouter>
                    <CssBaseline />
                    <AppRoutes />
                </BrowserRouter>
            </ToastProvider>
        </QueryClientProvider>
    </ThemeProvider>,
);
