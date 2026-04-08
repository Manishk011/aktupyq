import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles } from 'lucide-react';

const RotatingBanner = () => {
    const [currentSlide, setCurrentSlide] = useState(0);

    const slides = [
        "🚀 Download AKTU Notes for Free - Updated 2025-26",
        "📚 Previous Year Questions Updated (2018-2025)",
        "💡 Join Our Telegram for Exclusive Quantum PDFs",
        "✨ Sem Results Announced: Check Now on AKTU ERP"
    ];

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % slides.length);
        }, 4000);
        return () => clearInterval(timer);
    }, []);

    return (
        <div className="bg-gradient-to-r from-primary-dark via-primary to-primary-dark text-white py-3 overflow-hidden relative">
            <div className="container mx-auto px-4 flex justify-center items-center">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentSlide}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.5 }}
                        className="flex items-center gap-2 font-medium text-sm md:text-base text-center"
                    >
                        <Sparkles size={16} className="text-yellow-300 hidden md:block" />
                        {slides[currentSlide]}
                        <Sparkles size={16} className="text-yellow-300 hidden md:block" />
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
};

export default RotatingBanner;
