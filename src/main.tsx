import './styles/index.scss';
import App from './App';
import theme from './theme';
import NavigationLayout from '@/components/NavigationLayout.tsx';
import {ToastProvider} from '@/components/ToastProvider';
import CategoriesPage from '@/pages/CategoriesPage.tsx';
import CustomersPage from '@/pages/CustomersPage.tsx';
import FeltDetailPage from '@/pages/FeltDetailPage.tsx';
import FeltPage from '@/pages/FeltPage.tsx';
import FeltReorderPage from '@/pages/FeltReorderPage.tsx';
import InvAuditingArchive from '@/pages/InvAuditingArchive.tsx';
import InvAuditingArchiveView from '@/pages/InvAuditingArchiveView.tsx';
import InventoryAuditingView from '@/pages/InventoryAuditingView.tsx';
import InventoryPage from '@/pages/InventoryPage.tsx';
import LabelGeneratorPage from '@/pages/LabelGeneratorPage.tsx';
import OfferDetailPage from '@/pages/OfferDetailPage.tsx';
import OffersPage from '@/pages/OffersPage.tsx';
import ProductDetailView from '@/pages/ProductDetailView.tsx';
import ProductsPage from '@/pages/ProductsPage.tsx';
import RollDetail from '@/pages/RollDetail.tsx';
import ScanPage from '@/pages/ScanPage.tsx';
import ScrapDetail from '@/pages/ScrapDetail.tsx';
import ShoppingPage from '@/pages/ShoppingPage.tsx';
import StatisticsPage from '@/pages/StatisticsPage.tsx';
import StorageAuditingDetailPage from '@/pages/StorageAuditingDetailPage.tsx';
import StoragePage from '@/pages/StoragePage.tsx';
import {CssBaseline, ThemeProvider} from '@mui/material';
import ReactDOM from 'react-dom/client';
import {BrowserRouter, Route, Routes} from 'react-router';

ReactDOM.createRoot(document.getElementById('root')!).render(
    <ThemeProvider theme={theme}>
        <ToastProvider>
            <BrowserRouter>
                <CssBaseline />
                <Routes>
                    <Route element={<NavigationLayout />}>
                        <Route index element={<App />} />
                        <Route path="/scan" element={<ScanPage />} />
                        <Route path="/labels" element={<LabelGeneratorPage />} />
                        <Route path="/felts" element={<FeltPage />} />
                        <Route path="/felts/reorder" element={<FeltReorderPage />} />
                        <Route path="/felts/:id" element={<FeltDetailPage />} />
                        <Route path="/inventory" element={<InventoryPage />} />
                        <Route path="/inventoryArchive" element={<InvAuditingArchive />} />
                        <Route path="/inventoryArchive/:id" element={<InvAuditingArchiveView />} />
                        <Route path="/inventory/:id" element={<InventoryAuditingView />} />
                        <Route path="/inventory/:inventoryId/storage/:id" element={<StorageAuditingDetailPage />} />
                        <Route path="/storage" element={<StoragePage />} />
                        <Route path="/shopping" element={<ShoppingPage />} />
                        <Route path="/products" element={<ProductsPage />} />
                        <Route path="/product/:id" element={<ProductDetailView />} />
                        <Route path="/products/categories" element={<CategoriesPage />} />
                        <Route path="/roll/:id" element={<RollDetail />} />
                        <Route path="/offers" element={<OffersPage />} />
                        <Route path="/offers/:id" element={<OfferDetailPage />} />
                        <Route path="/customers" element={<CustomersPage />} />
                        <Route path="/statistics" element={<StatisticsPage />} />
                        <Route path="/scrap/:id" element={<ScrapDetail />} />
                    </Route>
                </Routes>
            </BrowserRouter>
        </ToastProvider>
    </ThemeProvider>,
);
