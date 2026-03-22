import React from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Users, Target, Zap } from 'lucide-react';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';

const AboutUs = () => {
    return (
        <div className="min-h-screen bg-slate-50">
            <Header />
            <div className="pt-32 pb-12 container mx-auto px-4 lg:px-8">
                {/* Hero Section */}
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <motion.h1 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-4xl md:text-5xl font-bold text-gray-900 mb-6"
                    >
                        Empowering AKTU Students to <span className="text-blue-600">Excel</span>
                    </motion.h1>
                    <motion.p 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-lg text-gray-600 leading-relaxed"
                    >
                        aktupyq is your ultimate destination for comprehensive study materials, previous year questions, and reliable academic resources tailored specifically for Dr. A.P.J. Abdul Kalam Technical University students.
                    </motion.p>
                </div>

                {/* Values / Features */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
                    {[
                        { icon: BookOpen, title: "Curated Resources", desc: "High-quality, verified materials organized by branch and semester." },
                        { icon: Target, title: "Exam Focused", desc: "Targeted PYQs and notes to help you maximize your scores." },
                        { icon: Users, title: "Community Driven", desc: "Built by students, for students, understanding your unique needs." },
                        { icon: Zap, title: "Constantly Updated", desc: "Staying current with the latest AKTU syllabus and patterns." },
                    ].map((feature, idx) => (
                        <motion.div 
                            key={idx}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: idx * 0.1 }}
                            className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 text-center hover:shadow-md transition-shadow"
                        >
                            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 mx-auto mb-4">
                                <feature.icon size={24} />
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                            <p className="text-gray-600 text-sm leading-relaxed">{feature.desc}</p>
                        </motion.div>
                    ))}
                </div>

                {/* Our Story */}
                <div className="bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-gray-100 flex flex-col md:flex-row gap-12 items-center">
                    <div className="flex-1 space-y-6">
                        <h2 className="text-3xl font-bold text-gray-900">Our Story</h2>
                        <p className="text-gray-600 leading-relaxed">
                            We recognized the struggle AKTU students face in finding organized, reliable, and up-to-date study materials. Surfing through ad-cluttered websites and unverified WhatsApp groups was frustrating and time-consuming.
                        </p>
                        <p className="text-gray-600 leading-relaxed">
                            That's why we created aktupyq—a clean, modern, and ad-free platform dedicated to centralizing the best academic resources. Our mission is to simplify your study process so you can focus on what truly matters: learning and excelling in your exams.
                        </p>
                    </div>
                    <div className="flex-1">
                        <img 
                            src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" 
                            alt="Students studying" 
                            className="rounded-2xl shadow-lg w-full h-auto object-cover"
                        />
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default AboutUs;
