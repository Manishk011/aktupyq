import React from 'react';
import { motion } from 'framer-motion';
import Button from '../ui/Button';
import { ArrowRight, BookOpen } from 'lucide-react';

const IntroSection = () => {
    return (
        <section className="py-20 bg-white">
            <div className="container mx-auto px-4 lg:px-8">
                <div className="flex flex-col lg:flex-row items-center gap-16">

                    <div className="flex-1 space-y-8">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                            viewport={{ once: true }}
                        >
                            <h1 className="text-4xl lg:text-5xl font-bold leading-tight text-gray-900 mb-6">
                                Your One-Stop Solution for <span className="text-primary">AKTU Study Material</span>
                            </h1>
                            <p className="text-lg text-gray-600 leading-relaxed mb-8">
                                Access curated notes, previous year questions, quantum PDFs, and syllabus for all courses including B.Tech, MBA, BCA, and more. Simplify your semester preparation with organized resources.
                            </p>

                            <div className="flex flex-wrap gap-4">
                                <Button variant="primary" className="px-8 py-3 text-lg">
                                    Explore Courses <ArrowRight size={20} />
                                </Button>
                                <Button variant="outline" className="px-8 py-3 text-lg">
                                    View Syllabus
                                </Button>
                            </div>
                        </motion.div>

                        <div className="grid grid-cols-3 gap-6 pt-8 border-t border-gray-100">
                            <div>
                                <h4 className="text-3xl font-bold text-gray-900">50k+</h4>
                                <p className="text-sm text-gray-500">Students Helped</p>
                            </div>
                            <div>
                                <h4 className="text-3xl font-bold text-primary">1000+</h4>
                                <p className="text-sm text-gray-500">PDF Resources</p>
                            </div>
                            <div>
                                <h4 className="text-3xl font-bold text-gray-900">100%</h4>
                                <p className="text-sm text-gray-500">Free Content</p>
                            </div>
                        </div>
                    </div>

                    <motion.div
                        className="flex-1 relative"
                        initial={{ opacity: 0, x: 20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8 }}
                        viewport={{ once: true }}
                    >
                        <div className="relative z-10 rounded-2xl overflow-hidden shadow-2xl border-4 border-white">
                            <img
                                src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                                alt="Students studying"
                                className="w-full h-auto object-cover"
                            />
                        </div>

                        {/* Decorative elements */}
                        <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-blue-100 rounded-full blur-3xl -z-10"></div>
                        <div className="absolute -top-10 -right-10 w-40 h-40 bg-purple-100 rounded-full blur-3xl -z-10"></div>
                    </motion.div>

                </div>
            </div>
        </section>
    );
};

export default IntroSection;
