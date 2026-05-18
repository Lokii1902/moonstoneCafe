import { useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';

const useNotifications = () => {
    
    // Request permission on load
    useEffect(() => {
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission();
        }
    }, []);

    const playSound = useCallback(() => {
        try {
            const audio = new Audio('/notification.mp3');
            audio.play().catch(e => {
                console.warn('Audio playback failed (requires user interaction first):', e);
            });
        } catch (error) {
            console.error('Error playing notification sound:', error);
        }
    }, []);

    const showNotification = useCallback(({ title, body, icon = '/vite.svg', onClick }) => {
        // 1. Play Sound
        playSound();

        // 2. Browser Notification (Desktop)
        if ('Notification' in window && Notification.permission === 'granted') {
            const notification = new Notification(title, {
                body,
                icon,
                vibrate: [200, 100, 200]
            });
            
            if (onClick) {
                notification.onclick = onClick;
            }
        }

        // 3. In-app Toast
        toast.info(
            <div>
                <strong className="block">{title}</strong>
                <span className="text-sm">{body}</span>
            </div>,
            {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
            }
        );
    }, [playSound]);

    return { showNotification, permission: typeof Notification !== 'undefined' ? Notification.permission : 'not-supported' };
};

export default useNotifications;
