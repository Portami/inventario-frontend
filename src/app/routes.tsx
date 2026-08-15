import NavigationLayout from './NavigationLayout';
import {lazy} from 'react';
import {Navigate, Route, Routes} from 'react-router';

const ScanPage = lazy(() => import('@/features/scanning/pages/ScanPage'));
const LabelGeneratorPage = lazy(() => import('@/features/labels/pages/LabelGeneratorPage'));
const FeltPage = lazy(() => import('@/features/felts/pages/FeltPage'));
const FeltReorderPage = lazy(() => import('@/features/felts/pages/FeltReorderPage'));
const FeltDetailPage = lazy(() => import('@/features/felts/pages/FeltDetailPage'));
const InventoryPage = lazy(() => import('@/features/stocktakes/pages/InventoryPage'));
const InvAuditingArchive = lazy(() => import('@/features/stocktakes/pages/InvAuditingArchive'));
const InvAuditingArchiveView = lazy(() => import('@/features/stocktakes/pages/InvAuditingArchiveView'));
const InventoryAuditingView = lazy(() => import('@/features/stocktakes/pages/InventoryAuditingView'));
const StorageAuditingDetailPage = lazy(() => import('@/features/stocktakes/pages/StorageAuditingDetailPage'));
const StoragePage = lazy(() => import('@/features/storage/pages/StoragePage'));
const ShoppingPage = lazy(() => import('@/features/shopping/pages/ShoppingPage'));
const ProductsPage = lazy(() => import('@/features/products/pages/ProductsPage'));
const ProductDetailView = lazy(() => import('@/features/products/pages/ProductDetailView'));
const CategoriesPage = lazy(() => import('@/features/products/pages/CategoriesPage'));
const RollDetail = lazy(() => import('@/features/rolls/pages/RollDetail'));
const ScrapDetail = lazy(() => import('@/features/rolls/pages/ScrapDetail'));
const OffersPage = lazy(() => import('@/features/offers/pages/OffersPage'));
const OfferDetailPage = lazy(() => import('@/features/offers/pages/OfferDetailPage'));
const CustomersPage = lazy(() => import('@/features/customers/pages/CustomersPage'));
const StatisticsPage = lazy(() => import('@/features/statistics/pages/StatisticsPage'));

export default function AppRoutes() {
    return (
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
    );
}
