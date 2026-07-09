import '@/shared/styles/index.scss';
import theme from './theme';
import NavigationLayout from '@/app/NavigationLayout';
import CustomersPage from '@/features/customers/pages/CustomersPage';
import FeltDetailPage from '@/features/felts/pages/FeltDetailPage';
import FeltPage from '@/features/felts/pages/FeltPage';
import FeltReorderPage from '@/features/felts/pages/FeltReorderPage';
import LabelGeneratorPage from '@/features/labels/pages/LabelGeneratorPage';
import OfferDetailPage from '@/features/offers/pages/OfferDetailPage';
import OffersPage from '@/features/offers/pages/OffersPage';
import CategoriesPage from '@/features/products/pages/CategoriesPage';
import ProductDetailView from '@/features/products/pages/ProductDetailView';
import ProductsPage from '@/features/products/pages/ProductsPage';
import RollDetail from '@/features/rolls/pages/RollDetail';
import ScrapDetail from '@/features/rolls/pages/ScrapDetail';
import ScanPage from '@/features/scanning/pages/ScanPage';
import ShoppingPage from '@/features/shopping/pages/ShoppingPage';
import StatisticsPage from '@/features/statistics/pages/StatisticsPage';
import InvAuditingArchive from '@/features/stocktakes/pages/InvAuditingArchive';
import InvAuditingArchiveView from '@/features/stocktakes/pages/InvAuditingArchiveView';
import InventoryAuditingView from '@/features/stocktakes/pages/InventoryAuditingView';
import InventoryPage from '@/features/stocktakes/pages/InventoryPage';
import StorageAuditingDetailPage from '@/features/stocktakes/pages/StorageAuditingDetailPage';
import StoragePage from '@/features/storage/pages/StoragePage';
import {ToastProvider} from '@/shared/components/ToastProvider';
import {CssBaseline, ThemeProvider} from '@mui/material';
import ReactDOM from 'react-dom/client';
import {BrowserRouter, Navigate, Route, Routes} from 'react-router';

ReactDOM.createRoot(document.getElementById('root')!).render(
    <ThemeProvider theme={theme}>
        <ToastProvider>
            <BrowserRouter>
                <CssBaseline />
                <Routes>
                    <Route element={<NavigationLayout />}>
                        <Route index element={<Navigate to="/felts" replace />} />
                        <Route path="/scan" element={<ScanPage />} />
                        <Route path="/labels" element={<LabelGeneratorPage />} />
                        <Route path="/felts" element={<FeltPage />} />
                        <Route path="/felts/reorder" element={<FeltReorderPage />} />
                        <Route path="/felts/:id" element={<FeltDetailPage />} />
                        <Route path="/inventory" element={<InventoryPage />} />
                        <Route path="/inventory/archive" element={<InvAuditingArchive />} />
                        <Route path="/inventory/archive/:id" element={<InvAuditingArchiveView />} />
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
