import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, ChevronRight, FileDown, Layers, FileText, SearchX } from 'lucide-react';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import { getCourses, getBranches, getYears, getSubjects, getMaterials } from '../services/api';
import SEO from '../components/SEO';

const Syllabus = () => {
    const [courses, setCourses] = useState([]);
    const [selectedCourseId, setSelectedCourseId] = useState('');

    const [branches, setBranches] = useState([]);
    const [selectedBranchId, setSelectedBranchId] = useState('');

    const [years, setYears] = useState([]);
    const [selectedYearId, setSelectedYearId] = useState('');

    const [loadingFilters, setLoadingFilters] = useState({ courses: true, branches: false, years: false });
    const [loading, setLoading] = useState(false);
    const [syllabusData, setSyllabusData] = useState([]); // Array of { subject, materials: [] }

    // 1. Load Courses
    useEffect(() => {
        getCourses().then(data => {
            setCourses(data);
            if (data.length > 0) setSelectedCourseId(data[0]._id);
        }).catch(err => console.error(err)).finally(() => setLoadingFilters(p => ({ ...p, courses: false })));
    }, []);

    // 2. Load Branches
    useEffect(() => {
        if (!selectedCourseId) { setBranches([]); return; }
        setLoadingFilters(p => ({ ...p, branches: true }));
        getBranches(selectedCourseId).then(data => {
            setBranches(data);
            if (data.length > 0) setSelectedBranchId(data[0]._id);
            else { setSelectedBranchId(''); setYears([]); setSyllabusData([]); }
        }).finally(() => setLoadingFilters(p => ({ ...p, branches: false })));
    }, [selectedCourseId]);

    // 3. Load Years
    useEffect(() => {
        if (!selectedBranchId) { setYears([]); return; }
        setLoadingFilters(p => ({ ...p, years: true }));
        getYears(selectedBranchId).then(data => {
            setYears(data);
            if (data.length > 0) setSelectedYearId(data[0]._id);
            else { setSelectedYearId(''); setSyllabusData([]); }
        }).finally(() => setLoadingFilters(p => ({ ...p, years: false })));
    }, [selectedBranchId]);

    // 4. Fetch Syllabus Data for the selected Year
    useEffect(() => {
        if (!selectedYearId) { setSyllabusData([]); return; }

        const fetchSyllabi = async () => {
            setLoading(true);
            try {
                // Get all subjects for this year
                const subjects = await getSubjects(selectedYearId);

                // For each subject, fetch materials of type 'syllabus'
                const promises = subjects.map(async (subj) => {
                    const res = await getMaterials(subj._id, 'syllabus');
                    return {
                        subject: subj,
                        materials: res.materials || []
                    };
                });

                const results = await Promise.all(promises);
                // Filter out subjects with no syllabus materials
                const filtered = results.filter(r => r.materials.length > 0);
                setSyllabusData(filtered);
            } catch (err) {
                console.error("Failed to fetch syllabus data", err);
            } finally {
                setLoading(false);
            }
        };

        fetchSyllabi();
    }, [selectedYearId]);

    const selectedCourseName = courses.find(c => c._id === selectedCourseId)?.name || '';
    const selectedBranchName = branches.find(b => b._id === selectedBranchId)?.name || '';
    const selectedYearName = years.find(y => y._id === selectedYearId)?.yearNumber ? `Year ${years.find(y => y._id === selectedYearId)?.yearNumber}` : '';
    
    const displayTitle = selectedCourseName 
        ? `${selectedCourseName} ${selectedBranchName} ${selectedYearName} Syllabus - AKTU PYQ` 
        : 'AKTU Syllabus - Download Latest Official Curriculum';
    
    const displayDesc = selectedCourseName 
        ? `Download the official AKTU syllabus for ${selectedCourseName} ${selectedBranchName} ${selectedYearName}.` 
        : 'Download the latest and archived syllabus for all AKTU courses, branches, and academic sessions.';

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col pt-24 pb-12">
            <SEO 
                title={displayTitle} 
                description={displayDesc} 
            />
            <Header />
            <main className="flex-grow container mx-auto px-4 lg:px-8 max-w-6xl">

                {/* Hero Section */}
                <div className="bg-gradient-to-br from-emerald-600 to-teal-800 rounded-3xl p-8 md:p-12 mb-8 text-white shadow-xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
                    <div className="relative z-10">
                        <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mb-6">
                            <BookOpen size={32} className="text-white" />
                        </div>
                        <h1 className="text-4xl md:text-5xl font-bold mb-4">Official Syllabus</h1>
                        <p className="text-emerald-50 text-lg max-w-2xl">
                            Download the latest and archived syllabus for all courses, branches, and academic sessions. Select your curriculum details below to get started.
                        </p>
                    </div>
                </div>

                {/* Filter Bar */}
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 mb-8 flex flex-col md:flex-row gap-4 items-center">
                    <div className="w-full md:w-1/3">
                        <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2 ml-1">Course</label>
                        <select
                            value={selectedCourseId}
                            onChange={e => setSelectedCourseId(e.target.value)}
                            disabled={loadingFilters.courses}
                            className="w-full px-4 py-3 border border-gray-200 bg-gray-50 rounded-xl text-sm font-semibold text-gray-800 outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all cursor-pointer disabled:opacity-50"
                        >
                            {loadingFilters.courses ? <option>Loading...</option> : courses.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                        </select>
                    </div>

                    <ChevronRight size={20} className="text-gray-300 hidden md:block mt-6" />

                    <div className="w-full md:w-1/3">
                        <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2 ml-1">Branch</label>
                        <select
                            value={selectedBranchId}
                            onChange={e => setSelectedBranchId(e.target.value)}
                            disabled={!branches.length || loadingFilters.branches}
                            className="w-full px-4 py-3 border border-gray-200 bg-gray-50 rounded-xl text-sm font-semibold text-gray-800 outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all cursor-pointer disabled:opacity-50"
                        >
                            <option value="">{loadingFilters.branches ? 'Loading...' : branches.length ? 'Select Branch' : 'No Branches'}</option>
                            {branches.map(b => <option key={b._id} value={b._id}>{b.name}</option>)}
                        </select>
                    </div>

                    <ChevronRight size={20} className="text-gray-300 hidden md:block mt-6" />

                    <div className="w-full md:w-1/3">
                        <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2 ml-1">Academic Year</label>
                        <select
                            value={selectedYearId}
                            onChange={e => setSelectedYearId(e.target.value)}
                            disabled={!years.length || loadingFilters.years}
                            className="w-full px-4 py-3 border border-gray-200 bg-gray-50 rounded-xl text-sm font-semibold text-gray-800 outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all cursor-pointer disabled:opacity-50"
                        >
                            <option value="">{loadingFilters.years ? 'Loading...' : years.length ? 'Select Year' : 'No Years'}</option>
                            {years.map(y => <option key={y._id} value={y._id}>Year {y.yearNumber}</option>)}
                        </select>
                    </div>
                </div>

                {/* Content Area */}
                <div className="min-h-[400px]">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20">
                            <div className="w-12 h-12 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin mb-4"></div>
                            <p className="text-gray-500 font-medium">Loading syllabus data...</p>
                        </div>
                    ) : syllabusData.length === 0 ? (
                        <div className="bg-white rounded-3xl p-12 text-center shadow-sm border border-gray-100 flex flex-col items-center">
                            <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-6">
                                <SearchX size={40} className="text-gray-400" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-800 mb-2">No Syllabus Found</h3>
                            <p className="text-gray-500 max-w-md mx-auto">
                                We couldn't find any syllabus documents for the selected curriculum. Please try another combination or check back later.
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-8">
                            <AnimatePresence>
                                {syllabusData.map((item, index) => (
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.1 }}
                                        key={item.subject._id}
                                        className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
                                    >
                                        <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                                                <Layers size={20} />
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-bold text-gray-900">{item.subject.name}</h3>
                                                <p className="text-sm font-medium text-gray-500 text-emerald-600">{item.subject.code}</p>
                                            </div>
                                        </div>

                                        <div className="p-6">
                                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                                {item.materials.map(m => (
                                                    <div key={m._id} className="border border-gray-200 rounded-xl p-4 hover:border-emerald-300 hover:shadow-md transition-all group">
                                                        <div className="flex justify-between items-start mb-3">
                                                            <FileText className="text-emerald-500 mb-2" size={24} />
                                                            {m.session && (
                                                                <span className="bg-gray-100 text-gray-600 text-[10px] font-bold px-2 py-1 rounded-full">
                                                                    {m.session}
                                                                </span>
                                                            )}
                                                        </div>
                                                        <h4 className="font-semibold text-gray-800 mb-4 line-clamp-2" title={m.title}>{m.title}</h4>

                                                        <button
                                                            onClick={() => {
                                                                const proxyUrl = `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/materials/${m._id}/proxy?action=view`;
                                                                window.open(proxyUrl, '_blank');
                                                            }}
                                                            className="w-full py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-semibold rounded-lg text-sm transition-colors flex items-center justify-center gap-2"
                                                        >
                                                            <FileDown size={16} /> Open PDF
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>
                    )}
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default Syllabus;
