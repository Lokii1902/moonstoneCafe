import React from 'react';
import { NavLink } from 'react-router-dom';
import { FaCrown, FaEnvelope, FaUtensils, FaClipboardList, FaInfoCircle, FaChartBar, FaTimes } from 'react-icons/fa';

const AdminSidebar = ({ activeTab, setActiveTab, sidebarOpen, setSidebarOpen }) => {
    const navItems = [
        { id: 'overview', label: 'Overview', icon: FaChartBar },
        { id: 'orders', label: 'Orders', icon: FaClipboardList },
        { id: 'menu', label: 'Menu Items', icon: FaUtensils },
        { id: 'messages', label: 'Messages', icon: FaEnvelope },
        { id: 'info', label: 'Restaurant Info', icon: FaInfoCircle },
    ];

    return (
        <>
            {/* Mobile Overlay */}
            {sidebarOpen && (
                <div 
                    className="fixed inset-0 bg-heritage-espresso/80 z-40 md:hidden backdrop-blur-sm"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            <aside className={`w-64 bg-heritage-espresso text-heritage-stone h-screen fixed left-0 top-0 z-50 flex flex-col shadow-2xl transition-transform duration-300 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}>
                {/* Logo Area */}
                <div className="p-8 flex items-center justify-between border-b border-white/5">
                    <div className="flex items-center gap-3">
                        <FaCrown className="text-heritage-saffron text-2xl" />
                        <span className="font-serif text-xl tracking-widest text-white">ADMIN</span>
                    </div>
                    <button 
                        onClick={() => setSidebarOpen(false)}
                        className="md:hidden text-white/50 hover:text-white transition-colors"
                    >
                        <FaTimes size={20} />
                    </button>
                </div>

            {/* Navigation */}
            <nav className="flex-1 mt-6 px-4 space-y-2">
                {navItems.map((item) => (
                    <button
                        key={item.id}
                        onClick={() => {
                            setActiveTab(item.id);
                            setSidebarOpen(false);
                        }}
                        className={`w-full flex items-center gap-4 px-4 py-4 rounded-xl transition-all duration-300 group ${
                            activeTab === item.id 
                            ? 'bg-heritage-saffron text-white shadow-lg' 
                            : 'hover:bg-white/5 text-heritage-stone/60 hover:text-white'
                        }`}
                    >
                        <item.icon className={`text-lg ${activeTab === item.id ? 'text-white' : 'group-hover:text-heritage-saffron'} transition-colors`} />
                        <span className="text-sm font-bold uppercase tracking-widest">{item.label}</span>
                    </button>
                ))}
            </nav>

            {/* Footer / Info */}
            <div className="p-6 border-t border-white/5">
                <div className="bg-white/5 rounded-2xl p-4">
                    <p className="text-[10px] text-white/40 uppercase tracking-widest leading-relaxed">
                        Moonstone Café<br />
                        Management Suite v1.0
                    </p>
                </div>
            </div>
        </aside>
        </>
    );
};

export default AdminSidebar;
