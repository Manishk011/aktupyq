import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, MapPin, Phone, Send, Megaphone, CheckCircle2 } from 'lucide-react';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import { submitContact } from '../services/api';

const ContactUs = () => {
    const [promoteStatus, setPromoteStatus] = useState('idle'); // idle, submitting, success
    const [contactStatus, setContactStatus] = useState('idle'); // idle, submitting, success, error
    const [contactData, setContactData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        subject: '',
        message: ''
    });

    const handlePromoteSubmit = (e) => {
        e.preventDefault();
        setPromoteStatus('submitting');
        // Simulate API call
        setTimeout(() => {
            setPromoteStatus('success');
            setTimeout(() => setPromoteStatus('idle'), 3000); // Reset after 3s
        }, 1000);
    };

    const handleContactSubmit = async (e) => {
        e.preventDefault();
        setContactStatus('submitting');
        try {
            await submitContact({
                name: `${contactData.firstName} ${contactData.lastName}`.trim(),
                email: contactData.email,
                subject: contactData.subject,
                message: contactData.message
            });
            setContactStatus('success');
            setContactData({ firstName: '', lastName: '', email: '', subject: '', message: '' });
            setTimeout(() => setContactStatus('idle'), 5000);
        } catch (error) {
            console.error("Failed to submit contact:", error);
            setContactStatus('error');
            setTimeout(() => setContactStatus('idle'), 3000);
        }
    };

    const handleChange = (e) => {
        setContactData({ ...contactData, [e.target.id]: e.target.value });
    };

    return (
        <div className="min-h-screen bg-slate-50">
            <Header />
            <div className="pt-32 pb-12 container mx-auto px-4 lg:px-8 max-w-6xl">
                <div className="text-center mb-16">
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-4xl md:text-5xl font-bold text-gray-900 mb-4"
                    >
                        Get in Touch
                    </motion.h1>
                    <p className="text-lg text-gray-600">Have questions, feedback, or resource contributions? We'd love to hear from you.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                    {/* Contact Information */}
                    <div className="space-y-8">
                        <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
                            <h2 className="text-2xl font-semibold text-gray-900 mb-6">Contact Information</h2>

                            <div className="space-y-6">
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 shrink-0">
                                        <Mail size={24} />
                                    </div>
                                    <div>
                                        <h3 className="font-medium text-gray-900 text-lg">Email Us</h3>
                                        <p className="text-gray-500 mb-1">We aim to reply within 24 hours.</p>
                                        <a href="mailto:support@aktupyq.com" className="text-blue-600 hover:text-blue-700 font-medium">support@aktupyq.com</a>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 shrink-0">
                                        <MapPin size={24} />
                                    </div>
                                    <div>
                                        <h3 className="font-medium text-gray-900 text-lg">Location</h3>
                                        <p className="text-gray-500">Uttar Pradesh, India</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-blue-600 rounded-2xl p-8 text-white shadow-lg">
                            <h2 className="text-2xl font-semibold mb-4">Contribute Resources</h2>
                            <p className="text-blue-100 mb-6">Have past papers or good notes? Help fellow students by sharing them with our community.</p>
                            <a href="mailto:contribute@aktupyq.com" className="inline-flex items-center gap-2 bg-white text-blue-600 px-6 py-3 rounded-xl font-medium hover:bg-blue-50 transition-colors">
                                <Send size={18} />
                                Submit Material
                            </a>
                        </div>
                    </div>

                    {/* Contact Form */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100"
                    >
                        <h2 className="text-2xl font-semibold text-gray-900 mb-6">Send a Message</h2>
                        <form className="space-y-5" onSubmit={handleContactSubmit}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div className="space-y-2">
                                    <label htmlFor="firstName" className="text-sm font-medium text-gray-700">First Name</label>
                                    <input type="text" id="firstName" required value={contactData.firstName} onChange={handleChange} className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none" placeholder="John" />
                                </div>
                                <div className="space-y-2">
                                    <label htmlFor="lastName" className="text-sm font-medium text-gray-700">Last Name</label>
                                    <input type="text" id="lastName" required value={contactData.lastName} onChange={handleChange} className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none" placeholder="Doe" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label htmlFor="email" className="text-sm font-medium text-gray-700">Email Address</label>
                                <input type="email" id="email" required value={contactData.email} onChange={handleChange} className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none" placeholder="john@example.com" />
                            </div>
                            <div className="space-y-2">
                                <label htmlFor="subject" className="text-sm font-medium text-gray-700">Subject</label>
                                <input type="text" id="subject" required value={contactData.subject} onChange={handleChange} className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none" placeholder="How can we help?" />
                            </div>
                            <div className="space-y-2">
                                <label htmlFor="message" className="text-sm font-medium text-gray-700">Message</label>
                                <textarea id="message" required rows="4" value={contactData.message} onChange={handleChange} className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none resize-none" placeholder="Your message here..."></textarea>
                            </div>
                            <button 
                                type="submit" 
                                disabled={contactStatus === 'submitting'}
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-xl transition-colors shadow-md hover:shadow-lg flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {contactStatus === 'idle' && <><Send size={18} /> Send Message</>}
                                {contactStatus === 'submitting' && <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                                {contactStatus === 'success' && <><CheckCircle2 size={18} className="text-green-300" /> <span className="text-green-100">Sent!</span></>}
                                {contactStatus === 'error' && <span>Failed to send. Try again.</span>}
                            </button>
                        </form>
                    </motion.div>
                </div>

                {/* Promote Us / Partner Section */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="mt-16 bg-gradient-to-br from-blue-900 to-indigo-900 rounded-3xl p-8 md:p-12 shadow-xl text-white relative overflow-hidden"
                >
                    {/* Decorative Background Elements */}
                    <div className="absolute top-0 right-0 -translate-y-12 translate-x-8 opacity-10">
                        <Megaphone size={200} />
                    </div>
                    <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/4 w-96 h-96 bg-blue-500 rounded-full blur-3xl opacity-20" />

                    <div className="relative z-10 grid grid-cols-1 lg:grid-cols-5 gap-12 items-center">
                        <div className="lg:col-span-2 space-y-6">
                            <div className="inline-flex items-center gap-2 bg-blue-800/50 rounded-full px-4 py-2 border border-blue-700/50">
                                <Megaphone size={16} className="text-blue-300" />
                                <span className="text-sm font-medium text-blue-100">Partner With Us</span>
                            </div>
                            <h2 className="text-3xl md:text-4xl font-bold leading-tight">Help us reach more students!</h2>
                            <p className="text-blue-100/80 leading-relaxed">
                                Are you a college influencer, club member, or just someone who loves sharing good resources? Partner with aktupyq to spread the word and get exclusive perks.
                            </p>
                        </div>
                        
                        <div className="lg:col-span-3">
                            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 md:p-8">
                                <form className="space-y-4" onSubmit={handlePromoteSubmit}>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                            <label htmlFor="promoName" className="text-sm font-medium text-blue-100">Name / Organization</label>
                                            <input type="text" id="promoName" required className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-blue-200/50 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 transition-all outline-none" placeholder="e.g. Tech Club AKTU" />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label htmlFor="promoPlatform" className="text-sm font-medium text-blue-100">Primary Platform</label>
                                            <select id="promoPlatform" required className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 transition-all outline-none appearance-none cursor-pointer">
                                                <option value="" disabled selected className="text-gray-900">Select Platform</option>
                                                <option value="instagram" className="text-gray-900">Instagram / Reels</option>
                                                <option value="youtube" className="text-gray-900">YouTube</option>
                                                <option value="whatsapp" className="text-gray-900">WhatsApp Groups / Communities</option>
                                                <option value="college_club" className="text-gray-900">College Club / Council</option>
                                                <option value="other" className="text-gray-900">Other</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label htmlFor="promoReach" className="text-sm font-medium text-blue-100">Estimated Reach / Audience Size</label>
                                        <input type="text" id="promoReach" required className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-blue-200/50 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 transition-all outline-none" placeholder="e.g. 5,000 followers or 500 club members" />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label htmlFor="promoIdea" className="text-sm font-medium text-blue-100">How do you plan to promote?</label>
                                        <textarea id="promoIdea" rows="3" required className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-blue-200/50 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 transition-all outline-none resize-none" placeholder="Briefly describe your idea..."></textarea>
                                    </div>
                                    
                                    <button 
                                        type="submit" 
                                        disabled={promoteStatus !== 'idle'}
                                        className="w-full bg-blue-500 hover:bg-blue-400 text-white font-medium py-3 rounded-xl transition-colors shadow-lg hover:shadow-blue-500/25 flex items-center justify-center gap-2 mt-2 disabled:opacity-70 disabled:cursor-not-allowed"
                                    >
                                        {promoteStatus === 'idle' && (
                                            <>
                                                <Megaphone size={18} />
                                                Submit Proposal
                                            </>
                                        )}
                                        {promoteStatus === 'submitting' && (
                                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        )}
                                        {promoteStatus === 'success' && (
                                            <>
                                                <CheckCircle2 size={18} className="text-green-300" />
                                                <span className="text-green-100">Submitted Successfully!</span>
                                            </>
                                        )}
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
            <Footer />
        </div>
    );
};

export default ContactUs;
