import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Link } from 'react-router-dom';
import SEO from '../components/SEO';
import { FaLongArrowAltRight, FaStar } from 'react-icons/fa';

const Home = () => {
    const containerRef = useRef(null);
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start start", "end end"]
    });

    const heroScale = useTransform(scrollYProgress, [0, 0.2], [1, 1.1]);
    const textParallax = useTransform(scrollYProgress, [0, 0.5], [0, -100]);

    return (
        <div ref={containerRef} className="w-full bg-heritage-stone text-heritage-espresso overflow-hidden relative selection:bg-heritage-saffron selection:text-white">
            <SEO
                title="Moonstone Café - The Vibrant Heritage"
                description="A culinary journey through spices and silk."
            />

            {/* 1. HERO - THE BLEND */}
            <section className="relative min-h-screen flex items-center pt-40 pb-10 md:pt-32 px-6 md:px-12 overflow-hidden">
                {/* Abstract Color Blobs */}
                <div className="absolute top-0 right-0 w-[50vw] h-[80vh] bg-heritage-clay/20 rounded-bl-full blur-3xl -z-10"></div>
                <div className="absolute bottom-0 left-0 w-[40vw] h-[60vh] bg-heritage-olive/10 rounded-tr-full blur-3xl -z-10"></div>

                <div className="container mx-auto grid grid-cols-1 md:grid-cols-12 gap-12 items-center mt-20 md:mt-0">
                    <div className="md:col-span-7 relative z-10">
                        <motion.span
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 }}
                            className="inline-block py-1 px-3 border border-heritage-espresso/20 rounded-full text-[10px] font-bold tracking-[0.2em] uppercase mb-6 text-heritage-espresso/60"
                        >
                            Since 2014
                        </motion.span>
                        <motion.h1
                            initial={{ opacity: 0, y: 50 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 1, ease: 'circOut' }}
                            className="text-5xl md:text-[7vw] leading-[0.9] font-serif font-light mb-8 text-heritage-espresso"
                        >
                            <span className="italic block text-heritage-saffron">Vibrant</span>
                            Flavors of Royal <br />Heritage
                        </motion.h1>
                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.8 }}
                            className="text-lg md:text-xl font-sans text-heritage-espresso/70 max-w-lg leading-relaxed mb-10"
                        >
                            We weave the richness of saffron, the depth of ancient spices, and the warmth of hospitality into a tapestry of taste.
                        </motion.p>
                        <div className="flex gap-6">
                            <Link to="/menu" className="px-8 py-4 bg-heritage-espresso text-heritage-stone rounded-full text-xs font-bold uppercase tracking-widest hover:bg-heritage-saffron transition-colors shadow-xl">
                                Explore Menu
                            </Link>
                        </div>
                    </div>

                    <div className="md:col-span-5 relative">
                        {/* Floating Image Card */}
                        <motion.div
                            style={{ scale: heroScale }}
                            className="aspect-[3/4] rounded-t-[10rem] rounded-b-2xl overflow-hidden relative shadow-2xl"
                        >
                            <img src="https://images.unsplash.com/photo-1596560548464-f010549b84d7?q=80&w=1000" className="w-full h-full object-cover" alt="Spice Dish" />
                            <div className="absolute inset-0 bg-gradient-to-t from-heritage-saffron/40 to-transparent mix-blend-multiply"></div>
                        </motion.div>
                        {/* Decor */}
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                            className="absolute -bottom-10 -left-10 w-32 h-32 border border-heritage-espresso/10 rounded-full flex items-center justify-center"
                        >
                            <span className="text-[10px] uppercase tracking-widest text-heritage-espresso/40">Moonstone Café •</span>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* 2. THE OLIVE SECTION - Narrative Block */}
            <section className="py-24 bg-heritage-olive text-heritage-stone relative overflow-hidden">
                <div className="container mx-auto px-6 md:px-12 grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
                    <div className="order-2 md:order-1">
                        <img src="https://images.unsplash.com/photo-1505253716362-afaea1d3d1af?q=80&w=1000" className="opacity-90 rounded-sm shadow-2xl skew-y-3" alt="Ingredients" />
                    </div>
                    <div className="order-1 md:order-2">
                        <span className="text-heritage-gold font-serif italic text-2xl mb-4 block">The Philosophy</span>
                        <h2 className="text-4xl md:text-6xl font-serif mb-6 leading-tight">Rooted in Earth, <br />Finished in Gold.</h2>
                        <p className="font-sans text-lg opacity-80 leading-relaxed mb-8">
                            Our kitchen is a sanctuary where the rustic meets the refined. We source our clay pots from local artisans and our saffron from the valleys of Kashmir.
                        </p>
                        <Link to="/about" className="inline-flex items-center gap-2 text-heritage-gold uppercase text-xs font-bold tracking-widest hover:text-white transition-colors">
                            Read Our Story <FaLongArrowAltRight />
                        </Link>
                    </div>
                </div>
            </section>

            {/* 3. THE SAFFRON SECTION - Featured */}
            <section className="py-32 px-6 md:px-12 bg-heritage-stone">
                <div className="container mx-auto">
                    <div className="text-center mb-20">
                        <h3 className="text-heritage-saffron font-bold uppercase tracking-[0.3em] text-xs mb-4">The Masterpieces</h3>
                        <h2 className="text-4xl md:text-7xl font-serif text-heritage-espresso">Curated for the Soul</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* Card 1 */}
                        <div className="group relative cursor-pointer">
                            <div className="aspect-[4/5] bg-heritage-clay rounded-2xl overflow-hidden mb-6 relative">
                                <img src="https://images.unsplash.com/photo-1631515243349-e0603690b6b8?q=80&w=800" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 mix-blend-overlay opacity-80 group-hover:opacity-100 group-hover:mix-blend-normal" />
                                <div className="absolute inset-0 bg-heritage-espresso/20 group-hover:opacity-0 transition-opacity"></div>
                            </div>
                            <h4 className="text-3xl font-serif mb-2 text-heritage-espresso">Royal Biryani</h4>
                            <p className="text-sm font-sans text-heritage-olive font-bold">Saffron Rice • Goat Meat • 12 Spices</p>
                        </div>

                        {/* Card 2 - Elevated */}
                        <div className="group relative cursor-pointer md:-mt-16">
                            <div className="aspect-[4/5] bg-heritage-olive rounded-2xl overflow-hidden mb-6 relative shadow-2xl">
                                <img src="https://images.unsplash.com/photo-1601050690597-df0568f70950?q=80&w=800" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 mix-blend-overlay opacity-80 group-hover:opacity-100 group-hover:mix-blend-normal" />
                            </div>
                            <h4 className="text-3xl font-serif mb-2 text-heritage-espresso">Samosa Chaat</h4>
                            <p className="text-sm font-sans text-heritage-olive font-bold">Crispy Pastry • Tamarind • Yoghurt</p>
                        </div>

                        {/* Card 3 */}
                        <div className="group relative cursor-pointer">
                            <div className="aspect-[4/5] bg-heritage-saffron rounded-2xl overflow-hidden mb-6 relative">
                                <img src="https://images.unsplash.com/photo-1565557623262-b51c2513a641?q=80&w=800" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 mix-blend-overlay opacity-80 group-hover:opacity-100 group-hover:mix-blend-normal" />
                            </div>
                            <h4 className="text-3xl font-serif mb-2 text-heritage-espresso">Tandoori Platter</h4>
                            <p className="text-sm font-sans text-heritage-olive font-bold">Charred Chicken • Mint Chutney • Naan</p>
                        </div>
                    </div>

                    <div className="text-center mt-20 relative z-20">
                        <Link to="/menu" className="inline-block border-b-2 border-heritage-saffron pb-1 text-2xl font-serif italic text-heritage-espresso hover:text-heritage-saffron transition-colors">
                            View Full Collection
                        </Link>
                    </div>
                </div>
            </section>

            {/* 4. IMMERSIVE FOOTER PREVIEW */}
            <div className="h-[50vh] bg-heritage-espresso flex items-center justify-center sticky bottom-0 -z-10">
                <h1 className="text-[15vw] font-serif text-heritage-gold/10 leading-none">MOONSTONE CAFÉ</h1>
            </div>
        </div>
    );
};

export default Home;
