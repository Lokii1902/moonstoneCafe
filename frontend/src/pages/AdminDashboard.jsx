import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { toast } from 'react-toastify';
import { FaTrash, FaPlus, FaTimes, FaSignOutAlt, FaEdit, FaChartBar, FaClipboardList, FaUtensils, FaEnvelope, FaCloudUploadAlt, FaImage } from 'react-icons/fa';
import AdminSidebar from '../components/AdminSidebar';
import AdminNavbar from '../components/AdminNavbar';
import { useSocket } from '../context/SocketContext';
import useNotifications from '../hooks/useNotifications.jsx';

const AdminDashboard = () => {
    const navigate = useNavigate();
    const socket = useSocket();
    const { showNotification } = useNotifications();

    const [activeTab, setActiveTab ] = useState('overview');
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [menuItems, setMenuItems] = useState([]);
    const [categories, setCategories] = useState([]);
    const [orders, setOrders] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [editingId, setEditingId] = useState(null);
    const [orderLoading, setOrderLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    // Restaurant Info State
    const [restaurantInfo, setRestaurantInfo] = useState({
        name: '', address: '', phone: '', email: '', opening_hours: '', cuisine_type: '', extra_info: '',
        opening_time: '17:00', closing_time: '23:00', is_manual_closed: false, operating_mode: 'auto'
    });

    // New Item Form State
    const [newItem, setNewItem] = useState({
        name: '', description: '', price: '', category_id: '', is_veg: false, image_url: '', is_available: true
    });
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState('');
    const [imageUploading, setImageUploading] = useState(false);
    const [isDragOver, setIsDragOver] = useState(false);
    const fileInputRef = useRef(null);

    // Set up Socket Listeners
    useEffect(() => {
        if (!socket) return;

        const handleNewOrder = (data) => {
            showNotification({
                title: '🛍️ New Order Received!',
                body: `Order #${data.id} for ₹${data.total_price}`,
                onClick: () => setActiveTab('orders')
            });
            fetchOrders(); // Refresh orders list
        };

        const handleNewMessage = (data) => {
            showNotification({
                title: '📧 New Message!',
                body: `From: ${data.name} - ${data.subject}`,
                onClick: () => setActiveTab('messages')
            });
            fetchData(); // Refresh messages (fetchData fetches messages)
        };

        const handleNewReservation = (data) => {
            showNotification({
                title: '📅 New Reservation!',
                body: `${data.name} for ${data.guests} guests on ${data.reservation_date}`,
                onClick: () => setActiveTab('messages')
            });
            fetchData();
        };

        const handleOrderCancelled = (data) => {
            toast.info(`Order #${data.id} was cancelled by the user`);
            setOrders(prev => prev.map(o => String(o.id) === String(data.id) ? { ...o, status: 'cancelled' } : o));
        };

        socket.on('newOrder', handleNewOrder);
        socket.on('newMessage', handleNewMessage);
        socket.on('newReservation', handleNewReservation);
        socket.on('orderCancelled', handleOrderCancelled);

        return () => {
            socket.off('newOrder', handleNewOrder);
            socket.off('newMessage', handleNewMessage);
            socket.off('newReservation', handleNewReservation);
            socket.off('orderCancelled', handleOrderCancelled);
        };
    }, [socket, showNotification]);

    // Check Auth & Fetch Initial Data
    useEffect(() => {
        const token = localStorage.getItem('adminToken');
        if (!token) {
            navigate('/admin/login');
        } else {
            fetchData();
        }
    }, [navigate]);

    const fetchData = async () => {
        try {
            // Fetch all sections independently so failure in one doesn't block others
            const fetchSection = async (endpoint, setter, label) => {
                try {
                    const res = await api.get(endpoint);
                    setter(res.data);
                } catch (err) {
                    console.error(`Error fetching ${label}:`, err);
                    toast.error(`Could not load ${label}`);
                }
            };

            await Promise.all([
                fetchSection('/contact', setMessages, "Messages"),
                fetchSection('/menu/categories', (data) => {
                    setCategories(data);
                    if (data.length > 0) {
                        setNewItem(prev => ({ ...prev, category_id: data[0].id }));
                    }
                }, "Categories"),
                fetchSection('/menu/admin/items', setMenuItems, "Menu Items"),
                fetchOrders()
            ]);

            try {
                const infoRes = await api.get('/restaurant');
                if (infoRes.data) setRestaurantInfo(infoRes.data);
            } catch (err) {
                console.log("No existing restaurant info found, using defaults");
            }
        } catch (error) {
            console.error(error);
            if (error.response?.status === 401) {
                localStorage.removeItem('adminToken');
                navigate('/admin/login');
            }
        }
    };

    const fetchOrders = async () => {
        try {
            setOrderLoading(true);
            const { data } = await api.get('/orders/admin/all');
            setOrders(data);
        } catch (error) {
            console.error(error);
            toast.error("Failed to fetch orders");
        } finally {
            setOrderLoading(false);
        }
    };

    const handleUpdateStatus = async (orderId, status) => {
        try {
            await api.put(`/orders/${orderId}/status`, { status });
            toast.success(`Order #${orderId} updated to ${status}`);
            setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o));
        } catch (error) {
            console.error(error);
            toast.error("Failed to update status");
        }
    };

    const handleUpdatePaymentStatus = async (orderId, payment_status) => {
        try {
            await api.put(`/orders/${orderId}/payment-status`, { payment_status });
            toast.success(`Payment status for Order #${orderId} updated to ${payment_status}`);
            setOrders(prev => prev.map(o => o.id === orderId ? { ...o, payment_status } : o));
        } catch (error) {
            console.error(error);
            toast.error("Failed to update payment status");
        }
    };


    const safeParse = (data) => {
        if (!data) return [];
        if (typeof data === 'object') return data;
        try {
            return JSON.parse(data);
        } catch (e) {
            return [];
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('adminToken');
        navigate('/admin/login');
    };

    const handleDeleteItem = async (id) => {
        if (!window.confirm("Are you sure you want to delete this item?")) return;
        try {
            await api.delete(`/menu/items/${id}`);
            toast.success("Item deleted");
            setMenuItems(prev => prev.filter(i => i.id !== id));
        } catch (error) {
            toast.error("Failed to delete item");
        }
    };

    const handleToggleAvailability = async (item) => {
        try {
            const updatedItem = {
                ...item,
                is_available: !item.is_available
            };
            
            // To ensure compatibility with the existing PUT endpoint which expects these
            const payload = {
                category_id: updatedItem.category_id,
                name: updatedItem.name,
                description: updatedItem.description,
                price: parseFloat(updatedItem.price),
                is_veg: Boolean(updatedItem.is_veg),
                image_url: updatedItem.image_url,
                is_available: Boolean(updatedItem.is_available)
            };

            await api.put(`/menu/items/${item.id}`, payload);
            toast.success(`${item.name} is now ${updatedItem.is_available ? 'Available' : 'Unavailable'}`);
            setMenuItems(prev => prev.map(i => i.id === item.id ? { ...i, is_available: updatedItem.is_available } : i));
        } catch (error) {
            console.error(error);
            toast.error("Failed to update availability status");
        }
    };

    const handleSaveItem = async (e) => {
        e.preventDefault();
        try {
            let finalImageUrl = newItem.image_url;

            // If a new file was selected, upload it first
            if (imageFile) {
                setImageUploading(true);
                const formData = new FormData();
                formData.append('image', imageFile);
                const uploadRes = await api.post('/upload/image', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                finalImageUrl = uploadRes.data.imageUrl;
                setImageUploading(false);
            }

            const payload = {
                ...newItem,
                image_url: finalImageUrl,
                price: parseFloat(newItem.price),
                category_id: parseInt(newItem.category_id),
                is_veg: Boolean(newItem.is_veg),
                is_available: Boolean(newItem.is_available)
            };

            if (editingId) {
                await api.put(`/menu/items/${editingId}`, payload);
                toast.success("Item updated!");
                setMenuItems(prev => prev.map(item => item.id === editingId ? { ...payload, id: editingId, category_name: categories.find(c => c.id == payload.category_id)?.name } : item));
            } else {
                const { data } = await api.post('/menu/items', payload);
                toast.success("Menu Item Added!");
                setMenuItems([...menuItems, { ...payload, id: data.id, category_name: categories.find(c => c.id == payload.category_id)?.name }]);
            }

            setShowModal(false);
            setEditingId(null);
            setNewItem({ ...newItem, name: '', description: '', price: '', image_url: '', is_available: true });
            setImageFile(null);
            setImagePreview('');
        } catch (error) {
            setImageUploading(false);
            console.error(error);
            toast.error(error.response?.data?.message || "Failed to save item");
        }
    };

    const handleEditItem = (item) => {
        setNewItem({
            name: item.name,
            description: item.description,
            price: item.price,
            category_id: item.category_id,
            is_veg: Boolean(item.is_veg),
            image_url: item.image_url || '',
            is_available: item.is_available !== undefined ? Boolean(item.is_available) : true
        });
        setImageFile(null);
        setImagePreview(item.image_url || '');
        setEditingId(item.id);
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setEditingId(null);
        setNewItem({ name: '', description: '', price: '', category_id: categories.length > 0 ? categories[0].id : '', is_veg: false, image_url: '', is_available: true });
        setImageFile(null);
        setImagePreview('');
    };

    const handleMarkRead = async (id) => {
        try {
            await api.put(`/contact/${id}/read`);
            setMessages(prev => prev.map(msg => msg.id === id ? { ...msg, is_read: 1 } : msg));
            toast.success("Marked as read");
        } catch (error) {
            console.error("Mark read error:", error);
            toast.error(error.response?.data?.message || "Failed to update status");
        }
    };

    const handleSaveInfo = async (e) => {
        e.preventDefault();
        try {
            await api.put('/restaurant', restaurantInfo);
            toast.success("Restaurant Info Updated!");
        } catch (error) {
            console.error(error);
            toast.error("Failed to update info");
        }
    };

    const updateOperatingMode = async (mode) => {
        try {
            setRestaurantInfo(prev => {
                const updated = { ...prev, operating_mode: mode };
                // Call API with the guaranteed fresh state
                api.put('/restaurant', updated).then(() => {
                    toast.success(`Restaurant is now ${mode === 'forced_open' ? 'ALWAYS OPEN' : mode === 'forced_closed' ? 'ALWAYS CLOSED' : 'following the SCHEDULE'}`);
                    // Re-fetch to get latest calculated is_open status
                    api.get('/restaurant').then(res => {
                        if (res.data) setRestaurantInfo(res.data);
                    });
                }).catch(err => {
                    toast.error("Failed to sync with server");
                    fetchData(); // Rollback to server state
                });
                return updated;
            });
        } catch (error) {
            console.error(error);
            toast.error("Failed to update operating mode");
        }
    };

    const stats = [
        { label: 'Total Orders', value: orders.length, icon: FaClipboardList, color: 'text-blue-600', bg: 'bg-blue-100' },
        { label: 'Pending Orders', value: orders.filter(o => o.status === 'pending').length, icon: FaChartBar, color: 'text-orange-600', bg: 'bg-orange-100' },
        { label: 'Menu Items', value: menuItems.length, icon: FaUtensils, color: 'text-green-600', bg: 'bg-green-100' },
        { label: 'Unread Messages', value: messages.filter(m => !m.is_read).length, icon: FaEnvelope, color: 'text-purple-600', bg: 'bg-purple-100' },
    ];

    const getTabLabel = (id) => {
        const labels = {
            overview: 'Dashboard Overview',
            messages: 'Customer Messages',
            menu: 'Menu Management',
            orders: 'Order Management',
            info: 'Restaurant Configuration'
        };
        return labels[id] || 'Dashboard';
    };

    return (
        <div className="flex min-h-screen bg-heritage-stone text-heritage-espresso overflow-x-hidden">
            <AdminSidebar activeTab={activeTab} setActiveTab={setActiveTab} sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
            
            <div className={`flex-1 flex flex-col min-h-screen w-full transition-all duration-300 md:ml-64 relative`}>
                <AdminNavbar handleLogout={handleLogout} activeTabLabel={getTabLabel(activeTab)} setSidebarOpen={setSidebarOpen} />
                
                <main className="flex-1 mt-20 p-4 md:p-8 overflow-x-hidden w-full max-w-full">
                    {activeTab === 'overview' && (
                        <div className="space-y-8 animate-fade-in w-full">
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                                {stats.map((stat, idx) => (
                                    <div key={idx} className="bg-white p-6 rounded-3xl border border-heritage-espresso/5 shadow-sm hover:shadow-md transition-shadow">
                                        <div className="flex items-center justify-between mb-4">
                                            <div className={`${stat.bg} ${stat.color} p-3 rounded-2xl`}>
                                                <stat.icon size={20} />
                                            </div>
                                        </div>
                                        <div className="text-2xl md:text-3xl font-serif text-heritage-espresso mb-1">{stat.value}</div>
                                        <div className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-heritage-espresso/40 break-words">{stat.label}</div>
                                    </div>
                                ))}
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                <div className="bg-white p-8 rounded-3xl border border-heritage-espresso/5 shadow-sm">
                                    <h3 className="text-2xl font-serif text-heritage-espresso mb-6">Recent Orders</h3>
                                    <div className="space-y-4">
                                        {orders.slice(0, 5).map(order => (
                                            <div key={order.id} className="flex items-center justify-between p-4 bg-heritage-stone/30 rounded-2xl">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 rounded-full bg-heritage-espresso text-white flex items-center justify-center font-bold text-xs uppercase">
                                                        #{order.id}
                                                    </div>
                                                    <div>
                                                        <div className="font-bold text-sm">{safeParse(order.customer_details).name || 'Guest'}</div>
                                                        <div className="text-[10px] text-heritage-espresso/50 uppercase tracking-widest">{new Date(order.created_at).toLocaleDateString()}</div>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <div className="font-bold text-sm">₹{order.total_price}</div>
                                                    <div className={`text-[8px] font-bold uppercase tracking-widest ${order.status === 'delivered' ? 'text-green-600' : 'text-heritage-saffron'}`}>
                                                        {order.status}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                        {orders.length === 0 && <p className="text-center text-heritage-espresso/40 italic py-4">No orders yet.</p>}
                                    </div>
                                    <button onClick={() => setActiveTab('orders')} className="w-full mt-6 py-3 border border-heritage-espresso/10 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-heritage-espresso hover:text-white transition-all">
                                        View All Orders
                                    </button>
                                </div>

                                <div className="bg-white p-8 rounded-3xl border border-heritage-espresso/5 shadow-sm">
                                    <h3 className="text-2xl font-serif text-heritage-espresso mb-6">Latest Messages</h3>
                                    <div className="space-y-4">
                                        {messages.slice(0, 5).map(msg => (
                                            <div key={msg.id} className={`p-4 rounded-2xl ${msg.is_read ? 'bg-heritage-stone/20' : 'bg-heritage-saffron/5 border-l-4 border-heritage-saffron'}`}>
                                                <div className="flex justify-between items-start mb-2">
                                                    <div className="font-bold text-sm">{msg.name}</div>
                                                    <div className="text-[8px] text-heritage-espresso/40 uppercase tracking-widest">
                                                        {new Date(msg.created_at).toLocaleDateString()}
                                                    </div>
                                                </div>
                                                <p className="text-xs text-heritage-espresso/70 line-clamp-1 italic">"{msg.message}"</p>
                                            </div>
                                        ))}
                                        {messages.length === 0 && <p className="text-center text-heritage-espresso/40 italic py-4">No messages yet.</p>}
                                    </div>
                                    <button onClick={() => setActiveTab('messages')} className="w-full mt-6 py-3 border border-heritage-espresso/10 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-heritage-espresso hover:text-white transition-all">
                                        View All Messages
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                {activeTab === 'messages' && (
                    <div className="bg-white rounded-3xl border border-heritage-espresso/5 overflow-x-auto shadow-sm w-full">
                        <table className="w-full min-w-[900px] text-left">
                            <thead className="bg-heritage-stone/50 text-heritage-espresso border-b border-heritage-espresso/10">
                                <tr>
                                    <th className="p-6 font-serif font-bold uppercase tracking-widest text-[10px]">Date</th>
                                    <th className="p-6 font-serif font-bold uppercase tracking-widest text-[10px]">Contact</th>
                                    <th className="p-6 font-serif font-bold uppercase tracking-widest text-[10px]">Subject</th>
                                    <th className="p-6 font-serif font-bold uppercase tracking-widest text-[10px] w-1/2">Message</th>
                                    <th className="p-6 font-serif font-bold uppercase tracking-widest text-[10px]">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-heritage-espresso/5">
                                {messages.map(msg => (
                                    <tr key={msg.id} className="hover:bg-heritage-stone/30 transition-colors">
                                        <td className="p-6">
                                            <div className="font-bold text-heritage-espresso">{new Date(msg.created_at).toLocaleDateString()}</div>
                                            <div className="text-xs text-heritage-espresso/50 uppercase tracking-widest">{new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}</div>
                                        </td>
                                        <td className="p-6">
                                            <div className="font-bold text-heritage-espresso">{msg.name}</div>
                                            <div className="text-sm text-heritage-espresso/60">{msg.email}</div>
                                            <div className="text-sm text-heritage-espresso/60">{msg.phone}</div>
                                        </td>
                                        <td className="p-6 font-serif text-lg text-heritage-espresso">{msg.subject}</td>
                                        <td className="p-6 text-heritage-espresso/70 leading-relaxed text-sm">{msg.message}</td>
                                        <td className="p-6">
                                            {msg.is_read ? (
                                                <span className="text-green-600 bg-green-100 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest">Read</span>
                                            ) : (
                                                <button onClick={() => handleMarkRead(msg.id)} className="text-heritage-saffron hover:underline text-xs font-bold uppercase tracking-widest whitespace-nowrap">
                                                    Mark as Read
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {messages.length === 0 && <p className="p-12 text-center text-heritage-espresso/40 italic font-serif text-xl">No messages found.</p>}
                    </div>
                )}

                {activeTab === 'menu' && (
                    <div>
                        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8">
                            <div className="flex items-center gap-4 w-full md:w-auto">
                                <div className="relative flex-1 md:w-64">
                                    <input 
                                        type="text" 
                                        placeholder="Search menu items..." 
                                        className="w-full bg-white border border-heritage-espresso/10 rounded-full py-3 px-6 text-sm focus:outline-none focus:border-heritage-saffron"
                                        onChange={(e) => {
                                            const term = e.target.value.toLowerCase();
                                            // Handle filtering logic in the mapping
                                            setSearchTerm(term);
                                        }}
                                    />
                                </div>
                                <div className="relative">
                                    <select
                                        value={selectedCategory}
                                        onChange={(e) => setSelectedCategory(e.target.value)}
                                        className="appearance-none bg-white border border-heritage-espresso/10 text-heritage-espresso py-3 px-6 pr-12 rounded-full text-xs font-bold uppercase tracking-widest focus:outline-none focus:border-heritage-saffron cursor-pointer"
                                    >
                                        <option value="All">All Categories</option>
                                        {categories.map(cat => (
                                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                                        ))}
                                    </select>
                                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-heritage-espresso/40">
                                        <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" /></svg>
                                    </div>
                                </div>
                            </div>

                            <button onClick={() => setShowModal(true)} className="w-full md:w-auto px-8 py-3 bg-heritage-espresso text-white rounded-full text-[10px] font-bold uppercase tracking-widest hover:bg-heritage-saffron transition-all shadow-lg flex items-center justify-center gap-2">
                                <FaPlus /> Add New Item
                            </button>
                        </div>

                        <div className="bg-white rounded-3xl border border-heritage-espresso/5 overflow-x-auto shadow-sm w-full">
                            <table className="w-full min-w-[900px] text-left">
                                <thead className="bg-heritage-stone/50 text-heritage-espresso border-b border-heritage-espresso/10">
                                    <tr>
                                        <th className="p-6 font-serif font-bold uppercase tracking-widest text-[10px]">Item</th>
                                        <th className="p-6 font-serif font-bold uppercase tracking-widest text-[10px]">Category</th>
                                        <th className="p-6 font-serif font-bold uppercase tracking-widest text-[10px]">Price</th>
                                        <th className="p-6 font-serif font-bold uppercase tracking-widest text-[10px]">Status</th>
                                        <th className="p-6 font-serif font-bold uppercase tracking-widest text-[10px] text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-heritage-espresso/5">
                                    {menuItems
                                        .filter(item => (selectedCategory === 'All' || item.category_id == selectedCategory) && (!searchTerm || item.name.toLowerCase().includes(searchTerm)))
                                        .map(item => (
                                            <tr key={item.id} className="hover:bg-heritage-stone/30 transition-colors">
                                                <td className="p-6 flex items-center gap-4">
                                                    <img src={item.image_url ? (item.image_url.startsWith('http') ? item.image_url : `https://moonstonecafe.onrender.com${item.image_url}`) : 'https://via.placeholder.com/50'} alt="mini" className="w-16 h-16 rounded-xl object-cover shadow-sm" />
                                                    <div>
                                                        <div className="font-bold text-heritage-espresso text-lg font-serif">{item.name}</div>
                                                        <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-full ${item.is_veg ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                            {item.is_veg ? 'VEG' : 'NON-VEG'}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="p-6 text-heritage-espresso/60">{item.category_name || '-'}</td>
                                                <td className="p-6 font-bold text-heritage-espresso">₹{item.price}</td>
                                                <td className="p-6">
                                                    <button 
                                                        onClick={() => handleToggleAvailability(item)}
                                                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-heritage-saffron ${item.is_available ? 'bg-green-500' : 'bg-gray-300'}`}
                                                        title={item.is_available ? 'Mark as Unavailable' : 'Mark as Available'}
                                                    >
                                                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${item.is_available ? 'translate-x-6' : 'translate-x-1'}`} />
                                                    </button>
                                                    <div className="text-[8px] font-bold uppercase tracking-widest mt-1 text-heritage-espresso/50">
                                                        {item.is_available ? 'Available' : 'Out of Stock'}
                                                    </div>
                                                </td>
                                                <td className="p-6 text-right">
                                                    <button onClick={() => handleEditItem(item)} className="w-10 h-10 rounded-full border border-heritage-saffron text-heritage-saffron hover:bg-heritage-saffron hover:text-white transition-all inline-flex items-center justify-center mr-2">
                                                        <FaEdit size={12} />
                                                    </button>
                                                    <button onClick={() => handleDeleteItem(item.id)} className="w-10 h-10 rounded-full border border-red-200 text-red-500 hover:bg-red-500 hover:text-white transition-all inline-flex items-center justify-center">
                                                        <FaTrash size={12} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {activeTab === 'orders' && (
                    <div className="bg-white rounded-3xl border border-heritage-espresso/5 overflow-x-auto shadow-sm w-full">
                        <table className="w-full min-w-[1000px] text-left">
                            <thead className="bg-heritage-stone/50 text-heritage-espresso border-b border-heritage-espresso/10">
                                <tr>
                                    <th className="p-6 font-serif font-bold uppercase tracking-widest text-[10px]">Order ID</th>
                                    <th className="p-6 font-serif font-bold uppercase tracking-widest text-[10px]">Customer</th>
                                    <th className="p-6 font-serif font-bold uppercase tracking-widest text-[10px]">Details</th>
                                    <th className="p-6 font-serif font-bold uppercase tracking-widest text-[10px]">Total</th>
                                    <th className="p-6 font-serif font-bold uppercase tracking-widest text-[10px]">Payment</th>
                                    <th className="p-6 font-serif font-bold uppercase tracking-widest text-[10px]">Status</th>
                                    <th className="p-6 font-serif font-bold uppercase tracking-widest text-[10px]">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-heritage-espresso/5">
                                {orders.map(order => {
                                    const details = safeParse(order.customer_details);
                                    const items = safeParse(order.items);
                                    return (
                                        <tr key={order.id} className="hover:bg-heritage-stone/30 transition-colors">
                                            <td className="p-6">
                                                <div className="font-bold text-heritage-espresso">#{order.id}</div>
                                                <div className="text-[10px] text-heritage-espresso/50 uppercase tracking-widest">{new Date(order.created_at).toLocaleDateString()}</div>
                                            </td>
                                            <td className="p-6">
                                                <div className="font-bold text-heritage-espresso">{details.name || order.user_name || 'Guest'}</div>
                                                <div className="text-xs text-heritage-espresso/60">{details.phone || 'No Phone'}</div>
                                                <div className="text-[10px] text-heritage-espresso/40 italic truncate max-w-[150px]">{details.address || 'No Address'}</div>
                                            </td>
                                            <td className="p-6">
                                                <div className="space-y-1">
                                                    {items.map((item, idx) => (
                                                        <div key={idx} className="text-xs text-heritage-espresso/70">
                                                            {item.quantity}x {item.name}
                                                        </div>
                                                    ))}
                                                </div>
                                            </td>
                                            <td className="p-6 font-bold text-heritage-espresso">₹{order.total_price}</td>
                                            <td className="p-6">
                                                <select 
                                                    value={order.payment_status || 'pending'}
                                                    onChange={(e) => handleUpdatePaymentStatus(order.id, e.target.value)}
                                                    className={`bg-white border rounded-lg p-2 text-[10px] font-bold uppercase tracking-widest focus:outline-none focus:ring-2 focus:ring-heritage-saffron ${
                                                        order.payment_status === 'paid' ? 'border-green-300 text-green-700' :
                                                        order.payment_status === 'refunded' ? 'border-purple-300 text-purple-700' :
                                                        order.payment_status === 'failed' ? 'border-red-300 text-red-700' :
                                                        'border-gray-300 text-gray-500'
                                                    }`}
                                                >
                                                    <option value="pending">Pending</option>
                                                    <option value="paid">Paid</option>
                                                    <option value="refunded">Refunded</option>
                                                    <option value="failed">Failed</option>
                                                </select>
                                                <div className="mt-1 text-[8px] text-heritage-espresso/50 uppercase font-bold text-center">
                                                    {order.payment_method === 'cod' ? '(COD)' : '(Online)'}
                                                </div>
                                            </td>
                                            <td className="p-6">
                                                <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                                                    order.status === 'delivered' ? 'bg-green-100 text-green-700' :
                                                    order.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                                                    order.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                                                    'bg-blue-100 text-blue-700'
                                                }`}>
                                                    {order.status}
                                                </span>
                                            </td>
                                            <td className="p-6">
                                                <select 
                                                    value={order.status}
                                                    onChange={(e) => handleUpdateStatus(order.id, e.target.value)}
                                                    className="bg-heritage-stone/50 border border-heritage-espresso/10 rounded-lg p-2 text-[10px] font-bold uppercase tracking-widest focus:outline-none focus:border-heritage-saffron"
                                                >
                                                    <option value="pending">Pending</option>
                                                    <option value="confirmed">Confirmed</option>
                                                    <option value="preparing">Preparing</option>
                                                    <option value="out for delivery">Out for Delivery</option>
                                                    <option value="delivered">Delivered</option>
                                                    <option value="cancelled">Cancelled</option>
                                                </select>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                        {orderLoading && (
                            <div className="p-12 text-center text-heritage-espresso/40 flex flex-col items-center gap-2">
                                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-heritage-saffron"></div>
                                <p className="font-serif">Loading Orders...</p>
                            </div>
                        )}
                        {!orderLoading && orders.length === 0 && (
                            <p className="p-12 text-center text-heritage-espresso/40 italic font-serif text-xl">No orders found.</p>
                        )}
                    </div>
                )}

                {activeTab === 'info' && (
                    <div className="bg-white p-8 rounded-3xl border border-heritage-espresso/5 shadow-sm max-w-4xl mx-auto">
                        <div className="flex justify-between items-center mb-8">
                            <div>
                                <h2 className="text-2xl font-serif text-heritage-espresso">Restaurant Details</h2>
                                <div className="mt-2 flex items-center gap-2">
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-heritage-espresso/40">Current Status:</span>
                                    <span className={`px-2 py-0.5 rounded-full text-[8px] font-bold uppercase tracking-[0.2em] animate-pulse ${restaurantInfo.is_open ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-red-100 text-red-700 border border-red-200'}`}>
                                        {restaurantInfo.is_open ? '● Open' : '○ Closed'}
                                    </span>
                                </div>
                            </div>
                            <p className="text-sm text-heritage-espresso/60">Used by AI Concierge</p>
                        </div>
                        <form onSubmit={handleSaveInfo} className="space-y-6">
                            <div>
                                <label className="block text-heritage-espresso/60 text-xs font-bold uppercase mb-2">Restaurant Name</label>
                                <input type="text" value={restaurantInfo.name} onChange={e => setRestaurantInfo({ ...restaurantInfo, name: e.target.value })} className="w-full bg-heritage-stone/30 border-b-2 border-heritage-espresso/10 p-3 focus:outline-none focus:border-heritage-saffron text-heritage-espresso text-lg font-serif" />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div>
                                    <label className="block text-heritage-espresso/60 text-xs font-bold uppercase mb-2">Phone Number</label>
                                    <input type="text" value={restaurantInfo.phone} onChange={e => setRestaurantInfo({ ...restaurantInfo, phone: e.target.value })} className="w-full bg-heritage-stone/30 border-b-2 border-heritage-espresso/10 p-3 focus:outline-none focus:border-heritage-saffron text-heritage-espresso" />
                                </div>
                                <div>
                                    <label className="block text-heritage-espresso/60 text-xs font-bold uppercase mb-2">Email Address</label>
                                    <input type="email" value={restaurantInfo.email} onChange={e => setRestaurantInfo({ ...restaurantInfo, email: e.target.value })} className="w-full bg-heritage-stone/30 border-b-2 border-heritage-espresso/10 p-3 focus:outline-none focus:border-heritage-saffron text-heritage-espresso" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-heritage-espresso/60 text-xs font-bold uppercase mb-2">Address</label>
                                <textarea value={restaurantInfo.address} onChange={e => setRestaurantInfo({ ...restaurantInfo, address: e.target.value })} className="w-full bg-heritage-stone/30 border-b-2 border-heritage-espresso/10 p-3 focus:outline-none focus:border-heritage-saffron text-heritage-espresso" rows="2"></textarea>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div>
                                    <label className="block text-heritage-espresso/60 text-xs font-bold uppercase mb-2">Opening Hours</label>
                                    <input type="text" value={restaurantInfo.opening_hours} onChange={e => setRestaurantInfo({ ...restaurantInfo, opening_hours: e.target.value })} className="w-full bg-heritage-stone/30 border-b-2 border-heritage-espresso/10 p-3 focus:outline-none focus:border-heritage-saffron text-heritage-espresso" placeholder="e.g. Mon-Sun: 11am - 11pm" />
                                </div>
                                <div>
                                    <label className="block text-heritage-espresso/60 text-xs font-bold uppercase mb-2">Cuisine Type</label>
                                    <input type="text" value={restaurantInfo.cuisine_type} onChange={e => setRestaurantInfo({ ...restaurantInfo, cuisine_type: e.target.value })} className="w-full bg-heritage-stone/30 border-b-2 border-heritage-espresso/10 p-3 focus:outline-none focus:border-heritage-saffron text-heritage-espresso" />
                                </div>
                            </div>
                            <div className="p-6 bg-heritage-espresso/5 rounded-3xl border border-heritage-saffron/10 mb-8">
                                <h3 className="text-lg font-serif text-heritage-espresso mb-4 flex items-center gap-2">
                                    <span className="w-2 h-2 bg-heritage-saffron rounded-full"></span>
                                    Operations Control
                                </h3>
                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                    {/* Auto Mode */}
                                    <button 
                                        type="button"
                                        onClick={() => updateOperatingMode('auto')}
                                        className={`p-4 rounded-2xl border-2 transition-all text-left flex flex-col gap-2 ${
                                            restaurantInfo.operating_mode === 'auto' 
                                            ? 'border-heritage-saffron bg-heritage-saffron/5 ring-4 ring-heritage-saffron/10' 
                                            : 'border-heritage-espresso/5 bg-white hover:border-heritage-espresso/20'
                                        }`}
                                    >
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm font-bold text-heritage-espresso">Auto (Schedule)</span>
                                            <div className={`w-3 h-3 rounded-full ${restaurantInfo.operating_mode === 'auto' ? 'bg-heritage-saffron animate-pulse' : 'bg-gray-200'}`}></div>
                                        </div>
                                        <p className="text-[10px] text-heritage-espresso/50 uppercase tracking-widest leading-relaxed">
                                            Follows your {restaurantInfo.opening_time} - {restaurantInfo.closing_time} timer
                                        </p>
                                    </button>

                                    {/* Forced Open */}
                                    <button 
                                        type="button"
                                        onClick={() => updateOperatingMode('forced_open')}
                                        className={`p-4 rounded-2xl border-2 transition-all text-left flex flex-col gap-2 ${
                                            restaurantInfo.operating_mode === 'forced_open' 
                                            ? 'border-green-500 bg-green-50 ring-4 ring-green-500/10' 
                                            : 'border-heritage-espresso/5 bg-white hover:border-heritage-espresso/20'
                                        }`}
                                    >
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm font-bold text-heritage-espresso">Always Open</span>
                                            <div className={`w-3 h-3 rounded-full ${restaurantInfo.operating_mode === 'forced_open' ? 'bg-green-500 animate-pulse' : 'bg-gray-200'}`}></div>
                                        </div>
                                        <p className="text-[10px] text-heritage-espresso/50 uppercase tracking-widest leading-relaxed">
                                            Force Open right now (Overrides the timer)
                                        </p>
                                    </button>

                                    {/* Forced Closed */}
                                    <button 
                                        type="button"
                                        onClick={() => updateOperatingMode('forced_closed')}
                                        className={`p-4 rounded-2xl border-2 transition-all text-left flex flex-col gap-2 ${
                                            restaurantInfo.operating_mode === 'forced_closed' 
                                            ? 'border-red-500 bg-red-50 ring-4 ring-red-500/10' 
                                            : 'border-heritage-espresso/5 bg-white hover:border-heritage-espresso/20'
                                        }`}
                                    >
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm font-bold text-heritage-espresso">Always Closed</span>
                                            <div className={`w-3 h-3 rounded-full ${restaurantInfo.operating_mode === 'forced_closed' ? 'bg-red-500 animate-pulse' : 'bg-gray-200'}`}></div>
                                        </div>
                                        <p className="text-[10px] text-heritage-espresso/50 uppercase tracking-widest leading-relaxed">
                                            Force Closed right now (Overrides the timer)
                                        </p>
                                    </button>
                                </div>

                                <div className="mt-8 pt-8 border-t border-heritage-espresso/5">
                                    <h4 className="text-xs font-bold text-heritage-espresso/40 uppercase tracking-[0.2em] mb-6">Operating Schedule</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div>
                                            <label className="block text-heritage-espresso/60 text-[10px] font-bold uppercase mb-2 tracking-widest">Opening Time</label>
                                            <input 
                                                type="time" 
                                                value={restaurantInfo.opening_time} 
                                                onChange={e => setRestaurantInfo({ ...restaurantInfo, opening_time: e.target.value })} 
                                                className="w-full bg-white border border-heritage-espresso/10 p-4 rounded-2xl focus:outline-none focus:border-heritage-saffron text-heritage-espresso font-bold shadow-sm" 
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-heritage-espresso/60 text-[10px] font-bold uppercase mb-2 tracking-widest">Closing Time</label>
                                            <input 
                                                type="time" 
                                                value={restaurantInfo.closing_time} 
                                                onChange={e => setRestaurantInfo({ ...restaurantInfo, closing_time: e.target.value })} 
                                                className="w-full bg-white border border-heritage-espresso/10 p-4 rounded-2xl focus:outline-none focus:border-heritage-saffron text-heritage-espresso font-bold shadow-sm" 
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div>
                                <label className="block text-heritage-espresso/60 text-xs font-bold uppercase mb-2">Extra Information (For AI)</label>
                                <textarea value={restaurantInfo.extra_info || ''} onChange={e => setRestaurantInfo({ ...restaurantInfo, extra_info: e.target.value })} className="w-full bg-heritage-stone/30 border-b-2 border-heritage-espresso/10 p-3 focus:outline-none focus:border-heritage-saffron text-heritage-espresso" rows="3" placeholder="Add specific details like 'Live Music on Fridays' or 'No Pets allowed'"></textarea>
                            </div>
                            <div className="pt-4">
                                <button type="submit" className="px-8 py-3 bg-heritage-espresso text-white font-bold uppercase tracking-widest text-xs rounded-full hover:bg-heritage-saffron transition-colors shadow-lg">
                                    Save Changes
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* ADD ITEM MODAL */}
                {showModal && (
                    <div className="fixed inset-0 bg-heritage-espresso/80 backdrop-blur-sm flex items-center justify-center z-50 px-4">
                        <div className="bg-white p-8 rounded-3xl shadow-2xl w-full max-w-lg relative">
                            <button onClick={handleCloseModal} className="absolute top-6 right-6 text-heritage-espresso/40 hover:text-heritage-saffron transition-colors"><FaTimes size={24} /></button>
                            <h2 className="text-3xl font-serif text-heritage-espresso mb-8">{editingId ? 'Edit Dish' : 'Add New Dish'}</h2>

                            <form onSubmit={handleSaveItem} className="space-y-6">
                                <div>
                                    <label className="block text-heritage-espresso/60 text-xs font-bold uppercase mb-2">Item Name</label>
                                    <input type="text" required value={newItem.name} onChange={e => setNewItem({ ...newItem, name: e.target.value })} className="w-full bg-heritage-stone/30 border-b-2 border-heritage-espresso/10 p-3 focus:outline-none focus:border-heritage-saffron text-heritage-espresso" placeholder="e.g. Saffron Rice" />
                                </div>
                                <div className="grid grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-heritage-espresso/60 text-xs font-bold uppercase mb-2">Price (₹)</label>
                                        <input type="number" required value={newItem.price} onChange={e => setNewItem({ ...newItem, price: e.target.value })} className="w-full bg-heritage-stone/30 border-b-2 border-heritage-espresso/10 p-3 focus:outline-none focus:border-heritage-saffron text-heritage-espresso" placeholder="0.00" />
                                    </div>
                                    <div>
                                        <label className="block text-heritage-espresso/60 text-xs font-bold uppercase mb-2">Category</label>
                                        <select value={newItem.category_id} onChange={e => setNewItem({ ...newItem, category_id: e.target.value })} className="w-full bg-heritage-stone/30 border-b-2 border-heritage-espresso/10 p-3 focus:outline-none focus:border-heritage-saffron text-heritage-espresso appearance-none">
                                            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                        </select>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-heritage-espresso/60 text-xs font-bold uppercase mb-2">Description</label>
                                    <textarea value={newItem.description} onChange={e => setNewItem({ ...newItem, description: e.target.value })} className="w-full bg-heritage-stone/30 border-b-2 border-heritage-espresso/10 p-3 focus:outline-none focus:border-heritage-saffron text-heritage-espresso" rows="2" placeholder="Describe the dish..."></textarea>
                                </div>
                                <div>
                                    <label className="block text-heritage-espresso/60 text-xs font-bold uppercase mb-2">Dish Image</label>
                                    {/* Hidden file input */}
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                                        className="hidden"
                                        onChange={(e) => {
                                            const file = e.target.files[0];
                                            if (file) {
                                                if (file.size > 5 * 1024 * 1024) {
                                                    toast.error('Image must be smaller than 5MB');
                                                    return;
                                                }
                                                setImageFile(file);
                                                setImagePreview(URL.createObjectURL(file));
                                            }
                                        }}
                                    />
                                    {/* Drag & Drop Zone */}
                                    <div
                                        onClick={() => fileInputRef.current?.click()}
                                        onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
                                        onDragLeave={() => setIsDragOver(false)}
                                        onDrop={(e) => {
                                            e.preventDefault();
                                            setIsDragOver(false);
                                            const file = e.dataTransfer.files[0];
                                            if (file) {
                                                if (!file.type.startsWith('image/')) {
                                                    toast.error('Please drop an image file');
                                                    return;
                                                }
                                                if (file.size > 5 * 1024 * 1024) {
                                                    toast.error('Image must be smaller than 5MB');
                                                    return;
                                                }
                                                setImageFile(file);
                                                setImagePreview(URL.createObjectURL(file));
                                            }
                                        }}
                                        className={`relative w-full border-2 border-dashed rounded-2xl cursor-pointer transition-all overflow-hidden ${
                                            isDragOver
                                                ? 'border-heritage-saffron bg-heritage-saffron/5 scale-[1.01]'
                                                : imagePreview
                                                ? 'border-heritage-espresso/20 bg-transparent'
                                                : 'border-heritage-espresso/20 bg-heritage-stone/30 hover:border-heritage-saffron hover:bg-heritage-saffron/5'
                                        }`}
                                    >
                                        {imagePreview ? (
                                            <div className="relative group">
                                                <img
                                                    src={imagePreview.startsWith('blob:') || imagePreview.startsWith('http') ? imagePreview : `https://moonstonecafe.onrender.com${imagePreview}`}
                                                    alt="Preview"
                                                    className="w-full h-48 object-cover rounded-2xl"
                                                />
                                                <div className="absolute inset-0 bg-heritage-espresso/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl flex flex-col items-center justify-center gap-2">
                                                    <FaCloudUploadAlt className="text-white" size={28} />
                                                    <span className="text-white text-xs font-bold uppercase tracking-widest">Change Image</span>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={(e) => { e.stopPropagation(); setImageFile(null); setImagePreview(''); setNewItem(prev => ({ ...prev, image_url: '' })); }}
                                                    className="absolute top-2 right-2 w-7 h-7 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors shadow-md opacity-0 group-hover:opacity-100"
                                                >
                                                    <FaTimes size={10} />
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="flex flex-col items-center justify-center py-8 gap-3">
                                                <div className="w-14 h-14 rounded-full bg-heritage-espresso/10 flex items-center justify-center">
                                                    <FaImage className="text-heritage-espresso/40" size={22} />
                                                </div>
                                                <div className="text-center">
                                                    <p className="text-sm font-bold text-heritage-espresso">
                                                        <span className="text-heritage-saffron">Click to upload</span> or drag & drop
                                                    </p>
                                                    <p className="text-[10px] text-heritage-espresso/40 uppercase tracking-widest mt-1">JPEG, PNG, GIF, WEBP · Max 5MB</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                    {imageUploading && (
                                        <div className="flex items-center gap-2 mt-2">
                                            <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-heritage-saffron"></div>
                                            <span className="text-xs text-heritage-espresso/60">Uploading image...</span>
                                        </div>
                                    )}
                                </div>
                                <div className="flex items-center gap-6">
                                    <div className="flex items-center gap-3">
                                        <input type="checkbox" id="veg" checked={newItem.is_veg} onChange={e => setNewItem({ ...newItem, is_veg: e.target.checked })} className="w-5 h-5 accent-heritage-saffron text-white rounded focus:ring-heritage-saffron cursor-pointer" />
                                        <label htmlFor="veg" className="text-sm text-heritage-espresso font-bold cursor-pointer">Vegetarian Dish</label>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <input type="checkbox" id="available" checked={newItem.is_available} onChange={e => setNewItem({ ...newItem, is_available: e.target.checked })} className="w-5 h-5 accent-heritage-saffron text-white rounded focus:ring-heritage-saffron cursor-pointer" />
                                        <label htmlFor="available" className="text-sm text-heritage-espresso font-bold cursor-pointer">Is Available</label>
                                    </div>
                                </div>
                                <button type="submit" disabled={imageUploading} className="w-full py-4 bg-heritage-espresso text-white font-bold uppercase tracking-widest text-xs rounded-xl hover:bg-heritage-saffron transition-colors shadow-lg mt-4 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                                    {imageUploading ? (
                                        <><div className="animate-spin rounded-full h-4 w-4 border-t-2 border-white"></div> Uploading...</>
                                    ) : (
                                        editingId ? 'Update Item' : 'Save Item'
                                    )}
                                </button>
                            </form>
                        </div>
                    </div>
                )}
                </main>
            </div>
        </div>
    );
};

export default AdminDashboard;
