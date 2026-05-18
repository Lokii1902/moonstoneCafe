import React from 'react';
import { useCart } from '../context/CartContext';
import { FaShoppingBasket } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

const CartWidget = () => {
    const { getCartCount, setIsCartOpen } = useCart();
    const count = getCartCount();

    return (
        <AnimatePresence>
            {count > 0 && (
                <motion.button
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    onClick={() => setIsCartOpen(true)}
                    className="fixed bottom-6 right-6 z-50 bg-heritage-saffron text-white w-16 h-16 rounded-full shadow-2xl flex items-center justify-center border-4 border-white hover:scale-110 transition-transform"
                >
                    <FaShoppingBasket size={24} />
                    <span className="absolute -top-2 -right-2 bg-heritage-espresso text-white t-xs font-bold w-7 h-7 flex items-center justify-center rounded-full border-2 border-white">
                        {count}
                    </span>
                </motion.button>
            )}
        </AnimatePresence>
    );
};

export default CartWidget;
