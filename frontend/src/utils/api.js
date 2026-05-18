import axios from 'axios';

// Base URL for API
const getBaseUrl = () => {
    let url = 'https://moonstonecafe.onrender.com/api';

    // If the URL comes from Render (via "property: host"), it might lack the protocol
    if (url && !url.startsWith('http')) {
        url = `https://${url}`;
    }

    // Ensure the URL points to the API route
    if (!url.endsWith('/api')) {
        url = `${url}/api`;
    }

    return url;
};

const api = axios.create({
    baseURL: getBaseUrl(),
    headers: {
        'Content-Type': 'application/json'
    }
});

// Add a request interceptor to attach the correct token.
// Priority: userToken for user pages, adminToken for admin pages, fallback otherwise.
api.interceptors.request.use(
    (config) => {
        const userToken = localStorage.getItem('userToken');
        const adminToken = localStorage.getItem('adminToken');
        
        // Only admin-specific routes get the admin token
        // /admin/ routes = admin dashboard fetches
        // /status and /payment-status = admin order management actions
        // /cancel is a USER action so it should always use userToken
        const isAdminOnlyRoute = config.url && (
            config.url.includes('/admin/') ||
            (config.url.includes('/upload/') && !config.url.includes('/upload/avatar')) ||
            (config.url.includes('/status') && !config.url.includes('/cancel')) ||
            config.url.includes('/payment-status')
        );
        
        if (isAdminOnlyRoute && adminToken) {
            // Admin-only routes: use admin token
            config.headers.Authorization = `Bearer ${adminToken}`;
        } else if (userToken) {
            // User token takes priority for all other routes (cancel, my-orders, profile, etc.)
            config.headers.Authorization = `Bearer ${userToken}`;
        } else if (adminToken) {
            // Fallback: use admin token if no user token
            config.headers.Authorization = `Bearer ${adminToken}`;
        }
        
        return config;
    },
    (error) => Promise.reject(error)
);


export default api;
