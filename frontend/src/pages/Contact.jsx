import React, { useState } from 'react';
import api from '../utils/api';
import { toast } from 'react-toastify';
import SEO from '../components/SEO';
import { FaPhoneAlt, FaEnvelope, FaMapMarkerAlt } from 'react-icons/fa';

const Contact = () => {
    const [formData, setFormData] = useState({
        name: '', email: '', phone: '', subject: '', message: ''
    });
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.post('/contact', formData);
            toast.success('Message sent! We will serve you soon.');
            setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
        } catch (error) {
            console.error(error);
            toast.error('Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="pt-32 min-h-screen bg-heritage-stone text-heritage-espresso">
            <SEO title="Contact Us - Moonstone Café" description="Get in touch for reservations and events." />

            <div className="container mx-auto px-6 md:px-12 pb-24">
                <div className="text-center mb-16">
                    <span className="text-heritage-saffron font-bold uppercase tracking-[0.3em] text-xs block mb-4">Get In Touch</span>
                    <h1 className="text-5xl md:text-7xl font-serif text-heritage-espresso">Contact Us</h1>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
                    {/* Information & Form */}
                    <div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
                            <div className="bg-white p-8 rounded-2xl shadow-sm text-center border border-heritage-espresso/5 hover:border-heritage-saffron transition-colors group">
                                <FaPhoneAlt className="text-heritage-olive text-2xl mx-auto mb-4 group-hover:text-heritage-saffron transition-colors" />
                                <h3 className="font-serif text-xl mb-2 text-heritage-espresso">Phone</h3>
                                <p className="text-heritage-espresso/60 text-sm font-sans">+91 34567 54324</p>
                            </div>
                            <div className="bg-white p-8 rounded-2xl shadow-sm text-center border border-heritage-espresso/5 hover:border-heritage-saffron transition-colors group">
                                <FaEnvelope className="text-heritage-olive text-2xl mx-auto mb-4 group-hover:text-heritage-saffron transition-colors" />
                                <h3 className="font-serif text-xl mb-2 text-heritage-espresso">Email</h3>
                                <p className="text-heritage-espresso/60 text-sm font-sans">contact@moonstonecafe.com</p>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6 bg-white p-8 md:p-12 rounded-3xl shadow-lg border border-heritage-espresso/5">
                            <h3 className="font-serif text-2xl mb-6 text-heritage-espresso">Send a Message</h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-heritage-espresso/60 text-xs font-bold uppercase mb-2">Name</label>
                                    <input type="text" name="name" required value={formData.name} onChange={handleChange} className="w-full bg-heritage-stone/30 border-b-2 border-heritage-espresso/10 p-3 focus:outline-none focus:border-heritage-saffron text-heritage-espresso transition-colors placeholder-heritage-espresso/20" placeholder="John Doe" />
                                </div>
                                <div>
                                    <label className="block text-heritage-espresso/60 text-xs font-bold uppercase mb-2">Phone</label>
                                    <input type="tel" name="phone" value={formData.phone} onChange={handleChange} className="w-full bg-heritage-stone/30 border-b-2 border-heritage-espresso/10 p-3 focus:outline-none focus:border-heritage-saffron text-heritage-espresso transition-colors placeholder-heritage-espresso/20" placeholder="+91..." />
                                </div>
                            </div>
                            <div>
                                <label className="block text-heritage-espresso/60 text-xs font-bold uppercase mb-2">Email</label>
                                <input type="email" name="email" required value={formData.email} onChange={handleChange} className="w-full bg-heritage-stone/30 border-b-2 border-heritage-espresso/10 p-3 focus:outline-none focus:border-heritage-saffron text-heritage-espresso transition-colors placeholder-heritage-espresso/20" placeholder="name@example.com" />
                            </div>
                            <div>
                                <label className="block text-heritage-espresso/60 text-xs font-bold uppercase mb-2">Message</label>
                                <textarea name="message" required value={formData.message} onChange={handleChange} rows="4" className="w-full bg-heritage-stone/30 border-b-2 border-heritage-espresso/10 p-3 focus:outline-none focus:border-heritage-saffron text-heritage-espresso transition-colors placeholder-heritage-espresso/20" placeholder="Hello..."></textarea>
                            </div>
                            <button type="submit" disabled={loading} className="w-full py-4 bg-heritage-espresso text-white font-bold uppercase tracking-widest text-xs rounded-xl hover:bg-heritage-saffron transition-colors shadow-lg">
                                {loading ? 'Sending...' : 'Send Message'}
                            </button>
                        </form>
                    </div>

                    {/* Map */}
                    <div className="h-full min-h-[400px] rounded-3xl overflow-hidden shadow-2xl relative order-first lg:order-last">
                        <iframe
                            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3886.0024464878546!2d80.2450!3d13.0604!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTPCsDAzJzM3LjQiTiA4MMKwMTQnNDIuMCJF!5e0!3m2!1sen!2sin!4v1635760000000!5m2!1sen!2sin"
                            width="100%"
                            height="100%"
                            style={{ border: 0 }}
                            allowFullScreen=""
                            loading="lazy"
                            title="Moonstone Café Location"
                            className="grayscale opacity-80 hover:grayscale-0 hover:opacity-100 transition-all duration-700"
                        ></iframe>
                        <div className="absolute bottom-6 left-6 bg-white/90 backdrop-blur px-6 py-4 rounded-xl shadow-lg border border-heritage-espresso/10 max-w-xs">
                            <h4 className="text-heritage-saffron font-serif font-bold text-lg mb-1">Visit Us</h4>
                            <p className="text-xs text-heritage-espresso/80 font-sans leading-relaxed">27, Grand Food Street, Near City Center Mall, Chennai – 600018</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Contact;
