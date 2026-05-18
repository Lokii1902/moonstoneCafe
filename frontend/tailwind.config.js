/** @type {import('tailwindcss').Config} */
export default {
    darkMode: 'class',
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                'heritage-stone': '#F0EBE5', // Warm Linen/Stone Base
                'heritage-espresso': '#2C1810', // Deep Brown Text
                'heritage-saffron': '#B84B2B', // Burnt Terracotta Primary
                'heritage-olive': '#6B705C', // Muted Sage Secondary
                'heritage-gold': '#D4AF37',   // Heirloom Gold
                'heritage-clay': '#E6B89C', // Soft Highlight
                'heritage-sand': '#E8E4DE', // Slightly darker stone for variation
            },
            fontFamily: {
                serif: ['"Cormorant Garamond"', 'serif'],
                sans: ['"Manrope"', 'sans-serif'],
                display: ['"Cormorant Garamond"', 'serif'],
            },
            backgroundImage: {
                'noise': "url('https://grainy-gradients.vercel.app/noise.svg')",
            },
            animation: {
                'fade-in': 'fadeIn 1s ease-out forwards',
                'fade-in-up': 'fadeInUp 1s ease-out forwards',
                'fade-in-down': 'fadeInDown 1s ease-out forwards',
                'slide-in-right': 'slideInRight 1s ease-out forwards',
                'slow-spin': 'spin 12s linear infinite',
            },
            keyframes: {
                fadeIn: {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
                fadeInUp: {
                    '0%': { opacity: '0', transform: 'translateY(40px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
                fadeInDown: {
                    '0%': { opacity: '0', transform: 'translateY(-40px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
                slideInRight: {
                    '0%': { transform: 'translateX(100%)', opacity: '0' },
                    '100%': { transform: 'translateX(0)', opacity: '1' },
                },
            },
        },
    },
    plugins: [],
}
