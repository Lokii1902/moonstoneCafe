import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SEO from '../components/SEO';
import api from '../utils/api';
import { FaSpinner, FaMinus, FaPlus } from 'react-icons/fa';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useRestaurant } from '../context/RestaurantContext';
import { Link } from 'react-router-dom';

const Menu = () => {
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [menuItems, setMenuItems] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const { addToCart, cart, updateQuantity } = useCart();
    const { user } = useAuth();
    const { isOpen, restaurantInfo } = useRestaurant();
    
    // Format 24h time string to 12h AM/PM for display
    const formatTime = (timeStr) => {
        if (!timeStr) return "5:00 PM";
        const [hours, minutes] = timeStr.split(':');
        const h = parseInt(hours);
        const ampm = h >= 12 ? 'PM' : 'AM';
        const h12 = h % 12 || 12;
        return `${h12}:${minutes} ${ampm}`;
    };

    const getItemQty = (id) => {
        return cart.find(i => i.id === id)?.qty || 0;
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [catRes, itemRes] = await Promise.all([
                    api.get('/menu/categories'),
                    api.get('/menu/items')
                ]);
                setCategories([{ id: 'all', name: 'All' }, ...catRes.data]);
                setMenuItems(itemRes.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const filteredItems = selectedCategory === 'all'
        ? menuItems
        : menuItems.filter(item => String(item.category_id) === String(selectedCategory));

    return (
        <div className="min-h-screen pt-32 bg-heritage-stone text-heritage-espresso">
            <SEO
                title="The Market - Moonstone Café"
                description="Explore our vibrant menu."
            />

            {/* Header */}
            <div className="px-6 md:px-12 mb-12 text-center max-w-4xl mx-auto">
                {!isOpen && (
                    <motion.div 
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-8 p-6 bg-red-50 border border-red-100 rounded-3xl flex flex-col items-center gap-2"
                    >
                        <span className="text-red-500 font-bold text-[10px] uppercase tracking-[0.3em] flex items-center gap-2">
                            <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                            Currently Closed
                        </span>
                        <p className="text-heritage-espresso/60 text-sm font-serif italic">
                            The kitchen opens at {formatTime(restaurantInfo?.opening_time)}. Feel free to browse and prepare your selection for later!
                        </p>
                    </motion.div>
                )}
                <span className="text-heritage-saffron font-bold text-xs uppercase tracking-[0.3em] block mb-6">Culinary Bazaar</span>
                <h1 className="text-4xl md:text-8xl font-serif text-heritage-espresso mb-8">The Collection</h1>
            </div>

            {/* Filter Bar - Responsive Selection (Non-sticky) */}
            <div className="px-6 py-4 mb-16 border-b border-heritage-espresso/5">
                <div className="max-w-4xl mx-auto">
                    {/* Mobile Dropdown Selection */}
                    <div className="md:hidden relative">
                        <select
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                            className="w-full appearance-none bg-white border border-heritage-espresso/10 text-heritage-espresso py-4 px-6 rounded-2xl text-[10px] font-bold uppercase tracking-[0.2em] focus:outline-none focus:border-heritage-saffron cursor-pointer shadow-sm"
                        >
                            {categories.map(cat => (
                                <option key={cat.id} value={cat.id}>
                                    {cat.name}
                                </option>
                            ))}
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-heritage-saffron">
                            <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                        </div>
                    </div>

                    {/* Desktop Selection - Wrapping Grid */}
                    <div className="hidden md:flex flex-wrap justify-center gap-4 py-2">
                        {categories.map(cat => (
                            <button
                                key={cat.id}
                                onClick={() => setSelectedCategory(cat.id)}
                                className={`whitespace-nowrap uppercase text-[10px] font-bold tracking-[0.2em] px-8 py-3 rounded-full transition-all duration-300 hover:scale-105
                                    ${String(selectedCategory) === String(cat.id)
                                        ? 'bg-heritage-espresso text-heritage-stone shadow-xl ring-2 ring-heritage-saffron/20'
                                        : 'bg-white text-heritage-espresso/60 hover:bg-heritage-sand hover:text-heritage-espresso border border-heritage-espresso/5 shadow-sm'}`}
                            >
                                {cat.name}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Content - Spice Market Grid */}
            <div className="px-6 md:px-12 pb-24 min-h-[50vh]">
                {loading ? (
                    <div className="flex justify-center py-20"><FaSpinner className="animate-spin text-3xl text-heritage-saffron" /></div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        <AnimatePresence>
                            {filteredItems.map((item) => (
                                <motion.div
                                    key={item.id}
                                    layout
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    className="group relative bg-white rounded-3xl overflow-hidden hover:shadow-2xl transition-all duration-500"
                                >
                                    {/* Image Top */}
                                    <div className="aspect-[4/3] overflow-hidden">
                                        <img
                                            src={item.image_url ? (item.image_url.startsWith('http') ? item.image_url : `https://moonstonecafe.onrender.com${item.image_url}`) : 'https://via.placeholder.com/400'}
                                            alt={item.name}
                                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                        />
                                    </div>

                                    {/* Info Bottom */}
                                    <div className="p-8">
                                        <div className="flex justify-between items-start mb-4">
                                            <h3 className="text-2xl font-serif text-heritage-espresso group-hover:text-heritage-saffron transition-colors">{item.name}</h3>
                                            <span className="font-bold text-lg text-heritage-olive">₹{item.price}</span>
                                        </div>
                                        <p className="text-heritage-espresso/60 text-sm font-sans leading-relaxed mb-6">
                                            {item.description}
                                        </p>
                                        {!user ? (
                                            <Link
                                                to="/login"
                                                className="w-full py-3 rounded-xl border border-heritage-saffron/30 text-xs font-bold uppercase tracking-widest text-heritage-saffron hover:bg-heritage-saffron hover:text-white transition-all text-center block"
                                            >
                                                Login to Order
                                            </Link>
                                        ) : getItemQty(item.id) > 0 ? (
                                            <div className="flex items-center justify-between bg-heritage-espresso/5 rounded-xl border border-heritage-espresso/10 p-1">
                                                <button onClick={() => updateQuantity(item.id, -1)} className="w-10 h-10 flex items-center justify-center text-heritage-espresso hover:bg-heritage-espresso hover:text-white rounded-lg transition-colors">
                                                    <FaMinus size={10} />
                                                </button>
                                                <span className="font-bold text-lg text-heritage-espresso">{getItemQty(item.id)}</span>
                                                <button onClick={() => addToCart(item)} className="w-10 h-10 flex items-center justify-center text-heritage-espresso hover:bg-heritage-espresso hover:text-white rounded-lg transition-colors">
                                                    <FaPlus size={10} />
                                                </button>
                                            </div>
                                        ) : (
                                            <button 
                                                onClick={() => addToCart(item)} 
                                                disabled={!isOpen}
                                                className={`w-full py-3 rounded-xl border text-xs font-bold uppercase tracking-widest transition-all ${
                                                    isOpen 
                                                    ? 'border-heritage-espresso/10 hover:bg-heritage-espresso hover:text-white' 
                                                    : 'border-red-100 text-red-300 bg-red-50/30 cursor-not-allowed'
                                                }`}
                                            >
                                                {isOpen ? 'Add to Order' : 'Closed'}
                                            </button>
                                        )}
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Menu;
