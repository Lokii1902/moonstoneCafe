import React from 'react';
import { motion } from 'framer-motion';
import SEO from '../components/SEO';

const About = () => {
    return (
        <div className="pt-32 min-h-screen bg-heritage-stone text-heritage-espresso">
            <SEO title="Our Heritage - Moonstone Café" description="The story behind the flavor." />

            <div className="container mx-auto px-6 md:px-12 pb-24">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="max-w-4xl mx-auto text-center mb-20"
                >
                    <span className="text-heritage-saffron font-bold uppercase tracking-[0.3em] text-xs">Since 2014</span>
                    <h1 className="text-5xl md:text-7xl font-serif mt-6 mb-8 leading-tight">The Royal Story</h1>
                    <div className="w-24 h-1 bg-heritage-olive mx-auto mb-8"></div>
                    <p className="text-xl md:text-2xl text-heritage-espresso/80 font-serif italic leading-relaxed">
                        "Food is not just sustenance. It is a language, a memory, and a gift."
                    </p>
                </motion.div>

                {/* Section 1: The Beginning */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center mb-32">
                    <div className="relative">
                        <div className="absolute top-4 left-4 w-full h-full border-2 border-heritage-olive rounded-full -z-10"></div>
                        <img
                            src="https://images.unsplash.com/photo-1559339352-11d035aa65de?ixlib=rb-4.0.3&auto=format&fit=crop&q=80&w=800"
                            alt="Heritage"
                            className="rounded-t-full rounded-b-2xl shadow-xl w-full"
                        />
                    </div>
                    <div>
                        <h2 className="text-4xl font-serif text-heritage-espresso mb-6">A Legacy of Flavor</h2>
                        <p className="text-heritage-espresso/70 leading-relaxed mb-6 font-sans">
                            Founded with a passion for culinary excellence, <span className="font-bold text-heritage-saffron">Moonstone Café</span> was established to bridge the gap between ancient royal kitchens and modern dining.
                        </p>
                        <p className="text-heritage-espresso/70 leading-relaxed font-sans">
                            We believe that every spice has a soul. Our chefs spend hours grinding fresh masalas by hand, respecting the traditions passed down through generations.
                        </p>
                    </div>
                </div>

                {/* Section 2: The Philosophy (Olive Block) */}
                <div className="bg-heritage-olive text-heritage-stone rounded-3xl p-8 md:p-16 mb-24 relative overflow-hidden">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center relative z-10">
                        <div>
                            <h2 className="text-4xl font-serif mb-6 text-white">The Atmosphere</h2>
                            <p className="text-white/80 leading-relaxed mb-6 font-sans text-lg">
                                Step into a world of rustic elegance. Our interiors are crafted from natural stone, warm wood, and soft linen to reflect the earthiness of our cuisine.
                            </p>
                            <p className="text-white/80 leading-relaxed font-sans">
                                Whether it's a family celebration or a quiet dinner for two, Moonstone Café provides a sanctuary from the noise of the city.
                            </p>
                        </div>
                        <img
                            src="https://images.unsplash.com/photo-1550966871-3ed3c47e2ce2?ixlib=rb-4.0.3&auto=format&fit=crop&q=80&w=800"
                            alt="Ambiance"
                            className="rounded-2xl shadow-xl border-4 border-heritage-stone/20"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default About;
