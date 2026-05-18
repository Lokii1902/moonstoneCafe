import React, { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { FaTimes, FaTrash, FaMinus, FaPlus, FaClock } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../utils/api';
import { toast } from 'react-toastify';
import { useRestaurant } from '../context/RestaurantContext';

const CartModal = () => {
    const { cart, isCartOpen, setIsCartOpen, updateQuantity, removeFromCart, getCartTotal, clearCart } = useCart();
    const { user } = useAuth();
    const { isOpen } = useRestaurant();
    const [formData, setFormData] = useState({ 
        name: user?.name || '', 
        phone: user?.phone || '', 
        address: user?.address || '' 
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isAutoFilled, setIsAutoFilled] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState('online');

    // Sync form data when user changes or modal opens
    useEffect(() => {
        if (isCartOpen && user) {
            setFormData({
                name: user.name || '',
                phone: user.phone || '',
                address: user.address || ''
            });
            if (user.phone || user.address) {
                setIsAutoFilled(true);
            }
        } else if (isCartOpen && !user) {
            setIsAutoFilled(false);
        }
    }, [isCartOpen, user]);

    if (!isCartOpen) return null;

    const handlePayment = async () => {
        setIsSubmitting(true);
        try {
            const total = getCartTotal();
            
            // 1. Create Razorpay order on backend
            const { data: order } = await api.post('payment/create-order', { amount: total });

            // 2. Open Razorpay Modal
            const options = {
                key: 'rzp_test_SoSGYywopz7AuB', // Use configured key ID
                amount: order.amount,
                currency: order.currency,
                name: 'Moonstone Café',
                description: 'Restaurant Order Payment',
                order_id: order.id,
                handler: async (response) => {
                    try {
                        // 3. Verify payment on success
                        const verificationData = {
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature,
                            order_details: {
                                items: cart.map(item => ({
                                    id: item.id,
                                    name: item.name,
                                    price: item.price,
                                    quantity: item.qty
                                })),
                                total_price: total,
                                customer_details: formData
                            }
                        };

                        const { data } = await api.post('payment/verify', verificationData);
                        
                        toast.success("Payment Successful! Order Placed.");
                        clearCart();
                        setIsSubmitting(false);
                        setIsCartOpen(false);
                        setFormData({ name: '', phone: '', address: '' });
                    } catch (err) {
                        console.error(err);
                        toast.error("Payment verification failed. Please contact support.");
                        setIsSubmitting(false);
                    }
                },
                prefill: {
                    name: formData.name,
                    contact: formData.phone
                },
                theme: {
                    color: '#B84B2B' // heritage-saffron
                },
                modal: {
                    ondismiss: () => {
                        setIsSubmitting(false);
                        toast.info("Payment cancelled.");
                    }
                }
            };

            const rzp = new window.Razorpay(options);
            rzp.open();

        } catch (error) {
            console.error(error);
            const errMsg = error.response?.data?.message || error.response?.data?.error || error.message;
            toast.error(`Could not initiate payment: ${errMsg}`);
            setIsSubmitting(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (paymentMethod === 'online') {
            handlePayment();
        } else {
            setIsSubmitting(true);
            try {
                const total = getCartTotal();
                const orderData = {
                    items: cart.map(item => ({
                        id: item.id,
                        name: item.name,
                        price: item.price,
                        quantity: item.qty
                    })),
                    total_price: total,
                    customer_details: formData
                };
                
                await api.post('orders/cod', orderData);
                
                toast.success("Order Placed via Cash on Delivery!");
                clearCart();
                setIsCartOpen(false);
                setFormData({ name: '', phone: '', address: '' });
            } catch (error) {
                console.error(error);
                const errMsg = error.response?.data?.message || error.message;
                toast.error(`Could not place order: ${errMsg}`);
            } finally {
                setIsSubmitting(false);
            }
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex justify-end">
            {/* Backdrop */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsCartOpen(false)}
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            />

            {/* Panel */}
            <motion.div
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col"
            >
                <div className="p-6 bg-heritage-olive text-white flex justify-between items-center">
                    <h2 className="text-2xl font-serif">Your Order</h2>
                    <button onClick={() => setIsCartOpen(false)} className="hover:text-heritage-saffron transition-colors">
                        <FaTimes size={24} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {cart.length === 0 ? (
                        <div className="text-center text-heritage-espresso/40 py-20">
                            <p className="text-xl font-serif mb-2">Your basket is empty</p>
                            <button onClick={() => setIsCartOpen(false)} className="text-sm font-bold uppercase tracking-widest text-heritage-saffron hover:underline">
                                Browse Menu
                            </button>
                        </div>
                    ) : (
                        cart.map(item => (
                            <div key={item.id} className="flex gap-4 items-center bg-heritage-stone/30 p-4 rounded-xl">
                                <img src={item.image_url || 'https://via.placeholder.com/60'} alt={item.name} className="w-16 h-16 rounded-lg object-cover" />
                                <div className="flex-1">
                                    <h4 className="font-bold text-heritage-espresso font-serif">{item.name}</h4>
                                    <div className="text-sm text-heritage-espresso/60">₹{item.price} x {item.qty}</div>
                                </div>
                                <div className="flex flex-col items-center gap-2">
                                    <button onClick={() => removeFromCart(item.id)} className="text-red-400 hover:text-red-600">
                                        <FaTrash size={12} />
                                    </button>
                                    <div className="flex items-center gap-2 bg-white rounded-full px-2 py-1 shadow-sm border border-heritage-espresso/10">
                                        <button onClick={() => updateQuantity(item.id, -1)} className="w-6 h-6 flex items-center justify-center text-heritage-espresso/60 hover:text-heritage-saffron"><FaMinus size={8} /></button>
                                        <span className="text-xs font-bold w-4 text-center">{item.qty}</span>
                                        <button onClick={() => updateQuantity(item.id, 1)} className="w-6 h-6 flex items-center justify-center text-heritage-espresso/60 hover:text-heritage-saffron"><FaPlus size={8} /></button>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {cart.length > 0 && (
                    <div className="p-6 border-t border-heritage-espresso/10 bg-white">
                        <div className="flex justify-between items-center mb-6 text-xl font-serif text-heritage-espresso">
                            <span>Total</span>
                            <span className="font-bold">₹{getCartTotal().toFixed(2)}</span>
                        </div>

                        <div className="flex justify-between items-center mb-2">
                            <h3 className="text-xs font-bold uppercase tracking-widest text-heritage-espresso/40">Delivery Details</h3>
                            {isAutoFilled && (
                                <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-bold uppercase flex items-center gap-1">
                                    <span className="w-1 h-1 bg-green-500 rounded-full animate-pulse"></span>
                                    From Profile
                                </span>
                            )}
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <input
                                type="text"
                                required
                                placeholder="Your Name"
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                className="w-full bg-heritage-stone/30 border-b-2 border-heritage-espresso/10 p-3 focus:outline-none focus:border-heritage-saffron text-heritage-espresso text-sm"
                            />
                            <input
                                type="tel"
                                required
                                placeholder="Phone Number"
                                value={formData.phone}
                                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                className="w-full bg-heritage-stone/30 border-b-2 border-heritage-espresso/10 p-3 focus:outline-none focus:border-heritage-saffron text-heritage-espresso text-sm"
                            />
                            <textarea
                                required
                                placeholder="Address or Table Number"
                                value={formData.address}
                                onChange={e => setFormData({ ...formData, address: e.target.value })}
                                className="w-full bg-heritage-stone/30 border-b-2 border-heritage-espresso/10 p-3 focus:outline-none focus:border-heritage-saffron text-heritage-espresso text-sm"
                                rows="2"
                            ></textarea>

                            <div className="flex gap-6 py-2">
                                <label className="flex items-center gap-2 text-sm font-bold text-heritage-espresso cursor-pointer">
                                    <input 
                                        type="radio" 
                                        name="paymentMethod" 
                                        value="online" 
                                        checked={paymentMethod === 'online'} 
                                        onChange={(e) => setPaymentMethod(e.target.value)}
                                        className="accent-heritage-saffron scale-125"
                                    />
                                    Pay Online
                                </label>
                                <label className="flex items-center gap-2 text-sm font-bold text-heritage-espresso cursor-pointer">
                                    <input 
                                        type="radio" 
                                        name="paymentMethod" 
                                        value="cod" 
                                        checked={paymentMethod === 'cod'} 
                                        onChange={(e) => setPaymentMethod(e.target.value)}
                                        className="accent-heritage-saffron scale-125"
                                    />
                                    Cash on Delivery
                                </label>
                            </div>

                            <button
                                type="submit"
                                disabled={isSubmitting || !isOpen}
                                className={`w-full py-4 font-bold uppercase tracking-widest text-xs rounded-xl transition-all shadow-lg ${
                                    isOpen 
                                    ? 'bg-heritage-saffron text-white hover:bg-heritage-espresso' 
                                    : 'bg-red-50 text-red-300 cursor-not-allowed border border-red-100'
                                }`}
                            >
                                {isSubmitting ? 'Sending Order...' : (
                                    !isOpen ? (
                                        <span className="flex items-center justify-center gap-2">
                                            <FaClock /> Closed (Reopens at 5 PM)
                                        </span>
                                    ) : (
                                        paymentMethod === 'online' ? 'Pay & Place Order' : 'Place Order (COD)'
                                    )
                                )}
                            </button>
                        </form>
                    </div>
                )}
            </motion.div>
        </div>
    );
};

export default CartModal;
