import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import { FaCamera, FaSpinner } from 'react-icons/fa';

const getAvatarSrc = (url) => {
    if (!url) return 'https://www.w3schools.com/howto/img_avatar.png';
    if (url.startsWith('http') || url.startsWith('blob:')) return url;
    return `https://moonstonecafe.onrender.com${url}`;
};

const Profile = () => {
    const { user, setUser } = useAuth();
    const [profileData, setProfileData] = useState({
        name: '',
        email: '',
        phone: '',
        address: '',
        avatar_url: ''
    });
    const [isEditing, setIsEditing] = useState(false);
    const [avatarPreview, setAvatarPreview] = useState('');
    const [avatarUploading, setAvatarUploading] = useState(false);
    const avatarInputRef = useRef(null);

    useEffect(() => {
        if (user) {
            setProfileData({
                name: user.name || '',
                email: user.email || '',
                phone: user.phone || '',
                address: user.address || '',
                avatar_url: user.avatar_url || ''
            });
            setAvatarPreview(user.avatar_url || '');
        }
    }, [user]);

    const handleChange = (e) => {
        setProfileData({ ...profileData, [e.target.name]: e.target.value });
    };

    const handleAvatarFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (file.size > 5 * 1024 * 1024) {
            toast.error('Photo must be smaller than 5MB');
            return;
        }

        // Show local preview immediately
        const localPreview = URL.createObjectURL(file);
        setAvatarPreview(localPreview);

        // Upload to server
        try {
            setAvatarUploading(true);
            const formData = new FormData();
            formData.append('avatar', file);
            const res = await api.post('/upload/avatar', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setProfileData(prev => ({ ...prev, avatar_url: res.data.avatarUrl }));
            setAvatarPreview(res.data.avatarUrl);
            toast.success('Photo uploaded! Save your profile to apply.');
        } catch (err) {
            console.error(err);
            toast.error('Failed to upload photo');
            setAvatarPreview(profileData.avatar_url || '');
        } finally {
            setAvatarUploading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.put('/users/profile', profileData);
            setUser({ ...user, ...profileData });
            setIsEditing(false);
            toast.success('Profile updated successfully!');
        } catch (error) {
            console.error(error);
            toast.error('Failed to update profile');
        }
    };

    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center pt-24">
                <p className="text-xl">Please login to view your profile.</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen pt-32 pb-20 px-4 bg-heritage-stone text-heritage-espresso">
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-4xl mx-auto bg-white/5 backdrop-blur-md rounded-3xl p-8 border border-heritage-saffron/20 shadow-2xl"
            >
                <div className="flex flex-col md:flex-row items-center gap-8 mb-12">
                    {/* Avatar with upload trigger */}
                    <div className="relative group flex-shrink-0">
                        {/* Hidden file input */}
                        <input
                            ref={avatarInputRef}
                            type="file"
                            accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                            className="hidden"
                            onChange={handleAvatarFileChange}
                        />

                        <img
                            src={getAvatarSrc(avatarPreview)}
                            alt="Profile"
                            className={`w-32 h-32 rounded-full object-cover border-4 border-heritage-saffron shadow-lg transition-opacity ${avatarUploading ? 'opacity-50' : 'opacity-100'}`}
                        />

                        {/* Spinner while uploading */}
                        {avatarUploading && (
                            <div className="absolute inset-0 flex items-center justify-center rounded-full">
                                <FaSpinner className="animate-spin text-heritage-saffron text-2xl" />
                            </div>
                        )}

                        {/* Hover overlay — desktop */}
                        {isEditing && !avatarUploading && (
                            <button
                                type="button"
                                onClick={() => avatarInputRef.current?.click()}
                                className="absolute inset-0 bg-black/55 rounded-full flex flex-col items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 cursor-pointer"
                            >
                                <FaCamera className="text-white" size={22} />
                                <span className="text-white text-[10px] font-bold uppercase tracking-widest">Change</span>
                            </button>
                        )}

                        {/* Always-visible camera badge for mobile */}
                        {isEditing && !avatarUploading && (
                            <button
                                type="button"
                                onClick={() => avatarInputRef.current?.click()}
                                className="absolute bottom-0 right-0 w-9 h-9 bg-heritage-saffron rounded-full flex items-center justify-center shadow-lg border-2 border-white hover:bg-heritage-espresso transition-colors"
                            >
                                <FaCamera className="text-white" size={14} />
                            </button>
                        )}
                    </div>

                    <div>
                        <h1 className="text-4xl font-serif text-heritage-saffron mb-2">{profileData.name}</h1>
                        <p className="text-heritage-espresso/60">{profileData.email}</p>
                        {isEditing && (
                            <p className="text-xs text-heritage-espresso/40 mt-1 italic">
                                {avatarUploading ? 'Uploading photo...' : 'Click your photo to change it'}
                            </p>
                        )}
                    </div>
                    <button 
                        onClick={() => setIsEditing(!isEditing)}
                        className="ml-auto px-6 py-2 bg-heritage-saffron/20 border border-heritage-saffron text-heritage-saffron rounded-full hover:bg-heritage-saffron hover:text-black transition-all"
                    >
                        {isEditing ? 'Cancel' : 'Edit Profile'}
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-6">
                        <div>
                            <label className="block text-xs font-bold uppercase mb-2 text-heritage-saffron">Full Name</label>
                            <input 
                                type="text" 
                                name="name"
                                value={profileData.name}
                                onChange={handleChange}
                                disabled={!isEditing}
                                className="w-full bg-white/5 border-b border-heritage-saffron/30 p-3 focus:border-heritage-saffron outline-none transition-colors disabled:opacity-50"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold uppercase mb-2 text-heritage-saffron">Email Address</label>
                            <input 
                                type="email" 
                                name="email"
                                value={profileData.email}
                                onChange={handleChange}
                                disabled={!isEditing}
                                className="w-full bg-white/5 border-b border-heritage-saffron/30 p-3 focus:border-heritage-saffron outline-none transition-colors disabled:opacity-50"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold uppercase mb-2 text-heritage-saffron">Phone Number</label>
                            <input 
                                type="text" 
                                name="phone"
                                value={profileData.phone}
                                onChange={handleChange}
                                disabled={!isEditing}
                                className="w-full bg-white/5 border-b border-heritage-saffron/30 p-3 focus:border-heritage-saffron outline-none transition-colors disabled:opacity-50"
                                placeholder="+1 234 567 890"
                            />
                        </div>
                    </div>
                    <div className="space-y-6">
                        <div>
                            <label className="block text-xs font-bold uppercase mb-2 text-heritage-saffron">Delivery Address</label>
                            <textarea 
                                name="address"
                                value={profileData.address}
                                onChange={handleChange}
                                disabled={!isEditing}
                                rows="4"
                                className="w-full bg-white/5 border border-heritage-saffron/30 p-3 focus:border-heritage-saffron outline-none transition-colors rounded-xl disabled:opacity-50 resize-none"
                                placeholder="Enter your full address here..."
                            />
                        </div>
                    </div>
                    {isEditing && (
                        <div className="md:col-span-2">
                            <button 
                                type="submit"
                                disabled={avatarUploading}
                                className="w-full py-4 bg-heritage-saffron text-black font-bold uppercase tracking-widest text-sm rounded-xl hover:bg-white transition-colors shadow-lg mt-4 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {avatarUploading ? (
                                    <><FaSpinner className="animate-spin" /> Uploading Photo...</>
                                ) : (
                                    'Save Changes'
                                )}
                            </button>
                        </div>
                    )}
                </form>
            </motion.div>
        </div>
    );
};

export default Profile;
