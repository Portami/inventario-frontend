import './styles/index.scss';
import App from './App';
import theme from './theme';
import NavigationLayout from '@/components/NavigationLayout.tsx';
import Demo from '@/pages/Demo.tsx';
import {CssBaseline, ThemeProvider} from '@mui/material';
import ReactDOM from 'react-dom/client';
import {BrowserRouter, Route, Routes} from 'react-router';

ReactDOM.createRoot(document.getElementById('root')!).render(
    <ThemeProvider theme={theme}>
        <BrowserRouter>
            <CssBaseline />
            <Routes>
                <Route element={<NavigationLayout />}>
                    <Route index element={<App />} />
                </Route>
                <Route path={'/demo'} element={<Demo />} />
            </Routes>
        </BrowserRouter>
    </ThemeProvider>,
);
