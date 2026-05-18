import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaRobot, FaPaperPlane, FaTimes, FaCrown } from 'react-icons/fa';
import api from '../utils/api';

const ChatWidget = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { id: 1, text: "Welcome to Moonstone Café. I am your digital concierge. How can I assist you with our menu today?", sender: 'bot' }
    ]);
    const [inputText, setInputText] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef(null);

    const presetQuestions = [
        "What are your opening hours?",
        "Do you offer vegetarian options?",
        "How can I track my order?",
        "Where are you located?"
    ];

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isOpen]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!inputText.trim()) return;

        const userMsg = { id: Date.now(), text: inputText, sender: 'user' };
        setMessages(prev => [...prev, userMsg]);
        setInputText("");
        setIsTyping(true);

        try {
            const res = await api.post('/chat', { message: userMsg.text });
            const botMsg = { id: Date.now() + 1, text: res.data.reply, sender: 'bot' };
            setMessages(prev => [...prev, botMsg]);
        } catch (error) {
            console.error(error);
            setMessages(prev => [...prev, { id: Date.now() + 1, text: "I apologize, but I am having trouble connecting to the concierge service right now.", sender: 'bot' }]);
        } finally {
            setIsTyping(false);
        }
    };

    const handlePresetClick = (question) => {
        // Create synthetic event
        handleSend({ preventDefault: () => {}, target: { value: question } }, question);
    };

    // Refactored handleSend to optionally accept text
    const handleSendRefactored = async (e, overrideText = null) => {
        if (e) e.preventDefault();
        const textToSend = overrideText || inputText;
        if (!textToSend.trim()) return;

        const userMsg = { id: Date.now(), text: textToSend, sender: 'user' };
        setMessages(prev => [...prev, userMsg]);
        if (!overrideText) setInputText("");
        setIsTyping(true);

        try {
            const res = await api.post('/chat', { message: userMsg.text });
            const botMsg = { id: Date.now() + 1, text: res.data.reply, sender: 'bot' };
            setMessages(prev => [...prev, botMsg]);
        } catch (error) {
            console.error(error);
            setMessages(prev => [...prev, { id: Date.now() + 1, text: "I apologize, but I am having trouble connecting to the concierge service right now.", sender: 'bot' }]);
        } finally {
            setIsTyping(false);
        }
    };


    return (
        <>
            {/* TOGGLE BUTTON */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="fixed bottom-6 right-6 md:bottom-8 md:right-8 z-[60] w-14 h-14 md:w-16 md:h-16 bg-heritage-saffron text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 transition-transform duration-300 group border-4 border-heritage-stone"
            >
                {isOpen ? <FaTimes className="text-xl" /> : <FaRobot className="text-2xl animate-bounce" />}
                {!isOpen && (
                    <span className="absolute -top-1 -right-1 flex h-4 w-4">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-heritage-gold opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-4 w-4 bg-heritage-gold border-2 border-heritage-stone"></span>
                    </span>
                )}
            </button>

            {/* CHAT WINDOW */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.9 }}
                        className="fixed bottom-44 md:bottom-28 right-8 z-[60] w-[90vw] md:w-[400px] h-[500px] bg-heritage-stone/95 backdrop-blur-xl border border-heritage-espresso/10 rounded-2xl shadow-2xl flex flex-col overflow-hidden font-sans"
                    >
                        {/* HEADER */}
                        <div className="bg-heritage-espresso p-5 flex items-center gap-4 shadow-md">
                            <div className="w-10 h-10 bg-heritage-saffron rounded-full flex items-center justify-center text-white shadow-inner">
                                <FaCrown />
                            </div>
                            <div>
                                <h3 className="font-serif text-white font-bold text-lg leading-none">Royal Concierge</h3>
                                <p className="text-white/60 text-xs uppercase tracking-wider mt-1">At your service</p>
                            </div>
                        </div>

                        {/* MESSAGES */}
                        <div className="flex-grow overflow-y-auto p-4 space-y-4 custom-scrollbar bg-heritage-stone">
                            {messages.map((msg) => (
                                <div
                                    key={msg.id}
                                    className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div
                                        className={`max-w-[80%] p-4 rounded-2xl text-sm leading-relaxed shadow-sm ${msg.sender === 'user'
                                            ? 'bg-heritage-espresso text-white rounded-tr-none'
                                            : 'bg-white border border-heritage-espresso/5 text-heritage-espresso rounded-tl-none'
                                            }`}
                                    >
                                        {msg.text}
                                    </div>
                                </div>
                            ))}
                            {isTyping && (
                                <div className="flex justify-start">
                                    <div className="bg-white p-4 rounded-2xl rounded-tl-none flex gap-1 border border-heritage-espresso/5 shadow-sm">
                                        <div className="w-2 h-2 bg-heritage-espresso/40 rounded-full animate-bounce"></div>
                                        <div className="w-2 h-2 bg-heritage-espresso/40 rounded-full animate-bounce delay-100"></div>
                                        <div className="w-2 h-2 bg-heritage-espresso/40 rounded-full animate-bounce delay-200"></div>
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* PRESET CHIPS */}
                        <div className="bg-white/50 border-t border-heritage-espresso/10 p-3 overflow-x-auto whitespace-nowrap custom-scrollbar flex gap-2">
                            {presetQuestions.map((q, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => handleSendRefactored(null, q)}
                                    className="px-3 py-1.5 bg-heritage-stone/50 hover:bg-heritage-saffron hover:text-white border border-heritage-espresso/10 rounded-full text-[10px] font-bold uppercase tracking-widest text-heritage-espresso transition-colors shadow-sm"
                                >
                                    {q}
                                </button>
                            ))}
                        </div>

                        {/* INPUT */}
                        <form onSubmit={(e) => handleSendRefactored(e)} className="p-4 border-t border-heritage-espresso/10 bg-white">
                            <div className="relative">
                                <input
                                    type="text"
                                    value={inputText}
                                    onChange={(e) => setInputText(e.target.value)}
                                    placeholder="Ask about our menu..."
                                    className="w-full pl-5 pr-14 py-4 rounded-xl bg-white border border-heritage-espresso/10 focus:border-heritage-saffron focus:outline-none text-sm transition-colors text-heritage-espresso placeholder-heritage-espresso/30 shadow-sm"
                                />
                                <button
                                    type="submit"
                                    className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-heritage-saffron text-white rounded-lg flex items-center justify-center hover:bg-heritage-espresso transition-colors shadow-md"
                                >
                                    <FaPaperPlane className="text-xs" />
                                </button>
                            </div>
                        </form>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default ChatWidget;
