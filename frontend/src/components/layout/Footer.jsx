import React from 'react';
import { Link } from 'react-router-dom';
import { GraduationCap, Mail, Twitter, Facebook, Instagram, Send } from 'lucide-react';

const Footer = () => {
    const [courses, setCourses] = React.useState([]);

    React.useEffect(() => {
        const fetchCourses = async () => {
            try {
                const { getCourses } = await import('../../services/api');
                const data = await getCourses();
                setCourses(data || []);
            } catch (error) {
                console.error("Failed to fetch courses:", error);
            }
        };
        fetchCourses();
    }, []);

    return (
        <footer className="bg-[#0f172a] text-white pt-16 pb-8">
            <div className="container mx-auto px-4 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
                    {/* Brand */}
                    <div className="space-y-4">
                        <Link to="/" className="flex items-center gap-2 group">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center text-white">
                                <GraduationCap size={24} />
                            </div>
                            <span className="text-xl font-bold">aktupyq</span>
                        </Link>
                        <p className="text-gray-400 text-sm leading-relaxed">
                            Your one-stop destination for AKTU study materials, PYQs, Quantum notes, and syllabus updates.
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="text-lg font-semibold mb-6">Quick Links</h3>
                        <ul className="space-y-3">
                            <li><Link to="/about" className="text-gray-400 hover:text-blue-400 transition-colors">About Us</Link></li>
                            <li><Link to="/contact" className="text-gray-400 hover:text-blue-400 transition-colors">Contact Us</Link></li>
                            <li><Link to="/privacy" className="text-gray-400 hover:text-blue-400 transition-colors">Privacy Policy</Link></li>
                            <li><Link to="/terms" className="text-gray-400 hover:text-blue-400 transition-colors">Terms & Conditions</Link></li>
                        </ul>
                    </div>

                    {/* Courses */}
                    <div>
                        <h3 className="text-lg font-semibold mb-6">Courses</h3>
                        <ul className="space-y-3">
                            {courses.length > 0 ? (
                                courses.map((course) => (
                                    <li key={course._id}>
                                        <Link 
                                            to={`/course/${course.name.toLowerCase().replace(/\./g, '')}`} 
                                            className="text-gray-400 hover:text-blue-400 transition-colors"
                                        >
                                            {course.name}
                                        </Link>
                                    </li>
                                ))
                            ) : (
                                <li><span className="text-gray-500 text-sm">Loading...</span></li>
                            )}
                        </ul>
                    </div>

                    {/* Contact */}
                    <div>
                        <h3 className="text-lg font-semibold mb-6">Connect With Us</h3>
                        <div className="space-y-4">
                            <a href="mailto:support@aktupyq.com" className="flex items-center gap-3 text-gray-400 hover:text-blue-400 transition-colors">
                                <Mail size={18} />
                                support@aktupyq.com
                            </a>
                            <div className="flex items-center gap-4 pt-2">
                                <a href="#" className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-gray-400 hover:bg-blue-600 hover:text-white transition-all">
                                    <Send size={18} />
                                </a>
                                <a href="#" className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-gray-400 hover:bg-blue-600 hover:text-white transition-all">
                                    <Instagram size={18} />
                                </a>
                                <a href="#" className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-gray-400 hover:bg-blue-600 hover:text-white transition-all">
                                    <Twitter size={18} />
                                </a>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
                    <p className="text-gray-500 text-sm">
                        © {new Date().getFullYear()} aktupyq. All rights reserved.
                    </p>
                    <div className="flex items-center gap-6">
                        <span className="text-sm text-gray-500">Made with ❤️ for AKTU Students</span>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
