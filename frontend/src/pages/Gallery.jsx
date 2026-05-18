import React from 'react';
import { motion } from 'framer-motion';
import SEO from '../components/SEO';

const IMAGES = [
    'https://images.unsplash.com/photo-1559339352-11d035aa65de?ixlib=rb-4.0.3&w=800',
    'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?ixlib=rb-4.0.3&w=800',
    'https://images.unsplash.com/photo-1552566626-52f8b828add9?ixlib=rb-4.0.3&w=800',
    'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?ixlib=rb-4.0.3&w=800',
    'https://images.unsplash.com/photo-1628294895950-98052523e036?ixlib=rb-4.0.3&w=800',
    'https://images.unsplash.com/photo-1633945274405-b6c8069047b0?ixlib=rb-4.0.3&w=800',
    'https://images.unsplash.com/photo-1579954115545-a95591f28bfd?ixlib=rb-4.0.3&w=800',
    'https://images.unsplash.com/photo-1544025162-d76690b6d262?ixlib=rb-4.0.3&w=800',
];

const Gallery = () => {
    return (
        <div className="pt-32 min-h-screen bg-heritage-stone text-heritage-espresso pb-24">
            <SEO title="Gallery - Moonstone Café" description="Witness the vibrant atmosphere." />

            <div className="container mx-auto px-6 md:px-12">
                <div className="text-center mb-16">
                    <span className="text-heritage-saffron font-bold uppercase tracking-[0.3em] text-xs block mb-4">The Moments</span>
                    <h1 className="text-5xl md:text-7xl font-serif text-heritage-espresso mb-4">Gallery</h1>
                </div>

                <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
                    {IMAGES.map((src, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                            className="break-inside-avoid relative group overflow-hidden rounded-2xl shadow-md border-[4px] border-white"
                        >
                            <img
                                src={src}
                                alt={`Gallery ${index}`}
                                className="w-full h-auto transition-transform duration-700 group-hover:scale-110"
                            />
                            <div className="absolute inset-0 bg-heritage-espresso/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                                <span className="text-white font-serif text-2xl italic">Royal Moment</span>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Gallery;
