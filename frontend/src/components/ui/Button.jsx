import React from 'react';
import { motion } from 'framer-motion';

const Button = ({ children, onClick, variant = 'primary', className = '', ...props }) => {
    const baseStyles = "px-6 py-2 rounded-lg font-medium transition-all duration-300 flex items-center justify-center gap-2";

    const variants = {
        primary: "bg-primary hover:bg-primary-dark text-white shadow-lg hover:shadow-xl",
        secondary: "bg-white text-gray-700 border border-gray-200 hover:border-primary hover:text-primary shadow-sm hover:shadow-md",
        outline: "border-2 border-primary text-primary hover:bg-primary/5",
        ghost: "text-gray-600 hover:text-primary hover:bg-gray-50",
        gradient: "bg-gradient-to-r from-primary to-primary-light text-white hover:shadow-lg hover:scale-[1.02]"
    };

    return (
        <motion.button
            whileTap={{ scale: 0.95 }}
            whileHover={{ scale: 1.02 }}
            className={`${baseStyles} ${variants[variant]} ${className}`}
            onClick={onClick}
            {...props}
        >
            {children}
        </motion.button>
    );
};

export default Button;
