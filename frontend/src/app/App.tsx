import React, { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryProvider } from './providers/QueryProvider';
import { SimpleAuthProvider } from './providers/SimpleAuthProvider';
import { CartProvider } from './providers/CartProvider';
import { FavoritesProvider } from './providers/FavoritesProvider';
import { OrdersProvider } from './providers/OrdersProvider';
import { MainPage } from '../pages/main';
import { AllBrandsPage } from '../pages/all-brands';
import { BrandPage } from '../pages/brand';
import { ProfilePage } from '../pages/profile';
import { CategoryPage } from '../pages/categories';
import { ProductPage } from '../pages/product';
import { CheckoutPage } from '../pages/checkout';
import { OrderPage } from '../pages/order';
import { TermsPage } from '../pages/terms';
import { PrivacyPage } from '../pages/privacy';
import './styles/global.css';

// Code splitting for admin pages
const AdminPanel = lazy(() => import('../pages/admin').then(m => ({ default: m.AdminPanel })));
const StoreDashboard = lazy(() => import('../pages/store-dashboard').then(m => ({ default: m.StoreDashboard })));

const LoadingFallback = () => (
  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
    <div>Загрузка...</div>
  </div>
);

function App() {
  return (
    <QueryProvider>
      <SimpleAuthProvider>
        <CartProvider>
          <FavoritesProvider>
            <OrdersProvider>
              <BrowserRouter>
                <Suspense fallback={<LoadingFallback />}>
                  <Routes>
                    <Route path="/" element={<MainPage />} />
                    <Route path="/all-brands" element={<AllBrandsPage />} />
                    <Route path="/brand/:brandId" element={<BrandPage />} />
                    <Route path="/profile" element={<ProfilePage />} />
                    <Route path="/category/:categoryId" element={<CategoryPage />} />
                    <Route path="/product/:productId" element={<ProductPage />} />
                    <Route path="/checkout" element={<CheckoutPage />} />
                    <Route path="/order/:orderId" element={<OrderPage />} />
                    <Route path="/admin" element={<AdminPanel />} />
                    <Route path="/store-dashboard" element={<StoreDashboard />} />
                    <Route path="/terms" element={<TermsPage />} />
                    <Route path="/privacy" element={<PrivacyPage />} />
                  </Routes>
                </Suspense>
              </BrowserRouter>
            </OrdersProvider>
          </FavoritesProvider>
        </CartProvider>
      </SimpleAuthProvider>
    </QueryProvider>
  );
}

export default App;