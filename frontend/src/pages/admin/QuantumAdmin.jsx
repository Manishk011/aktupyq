import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api, { getCourses, getBranches, getYears, getSubjects } from '../../services/api';
import Button from '../../components/ui/Button';
import { Send, Save, HardDrive, Cloud, FileText, Plus, Trash2, Edit, ChevronRight, FileDown, Layers, SearchX } from 'lucide-react';

const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
};

const QuantumAdmin = () => {
    // Selectors state
    const [courses, setCourses] = useState([]);
    const [selectedCourseId, setSelectedCourseId] = useState('');
    const [branches, setBranches] = useState([]);
    const [selectedBranchId, setSelectedBranchId] = useState('');
    const [years, setYears] = useState([]);
    const [selectedYearId, setSelectedYearId] = useState('');
    const [subjects, setSubjects] = useState([]);
    const [selectedSubjectId, setSelectedSubjectId] = useState('');

    // Quantums state
    const [quantums, setQuantums] = useState([]);
    const [loading, setLoading] = useState(false);

    // Form state
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [actionLoading, setActionLoading] = useState(false);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');

    // Link/File state
    const [type, setType] = useState('link'); // 'link' | 'file'
    const [session, setSession] = useState('');
    const [telegramLink, setTelegramLink] = useState('');
    const [isGdrive, setIsGdrive] = useState(false);
    const [gdriveLink, setGdriveLink] = useState('');
    const [file, setFile] = useState(null);
    const [existingFile, setExistingFile] = useState(false);

    // Initial Load
    useEffect(() => {
        getCourses().then(data => {
            setCourses(data);
            if (data.length > 0) setSelectedCourseId(data[0]._id);
        }).catch(() => setError('Failed to load courses'));
    }, []);

    // Load hierarchies
    useEffect(() => {
        if (!selectedCourseId) return;
        getBranches(selectedCourseId).then(data => {
            setBranches(data);
            if (data.length > 0) setSelectedBranchId(data[0]._id);
            else { setSelectedBranchId(''); setYears([]); setSubjects([]); setQuantums([]); }
        });
    }, [selectedCourseId]);

    useEffect(() => {
        if (!selectedBranchId) return;
        getYears(selectedBranchId).then(data => {
            setYears(data);
            if (data.length > 0) setSelectedYearId(data[0]._id);
            else { setSelectedYearId(''); setSubjects([]); setQuantums([]); }
        });
    }, [selectedBranchId]);

    useEffect(() => {
        if (!selectedYearId) return;
        getSubjects(selectedYearId).then(data => {
            setSubjects(data);
            if (data.length > 0) setSelectedSubjectId(data[0]._id);
            else { setSelectedSubjectId(''); setQuantums([]); }
        });
    }, [selectedYearId]);

    // Fetch existing quantums for subject
    useEffect(() => {
        if (!selectedSubjectId) {
            setQuantums([]);
            return;
        }
        fetchQuantums();
    }, [selectedSubjectId]);

    const fetchQuantums = async () => {
        setLoading(true);
        try {
            const res = await api.get(`/quantum/subject/${selectedSubjectId}`);
            setQuantums(res.data.materials || []);
        } catch (err) {
            setError('Failed to fetch quantums');
            setQuantums([]);
        } finally {
            setLoading(false);
        }
    };

    const resetFormState = () => {
        setType('link');
        setSession('');
        setTelegramLink('');
        setIsGdrive(false);
        setGdriveLink('');
        setFile(null);
        setExistingFile(false);
        setEditingId(null);
        setIsFormOpen(false);
    };

    const handleEdit = (q) => {
        setEditingId(q._id);
        setType(q.type || 'link');
        setSession(q.session || '');
        setTelegramLink(q.telegramLink || '');
        setIsGdrive(q.isGdrive || false);
        setGdriveLink(q.gdriveLink || '');
        if (q.type === 'file' && !q.isGdrive && q.fileUrl) {
            setExistingFile(true);
        } else {
            setExistingFile(false);
        }
        setIsFormOpen(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this Quantum resource?")) return;
        try {
            await api.delete(`/quantum/${id}`);
            setMessage('Quantum deleted successfully');
            fetchQuantums();
            setTimeout(() => setMessage(''), 3000);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to delete quantum');
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        if (!selectedSubjectId) return;

        if (type === 'link' && !telegramLink.trim()) {
            return setError('Please provide a Telegram link');
        }

        if (type === 'file') {
            if (isGdrive && !gdriveLink.trim()) {
                return setError('Please provide a GDrive link');
            }
            if (!isGdrive && !file && !existingFile) {
                return setError('Please select a file to upload');
            }
        }

        setActionLoading(true);
        setError('');
        setMessage('');

        try {
            const formData = new FormData();
            formData.append('branchId', selectedBranchId);
            formData.append('yearId', selectedYearId);
            formData.append('subjectId', selectedSubjectId);
            if (session) formData.append('session', session);
            formData.append('type', type);
            if (editingId) formData.append('id', editingId);

            if (type === 'link') {
                formData.append('telegramLink', telegramLink);
            } else {
                formData.append('isGdrive', isGdrive);
                if (isGdrive) {
                    formData.append('gdriveLink', gdriveLink);
                } else if (file) {
                    formData.append('file', file);
                }
            }

            await api.post('/quantum', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setMessage(editingId ? 'Quantum resource updated successfully!' : 'Quantum resource saved successfully!');
            fetchQuantums();
            resetFormState();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to save Quantum resource');
        } finally {
            setActionLoading(false);
            setTimeout(() => setMessage(''), 3000);
        }
    };

    return (
        <div className="max-w-7xl mx-auto pb-12">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2 text-sm text-gray-500 mb-2 font-medium">
                        <span>Dashboard</span> <ChevronRight size={14} /> <span className="text-blue-600">Quantum</span>
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Manage Quantum Links/Files</h1>
                </div>
                <Button onClick={() => { resetFormState(); setIsFormOpen(true); }} variant="primary" className="py-2.5 px-6 rounded-xl shadow-md transition-all" disabled={!selectedSubjectId}>
                    <Plus size={18} className="mr-2" /> Add Quantum
                </Button>
            </div>

            {error && <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-md text-sm border border-red-200">{error}</div>}
            {message && <div className="mb-4 p-3 bg-green-50 text-green-700 rounded-md text-sm border border-green-200">{message}</div>}

            {/* Smart Filter Bar */}
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 mb-6 flex flex-wrap lg:flex-nowrap gap-4 items-center">
                <div className="w-full lg:w-1/4">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1 ml-1">Course</p>
                    <select value={selectedCourseId} onChange={e => setSelectedCourseId(e.target.value)} className="w-full px-4 py-2 border border-gray-200 bg-gray-50 rounded-xl text-sm font-medium text-gray-700 outline-none">
                        {courses.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                    </select>
                </div>
                <div className="w-full lg:w-1/4">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1 ml-1">Branch</p>
                    <select value={selectedBranchId} onChange={e => setSelectedBranchId(e.target.value)} disabled={!branches.length} className="w-full px-4 py-2 border border-gray-200 bg-gray-50 rounded-xl text-sm font-medium text-gray-700 outline-none disabled:opacity-50">
                        <option value="">{branches.length ? 'Select Branch' : 'No Branches'}</option>
                        {branches.map(b => <option key={b._id} value={b._id}>{b.name}</option>)}
                    </select>
                </div>
                <div className="w-full lg:w-1/4">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1 ml-1">Academic Year</p>
                    <select value={selectedYearId} onChange={e => setSelectedYearId(e.target.value)} disabled={!years.length} className="w-full px-4 py-2 border border-gray-200 bg-gray-50 rounded-xl text-sm font-medium text-gray-700 outline-none disabled:opacity-50">
                        <option value="">{years.length ? 'Select Year' : 'No Years'}</option>
                        {years.map(y => <option key={y._id} value={y._id}>Year {y.yearNumber}</option>)}
                    </select>
                </div>
                <div className="w-full lg:w-1/4">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1 ml-1">Subject</p>
                    <select value={selectedSubjectId} onChange={e => setSelectedSubjectId(e.target.value)} disabled={!subjects.length} className="w-full px-4 py-2 border border-blue-200 bg-blue-50/50 rounded-xl text-sm font-bold text-blue-700 outline-none disabled:opacity-50">
                        <option value="">{subjects.length ? 'Select Subject' : 'No Subjects'}</option>
                        {subjects.map(s => <option key={s._id} value={s._id}>{s.code} - {s.name}</option>)}
                    </select>
                </div>
            </div>

            {/* Form Modal */}
            <AnimatePresence>
                {isFormOpen && (
                    <div className="fixed inset-0 z-50 bg-gray-900/50 flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white rounded-2xl shadow-xl w-full max-w-xl overflow-hidden max-h-[90vh] flex flex-col">
                            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                                <h3 className="text-xl font-bold">{editingId ? 'Edit Quantum' : 'Add Quantum'}</h3>
                                <button onClick={resetFormState} className="text-gray-400 hover:text-gray-600">&times;</button>
                            </div>
                            <div className="p-6 overflow-y-auto">
                                <form id="quantum-form" onSubmit={handleSave} className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Session</label>
                                        <select value={session} onChange={e => setSession(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 outline-none" required>
                                            <option value="">Select Session</option>
                                            {Array.from({ length: 10 }).map((_, i) => {
                                                const year = new Date().getFullYear() - i;
                                                const sessStr = `${year}-${(year + 1).toString().slice(-2)}`;
                                                return <option key={sessStr} value={sessStr}>{sessStr}</option>;
                                            })}
                                        </select>
                                    </div>

                                    <div className="flex gap-4 mb-2">
                                        <label className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-xl border cursor-pointer transition-all ${type === 'link' ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
                                            <input type="radio" checked={type === 'link'} onChange={() => setType('link')} className="sr-only" />
                                            <Send size={18} /> Telegram Link
                                        </label>
                                        <label className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-xl border cursor-pointer transition-all ${type === 'file' ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
                                            <input type="radio" checked={type === 'file'} onChange={() => setType('file')} className="sr-only" />
                                            <FileText size={18} /> Upload File
                                        </label>
                                    </div>

                                    {type === 'link' ? (
                                        <div className="flex items-center gap-3">
                                            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center shrink-0"><Send size={24} /></div>
                                            <div className="flex-1">
                                                <label className="block text-sm font-medium text-gray-900 mb-1">Telegram Link</label>
                                                <input type="url" value={telegramLink} onChange={(e) => setTelegramLink(e.target.value)} placeholder="https://t.me/your_channel" className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none" required={type === 'link'} />
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
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
                                                        <input type="url" value={gdriveLink} onChange={e => setGdriveLink(e.target.value)} placeholder="https://drive.google.com..." className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none bg-white" required={type === 'file' && isGdrive} />
                                                    </div>
                                                ) : (
                                                    <div>
                                                        <label className="block text-sm font-bold text-gray-700 mb-1">Upload PDF File {editingId && existingFile && '(Optional to replace)'}</label>
                                                        <input type="file" accept=".pdf" onChange={e => setFile(e.target.files[0])} className="w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:bg-blue-50 file:text-blue-700 cursor-pointer" required={type === 'file' && !isGdrive && !existingFile} />
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </form>
                            </div>
                            <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
                                <Button type="button" variant="outline" onClick={resetFormState}>Cancel</Button>
                                <Button type="submit" form="quantum-form" variant="primary" disabled={actionLoading}>
                                    {actionLoading ? 'Saving...' : <><Save size={18} className="mr-2" /> Save Quantum</>}
                                </Button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* List View */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden min-h-[400px]">
                {loading ? (
                    <div className="flex flex-col items-center justify-center h-[400px] text-gray-400">
                        <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
                        <p>Loading quantums...</p>
                    </div>
                ) : !selectedSubjectId ? (
                    <div className="flex flex-col items-center justify-center h-[400px] text-gray-400 p-6 text-center">
                        <Layers size={48} className="text-gray-300 mb-4" />
                        <h3 className="text-xl font-bold text-gray-800 mb-2">No Subject Selected</h3>
                    </div>
                ) : quantums.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-[400px] text-gray-400 p-6 text-center">
                        <SearchX size={48} className="text-gray-300 mb-4" />
                        <h3 className="text-xl font-bold text-gray-800 mb-2">No Quantums Found</h3>
                        <Button variant="primary" onClick={() => setIsFormOpen(true)} className="px-6 mt-4"><Plus size={18} className="mr-2" /> Add Quantum</Button>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50/80 border-b border-gray-100 text-xs uppercase text-gray-500 font-bold">
                                    <th className="px-6 py-4">Session</th>
                                    <th className="px-6 py-4">Subject</th>
                                    <th className="px-6 py-4">Type</th>
                                    <th className="px-6 py-4">Added</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {quantums.map((q) => (
                                    <tr key={q._id} className="hover:bg-indigo-50/30 transition-colors">
                                        <td className="px-6 py-4 font-semibold text-gray-900">{q.session || 'N/A'}</td>
                                        <td className="px-6 py-4 text-sm text-gray-500">{q.subjectId?.name} ({q.subjectId?.code})</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border ${q.type === 'link' ? 'bg-blue-100 text-blue-700' : 'bg-emerald-100 text-emerald-700'}`}>
                                                {q.type}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500">{formatDate(q.createdAt)}</td>
                                        <td className="px-6 py-4 text-right flex justify-end gap-2">
                                            {q.type === 'file' ? (
                                                <button onClick={() => window.open(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/quantum/${q._id}/proxy?action=view`, '_blank')} className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg">
                                                    <FileDown size={18} />
                                                </button>
                                            ) : (
                                                <button onClick={() => window.open(q.telegramLink, '_blank')} className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg">
                                                    <Send size={18} />
                                                </button>
                                            )}
                                            <button onClick={() => handleEdit(q)} className="p-2 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg">
                                                <Edit size={18} />
                                            </button>
                                            <button onClick={() => handleDelete(q._id)} className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg">
                                                <Trash2 size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default QuantumAdmin;
