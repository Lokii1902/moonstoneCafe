import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { motion, AnimatePresence } from 'framer-motion';
import { FaBox, FaCheckCircle, FaClock, FaMotorcycle, FaTimesCircle, FaMapMarkerAlt, FaReceipt, FaExclamationTriangle, FaSpinner } from 'react-icons/fa';
import { toast } from 'react-toastify';

const Orders = () => {
    const { user } = useAuth();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [cancellingOrderId, setCancellingOrderId] = useState(null);
    const [confirmModal, setConfirmModal] = useState({ show: false, orderId: null });
    const { loading: authLoading } = useAuth();

    const safeParse = (dataStr) => {
        if (!dataStr) return {};
        if (typeof dataStr === 'object') return dataStr;
        try {
            return JSON.parse(dataStr);
        } catch (e) {
            return {};
        }
    };

    const safeParseItems = (itemsStr) => {
        const parsed = safeParse(itemsStr);
        return Array.isArray(parsed) ? parsed : [];
    };

    useEffect(() => {
        const fetchOrders = async () => {
            setLoading(true);
            try {
                const { data } = await api.get('/orders/my-orders');
                setOrders(data);
            } catch (error) {
                console.error('Failed to fetch orders:', error);
                setError('Unable to load your orders. Please try again later.');
            } finally {
                setLoading(false);
            }
        };

        // Wait for auth to finish loading before deciding
        if (authLoading) return;

        if (user) {
            fetchOrders();
        } else {
            setLoading(false);
        }
    }, [user, authLoading]);

    const handleCancelOrder = async (orderId) => {
        setCancellingOrderId(orderId);
        setConfirmModal({ show: false, orderId: null });

        try {
            console.log(`[DEBUG] Requesting cancellation for order ${orderId}`);
            const response = await api.put(`/orders/${orderId}/cancel`, {});
            
            // Be resilient: check for success property OR simple success status code
            if (response.status === 200 || response.data.success) {
                toast.success(response.data.message || 'Order has been cancelled successfully');
                setOrders(prevOrders => 
                    prevOrders.map(order => 
                        String(order.id) === String(orderId) ? { ...order, status: 'cancelled' } : order
                    )
                );
            } else {
                throw new Error(response.data.message || 'Unexpected response from server');
            }
        } catch (error) {
            console.error('Failed to cancel order:', error);
            const errorMsg = error.response?.data?.message || error.message || 'Failed to cancel order';
            toast.error(`Cancellation Failed: ${errorMsg}`);
        } finally {
            setCancellingOrderId(null);
        }
    };

    const openConfirmModal = (orderId) => {
        setConfirmModal({ show: true, orderId });
    };

    const getStatusConfig = (status) => {
        const s = (status || 'pending').toLowerCase();
        if (s === 'delivered') return { icon: FaCheckCircle, color: 'text-green-600', bg: 'bg-green-100', border: 'border-green-200' };
        if (s === 'out for delivery') return { icon: FaMotorcycle, color: 'text-blue-600', bg: 'bg-blue-100', border: 'border-blue-200' };
        if (s === 'preparing') return { icon: FaBox, color: 'text-purple-600', bg: 'bg-purple-100', border: 'border-purple-200' };
        if (s === 'confirmed') return { icon: FaReceipt, color: 'text-indigo-600', bg: 'bg-indigo-100', border: 'border-indigo-200' };
        if (s === 'cancelled') return { icon: FaTimesCircle, color: 'text-red-600', bg: 'bg-red-100', border: 'border-red-200' };
        return { icon: FaClock, color: 'text-orange-600', bg: 'bg-orange-100', border: 'border-orange-200' }; // pending
    };

    /**
     * Smart payment badge logic:
     *   Cancelled + COD            → "Not Charged"      (grey)
     *   Cancelled + paid online    → "Refund Pending"   (amber)
     *   Cancelled + unpaid online  → "Not Charged"      (grey)
     *   Delivered + COD            → "Cash Paid"        (green)
     *   Paid Online (any status)   → "Paid Online"      (green)
     *   COD (non-cancelled)        → "Pay on Delivery"  (orange)
     *   Default (online pending)   → "Pending Payment"  (orange)
     */
    const getPaymentConfig = (order) => {
        const status = (order.status || '').toLowerCase();
        const paymentStatus = (order.payment_status || '').toLowerCase();
        const isCod = (order.payment_method || '').toLowerCase() === 'cod';
        const isCancelled = status === 'cancelled';
        const isPaid = paymentStatus === 'paid';
        const isRefunded = paymentStatus === 'refunded';

        // Refunded — confirmed by admin, always show this first
        if (isRefunded) {
            return {
                label: 'Refunded',
                className: 'bg-purple-50 text-purple-700 border-purple-200',
                dot: 'bg-purple-500',
            };
        }

        if (isCancelled) {
            if (isPaid) {
                // User paid online but order was cancelled — refund expected
                return {
                    label: 'Refund Pending',
                    className: 'bg-amber-50 text-amber-700 border-amber-300',
                    dot: 'bg-amber-500',
                };
            }
            // COD cancelled or online order cancelled before payment
            return {
                label: 'Not Charged',
                className: 'bg-gray-100 text-gray-500 border-gray-200',
                dot: 'bg-gray-400',
            };
        }

        if (isPaid) {
            return {
                label: 'Paid Online',
                className: 'bg-green-50 text-green-700 border-green-200',
                dot: 'bg-green-500',
            };
        }

        if (isCod) {
            if (status === 'delivered') {
                return {
                    label: 'Cash Paid',
                    className: 'bg-green-50 text-green-700 border-green-200',
                    dot: 'bg-green-500',
                };
            }
            return {
                label: 'Pay on Delivery',
                className: 'bg-orange-50 text-orange-700 border-orange-200',
                dot: 'bg-orange-500',
            };
        }

        return {
            label: 'Pending Payment',
            className: 'bg-orange-50 text-orange-700 border-orange-200',
            dot: 'bg-orange-400',
        };
    };

    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center pt-24 bg-heritage-stone text-heritage-espresso">
                <div className="text-center">
                    <FaClock className="mx-auto text-4xl opacity-30 mb-4" />
                    <p className="text-2xl font-serif">Please login to view your journey.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen pt-32 pb-24 px-4 sm:px-8 bg-heritage-stone/30 relative">
            {/* Background Accent */}
            <div className="absolute top-0 left-0 w-full h-[40vh] bg-gradient-to-b from-heritage-stone to-transparent -z-10" />

            <div className="max-w-5xl mx-auto">
                <div className="text-center mb-16 animate-fade-in">
                    <h1 className="text-5xl md:text-6xl font-serif text-heritage-espresso mb-4">Culinary Journey</h1>
                    <p className="text-sm font-bold uppercase tracking-widest text-heritage-espresso/50">Your Past & Present Orders</p>
                </div>
                
                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-heritage-saffron"></div>
                    </div>
                ) : error ? (
                    <div className="bg-red-50 text-red-600 p-8 rounded-3xl text-center border border-red-100 shadow-sm">
                        <p className="text-lg font-bold">{error}</p>
                    </div>
                ) : orders.length === 0 ? (
                    <div className="bg-white rounded-3xl p-16 shadow-sm border border-heritage-espresso/5 text-center max-w-2xl mx-auto">
                        <FaReceipt className="mx-auto text-6xl text-heritage-espresso/10 mb-6" />
                        <h2 className="text-2xl font-serif text-heritage-espresso mb-2">No orders found</h2>
                        <p className="text-heritage-espresso/60 mb-8">It seems you haven't indulged in our royal exquisite menu yet.</p>
                        <button 
                            onClick={() => window.location.href = '/menu'}
                            className="px-10 py-4 bg-heritage-saffron text-white text-xs font-bold uppercase tracking-widest rounded-full hover:bg-heritage-espresso transition-all shadow-md transform hover:-translate-y-1"
                        >
                            Explore Our Menu
                        </button>
                    </div>
                ) : (
                    <div className="space-y-8">
                        {orders.map((order, index) => {
                            const statusConfig = getStatusConfig(order.status);
                            const StatusIcon = statusConfig.icon;
                            const customerDetails = safeParse(order.customer_details);
                            const paymentConfig = getPaymentConfig(order);
                            
                            return (
                                <motion.div 
                                    key={order.id}
                                    initial={{ opacity: 0, y: 30 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1, type: "spring", stiffness: 100 }}
                                    className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-heritage-espresso/5 hover:shadow-lg transition-all duration-500 overflow-hidden relative group"
                                >
                                    {/* Accent line on the left side indicating status color */}
                                    <div className={`absolute top-0 left-0 h-full w-1.5 ${statusConfig.bg}`} />

                                    <div className="flex flex-col lg:flex-row gap-8 justify-between">
                                        
                                        {/* Left col: Order Meta */}
                                        <div className="flex-1">
                                            <div className="flex items-center gap-4 mb-6">
                                                <div className={`w-12 h-12 rounded-2xl flex flex-col items-center justify-center bg-heritage-stone/50 font-serif`}>
                                                    <span className="text-xs uppercase font-bold text-heritage-espresso/40">ID</span>
                                                    <span className="text-lg text-heritage-espresso font-bold">#{order.id}</span>
                                                </div>
                                                <div>
                                                    <p className="text-[10px] font-bold uppercase tracking-widest text-heritage-espresso/50 mb-1">Placed On</p>
                                                    <p className="font-medium text-heritage-espresso">
                                                        {new Date(order.created_at).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })} 
                                                        <span className="opacity-50 ml-2">{new Date(order.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', hour12: true})}</span>
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Items List */}
                                            <div className="space-y-3">
                                                <p className="text-[10px] font-bold uppercase tracking-widest text-heritage-espresso/30 border-b border-heritage-espresso/5 pb-2">Order Summary</p>
                                                {safeParseItems(order.items).map((item, idx) => (
                                                    <div key={idx} className="flex justify-between items-center group/item hover:bg-heritage-stone/20 p-2 -mx-2 rounded-lg transition-colors">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-8 h-8 rounded-full bg-heritage-stone/50 flex items-center justify-center text-xs font-bold text-heritage-espresso/70">
                                                                {item.quantity}x
                                                            </div>
                                                            <span className="font-serif text-lg text-heritage-espresso">{item.name || item.id}</span>
                                                        </div>
                                                        <span className="text-sm font-bold text-heritage-espresso/60">₹{item.price * (item.quantity || 1)}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Right col: Status, Total, Details */}
                                        <div className="lg:w-1/3 flex flex-col justify-between bg-heritage-stone/10 rounded-2xl p-6 border border-heritage-espresso/5">
                                            
                                            <div>
                                                <div className="flex items-center justify-between mb-4">
                                                    <span className="text-[10px] font-bold uppercase tracking-widest text-heritage-espresso/40">Status</span>
                                                    <span className="text-[10px] font-bold uppercase tracking-widest text-heritage-espresso/40">Payment</span>
                                                </div>
                                                
                                                <div className="flex flex-col gap-3 mb-6">
                                                    {/* Status Badge */}
                                                    <div className={`flex items-center gap-2 px-4 py-2 ${statusConfig.bg} ${statusConfig.color} rounded-xl border ${statusConfig.border} w-fit`}>
                                                        <StatusIcon size={14} />
                                                        <span className="text-xs font-bold uppercase tracking-widest">{order.status}</span>
                                                    </div>

                                                    {/* Payment Badge — context-aware */}
                                                    <div className={`flex items-center gap-2 px-4 py-2 rounded-xl border w-fit text-xs font-bold uppercase tracking-widest ${paymentConfig.className}`}>
                                                        <span className={`w-2 h-2 rounded-full flex-shrink-0 ${paymentConfig.dot}`} />
                                                        {paymentConfig.label}
                                                    </div>
                                                </div>

                                                {/* Delivery Info */}
                                                {customerDetails.address && (
                                                    <div className="mb-6">
                                                        <p className="text-[10px] font-bold uppercase tracking-widest text-heritage-espresso/40 mb-2 flex items-center gap-1">
                                                            <FaMapMarkerAlt /> Delivery To
                                                        </p>
                                                        <p className="text-sm text-heritage-espresso/80 leading-relaxed italic border-l-2 border-heritage-saffron/30 pl-3">
                                                            {customerDetails.address}
                                                        </p>
                                                    </div>
                                                )}

                                                {/* Cancel Button */}
                                                {(order.status?.toLowerCase() === 'pending') && (
                                                    <button
                                                        onClick={() => openConfirmModal(order.id)}
                                                        disabled={cancellingOrderId === order.id}
                                                        className={`mt-4 px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-widest transition-all w-full lg:w-fit shadow-md hover:shadow-lg flex items-center justify-center gap-2 ${
                                                            cancellingOrderId === order.id 
                                                            ? 'bg-heritage-stone text-heritage-espresso/40 cursor-not-allowed'
                                                            : 'bg-red-600 text-white hover:bg-red-700'
                                                        }`}
                                                    >
                                                        {cancellingOrderId === order.id ? (
                                                            <>
                                                                <FaSpinner className="animate-spin" /> Cancelling...
                                                            </>
                                                        ) : (
                                                            <>
                                                                <FaTimesCircle /> Cancel Order
                                                            </>
                                                        )}
                                                    </button>
                                                )}
                                            </div>

                                            <div className="border-t border-heritage-espresso/10 pt-4 mt-auto flex items-end justify-between">
                                                <span className="text-xs font-bold uppercase tracking-widest text-heritage-espresso/50">Total Amount</span>
                                                <span className="text-3xl font-serif text-heritage-espresso font-bold">₹{order.total_price}</span>
                                            </div>
                                        </div>

                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Perfect Confirmation Modal */}
            <AnimatePresence>
                {confirmModal.show && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setConfirmModal({ show: false, orderId: null })}
                            className="absolute inset-0 bg-heritage-espresso/80 backdrop-blur-sm"
                        ></motion.div>
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="relative w-full max-w-sm bg-white rounded-3xl p-8 shadow-2xl text-center"
                        >
                            <div className="w-20 h-20 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
                                <FaExclamationTriangle size={32} />
                            </div>
                            <h2 className="text-2xl font-serif text-heritage-espresso mb-2">Cancel Order?</h2>
                            <p className="text-heritage-espresso/60 mb-8 leading-relaxed">
                                Are you sure you want to cancel Order <span className="font-bold text-heritage-espresso">#{confirmModal.orderId}</span>? This action cannot be undone.
                            </p>
                            <div className="flex flex-col gap-3">
                                <button
                                    onClick={() => handleCancelOrder(confirmModal.orderId)}
                                    className="w-full py-4 bg-red-600 text-white rounded-2xl text-xs font-bold uppercase tracking-widest hover:bg-red-700 transition-all shadow-md"
                                >
                                    Yes, Cancel Order
                                </button>
                                <button
                                    onClick={() => setConfirmModal({ show: false, orderId: null })}
                                    className="w-full py-4 bg-heritage-stone/50 text-heritage-espresso rounded-2xl text-xs font-bold uppercase tracking-widest hover:bg-heritage-stone transition-all"
                                >
                                    Keep Order
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Orders;
