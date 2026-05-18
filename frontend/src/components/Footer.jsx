import React from 'react';
import { FaInstagram, FaFacebookF, FaTwitter } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const Footer = () => {
    return (
        <footer className="bg-heritage-saffron text-white pt-24 pb-12 relative z-20">
            <div className="container mx-auto px-6 md:px-12">
                <div className="flex flex-col md:flex-row justify-between mb-24">
                    <div className="max-w-md mb-12 md:mb-0">
                        <h2 className="text-6xl font-serif mb-8 leading-none">Taste the <br /> Tradition.</h2>
                        <p className="font-sans text-white/80 text-lg leading-relaxed mb-8">
                            27 Grand Food Street<br />
                            Near City Center Mall, Chennai – 600018
                        </p>
                        <div className="flex gap-4">
                            {[FaInstagram, FaFacebookF, FaTwitter].map((Icon, i) => (
                                <a key={i} href="#" className="w-12 h-12 rounded-full border border-white/20 flex items-center justify-center hover:bg-white hover:text-heritage-saffron transition-all text-xl">
                                    <Icon />
                                </a>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-12 md:gap-24">
                        <div>
                            <h4 className="font-sans font-bold uppercase tracking-widest text-xs mb-6 opacity-60">Menu</h4>
                            <ul className="space-y-4 font-serif text-2xl">
                                <li><Link to="/menu" className="hover:text-heritage-gold transition-colors">Starters</Link></li>
                                <li><Link to="/menu" className="hover:text-heritage-gold transition-colors">Mains</Link></li>
                                <li><Link to="/menu" className="hover:text-heritage-gold transition-colors">Desserts</Link></li>
                                <li><Link to="/menu" className="hover:text-heritage-gold transition-colors">Drinks</Link></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-sans font-bold uppercase tracking-widest text-xs mb-6 opacity-60">Company</h4>
                            <ul className="space-y-4 font-serif text-2xl">
                                <li><Link to="/about" className="hover:text-heritage-gold transition-colors">Our Story</Link></li>
                                <li><Link to="/gallery" className="hover:text-heritage-gold transition-colors">Gallery</Link></li>
                                <li><Link to="/contact" className="hover:text-heritage-gold transition-colors">Contact</Link></li>
                                <li><Link to="/reservation" className="hover:text-heritage-gold transition-colors">Reserve</Link></li>
                            </ul>
                        </div>
                    </div>
                </div>

                <div className="border-t border-white/20 pt-8 flex flex-col md:flex-row justify-between items-center opacity-60 font-sans text-sm tracking-wide">
                    <p>&copy; 2024 Moonstone Café.</p>
                    <p>Designed for warmth.</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
