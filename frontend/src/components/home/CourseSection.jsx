import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Book, Cpu, Briefcase, Code, Stethoscope, ChevronRight, GraduationCap } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getCourses } from '../../services/api';

const iconMap = {
    'b.tech': { icon: Cpu, color: 'bg-blue-500' },
    'mba': { icon: Briefcase, color: 'bg-indigo-500' },
    'bca': { icon: Code, color: 'bg-violet-500' },
    'mca': { icon: Book, color: 'bg-purple-500' },
    'b.pharm': { icon: Stethoscope, color: 'bg-emerald-500' },
    'default': { icon: GraduationCap, color: 'bg-gray-500' }
};

const CourseCard = ({ title, icon: Icon, color, delay }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay }}
            whileHover={{ y: -5, transition: { duration: 0.2 } }}
            viewport={{ once: true }}
            className="bg-white rounded-2xl p-6 shadow-md hover:shadow-xl border border-gray-100 group cursor-pointer transition-all"
        >
            <Link to={`/course/${title.toLowerCase().replace('.', '')}`} className="block h-full">
                <div className={`w-14 h-14 rounded-xl ${color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                    <Icon size={28} className="text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
                <p className="text-gray-500 text-sm mb-4">Access notes, PYQs, and study materials for {title} students.</p>
                <div className="flex items-center text-primary font-medium text-sm group-hover:gap-2 transition-all">
                    Explore Resources <ChevronRight size={16} />
                </div>
            </Link>
        </motion.div>
    );
};

const CourseSection = () => {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCourseData = async () => {
            try {
                const data = await getCourses();
                const formattedCourses = data.map(course => {
                    const key = course.name.toLowerCase();
                    const mapped = iconMap[key] || iconMap['default'];
                    return {
                        title: course.name,
                        icon: mapped.icon,
                        color: mapped.color
                    };
                });
                setCourses(formattedCourses);
            } catch (error) {
                console.error("Error fetching courses:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchCourseData();
    }, []);

    return (
        <section id="courses" className="py-20 bg-slate-50 border-t border-gray-200">
            <div className="container mx-auto px-4 lg:px-8">
                <div className="text-center mb-16">
                    <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">Explore Courses</h2>
                    <p className="text-gray-600 max-w-2xl mx-auto">
                        Choose your stream to find specific study materials tailored to your curriculum.
                    </p>
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <div className="w-12 h-12 border-4 border-blue-200 border-t-primary rounded-full animate-spin mb-4"></div>
                        <p className="text-gray-500 font-medium">Loading courses...</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {courses.map((course, index) => (
                            <CourseCard key={index} {...course} delay={index * 0.1} />
                        ))}

                        {/* Default 'More' Card */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.5 }}
                            className="flex items-center justify-center bg-gray-100 rounded-2xl p-6 border-2 border-dashed border-gray-300 text-gray-500 hover:bg-gray-50 hover:border-primary/50 hover:text-primary transition-all cursor-pointer"
                        >
                            <div className="text-center">
                                <span className="block text-lg font-medium mb-1">More Courses</span>
                                <span className="text-sm">Coming Soon</span>
                            </div>
                        </motion.div>
                    </div>
                )}
            </div>
        </section>
    );
};

export default CourseSection;
