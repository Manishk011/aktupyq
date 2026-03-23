import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Plus, Trash2, FileText, Upload, Edit, Cloud, File, FileDown,
    MoreVertical, Search, LayoutGrid, List as ListIcon,
    ChevronRight, CheckCircle2, AlertCircle, HardDrive, Clock, SearchX, BookOpen, Layers
} from 'lucide-react';
import api, { getCourses, getBranches, getYears, getSubjects, updateMaterial } from '../../services/api';
import Button from '../../components/ui/Button';

// Native date formatter
const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
};

const MaterialsAdmin = () => {
    // Selectors state
    const [courses, setCourses] = useState([]);
    const [selectedCourseId, setSelectedCourseId] = useState('');
    const [branches, setBranches] = useState([]);
    const [selectedBranchId, setSelectedBranchId] = useState('');
    const [years, setYears] = useState([]);
    const [selectedYearId, setSelectedYearId] = useState('');
    const [subjects, setSubjects] = useState([]);
    const [selectedSubjectId, setSelectedSubjectId] = useState('');

    // Materials state
    const [materials, setMaterials] = useState([]);
    const [loading, setLoading] = useState(false);

    // UI Messages & Modals
    const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
    const [deleteModal, setDeleteModal] = useState({ show: false, id: null });

    // Display & Filtering
    const [viewMode, setViewMode] = useState('table'); // 'table' or 'card'
    const [searchQuery, setSearchQuery] = useState('');
    const [typeFilter, setTypeFilter] = useState('All'); // All, Notes, PYQ, Syllabus

    // Form state (Modal)
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [uploadLoading, setUploadLoading] = useState(false);
    const [title, setTitle] = useState('');
    const [type, setType] = useState('notes');
    const [session, setSession] = useState('');
    const [isGdrive, setIsGdrive] = useState(false);
    const [gdriveLink, setGdriveLink] = useState('');
    const [file, setFile] = useState(null);

    // Context stats
    const [stats, setStats] = useState({ total: 0, recent: 0, subjects: 0 });

    const showToast = (message, type = 'success') => {
        setToast({ show: true, message, type });
        setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
    };

    // Initial Load
    useEffect(() => {
        getCourses().then(data => {
            setCourses(data);
            if (data.length > 0) setSelectedCourseId(data[0]._id);
        }).catch(() => showToast('Failed to load courses', 'error'));
    }, []);

    // Load hierarchies
    useEffect(() => {
        if (!selectedCourseId) { setBranches([]); return; }
        getBranches(selectedCourseId).then(data => {
            setBranches(data);
            if (data.length > 0) { setSelectedBranchId(data[0]._id); } else { setSelectedBranchId(''); setYears([]); setSubjects([]); setMaterials([]); }
        });
    }, [selectedCourseId]);

    useEffect(() => {
        if (!selectedBranchId) { setYears([]); return; }
        getYears(selectedBranchId).then(data => {
            setYears(data);
            if (data.length > 0) { setSelectedYearId(data[0]._id); } else { setSelectedYearId(''); setSubjects([]); setMaterials([]); }
        });
    }, [selectedBranchId]);

    useEffect(() => {
        if (!selectedYearId) { setSubjects([]); return; }
        getSubjects(selectedYearId).then(data => {
            setSubjects(data);
            setStats(prev => ({ ...prev, subjects: data.length }));
            if (data.length > 0) { setSelectedSubjectId(data[0]._id); } else { setSelectedSubjectId(''); setMaterials([]); }
        });
    }, [selectedYearId]);

    // Fetch Materials
    useEffect(() => {
        if (!selectedSubjectId) { setMaterials([]); return; }
        fetchMaterials();
    }, [selectedSubjectId]);

    const fetchMaterials = async () => {
        setLoading(true);
        try {
            const res = await api.get(`/materials/${selectedSubjectId}`);
            const data = res.data.materials || [];
            setMaterials(data);

            // Calculate stats for current subject
            const recentCount = data.filter(m => {
                const diffTime = Math.abs(new Date() - new Date(m.createdAt));
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                return diffDays <= 7;
            }).length;

            setStats(prev => ({ ...prev, total: data.length, recent: recentCount }));
        } catch (err) {
            showToast('Failed to fetch materials', 'error');
            setMaterials([]);
        } finally {
            setLoading(false);
        }
    };

    const handleUpload = async (e) => {
        e.preventDefault();
        if (!title || !type || !selectedSubjectId) {
            return showToast('Please fill all required fields.', 'error');
        }
        if (!isGdrive && !file && !editingId) {
            return showToast('Please select a file.', 'error');
        }
        if (isGdrive && !gdriveLink) {
            return showToast('Please provide a Google Drive link.', 'error');
        }

        setUploadLoading(true);
        const formData = new FormData();
        formData.append('title', title);
        formData.append('type', type);
        if (session) formData.append('session', session);
        formData.append('subjectId', selectedSubjectId);
        formData.append('isGdrive', isGdrive);

        if (isGdrive) formData.append('gdriveLink', gdriveLink);
        else if (file) formData.append('file', file);

        try {
            if (editingId) {
                await updateMaterial(editingId, formData);
                showToast('Material updated successfully');
            } else {
                await api.post('/materials', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                showToast('Material uploaded successfully');
            }
            handleCancelForm();
            fetchMaterials();
        } catch (err) {
            showToast(err.response?.data?.message || (editingId ? 'Failed to update material' : 'Failed to upload material'), 'error');
        } finally {
            setUploadLoading(false);
        }
    };

    const handleEdit = (material) => {
        setEditingId(material._id);
        setTitle(material.title);
        setType(material.type);
        setSession(material.session || '');
        if (material.isGdrive) {
            setIsGdrive(true);
            setGdriveLink(material.gdriveLink || '');
        } else {
            setIsGdrive(false);
            setGdriveLink('');
        }
        setIsFormOpen(true);
    };

    const handleCancelForm = () => {
        setIsFormOpen(false);
        setEditingId(null);
        setTitle('');
        setSession('');
        setFile(null);
        setGdriveLink('');
        setIsGdrive(false);
    };

    const confirmDelete = async () => {
        if (!deleteModal.id) return;
        try {
            await api.delete(`/materials/${deleteModal.id}`);
            showToast('Material deleted successfully');
            setMaterials(materials.filter(m => m._id !== deleteModal.id));
            setStats(prev => ({ ...prev, total: prev.total - 1 }));
        } catch (err) {
            showToast(err.response?.data?.message || 'Failed to delete material', 'error');
        } finally {
            setDeleteModal({ show: false, id: null });
        }
    };

    // Filtered Materials
    const filteredMaterials = materials.filter(m => {
        const matchSearch = m.title.toLowerCase().includes(searchQuery.toLowerCase());
        const matchType = typeFilter === 'All' || m.type.toLowerCase() === typeFilter.toLowerCase();
        return matchSearch && matchType;
    });

    const getTypeColor = (docType) => {
        switch (docType?.toLowerCase()) {
            case 'notes': return 'bg-blue-100 text-blue-700 border-blue-200';
            case 'pyq': return 'bg-purple-100 text-purple-700 border-purple-200';
            case 'syllabus': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
            default: return 'bg-gray-100 text-gray-700 border-gray-200';
        }
    };

    return (
        <div className="max-w-7xl mx-auto pb-12">
            {/* TOAST */}
            <AnimatePresence>
                {toast.show && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className={`fixed top-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg border ${toast.type === 'error' ? 'bg-red-50 border-red-200 text-red-700' : 'bg-green-50 border-green-200 text-green-700'}`}
                    >
                        {toast.type === 'error' ? <AlertCircle size={18} /> : <CheckCircle2 size={18} />}
                        <p className="font-medium text-sm">{toast.message}</p>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* DELETE MODAL */}
            <AnimatePresence>
                {deleteModal.show && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden"
                        >
                            <div className="p-6 text-center">
                                <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Trash2 size={32} />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">Delete Material?</h3>
                                <p className="text-gray-500 text-sm">Are you sure you want to remove this file? This action cannot be undone.</p>
                            </div>
                            <div className="flex border-t border-gray-100">
                                <button onClick={() => setDeleteModal({ show: false, id: null })} className="flex-1 py-3 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors border-r border-gray-100">Cancel</button>
                                <button onClick={confirmDelete} className="flex-1 py-3 text-sm font-semibold text-red-600 hover:bg-red-50 transition-colors">Delete</button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* FORM MODAL (Side drawer style mapping to the right) or Centered */}
            <AnimatePresence>
                {isFormOpen && (
                    <div className="fixed inset-0 z-40 bg-gray-900/50 backdrop-blur-sm flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 20 }}
                            className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]"
                        >
                            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                                <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                                    <Upload size={18} className="text-blue-600" />
                                    {editingId ? 'Edit Material' : 'Upload New Material'}
                                </h3>
                                <button onClick={handleCancelForm} className="text-gray-400 hover:text-gray-600">&times;</button>
                            </div>

                            <div className="p-6 overflow-y-auto">
                                <form id="material-form" onSubmit={handleUpload} className="space-y-5">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                                        <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Unit 1 Handwritten Notes" className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" required />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                                        <select value={type} onChange={e => setType(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-white" >
                                            <option value="notes">Notes</option>
                                            <option value="pyq">PYQ</option>
                                            <option value="syllabus">Syllabus</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Academic Session (Optional)</label>
                                        <select value={session} onChange={e => setSession(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-white" >
                                            <option value="">Select Session</option>
                                            {Array.from({ length: 10 }).map((_, i) => {
                                                const year = new Date().getFullYear() - i;
                                                const sessStr = `${year}-${(year + 1).toString().slice(-2)}`;
                                                return <option key={sessStr} value={sessStr}>{sessStr}</option>;
                                            })}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Source Type</label>
                                        <div className="grid grid-cols-2 gap-3">
                                            <label className={`flex items-center justify-center gap-2 p-3 rounded-xl border cursor-pointer transition-all ${!isGdrive ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
                                                <input type="radio" checked={!isGdrive} onChange={() => setIsGdrive(false)} className="sr-only" />
                                                <HardDrive size={18} /> Local File
                                            </label>
                                            <label className={`flex items-center justify-center gap-2 p-3 rounded-xl border cursor-pointer transition-all ${isGdrive ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
                                                <input type="radio" checked={isGdrive} onChange={() => setIsGdrive(true)} className="sr-only" />
                                                <Cloud size={18} /> Google Drive
                                            </label>
                                        </div>
                                    </div>

                                    <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                                        {isGdrive ? (
                                            <div>
                                                <label className="block text-sm font-bold text-gray-700 mb-1">Google Drive Link</label>
                                                <input type="url" value={gdriveLink} onChange={e => setGdriveLink(e.target.value)} placeholder="https://drive.google.com/file/d/.../view" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white" required={isGdrive} />
                                                <p className="text-xs text-gray-500 mt-2 flex items-center gap-1"><AlertCircle size={12} /> Needs "Anyone with the link" access.</p>
                                            </div>
                                        ) : (
                                            <div>
                                                <label className="block text-sm font-bold text-gray-700 mb-1">Upload PDF File {editingId && '(Optional to replace)'}</label>
                                                <input type="file" accept=".pdf" onChange={e => setFile(e.target.files[0])} className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 transition-all cursor-pointer" required={!isGdrive && !editingId} />
                                            </div>
                                        )}
                                    </div>

                                </form>
                            </div>
                            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
                                <Button type="button" variant="outline" onClick={handleCancelForm} className="px-6 rounded-xl">Cancel</Button>
                                <Button type="submit" form="material-form" variant="primary" disabled={uploadLoading || !selectedSubjectId} className="px-6 rounded-xl">
                                    {uploadLoading ? 'Saving...' : (editingId ? 'Save Changes' : 'Upload Material')}
                                </Button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* 1. HEADER SECTION */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2 text-sm text-gray-500 mb-2 font-medium">
                        <span>Dashboard</span> <ChevronRight size={14} /> <span className="text-blue-600">Materials</span>
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Manage Study Materials</h1>
                    <p className="text-gray-500 mt-1">Upload, edit and manage PDFs for Notes, PYQs and Syllabus.</p>
                </div>
                <Button onClick={() => setIsFormOpen(true)} variant="primary" className="py-2.5 px-6 rounded-xl shadow-md hover:shadow-lg transition-all" disabled={!selectedSubjectId}>
                    <Upload size={18} className="mr-2" /> Upload Material
                </Button>
            </div>

            {/* 2. STATS ROW */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
                    <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                        <FileText size={24} />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-500">Subject Materials</p>
                        <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                    </div>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
                    <div className="w-12 h-12 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600">
                        <BookOpen size={24} />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-500">Total Subjects</p>
                        <p className="text-2xl font-bold text-gray-900">{stats.subjects}</p>
                    </div>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
                    <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600">
                        <Clock size={24} />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-500">Recent Uploads</p>
                        <p className="text-2xl font-bold text-gray-900">{stats.recent}</p>
                    </div>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
                    <div className="w-12 h-12 rounded-full bg-orange-50 flex items-center justify-center text-orange-600">
                        <HardDrive size={24} />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-500">Storage Used</p>
                        <p className="text-2xl font-bold text-gray-900">~15 MB</p> {/* Placeholder */}
                    </div>
                </div>
            </div>

            {/* 3. SMART FILTER BAR */}
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 mb-6 flex flex-wrap lg:flex-nowrap gap-4 items-center">
                <div className="w-full lg:w-1/4">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1 ml-1">Course</p>
                    <select value={selectedCourseId} onChange={e => setSelectedCourseId(e.target.value)} className="w-full px-4 py-2 border border-gray-200 bg-gray-50 rounded-xl text-sm font-medium text-gray-700 outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all appearance-none cursor-pointer">
                        {courses.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                    </select>
                </div>
                <ChevronRight size={16} className="text-gray-300 hidden lg:block mt-4" />
                <div className="w-full lg:w-1/4">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1 ml-1">Branch</p>
                    <select value={selectedBranchId} onChange={e => setSelectedBranchId(e.target.value)} disabled={!branches.length} className="w-full px-4 py-2 border border-gray-200 bg-gray-50 rounded-xl text-sm font-medium text-gray-700 outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all appearance-none cursor-pointer disabled:opacity-50">
                        <option value="">{branches.length ? 'Select Branch' : 'No Branches'}</option>
                        {branches.map(b => <option key={b._id} value={b._id}>{b.name}</option>)}
                    </select>
                </div>
                <ChevronRight size={16} className="text-gray-300 hidden lg:block mt-4" />
                <div className="w-full lg:w-1/4">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1 ml-1">Academic Year</p>
                    <select value={selectedYearId} onChange={e => setSelectedYearId(e.target.value)} disabled={!years.length} className="w-full px-4 py-2 border border-gray-200 bg-gray-50 rounded-xl text-sm font-medium text-gray-700 outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all appearance-none cursor-pointer disabled:opacity-50">
                        <option value="">{years.length ? 'Select Year' : 'No Years'}</option>
                        {years.map(y => <option key={y._id} value={y._id}>Year {y.yearNumber}</option>)}
                    </select>
                </div>
                <ChevronRight size={16} className="text-gray-300 hidden lg:block mt-4" />
                <div className="w-full lg:w-1/4">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1 ml-1">Subject</p>
                    <select value={selectedSubjectId} onChange={e => setSelectedSubjectId(e.target.value)} disabled={!subjects.length} className="w-full px-4 py-2 border border-blue-200 bg-blue-50/50 rounded-xl text-sm font-bold text-blue-700 outline-none focus:ring-2 focus:ring-blue-500 focus:bg-blue-50 transition-all appearance-none cursor-pointer disabled:opacity-50 disabled:border-gray-200 disabled:bg-gray-50 disabled:text-gray-500">
                        <option value="">{subjects.length ? 'Select Subject' : 'No Subjects'}</option>
                        {subjects.map(s => <option key={s._id} value={s._id}>{s.code} - {s.name}</option>)}
                    </select>
                </div>
            </div>

            {/* 4. SEARCH + TYPE FILTER ROW */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
                <div className="relative w-full md:w-96">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                        <Search size={18} />
                    </div>
                    <input
                        type="text"
                        placeholder="Search by file name..."
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        className="pl-10 pr-4 py-2.5 w-full bg-white border border-gray-200 rounded-xl shadow-sm text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    />
                </div>

                <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 w-full md:w-auto">
                    {['All', 'Notes', 'PYQ', 'Syllabus'].map((type) => (
                        <button
                            key={type}
                            onClick={() => setTypeFilter(type)}
                            className={`px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-all ${typeFilter === type ? 'bg-blue-600 text-white shadow-md' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}`}
                        >
                            {type}
                        </button>
                    ))}

                    {/* View Toggle */}
                    <div className="ml-auto md:ml-4 flex bg-white border border-gray-200 rounded-xl p-1 shadow-sm shrink-0">
                        <button onClick={() => setViewMode('table')} className={`p-1.5 rounded-lg transition-colors ${viewMode === 'table' ? 'bg-gray-100 text-gray-900' : 'text-gray-400 hover:text-gray-600'}`}>
                            <ListIcon size={18} />
                        </button>
                        <button onClick={() => setViewMode('card')} className={`p-1.5 rounded-lg transition-colors ${viewMode === 'card' ? 'bg-gray-100 text-gray-900' : 'text-gray-400 hover:text-gray-600'}`}>
                            <LayoutGrid size={18} />
                        </button>
                    </div>
                </div>
            </div>

            {/* 5 & 6. HYBRID MATERIAL DISPLAY + EMPTY STATES */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden min-h-[400px]">
                {loading ? (
                    <div className="flex flex-col items-center justify-center h-[400px] text-gray-400">
                        <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
                        <p className="font-medium text-sm">Loading materials...</p>
                    </div>
                ) : !selectedSubjectId ? (
                    <div className="flex flex-col items-center justify-center h-[400px] text-gray-400 p-6 text-center">
                        <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-6">
                            <Layers size={48} className="text-gray-300" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-800 mb-2">No Subject Selected</h3>
                        <p className="max-w-md">Please use the filter bar above to select a Course, Branch, Year, and Subject to view and manage its materials.</p>
                    </div>
                ) : materials.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-[400px] text-gray-400 p-6 text-center">
                        <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center mb-6">
                            <Cloud size={48} className="text-blue-200" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-800 mb-2">No Materials Uploaded Yet</h3>
                        <p className="max-w-sm mb-6">This subject currently has no PDF documents. You can add notes, syllabus, or past papers.</p>
                        <Button variant="primary" onClick={() => setIsFormOpen(true)} className="px-6 rounded-xl"><Plus size={18} className="mr-2" /> Upload First Material</Button>
                    </div>
                ) : filteredMaterials.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-[400px] text-gray-400 p-6 text-center">
                        <SearchX size={48} className="text-gray-300 mb-4" />
                        <h3 className="text-lg font-bold text-gray-800 mb-1">No Matches Found</h3>
                        <p>Try adjusting your search or type filter.</p>
                    </div>
                ) : (
                    <>
                        <AnimatePresence mode="wait">
                            {viewMode === 'table' ? (
                                <motion.div key="table-view" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="bg-gray-50/80 border-b border-gray-100 text-xs uppercase tracking-wider text-gray-500 font-bold">
                                                <th className="px-6 py-4">File Name</th>
                                                <th className="px-6 py-4">Type</th>
                                                <th className="px-6 py-4">Source</th>
                                                <th className="px-6 py-4">Uploaded Date</th>
                                                <th className="px-6 py-4 text-right">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {filteredMaterials.map((m) => (
                                                <tr key={m._id} className="hover:bg-blue-50/30 transition-colors group">
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-8 h-8 rounded bg-red-50 text-red-500 flex items-center justify-center shrink-0">
                                                                <File size={16} />
                                                            </div>
                                                            <p className="font-semibold text-gray-900 text-sm max-w-[250px] truncate" title={m.title}>{m.title}</p>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border ${getTypeColor(m.type)}`}>
                                                            {m.type}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className="text-xs font-medium text-gray-500 flex items-center gap-1">
                                                            {m.isGdrive ? <><Cloud size={14} /> GDrive</> : <><HardDrive size={14} /> Local</>}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-sm text-gray-500 font-medium">
                                                        {formatDate(m.createdAt)}
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <button 
                                                                onClick={() => {
                                                                    const proxyUrl = `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/materials/${m._id}/proxy?action=view`;
                                                                    window.open(proxyUrl, '_blank');
                                                                }} 
                                                                className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="View/Download"
                                                            >
                                                                <FileDown size={18} />
                                                            </button>
                                                            <button onClick={() => handleEdit(m)} className="p-2 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors" title="Edit">
                                                                <Edit size={18} />
                                                            </button>
                                                            <button onClick={() => setDeleteModal({ show: true, id: m._id })} className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Delete">
                                                                <Trash2 size={18} />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </motion.div>
                            ) : (
                                <motion.div key="card-view" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="p-6">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {filteredMaterials.map(m => (
                                            <div key={m._id} className="bg-white border border-gray-200 rounded-2xl p-5 hover:border-blue-300 hover:shadow-lg transition-all flex flex-col group relative overflow-hidden">
                                                {/* Decorative top bar based on type */}
                                                <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${m.type === 'notes' ? 'from-blue-400 to-blue-600' : m.type === 'pyq' ? 'from-purple-400 to-purple-600' : 'from-emerald-400 to-emerald-600'}`}></div>

                                                <div className="flex justify-between items-start mb-4">
                                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border ${getTypeColor(m.type)}`}>
                                                        <FileText size={24} />
                                                    </div>
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border ${getTypeColor(m.type)}`}>
                                                        {m.type}
                                                    </span>
                                                </div>

                                                <div className="mb-6 flex-1">
                                                    <h4 className="font-bold text-gray-900 leading-tight mb-2 line-clamp-2" title={m.title}>{m.title}</h4>
                                                    <div className="flex items-center gap-4 text-xs font-semibold text-gray-400 mt-auto">
                                                        <span className="flex items-center gap-1"><Clock size={12} /> {formatDate(m.createdAt)}</span>
                                                        <span className="flex items-center gap-1">{m.isGdrive ? <><Cloud size={12} /> GDrive</> : <><HardDrive size={12} /> Local</>}</span>
                                                    </div>
                                                </div>

                                                <div className="pt-4 border-t border-gray-100 flex items-center justify-between mt-auto">
                                                    <button 
                                                        onClick={() => {
                                                            const proxyUrl = `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/materials/${m._id}/proxy?action=view`;
                                                            window.open(proxyUrl, '_blank');
                                                        }} 
                                                        className="text-sm font-semibold text-gray-600 hover:text-blue-600 flex items-center gap-1 transition-colors"
                                                    >
                                                        <FileDown size={16} /> Preview
                                                    </button>
                                                    <div className="flex items-center gap-1">
                                                        <button onClick={() => handleEdit(m)} className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"><Edit size={16} /></button>
                                                        <button onClick={() => setDeleteModal({ show: true, id: m._id })} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={16} /></button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Pagination placeholder if needed later */}
                        {filteredMaterials.length > 0 && viewMode === 'table' && (
                            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex items-center justify-between">
                                <span className="text-sm text-gray-500 font-medium">Showing <span className="text-gray-900 font-bold">{filteredMaterials.length}</span> items</span>
                            </div>
                        )}
                    </>
                )}
            </div>

        </div>
    );
};

export default MaterialsAdmin;
