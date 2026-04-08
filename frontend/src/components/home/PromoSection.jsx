import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Button from '../ui/Button';
import { Megaphone, X, Send, CheckCircle2 } from 'lucide-react';

const PromoSection = () => {
    const [showForm, setShowForm] = useState(false);
    const [promoteStatus, setPromoteStatus] = useState('idle');

    const handlePromoteSubmit = (e) => {
        e.preventDefault();
        setPromoteStatus('submitting');
        setTimeout(() => {
            setPromoteStatus('success');
            setTimeout(() => {
                setPromoteStatus('idle');
                setShowForm(false);
            }, 3000);
        }, 1500);
    };

    return (
        <section className="py-20">
            <div className="container mx-auto px-4 lg:px-8">
                <motion.div
                    className="relative bg-gradient-to-br from-primary-dark to-primary rounded-3xl p-8 md:p-12 overflow-hidden shadow-2xl text-white text-left flex flex-col items-stretch"
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                    viewport={{ once: true }}
                >
                    {/* Background decoration */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-black/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 pointer-events-none"></div>

                    <AnimatePresence mode="wait">
                        {!showForm ? (
                            <motion.div 
                                key="banner"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20, position: 'absolute' }}
                                className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8 h-full min-h-[160px]"
                            >
                                <div className="max-w-2xl text-center md:text-left">
                                    <h2 className="text-3xl md:text-4xl font-bold mb-4">Promote Your College or Coaching</h2>
                                    <p className="text-blue-100 text-lg mb-8 md:mb-0">
                                        Reach thousands of AKTU students daily. Boost your brand visibility with targeted advertisements on our platform.
                                    </p>
                                </div>
                                <div className="flex flex-col items-center gap-6 shrink-0">
                                    <div className="relative z-10 animate-float hidden md:block">
                                        <div className="w-24 h-24 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center rotate-12 shadow-xl border border-white/30">
                                            <Megaphone size={36} className="text-yellow-300 transform -rotate-12" />
                                        </div>
                                    </div>
                                    <Button 
                                        variant="secondary" 
                                        className="px-8 py-3 text-primary font-bold shadow-lg hover:shadow-xl"
                                        onClick={() => setShowForm(true)}
                                    >
                                        Promote With Us
                                    </Button>
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="form"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className="relative z-10 w-full"
                            >
                                <div className="flex items-center justify-between mb-8">
                                    <div>
                                        <h2 className="text-2xl md:text-3xl font-bold">Partner With Us</h2>
                                        <p className="text-blue-100 mt-2">Fill out the details below and we'll get back to you.</p>
                                    </div>
                                    <button 
                                        onClick={() => setShowForm(false)}
                                        className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors self-start"
                                    >
                                        <X size={24} />
                                    </button>
                                </div>

                                <form onSubmit={handlePromoteSubmit} className="max-w-3xl space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                            <label htmlFor="orgName" className="text-sm font-medium text-blue-100">Organization / College Name</label>
                                            <input type="text" id="orgName" required className="w-full px-4 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white placeholder-blue-200/50 focus:border-white focus:ring-2 focus:ring-white/20 transition-all outline-none" placeholder="e.g. ABC Engineering College" />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label htmlFor="contactEmail" className="text-sm font-medium text-blue-100">Contact Email</label>
                                            <input type="email" id="contactEmail" required className="w-full px-4 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white placeholder-blue-200/50 focus:border-white focus:ring-2 focus:ring-white/20 transition-all outline-none" placeholder="contact@abccollege.edu" />
                                        </div>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label htmlFor="requirements" className="text-sm font-medium text-blue-100">What are you looking to promote?</label>
                                        <textarea id="requirements" rows="3" required className="w-full px-4 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white placeholder-blue-200/50 focus:border-white focus:ring-2 focus:ring-white/20 transition-all outline-none resize-none" placeholder="e.g. B.Tech Admissions, Coding Bootcamp..."></textarea>
                                    </div>
                                    
                                    <button 
                                        type="submit" 
                                        disabled={promoteStatus !== 'idle'}
                                        className="w-full md:w-auto bg-white hover:bg-gray-50 text-primary font-bold px-8 py-3 rounded-xl transition-colors shadow-lg flex items-center justify-center gap-2 mt-4 disabled:opacity-80 disabled:cursor-not-allowed"
                                    >
                                        {promoteStatus === 'idle' && (
                                            <>
                                                <Send size={18} />
                                                Send Details
                                            </>
                                        )}
                                        {promoteStatus === 'submitting' && (
                                            <div className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                                        )}
                                        {promoteStatus === 'success' && (
                                            <>
                                                <CheckCircle2 size={18} className="text-green-600" />
                                                <span className="text-green-600">Request Sent!</span>
                                            </>
                                        )}
                                    </button>
                                </form>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>
            </div>
        </section>
    );
};

export default PromoSection;
