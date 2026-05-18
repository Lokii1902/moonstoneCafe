import React, { useState } from 'react';
import api from '../utils/api';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const AdminLogin = () => {
    const [credentials, setCredentials] = useState({ username: '', password: '' });
    const navigate = useNavigate();

    const handleChange = (e) => {
        setCredentials({ ...credentials, [e.target.name]: e.target.value });
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            // NOTE: In production, URL is handled by api utility
            const { data } = await api.post('/auth/login', credentials);
            localStorage.setItem('adminToken', data.token);
            toast.success('Welcome back, Admin!');
            navigate('/admin/dashboard');
        } catch (error) {
            console.error(error);
            toast.error('Invalid Credentials');
        }
    };

    return (
        <div className="min-h-screen bg-heritage-stone flex items-center justify-center px-4">
            <div className="bg-white p-10 rounded-3xl shadow-2xl border border-heritage-espresso/5 w-full max-w-md">
                <h2 className="text-4xl font-serif text-heritage-espresso text-center mb-8">Admin Access</h2>
                <form onSubmit={handleLogin} className="space-y-6">
                    <div>
                        <label className="block text-heritage-espresso/60 text-xs font-bold uppercase mb-2">Username</label>
                        <input type="text" name="username" value={credentials.username} onChange={handleChange} className="w-full bg-heritage-stone/50 border-b-2 border-heritage-espresso/10 p-3 focus:outline-none focus:border-heritage-saffron text-heritage-espresso" placeholder="Enter username" />
                    </div>
                    <div>
                        <label className="block text-heritage-espresso/60 text-xs font-bold uppercase mb-2">Password</label>
                        <input type="password" name="password" value={credentials.password} onChange={handleChange} className="w-full bg-heritage-stone/50 border-b-2 border-heritage-espresso/10 p-3 focus:outline-none focus:border-heritage-saffron text-heritage-espresso" placeholder="••••••••" />
                    </div>
                    <button type="submit" className="w-full py-4 bg-heritage-espresso text-white font-bold uppercase tracking-widest text-xs rounded-xl hover:bg-heritage-saffron transition-colors shadow-lg mt-4">
                        Login
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AdminLogin;
