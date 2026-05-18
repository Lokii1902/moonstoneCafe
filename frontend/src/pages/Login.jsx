import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { GoogleLogin } from '@react-oauth/google';

import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

const Login = () => {
    const { login } = useAuth();
    const [isLoginMode, setIsLoginMode] = useState(true);
    const [credentials, setCredentials] = useState({ name: '', email: '', password: '' });
    const navigate = useNavigate();

    const handleChange = (e) => {
        setCredentials({ ...credentials, [e.target.name]: e.target.value });
    };

    const handleGoogleSuccess = async (credentialResponse) => {
        try {
            const { data } = await api.post('/users/auth/google', {
                credential: credentialResponse.credential
            });
            login(data, data.token);
            toast.success(`Welcome, ${data.name}!`);
            navigate('/');
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || 'Google Auth Failed');
        }
    };

    const handleGoogleError = () => {
        toast.error('Google Login Failed');
    };

    const handleEmailAuth = async (e) => {
        e.preventDefault();
        try {
            if (isLoginMode) {
                const { data } = await api.post('/users/auth/login', { email: credentials.email, password: credentials.password });
                login(data, data.token);
                toast.success(`Welcome back, ${data.name}!`);
                navigate('/');
            } else {
                const { data } = await api.post('/users/auth/register', credentials);
                login(data, data.token);
                toast.success(`Welcome to Moonstone Café, ${data.name}!`);
                navigate('/');
            }
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || 'Authentication Failed');
        }
    };

    return (
        <div className="min-h-[80vh] flex items-center justify-center pt-24 px-4 bg-heritage-stone text-heritage-espresso">
            <div className="bg-white p-10 rounded-3xl shadow-2xl w-full max-w-md text-heritage-espresso border border-heritage-saffron/20">
                <h2 className="text-4xl font-serif text-center mb-8 text-heritage-espresso">
                    {isLoginMode ? 'Welcome Back' : 'Join Our Club'}
                </h2>
                
                <form onSubmit={handleEmailAuth} className="space-y-6">
                    {!isLoginMode && (
                        <div>
                            <label className="block text-xs font-bold uppercase mb-2">Name</label>
                            <input 
                                type="text" 
                                name="name" 
                                value={credentials.name} 
                                onChange={handleChange} 
                                className="w-full bg-heritage-stone/30 border-b-2 border-heritage-espresso/10 p-3 focus:outline-none focus:border-heritage-saffron" 
                                placeholder="Full Name" 
                                required={!isLoginMode}
                            />
                        </div>
                    )}
                    <div>
                        <label className="block text-xs font-bold uppercase mb-2">Email</label>
                        <input 
                            type="email" 
                            name="email" 
                            value={credentials.email} 
                            onChange={handleChange} 
                            className="w-full bg-heritage-stone/30 border-b-2 border-heritage-espresso/10 p-3 focus:outline-none focus:border-heritage-saffron" 
                            placeholder="your@email.com" 
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold uppercase mb-2">Password</label>
                        <input 
                            type="password" 
                            name="password" 
                            value={credentials.password} 
                            onChange={handleChange} 
                            className="w-full bg-heritage-stone/30 border-b-2 border-heritage-espresso/10 p-3 focus:outline-none focus:border-heritage-saffron" 
                            placeholder="••••••••" 
                            required
                        />
                    </div>
                    <button type="submit" className="w-full py-4 bg-heritage-espresso text-white font-bold uppercase tracking-widest text-xs rounded-xl hover:bg-heritage-saffron transition-colors shadow-lg mt-4">
                        {isLoginMode ? 'Sign In' : 'Create Account'}
                    </button>
                </form>

                <div className="mt-8 mb-6 flex items-center justify-center relative">
                    <div className="border-t border-heritage-espresso/10 w-full"></div>
                    <span className="bg-white px-4 text-[10px] uppercase font-bold text-heritage-espresso/40 tracking-widest absolute">Or</span>
                </div>

                <div className="flex justify-center mb-6">
                    <GoogleLogin
                        onSuccess={handleGoogleSuccess}
                        onError={handleGoogleError}
                        theme="outline"
                        text="continue_with"
                        shape="pill"
                    />
                </div>

                <div className="mt-8 text-center">
                    <button 
                        type="button" 
                        onClick={() => setIsLoginMode(!isLoginMode)}
                        className="text-sm font-bold text-heritage-saffron hover:text-heritage-espresso transition-colors"
                    >
                        {isLoginMode ? "Don't have an account? Sign Up" : "Already have an account? Sign In"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Login;
