import { useState, useEffect } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { Search as SearchIcon, FileText, Cloud, HardDrive, BookOpen, Layers, ExternalLink, GraduationCap } from 'lucide-react';
import { globalSearch } from '../services/api';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';

// Helper to get type color
const getTypeColor = (docType) => {
    switch (docType?.toLowerCase()) {
        case 'notes': return 'bg-blue-100 text-blue-700 border-blue-200';
        case 'pyq': return 'bg-purple-100 text-purple-700 border-purple-200';
        case 'syllabus': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
        default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
};

const SearchResults = () => {
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const query = queryParams.get('q') || '';
    const navigate = useNavigate();

    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState({ courses: [], branches: [], materials: [], quantums: [] });

    useEffect(() => {
        if (!query.trim()) return;
        const fetchResults = async () => {
            setLoading(true);
            try {
                const data = await globalSearch(query);
                setResults(data);
            } catch (error) {
                console.error("Search error:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchResults();
    }, [query]);

    const handlePreview = (m) => {
        const proxyUrl = `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/materials/${m._id}/proxy?action=view`;
        window.open(proxyUrl, '_blank');
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col pt-40 pb-12">
            <Header />
            <main className="flex-grow container mx-auto px-4 lg:px-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Search Results</h1>
                    <p className="text-gray-500">
                        Showing results for <span className="font-semibold text-gray-900">"{query}"</span>
                    </p>
                </div>

                {loading ? (
                    <div className="flex justify-center items-center py-20">
                        <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                    </div>
                ) : (
                    <div className="space-y-12">
                        {/* COURSES & BRANCHES (Only if present) */}
                        {((results.courses && results.courses.length > 0) || (results.branches && results.branches.length > 0)) && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {results.courses && results.courses.length > 0 && (
                                    <div>
                                        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                                            <GraduationCap className="text-blue-600" /> Courses ({results.courses.length})
                                        </h2>
                                        <div className="space-y-4">
                                            {results.courses.map(c => (
                                                <button key={c._id} onClick={() => navigate(`/course/${c.name.toLowerCase().replace('.', '')}`)} className="w-full bg-white rounded-2xl p-5 border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all flex items-center gap-4 text-left group">
                                                    <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                                        <GraduationCap size={24} />
                                                    </div>
                                                    <div>
                                                        <h3 className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors">{c.name}</h3>
                                                        <p className="text-sm text-gray-500">View branches & materials</p>
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {results.branches && results.branches.length > 0 && (
                                    <div>
                                        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                                            <Layers className="text-emerald-600" /> Branches ({results.branches.length})
                                        </h2>
                                        <div className="space-y-4">
                                            {results.branches.map(b => (
                                                <button key={b._id} onClick={() => navigate(`/course/${b.courseId?.name.toLowerCase().replace('.', '')}/${b.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`)} className="w-full bg-white rounded-2xl p-5 border border-gray-200 hover:border-emerald-300 hover:shadow-md transition-all flex items-center gap-4 text-left group">
                                                    <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                                                        <Layers size={24} />
                                                    </div>
                                                    <div>
                                                        <h3 className="font-bold text-gray-900 group-hover:text-emerald-600 transition-colors">{b.name}</h3>
                                                        <p className="text-sm text-gray-500">{b.courseId?.name}</p>
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* MATERIALS */}
                        <div>
                            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                                <FileText className="text-blue-500" /> Materials ({results.materials.length})
                            </h2>
                            {results.materials.length === 0 ? (
                                <p className="text-gray-500 italic bg-white p-4 rounded-xl shadow-sm border border-gray-100">No materials found.</p>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {results.materials.map(m => (
                                        <div key={m._id} className="bg-white rounded-2xl p-5 border border-gray-200 hover:shadow-lg transition-all flex flex-col group relative overflow-hidden">
                                            <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${m.type === 'notes' ? 'from-blue-400 to-blue-600' : m.type === 'pyq' ? 'from-purple-400 to-purple-600' : 'from-emerald-400 to-emerald-600'}`}></div>
                                            <div className="flex justify-between items-start mb-4">
                                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border ${getTypeColor(m.type)}`}>
                                                    <FileText size={20} />
                                                </div>
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border ${getTypeColor(m.type)}`}>
                                                    {m.type}
                                                </span>
                                            </div>
                                            <div className="mb-4">
                                                <h3 className="font-bold text-gray-900 leading-tight mb-1 line-clamp-2">{m.title}</h3>
                                                <p className="text-xs text-gray-500">
                                                    {m.subjectId?.name} ({m.subjectId?.code})
                                                </p>
                                                {m.session && (
                                                    <p className="text-xs text-gray-400 mt-1">Session: {m.session}</p>
                                                )}
                                            </div>
                                            <div className="mt-auto pt-4 border-t border-gray-100 flex items-center justify-between">
                                                <button onClick={() => handlePreview(m)} className="text-sm font-semibold text-blue-600 hover:text-blue-700 bg-blue-50 px-3 py-1.5 rounded-lg flex items-center gap-1">
                                                    Open <ExternalLink size={14} />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* QUANTUMS */}
                        <div>
                            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                                <BookOpen className="text-indigo-500" /> Quantums ({results.quantums.length})
                            </h2>
                            {results.quantums.length === 0 ? (
                                <p className="text-gray-500 italic bg-white p-4 rounded-xl shadow-sm border border-gray-100">No quantums found.</p>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {results.quantums.map(q => (
                                        <div key={q._id} className="bg-white rounded-2xl p-5 border border-indigo-100 shadow-sm hover:shadow-md transition-all flex flex-col">
                                            <div className="flex items-center gap-3 mb-4">
                                                <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                                                    <BookOpen size={20} />
                                                </div>
                                                <div>
                                                    <h3 className="font-bold text-gray-900 line-clamp-1">{q.branchId?.courseId?.name} - {q.branchId?.name}</h3>
                                                    <p className="text-xs text-gray-500">Year {q.yearId?.yearNumber}</p>
                                                </div>
                                            </div>
                                            <div className="mt-auto pt-4 border-t border-gray-100 flex justify-end">
                                                <a href={q.telegramLink} target="_blank" rel="noopener noreferrer" className="text-sm font-semibold text-white hover:bg-indigo-700 bg-indigo-600 px-4 py-2 rounded-xl flex items-center gap-2 transition-colors">
                                                    Open Telegram <ExternalLink size={14} />
                                                </a>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                    </div>
                )}
            </main>
            <Footer />
        </div>
    );
};

export default SearchResults;
