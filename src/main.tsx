import './styles/index.scss';
import App from './App';
import theme from './theme';
import NavigationLayout from '@/components/NavigationLayout.tsx';
import FeltPage from '@/pages/FeltPage.tsx';
import InventoryPage from '@/pages/InventoryPage.tsx';
import LabelGeneratorPage from '@/pages/LabelGeneratorPage.tsx';
import ProductDetailView from '@/pages/ProductDetailView.tsx';
import ProductsPage from '@/pages/ProductsPage.tsx';
import RollDetail from '@/pages/RollDetail.tsx';
import RollPage from '@/pages/RollPage.tsx';
import ScanPage from '@/pages/ScanPage.tsx';
import ScrapDetail from '@/pages/ScrapDetail.tsx';
import ShoppingPage from '@/pages/ShoppingPage.tsx';
import StoragePage from '@/pages/StoragePage.tsx';
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
                    <Route path="/scan" element={<ScanPage />} />
                    <Route path="/labels" element={<LabelGeneratorPage />} />
                    <Route path="/rolls" element={<RollPage />} />
                    <Route path="/felts" element={<FeltPage />} />
                    <Route path="/inventory" element={<InventoryPage />} />
                    <Route path="/storage" element={<StoragePage />} />
                    <Route path="/shopping" element={<ShoppingPage />} />
                    <Route path="/products" element={<ProductsPage />} />
                    <Route path="/product/:id" element={<ProductDetailView />} />
                </Route>
                <Route path="/roll/:id" element={<RollDetail />} />
                <Route path="/scrap/:id" element={<ScrapDetail />} />
            </Routes>
        </BrowserRouter>
    </ThemeProvider>,
);
