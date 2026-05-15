import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
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
import { AdminPanel } from '../pages/admin';
import { StoreDashboard } from '../pages/store-dashboard';
import './styles/global.css';

function App() {
  return (
    <SimpleAuthProvider>
      <CartProvider>
        <FavoritesProvider>
          <OrdersProvider>
            <BrowserRouter>
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
              </Routes>
            </BrowserRouter>
          </OrdersProvider>
        </FavoritesProvider>
      </CartProvider>
    </SimpleAuthProvider>
  );
}

export default App;