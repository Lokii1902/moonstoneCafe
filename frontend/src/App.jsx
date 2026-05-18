import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import PagePlaceholder from './components/PagePlaceholder';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// We will implement real pages next, for now use placeholder
import Home from './pages/Home';
import Menu from './pages/Menu';
import About from './pages/About';
import Gallery from './pages/Gallery';
import Contact from './pages/Contact';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import Login from './pages/Login'; // Normal users login
import Profile from './pages/Profile';
import Orders from './pages/Orders';

import { HelmetProvider } from 'react-helmet-async';

import SmoothScroll from './components/SmoothScroll';
import { ThemeProvider } from './context/ThemeContext';
// ThemeToggle is now inside Navbar, so we remove the import if unused elsewhere, but keeping import is fine.
// Actually it is imported in App.jsx but removed from JSX. I will just add ChatWidget.
// import ChatWidget from './components/ChatWidget'; // New Widget
import CustomCursor from './components/CustomCursor';
import { CartProvider } from './context/CartContext';
import CartWidget from './components/CartWidget';
import CartModal from './components/CartModal';
import { RestaurantProvider } from './context/RestaurantContext';

function AppContent() {
    const location = useLocation();
    const isAdminRoute = location.pathname.startsWith('/admin');

    return (
        <div className="App bg-heritage-stone text-heritage-espresso min-h-screen transition-colors duration-500">
            <CartProvider>
                <RestaurantProvider>
                    {!isAdminRoute && <Navbar />}
                    {/* {!isAdminRoute && <ChatWidget />} */}
                    {!isAdminRoute && <CartModal />}
                    
                    <main className="w-full">
                        <Routes>
                            <Route path="/" element={<Home />} />
                            <Route path="/menu" element={<Menu />} />
                            <Route path="/about" element={<About />} />
                            <Route path="/gallery" element={<Gallery />} />
                            <Route path="/contact" element={<Contact />} />
                            <Route path="/login" element={<Login />} />
                            <Route path="/profile" element={<Profile />} />
                            <Route path="/orders" element={<Orders />} />
                            <Route path="/admin/login" element={<AdminLogin />} />
                            <Route path="/admin/dashboard" element={<AdminDashboard />} />
                        </Routes>
                    </main>
                    
                    {!isAdminRoute && <Footer />}
                    <ToastContainer position="bottom-right" theme="dark" />
                </RestaurantProvider>
            </CartProvider>
        </div>
    );
}

function App() {
    return (
        <HelmetProvider>
            <ThemeProvider>
                <SmoothScroll>
                    <Router>
                        <CustomCursor />
                        <AppContent />
                    </Router>
                </SmoothScroll>
            </ThemeProvider>
        </HelmetProvider>
    );
}

export default App;
