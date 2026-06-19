import React from 'react';
import { useLocation } from 'react-router-dom';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Menu from './pages/Menu';
import Login from './pages/Login';
import Register from './pages/Register';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import OrderConfirmation from './pages/OrderConfirmation';
import Profile from './pages/Profile';
import AdminDashboard from './pages/AdminDashboard';
import StaticPage from './pages/StaticPage';
import { staticPageRoutes } from './data/staticPages';
import { AuthProvider } from './context/AuthContext';
import { Toaster } from 'react-hot-toast';

// Wrapper that hides Navbar on auth pages
function Layout() {
  const location = useLocation();
  const hideNavbar = ['/login', '/register', '/admin'].includes(location.pathname);
  return (
    <div className="App min-w-0 overflow-x-hidden">
      {!hideNavbar && <Navbar />}
      <Routes>
        <Route path="/" element={<Home />} />
          <Route path="/menu" element={<Menu />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/order-confirmation" element={<OrderConfirmation />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/admin" element={<AdminDashboard />} />
        {staticPageRoutes.map((slug) => (
          <Route key={slug} path={`/${slug}`} element={<StaticPage />} />
        ))}
      </Routes>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <Toaster position="top-center" reverseOrder={false} />
        <Layout />
      </Router>
    </AuthProvider>
  );
}

export default App;
