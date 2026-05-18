import React from 'react';
import { Link } from 'react-router-dom';
import { FaSignOutAlt, FaExternalLinkAlt, FaUserShield, FaBars } from 'react-icons/fa';

const AdminNavbar = ({ handleLogout, activeTabLabel, setSidebarOpen }) => {
    return (
        <header className="h-20 bg-white border-b border-heritage-espresso/5 fixed top-0 right-0 left-0 md:left-64 z-30 px-4 md:px-8 flex items-center justify-between shadow-sm transition-all duration-300">
            <div className="flex items-center gap-4">
                <button 
                    onClick={() => setSidebarOpen(true)}
                    className="md:hidden text-heritage-espresso hover:text-heritage-saffron transition-colors"
                >
                    <FaBars size={20} />
                </button>
                <h2 className="text-xl md:text-2xl font-serif text-heritage-espresso truncate max-w-[150px] md:max-w-none">{activeTabLabel}</h2>
            </div>

            <div className="flex items-center gap-3 md:gap-6">
                <Link 
                    to="/" 
                    className="hidden md:flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-heritage-espresso/60 hover:text-heritage-saffron transition-colors"
                >
                    <FaExternalLinkAlt size={12} />
                    Visit Website
                </Link>

                <div className="hidden md:block h-8 w-[1px] bg-heritage-espresso/10"></div>

                <div className="flex items-center gap-2 md:gap-4">
                    <div className="hidden md:flex flex-col items-end">
                        <span className="text-[10px] uppercase tracking-widest font-bold text-heritage-espresso">Administrator</span>
                        <span className="text-xs text-heritage-espresso/60">admin@moonstonecafe.com</span>
                    </div>
                    <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-heritage-stone flex items-center justify-center text-heritage-espresso border border-heritage-espresso/10 shadow-inner">
                        <FaUserShield size={16} className="md:w-5 md:h-5" />
                    </div>
                </div>

                <button 
                    onClick={handleLogout}
                    className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition-all duration-300 flex items-center justify-center shadow-sm"
                    title="Logout"
                >
                    <FaSignOutAlt />
                </button>
            </div>
        </header>
    );
};

export default AdminNavbar;
