import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { FaSun, FaMoon } from 'react-icons/fa';
import { motion } from 'framer-motion';

const ThemeToggle = () => {
    const { theme, toggleTheme } = useTheme();

    return (
        <button
            onClick={toggleTheme}
            className="fixed bottom-8 right-8 z-50 p-4 rounded-full bg-white dark:bg-royal-gold text-royal-black shadow-lg transition-transform hover:scale-110 border border-black/10 dark:border-none"
            title="Toggle Theme"
        >
            <motion.div
                initial={false}
                animate={{ rotate: theme === 'dark' ? 0 : 180 }}
                transition={{ duration: 0.5 }}
            >
                {theme === 'dark' ? <FaSun className="text-xl" /> : <FaMoon className="text-xl" />}
            </motion.div>
        </button>
    );
};

export default ThemeToggle;
