import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';

import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Products from './pages/Products';
import Sellers from './pages/Sellers';

// Seller Components
import SellerDashboard from './components/Seller/SellerDashboard';

// import ProductDetail from './pages/ProductDetail';
// import Cart from './pages/Cart';
// import Checkout from './pages/Checkout';
// import Orders from './pages/Orders';
// import Profile from './pages/Profile';
// import Sellers from './pages/Sellers';

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <div className="App">
          <Navbar />
          <main>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/products" element={<Products />} />
              <Route path="/sellers" element={<Sellers />} />
              
              {/* Seller Dashboard Routes */}
              <Route 
                path="/seller/*" 
                element={
                  <ProtectedRoute roles={['artisan', 'admin']}>
                    <SellerDashboard />
                  </ProtectedRoute>
                } 
              />
              
              {/* Temporarily commented out until pages are created */}
              {/* <Route path="/products/:id" element={<ProductDetail />} /> */}
              {/* <Route path="/sellers/:id" element={<SellerProfile />} /> */}
              
              {/* Protected Routes - Temporarily commented out */}
              {/* <Route 
                path="/cart" 
                element={
                  <ProtectedRoute>
                    <Cart />
                  </ProtectedRoute>
                } 
              /> */}
              {/* <Route 
                path="/checkout" 
                element={
                  <ProtectedRoute>
                    <Checkout />
                  </ProtectedRoute>
                } 
              /> */}
              {/* <Route 
                path="/orders" 
                element={
                  <ProtectedRoute>
                    <Orders />
                  </ProtectedRoute>
                } 
              /> */}
              {/* <Route 
                path="/profile" 
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                } 
              /> */}
              {/* <Route 
                path="/dashboard" 
                element={
                  <ProtectedRoute roles={['seller', 'admin']}>
                    <SellerDashboard />
                  </ProtectedRoute>
                } 
              /> */}
              
              {/* 404 Page */}
              <Route 
                path="*" 
                element={
                  <div className="container text-center mt-4">
                    <h1>404 - Page Not Found</h1>
                    <p>The page you're looking for doesn't exist.</p>
                  </div>
                } 
              />
            </Routes>
          </main>
          <Footer />
          
          <ToastContainer
            position="top-right"
            autoClose={3000}
            hideProgressBar={false}
            newestOnTop
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="light"
          />
        </div>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;