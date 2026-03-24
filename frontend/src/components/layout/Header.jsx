import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Menu, X, ChevronDown, BookOpen, GraduationCap, FileText, Download, Layers, ChevronRight } from 'lucide-react';

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

const MobileNavDropdown = ({ title, items, onItemClick }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="space-y-1">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between px-4 py-3 rounded-xl hover:bg-blue-50 text-gray-700 font-medium transition-colors"
            >
                {title}
                <ChevronDown size={18} className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                    >
                        <div className="bg-gray-50 rounded-xl px-2 py-2 mb-2 space-y-1 ml-2 border-l-2 border-primary/20">
                            {items.map((item, index) => (
                                <Link
                                    key={index}
                                    to={item.href || '#'}
                                    onClick={onItemClick}
                                    className="block px-4 py-2 text-sm text-gray-600 hover:text-primary transition-colors"
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
    const [searchQuery, setSearchQuery] = useState('');
    const [suggestions, setSuggestions] = useState({ courses: [], branches: [], materials: [] });
    const [isSuggesting, setIsSuggesting] = useState(false);
    const [suggestLoading, setSuggestLoading] = useState(false);
    const searchRef = React.useRef(null);
    const navigate = useNavigate();

    // Handle outside click for search suggestions
    React.useEffect(() => {
        const handleClickOutside = (event) => {
            if (searchRef.current && !searchRef.current.contains(event.target)) {
                setIsSuggesting(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
            setIsMobileMenuOpen(false);
            setSearchQuery('');
        }
    };

    const [courses, setCourses] = useState([]);

    React.useEffect(() => {
        const fetchCourses = async () => {
            try {
                const { getCourses } = await import('../../services/api');
                const data = await getCourses();
                const formattedCourses = data.map(course => ({
                    label: course.name,
                    href: `/course/${course.name.toLowerCase().replace('.', '')}`
                }));
                setCourses(formattedCourses);
            } catch (error) {
                console.error("Failed to fetch courses:", error);
            }
        };
        fetchCourses();
    }, []);

    // Search Autocomplete Effect
    React.useEffect(() => {
        if (!searchQuery.trim()) {
            setSuggestions({ courses: [], branches: [], materials: [] });
            setIsSuggesting(false);
            return;
        }

        setIsSuggesting(true);

        // 1. Instantly show local course matches while API loads
        const localMatches = courses.filter(c => c.label.toLowerCase().includes(searchQuery.toLowerCase())).slice(0, 3);
        setSuggestions(prev => ({ ...prev, courses: localMatches }));
        setSuggestLoading(true);

        // 2. Debounced API call
        const timer = setTimeout(async () => {
            try {
                const { globalSearch } = await import('../../services/api');
                const data = await globalSearch(searchQuery);
                
                setSuggestions({
                    courses: data.courses.slice(0, 3).map(c => ({ label: c.name, href: `/course/${c.name.toLowerCase().replace('.', '')}` })),
                    branches: data.branches.slice(0, 3),
                    materials: data.materials.slice(0, 4)
                });
            } catch (error) {
                console.error("Live search failed:", error);
            } finally {
                setSuggestLoading(false);
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [searchQuery, courses]);

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
                        <Link to="/syllabus" className="text-sm font-medium text-gray-700 hover:text-primary py-4">Syllabus</Link>
                    </div>
                </div>
            </div>

            {/* Main Header */}
            <div className="container mx-auto px-4 lg:px-8 py-3">
                <div className="flex items-center justify-between gap-4">
                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-2 group">
                        <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary-dark rounded-xl flex items-center justify-center text-white shadow-lg group-hover:shadow-primary/30 transition-all duration-300 overflow-hidden">
                            <img src="/logo.jpeg" alt="aktupyq logo" className="w-full h-full object-cover" />
                        </div>
                        <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600">
                            aktupyq
                        </span>
                    </Link>

                    {/* Search Bar - Desktop */}
                    <form onSubmit={handleSearchSubmit} className="hidden md:flex flex-1 max-w-xl relative group" ref={searchRef}>
                        <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-primary transition-colors">
                            <Search size={18} />
                        </div>
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onFocus={() => searchQuery.trim() && setIsSuggesting(true)}
                            placeholder="Search notes, pyqs, syllabus..."
                            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-300"
                        />
                        
                        {/* Autocomplete Dropdown */}
                        <AnimatePresence>
                            {isSuggesting && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 10 }}
                                    className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50 flex flex-col max-h-[70vh]"
                                >
                                    <div className="overflow-y-auto w-full p-2 space-y-4">
                                        {/* Courses Suggestions */}
                                        {suggestions.courses.length > 0 && (
                                            <div>
                                                <div className="px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-gray-400">Courses</div>
                                                {suggestions.courses.map((c, i) => (
                                                    <Link key={i} to={c.href} onClick={() => setIsSuggesting(false)} className="flex items-center gap-3 px-3 py-2 hover:bg-gray-50 rounded-lg group transition-colors">
                                                        <div className="w-8 h-8 rounded bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                                                            <GraduationCap size={16} />
                                                        </div>
                                                        <span className="font-medium text-gray-700 group-hover:text-blue-600">{c.label}</span>
                                                    </Link>
                                                ))}
                                            </div>
                                        )}

                                        {/* Branches Suggestions */}
                                        {suggestions.branches.length > 0 && (
                                            <div>
                                                <div className="px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-gray-400">Branches</div>
                                                {suggestions.branches.map((b, i) => (
                                                    <Link key={i} to={`/course/${b.courseId?.name.toLowerCase().replace('.', '')}`} onClick={() => setIsSuggesting(false)} className="flex items-center gap-3 px-3 py-2 hover:bg-gray-50 rounded-lg group transition-colors">
                                                        <div className="w-8 h-8 rounded bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                                                            <Layers size={16} />
                                                        </div>
                                                        <div>
                                                            <span className="font-medium text-gray-700 group-hover:text-emerald-600 block">{b.name}</span>
                                                            <span className="text-[10px] text-gray-400 font-bold uppercase">{b.courseId?.name}</span>
                                                        </div>
                                                    </Link>
                                                ))}
                                            </div>
                                        )}

                                        {/* Materials Suggestions */}
                                        {suggestions.materials.length > 0 && (
                                            <div>
                                                <div className="px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-gray-400">Materials</div>
                                                {suggestions.materials.map((m, i) => (
                                                    <div key={i} onClick={() => { setIsSuggesting(false); window.open(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/materials/${m._id}/proxy?action=view`, '_blank'); }} className="flex items-center gap-3 px-3 py-2 hover:bg-gray-50 rounded-lg group transition-colors cursor-pointer">
                                                        <div className="w-8 h-8 rounded bg-gray-100 text-gray-500 flex items-center justify-center shrink-0">
                                                            <FileText size={16} />
                                                        </div>
                                                        <div className="overflow-hidden">
                                                            <span className="font-medium text-gray-700 group-hover:text-blue-600 block truncate" title={m.title}>{m.title}</span>
                                                            <div className="flex items-center gap-2 mt-0.5">
                                                                <span className="text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded font-bold uppercase">{m.type}</span>
                                                                {m.session && <span className="text-[10px] text-gray-400">{m.session}</span>}
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        {/* Loading or Empty State */}
                                        {suggestLoading && (
                                            <div className="p-4 text-center text-gray-400 flex items-center justify-center gap-2 text-sm">
                                                <div className="w-4 h-4 border-2 border-gray-200 border-t-primary rounded-full animate-spin"></div>
                                                Searching...
                                            </div>
                                        )}
                                        {!suggestLoading && suggestions.courses.length === 0 && suggestions.branches.length === 0 && suggestions.materials.length === 0 && (
                                            <div className="p-4 text-center text-gray-500 text-sm">
                                                No suggestions found. Press <kbd className="px-1 py-0.5 bg-gray-100 rounded text-xs">Enter</kbd> to search all.
                                            </div>
                                        )}
                                    </div>
                                    
                                    {/* Footer */}
                                    <div className="px-4 py-3 bg-gray-50 border-t border-gray-100 flex justify-between items-center text-xs text-gray-500">
                                        <button onClick={() => setIsSuggesting(false)} className="hover:text-gray-800">Close</button>
                                        <button type="submit" className="font-bold text-primary hover:text-blue-700 flex items-center gap-1">View all results <ChevronRight size={14}/></button>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </form>

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
                            <form onSubmit={handleSearchSubmit}>
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Search..."
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl mb-4 focus:outline-none focus:ring-2 focus:ring-primary/20"
                                />
                            </form>
                            <div className="space-y-2 pb-4">
                                <Link to="/" onClick={() => setIsMobileMenuOpen(false)} className="block px-4 py-3 rounded-xl hover:bg-blue-50 text-gray-700 font-medium">Home</Link>
                                <MobileNavDropdown title="Courses" items={courses} onItemClick={() => setIsMobileMenuOpen(false)} />
                                <MobileNavDropdown title="AKTU PYQs" items={courses} onItemClick={() => setIsMobileMenuOpen(false)} />
                                <MobileNavDropdown title="Quantum" items={courses} onItemClick={() => setIsMobileMenuOpen(false)} />
                                <MobileNavDropdown title="Notes" items={courses} onItemClick={() => setIsMobileMenuOpen(false)} />
                                <Link to="/syllabus" onClick={() => setIsMobileMenuOpen(false)} className="block px-4 py-3 rounded-xl hover:bg-blue-50 text-gray-700 font-medium w-full text-left">Syllabus</Link>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </header>
    );
};

export default Header;
