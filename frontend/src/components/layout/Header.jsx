import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Menu, X, ChevronDown, BookOpen, GraduationCap, FileText, Download } from 'lucide-react';

const NavDropdown = ({ title, items }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div
            className="relative group"
            onMouseEnter={() => setIsOpen(true)}
            onMouseLeave={() => setIsOpen(false)}
        >
            <button className="flex items-center gap-1 py-4 text-sm font-medium text-gray-700 hover:text-primary transition-colors">
                {title}
                <ChevronDown size={14} className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        transition={{ duration: 0.2 }}
                        className="absolute top-full left-0 w-56 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50"
                    >
                        <div className="py-2">
                            {items.map((item, index) => (
                                <Link
                                    key={index}
                                    to={item.href || '#'}
                                    className="block px-4 py-2 text-sm text-gray-600 hover:bg-blue-50 hover:text-primary transition-colors"
                                >
                                    {item.label}
                                </Link>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

const Header = () => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const [courses, setCourses] = useState([]);

    React.useEffect(() => {
        const fetchCourses = async () => {
            try {
                const { getCourses } = await import('../../services/api');
                const data = await getCourses();
                // Map the backend courses to the format needed by the dropdown
                const formattedCourses = data.map(course => ({
                    label: course.name,
                    // Convert course name to slug e.g. B.Tech -> btech
                    href: `/course/${course.name.toLowerCase().replace('.', '')}`
                }));
                setCourses(formattedCourses);
            } catch (error) {
                console.error("Failed to fetch courses:", error);
            }
        };
        fetchCourses();
    }, []);

    return (
        <header className="fixed w-full top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
            {/* Upper Navigation Bar - Desktop */}
            <div className="hidden md:block bg-white border-b border-gray-50">
                <div className="container mx-auto px-4 lg:px-8">
                    <div className="flex items-center gap-8">
                        <Link to="/" className="text-sm font-medium text-gray-700 hover:text-primary py-4">Home</Link>
                        <NavDropdown title="Courses" items={courses} />
                        <NavDropdown title="AKTU PYQs" items={courses} />
                        <NavDropdown title="Quantum" items={courses} />
                        <NavDropdown title="Notes" items={courses} />
                        <NavDropdown title="Syllabus" items={courses} />
                    </div>
                </div>
            </div>

            {/* Main Header */}
            <div className="container mx-auto px-4 lg:px-8 py-3">
                <div className="flex items-center justify-between gap-4">
                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-2 group">
                        <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary-dark rounded-xl flex items-center justify-center text-white shadow-lg group-hover:shadow-primary/30 transition-all duration-300">
                            <GraduationCap size={24} />
                        </div>
                        <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600">
                            aktupyq
                        </span>
                    </Link>

                    {/* Search Bar - Desktop */}
                    <div className="hidden md:flex flex-1 max-w-xl relative group">
                        <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-primary transition-colors">
                            <Search size={18} />
                        </div>
                        <input
                            type="text"
                            placeholder="Search notes, pyqs, syllabus..."
                            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-300"
                        />
                    </div>

                    {/* Right Links - Desktop */}
                    <div className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-600">
                        <Link to="/about" className="hover:text-primary transition-colors">About</Link>
                        <Link to="/contact" className="hover:text-primary transition-colors">Contact</Link>
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        className="md:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    >
                        {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu Overlay */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="md:hidden bg-white border-t border-gray-100 overflow-hidden"
                    >
                        <div className="p-4 space-y-4">
                            <input
                                type="text"
                                placeholder="Search..."
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl mb-4"
                            />
                            <div className="space-y-2">
                                <Link to="/" className="block px-4 py-3 rounded-xl hover:bg-blue-50 text-gray-700 font-medium">Home</Link>
                                <Link to="/courses" className="block px-4 py-3 rounded-xl hover:bg-blue-50 text-gray-700 font-medium">Courses</Link>
                                <Link to="/pyqs" className="block px-4 py-3 rounded-xl hover:bg-blue-50 text-gray-700 font-medium">AKTU PYQs</Link>
                                <Link to="/quantum" className="block px-4 py-3 rounded-xl hover:bg-blue-50 text-gray-700 font-medium">Quantum</Link>
                                <Link to="/notes" className="block px-4 py-3 rounded-xl hover:bg-blue-50 text-gray-700 font-medium">Notes</Link>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </header>
    );
};

export default Header;
