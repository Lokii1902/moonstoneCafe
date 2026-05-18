import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../utils/api';
import { useSocket } from './SocketContext';

const RestaurantContext = createContext();

export const RestaurantProvider = ({ children }) => {
    const [restaurantInfo, setRestaurantInfo] = useState(null);
    const [isOpen, setIsOpen] = useState(true); // Default to true while loading
    const [loading, setLoading] = useState(true);
    const socket = useSocket();

    const fetchStatus = async () => {
        try {
            const { data } = await api.get('/restaurant');
            setRestaurantInfo(data);
            setIsOpen(data.is_open);
        } catch (error) {
            console.error('Failed to fetch restaurant status:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStatus();
        // Refresh status every 30 seconds to keep it updated with the server time
        const interval = setInterval(fetchStatus, 30000);
        return () => clearInterval(interval);
    }, []);

    // Listen for real-time updates from server
    useEffect(() => {
        if (!socket) return;
        
        socket.on('restaurantUpdate', () => {
            console.log('🔄 Restaurant status update received via socket');
            fetchStatus();
        });

        return () => {
            socket.off('restaurantUpdate');
        };
    }, [socket]);

    return (
        <RestaurantContext.Provider value={{ restaurantInfo, isOpen, loading, refreshStatus: fetchStatus }}>
            {children}
        </RestaurantContext.Provider>
    );
};

export const useRestaurant = () => {
    const context = useContext(RestaurantContext);
    if (!context) {
        throw new Error('useRestaurant must be used within a RestaurantProvider');
    }
    return context;
};
