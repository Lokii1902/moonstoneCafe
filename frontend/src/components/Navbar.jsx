import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { HiOutlineMenuAlt4, HiX } from 'react-icons/hi';
import { FaCrown, FaShoppingBasket, FaUser, FaBoxOpen, FaSignOutAlt } from 'react-icons/fa';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useRestaurant } from '../context/RestaurantContext';

const Navbar = () => {
    const location = useLocation();
    const [scrolled, setScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const { getCartCount, setIsCartOpen } = useCart();
    const { user, logout } = useAuth();
    const { isOpen } = useRestaurant();
    const cartCount = getCartCount();
    
    const handleLogout = () => {
        logout();
    };

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const navLinks = [
        { name: "Home", path: "/" },
        { name: "The Collection", path: "/menu" },
        { name: "Our Story", path: "/about" },
        { name: "Gallery", path: "/gallery" },
        { name: "Contact", path: "/contact" },
    ];

    return (
        <>
            <motion.nav
                initial={{ y: -100 }}
                animate={{ y: 0 }}
                transition={{ duration: 0.8, ease: [0.6, 0.05, -0.01, 0.9] }}
                className={`fixed top-4 left-0 w-full z-50 px-4 md:px-8 transition-all duration-500`}
            >
                <div className={`mx-auto max-w-7xl rounded-full transition-all duration-500 ${scrolled
                    ? 'bg-heritage-stone/90 backdrop-blur-md shadow-lg py-3 px-8'
                    : 'bg-transparent py-6 px-4'
                    } flex justify-between items-center`}>

                    {/* Logo */}
                    <Link to="/" className="group flex items-center gap-2">
                        <FaCrown className={`text-xl transition-colors ${scrolled ? 'text-heritage-saffron' : 'text-heritage-espresso'} opacity-80`} />
                        <div className="flex flex-col">
                            <span className={`font-serif text-2xl tracking-widest ${scrolled ? 'text-heritage-espresso' : 'text-heritage-espresso'} group-hover:text-heritage-saffron transition-colors duration-300`}>
                                MOONSTONE CAFÉ
                            </span>
                            <span className={`text-[7px] font-bold uppercase tracking-[0.2em] transition-all duration-500 ${isOpen ? 'text-green-600' : 'text-red-500'}`}>
                                {isOpen ? '• Open Now' : '• Closed Now'}
                            </span>
                        </div>
                    </Link>

                    {/* Desktop Links - Pill Design */}
                    <div className={`hidden md:flex items-center gap-2 ${scrolled ? 'bg-heritage-sand/50' : 'bg-white/40 backdrop-blur-sm'} rounded-full px-2 py-1 transition-colors duration-500`}>
                        {navLinks.map((link) => (
                            <Link
                                key={link.name}
                                to={link.path}
                                className="relative px-5 py-2 rounded-full text-xs font-bold tracking-widest uppercase text-heritage-espresso/70 hover:text-heritage-espresso hover:bg-white/80 transition-all duration-300"
                            >
                                {link.name}
                            </Link>
                        ))}
                    </div>

                    {/* Actions Group: Cart, Auth, Mobile Toggle */}
                    <div className={`flex items-center p-1 ${scrolled ? 'bg-heritage-stone/30' : 'bg-white/40 backdrop-blur-sm'} rounded-full transition-all duration-500`}>
                        {/* Cart Button */}
                        {user && (
                            <button
                                onClick={() => setIsCartOpen(true)}
                                className="bg-heritage-saffron text-white w-9 h-9 rounded-full flex items-center justify-center relative hover:bg-heritage-espresso transition-all duration-500 shadow-sm z-10"
                                title="Cart"
                            >
                                <FaShoppingBasket size={14} />
                                {cartCount > 0 && (
                                    <span className="absolute -top-1 -right-1 bg-heritage-espresso text-white text-[8px] font-bold w-4 h-4 flex items-center justify-center rounded-full border border-white">
                                        {cartCount}
                                    </span>
                                )}
                            </button>
                        )}

                        {/* Desktop Auth Section */}
                        <div className="hidden md:flex items-center ml-1">
                            {user ? (
                                <div className="flex items-center bg-white/70 backdrop-blur-md rounded-full shadow-sm border border-heritage-espresso/10 p-1 pl-3 gap-1">
                                    {/* Greeting Name */}
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-heritage-espresso/60 mr-2 max-w-[80px] truncate">
                                        Hi, {user.name?.split(' ')[0]}
                                    </span>
                                    
                                    {/* Profile */}
                                    <Link 
                                        to="/profile" 
                                        className="w-7 h-7 bg-heritage-stone/50 hover:bg-heritage-espresso hover:text-white text-heritage-espresso rounded-full flex items-center justify-center transition-all duration-300"
                                        title="My Profile"
                                    >
                                        <FaUser size={11} />
                                    </Link>

                                    {/* Orders */}
                                    <Link 
                                        to="/orders" 
                                        className="w-7 h-7 bg-heritage-stone/50 hover:bg-heritage-espresso hover:text-white text-heritage-espresso rounded-full flex items-center justify-center transition-all duration-300"
                                        title="Order History"
                                    >
                                        <FaBoxOpen size={12} />
                                    </Link>

                                    {/* Logout */}
                                    <button 
                                        onClick={handleLogout} 
                                        className="w-7 h-7 bg-red-50 hover:bg-red-500 hover:text-white text-red-500 rounded-full flex items-center justify-center transition-all duration-300"
                                        title="Logout"
                                    >
                                        <FaSignOutAlt size={12} className="ml-0.5" />
                                    </button>
                                </div>
                            ) : (
                                <Link to="/login" className="ml-2 px-5 py-2 text-[10px] font-bold uppercase tracking-widest bg-heritage-espresso text-white rounded-full hover:bg-heritage-saffron transition-all duration-300 shadow-md">
                                    Login
                                </Link>
                            )}
                        </div>

                        {/* Mobile Menu Toggle */}
                        <button
                            onClick={() => setMobileMenuOpen(true)}
                            className="md:hidden w-9 h-9 ml-2 flex items-center justify-center text-heritage-espresso hover:text-heritage-saffron transition-colors"
                        >
                            <HiOutlineMenuAlt4 size={24} />
                        </button>
                    </div>
                </div>
            </motion.nav>

            {/* Mobile Menu Overlay - Rich Saffron/Olive Gradient */}
            <AnimatePresence>
                {mobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, clipPath: "circle(0% at 100% 0%)" }}
                        animate={{ opacity: 1, clipPath: "circle(150% at 100% 0%)" }}
                        exit={{ opacity: 0, clipPath: "circle(0% at 100% 0%)" }}
                        transition={{ duration: 0.8, ease: [0.77, 0, 0.175, 1] }}
                        className="fixed inset-0 z-[60] bg-heritage-espresso flex flex-col justify-center items-center text-heritage-stone"
                    >
                        <button
                            onClick={() => setMobileMenuOpen(false)}
                            className="absolute top-8 right-8 text-heritage-stone/50 hover:text-heritage-gold transition-colors"
                        >
                            <HiX size={32} />
                        </button>

                        <div className="flex flex-col gap-8 text-center">
                            {navLinks.map((link, i) => (
                                <motion.div
                                    key={link.name}
                                    initial={{ opacity: 0, y: 50 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.2 + i * 0.1, duration: 0.5 }}
                                >
                                    <Link
                                        to={link.path}
                                        onClick={() => setMobileMenuOpen(false)}
                                        className="font-serif text-4xl md:text-5xl text-heritage-stone hover:text-heritage-saffron transition-colors duration-300"
                                    >
                                        {link.name}
                                    </Link>
                                </motion.div>
                            ))}
                            
                            {/* Mobile Auth Links */}
                            <motion.div
                                initial={{ opacity: 0, y: 50 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 + navLinks.length * 0.1, duration: 0.5 }}
                                className="mt-8 flex flex-col gap-6"
                            >
                                {user ? (
                                    <>
                                        <Link
                                            to="/profile"
                                            onClick={() => setMobileMenuOpen(false)}
                                            className="font-serif text-3xl text-heritage-saffron hover:text-white transition-colors duration-300"
                                        >
                                            My Profile
                                        </Link>
                                        <Link
                                            to="/orders"
                                            onClick={() => setMobileMenuOpen(false)}
                                            className="font-serif text-3xl text-heritage-saffron hover:text-white transition-colors duration-300"
                                        >
                                            Order History
                                        </Link>
                                        <button
                                            onClick={() => { handleLogout(); setMobileMenuOpen(false); }}
                                            className="font-serif text-2xl text-white/50 hover:text-red-400 transition-colors duration-300"
                                        >
                                            Logout
                                        </button>
                                    </>
                                ) : (
                                    <Link
                                        to="/login"
                                        onClick={() => setMobileMenuOpen(false)}
                                        className="font-serif text-4xl text-heritage-saffron hover:text-white transition-colors duration-300"
                                    >
                                        Login
                                    </Link>
                                )}
                            </motion.div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default Navbar;
