import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api, { getCourses, getBranches, getYears, getSubjects, deleteCourse, deleteBranch, deleteYear, deleteSubject } from '../../services/api';
import Button from '../../components/ui/Button';
import { Plus, Trash2, Folder, Layers, Calendar, BookOpen, AlertCircle, ChevronRight, Edit2 } from 'lucide-react';

const StructureItem = ({ icon: Icon, title, subtitle, onDelete, onClick, isActive, colorClass }) => (
    <div
        onClick={onClick}
        className={`flex items-center justify-between p-4 bg-white border rounded-xl shadow-sm hover:shadow-md transition-all cursor-pointer ${isActive ? 'ring-2 ring-primary border-transparent' : 'border-gray-100 hover:border-gray-300'}`}
    >
        <div className="flex items-center gap-4">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${isActive ? 'bg-primary text-white' : colorClass}`}>
                <Icon size={20} />
            </div>
            <div>
                <p className={`font-semibold ${isActive ? 'text-primary' : 'text-gray-800'}`}>{title}</p>
                {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
            </div>
        </div>
        <div className="flex items-center gap-2">
            <button
                onClick={(e) => { e.stopPropagation(); onDelete(e); }}
                className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title="Delete"
            >
                <Trash2 size={18} />
            </button>
            {!isActive && <ChevronRight size={20} className="text-gray-400" />}
        </div>
    </div>
);

const CurriculumAdmin = () => {
    // State: Selection & Data
    const [courses, setCourses] = useState([]);
    const [selectedCourseId, setSelectedCourseId] = useState('');

    const [branches, setBranches] = useState([]);
    const [selectedBranchId, setSelectedBranchId] = useState('');

    const [years, setYears] = useState([]);
    const [selectedYearId, setSelectedYearId] = useState('');

    const [subjects, setSubjects] = useState([]);

    // State: UI & Messages
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');

    // State: Forms
    const [newCourseName, setNewCourseName] = useState('');
    const [newBranchName, setNewBranchName] = useState('');
    const [newYearNumber, setNewYearNumber] = useState('');
    const [newSubjectName, setNewSubjectName] = useState('');
    const [newSubjectCode, setNewSubjectCode] = useState('');

    // Initial Load & Cascading Fetches
    const fetchCourses = async () => {
        try {
            const data = await getCourses();
            setCourses(data);
        } catch (err) { setError('Failed to load courses'); }
    };

    const fetchBranches = async (cId) => {
        if (!cId) { setBranches([]); return; }
        try {
            const data = await getBranches(cId);
            setBranches(data);
        } catch (err) { setError('Failed to load branches'); }
    };

    const fetchYears = async (bId) => {
        if (!bId) { setYears([]); return; }
        try {
            const data = await getYears(bId);
            setYears(data);
        } catch (err) { setError('Failed to load years'); }
    };

    const fetchSubjects = async (yId) => {
        if (!yId) { setSubjects([]); return; }
        try {
            const data = await getSubjects(yId);
            setSubjects(data);
        } catch (err) { setError('Failed to load subjects'); }
    };

    // Effects for cascading
    useEffect(() => { fetchCourses(); }, []);
    useEffect(() => {
        fetchBranches(selectedCourseId);
        setSelectedBranchId(''); // reset downstream
    }, [selectedCourseId]);
    useEffect(() => {
        fetchYears(selectedBranchId);
        setSelectedYearId(''); // reset downstream
    }, [selectedBranchId]);
    useEffect(() => {
        fetchSubjects(selectedYearId);
    }, [selectedYearId]);

    // Handlers: Creators
    const handleAddCourse = async (e) => {
        e.preventDefault();
        setError(''); setMessage('');
        try {
            const res = await api.post('/courses', { name: newCourseName });
            setNewCourseName('');
            setMessage('Course created');
            fetchCourses();
            setSelectedCourseId(res.data._id);
        } catch (err) { setError(err.response?.data?.message || 'Error'); }
    };

    const handleAddBranch = async (e) => {
        e.preventDefault();
        if (!selectedCourseId) return setError("Select a course first");
        setError(''); setMessage('');
        try {
            const res = await api.post('/branches', { name: newBranchName, courseId: selectedCourseId });
            setNewBranchName('');
            setMessage('Branch created');
            fetchBranches(selectedCourseId);
            setSelectedBranchId(res.data._id);
        } catch (err) { setError(err.response?.data?.message || 'Error'); }
    };

    const handleAddYear = async (e) => {
        e.preventDefault();
        if (!selectedBranchId) return setError("Select a branch first");
        setError(''); setMessage('');
        try {
            const res = await api.post('/years', { yearNumber: Number(newYearNumber), branchId: selectedBranchId });
            setNewYearNumber('');
            setMessage('Year created');
            fetchYears(selectedBranchId);
            setSelectedYearId(res.data._id);
        } catch (err) { setError(err.response?.data?.message || 'Error'); }
    };

    const handleAddSubject = async (e) => {
        e.preventDefault();
        if (!selectedYearId || !newSubjectName || !newSubjectCode) return setError("Fill all fields");
        setError(''); setMessage('');
        try {
            await api.post('/subjects', { name: newSubjectName, code: newSubjectCode, yearId: selectedYearId });
            setNewSubjectName('');
            setNewSubjectCode('');
            setMessage('Subject created');
            fetchSubjects(selectedYearId);
        } catch (err) { setError(err.response?.data?.message || 'Error'); }
    };

    // Handlers: Deleters
    const confirmDelete = () => window.confirm('Are you sure you want to delete this?');

    const handleDeleteCourse = async (id) => {
        if (!confirmDelete()) return;
        try {
            await deleteCourse(id);
            setMessage('Deleted course');
            if (selectedCourseId === id) setSelectedCourseId('');
            fetchCourses();
        } catch (err) { setError(err.response?.data?.message || 'Error'); }
    };

    const handleDeleteBranch = async (id) => {
        if (!confirmDelete()) return;
        try {
            await deleteBranch(id);
            setMessage('Deleted branch');
            if (selectedBranchId === id) setSelectedBranchId('');
            fetchBranches(selectedCourseId);
        } catch (err) { setError(err.response?.data?.message || 'Error'); }
    };

    const handleDeleteYear = async (id) => {
        if (!confirmDelete()) return;
        try {
            await deleteYear(id);
            setMessage('Deleted year');
            if (selectedYearId === id) setSelectedYearId('');
            fetchYears(selectedBranchId);
        } catch (err) { setError(err.response?.data?.message || 'Error'); }
    };

    const handleDeleteSubject = async (id) => {
        if (!confirmDelete()) return;
        try {
            await deleteSubject(id);
            setMessage('Deleted subject');
            fetchSubjects(selectedYearId);
        } catch (err) { setError(err.response?.data?.message || 'Error'); }
    };

    // Selectors
    const activeCourse = courses.find(c => c._id === selectedCourseId);
    const activeBranch = branches.find(b => b._id === selectedBranchId);
    const activeYear = years.find(y => y._id === selectedYearId);

    // Animation Variants
    const containerVariants = {
        hidden: { opacity: 0, height: 0, marginBottom: 0 },
        visible: { opacity: 1, height: 'auto', marginBottom: 24, transition: { duration: 0.4, ease: "easeOut" } },
        exit: { opacity: 0, height: 0, marginBottom: 0, transition: { duration: 0.3, ease: "easeIn" } }
    };

    return (
        <div className="max-w-4xl mx-auto pb-20">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Curriculum Management</h1>
                <p className="text-gray-500 mt-2">Manage the academic hierarchy: Courses &gt; Branches &gt; Years &gt; Subjects.</p>
            </div>

            {error && <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl text-sm border border-red-200 flex items-center gap-3 shadow-sm"><AlertCircle size={18} />{error}</div>}
            {message && <div className="mb-6 p-4 bg-green-50 text-green-700 rounded-xl text-sm border border-green-200 shadow-sm">{message}</div>}

            {/* STEP 1: COURSES */}
            <motion.div layout className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden mb-6">
                <div className="p-6 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-gray-800 flex items-center gap-3">
                        <span className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-600 text-sm">1</span>
                        {selectedCourseId ? 'Selected Course' : 'Select a Course'}
                    </h2>
                    {selectedCourseId && (
                        <Button variant="outline" size="sm" onClick={() => setSelectedCourseId('')}>
                            Change Course
                        </Button>
                    )}
                </div>

                <AnimatePresence mode="wait">
                    {!selectedCourseId ? (
                        <motion.div
                            key="course-list"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0, height: 0 }}
                            className="p-6"
                        >
                            <form onSubmit={handleAddCourse} className="mb-6 flex gap-3">
                                <input type="text" value={newCourseName} onChange={e => setNewCourseName(e.target.value)} placeholder="Add new course (e.g. B.Tech)..." className="flex-1 px-4 py-3 border border-gray-300 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500 transition-all" required />
                                <Button type="submit" variant="primary" className="px-6 rounded-xl"><Plus size={18} className="mr-2" /> Add Course</Button>
                            </form>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {courses.length === 0 && <p className="text-gray-400 col-span-full py-4 text-center">No courses found. Add one above.</p>}
                                {courses.map(c => (
                                    <StructureItem
                                        key={c._id}
                                        icon={Folder}
                                        title={c.name}
                                        colorClass="bg-blue-50 text-blue-600"
                                        onClick={() => setSelectedCourseId(c._id)}
                                        onDelete={(e) => handleDeleteCourse(c._id)}
                                    />
                                ))}
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="course-selected"
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="p-6 flex items-center gap-4"
                        >
                            <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
                                <Folder size={24} />
                            </div>
                            <div>
                                <p className="text-sm tracking-wide text-gray-500 uppercase font-semibold">Active Course</p>
                                <p className="text-2xl font-bold text-gray-900">{activeCourse?.name}</p>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>

            {/* STEP 2: BRANCHES */}
            <AnimatePresence>
                {selectedCourseId && (
                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        exit="hidden"
                        className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden"
                    >
                        <div className="p-6 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-3">
                                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 text-sm">2</span>
                                {selectedBranchId ? 'Selected Branch' : 'Select a Branch'}
                            </h2>
                            {selectedBranchId && (
                                <Button variant="outline" size="sm" onClick={() => setSelectedBranchId('')}>
                                    Change Branch
                                </Button>
                            )}
                        </div>

                        <AnimatePresence mode="wait">
                            {!selectedBranchId ? (
                                <motion.div
                                    key="branch-list"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="p-6"
                                >
                                    <form onSubmit={handleAddBranch} className="mb-6 flex gap-3">
                                        <input type="text" value={newBranchName} onChange={e => setNewBranchName(e.target.value)} placeholder="Add new branch (e.g. Computer Science)..." className="flex-1 px-4 py-3 border border-gray-300 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500 transition-all" required />
                                        <Button type="submit" variant="primary" className="px-6 rounded-xl bg-indigo-600 hover:bg-indigo-700 border-indigo-600"><Plus size={18} className="mr-2" /> Add Branch</Button>
                                    </form>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {branches.length === 0 && <p className="text-gray-400 col-span-full py-4 text-center">No branches found for this course.</p>}
                                        {branches.map(b => (
                                            <StructureItem
                                                key={b._id}
                                                icon={Layers}
                                                title={b.name}
                                                colorClass="bg-indigo-50 text-indigo-600"
                                                onClick={() => setSelectedBranchId(b._id)}
                                                onDelete={(e) => handleDeleteBranch(b._id)}
                                            />
                                        ))}
                                    </div>
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="branch-selected"
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="p-6 flex items-center gap-4"
                                >
                                    <div className="w-12 h-12 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center">
                                        <Layers size={24} />
                                    </div>
                                    <div>
                                        <p className="text-sm tracking-wide text-gray-500 uppercase font-semibold">Active Branch</p>
                                        <p className="text-2xl font-bold text-gray-900">{activeBranch?.name}</p>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* STEP 3: YEARS */}
            <AnimatePresence>
                {selectedCourseId && selectedBranchId && (
                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        exit="hidden"
                        className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden"
                    >
                        <div className="p-6 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-3">
                                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 text-sm">3</span>
                                {selectedYearId ? 'Selected Year' : 'Select an Academic Year'}
                            </h2>
                            {selectedYearId && (
                                <Button variant="outline" size="sm" onClick={() => setSelectedYearId('')}>
                                    Change Year
                                </Button>
                            )}
                        </div>

                        <AnimatePresence mode="wait">
                            {!selectedYearId ? (
                                <motion.div
                                    key="year-list"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="p-6"
                                >
                                    <form onSubmit={handleAddYear} className="mb-6 flex gap-3 flex-wrap md:flex-nowrap">
                                        <input type="number" min="1" max="8" value={newYearNumber} onChange={e => setNewYearNumber(e.target.value)} placeholder="Add new year (e.g. 1)" className="flex-1 min-w-[200px] px-4 py-3 border border-gray-300 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500 transition-all" required />
                                        <Button type="submit" variant="primary" className="px-6 rounded-xl bg-emerald-600 hover:bg-emerald-700 border-emerald-600 whitespace-nowrap"><Plus size={18} className="mr-2" /> Add Year</Button>
                                    </form>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                                        {years.length === 0 && <p className="text-gray-400 col-span-full py-4 text-center">No years found for this branch.</p>}
                                        {years.map(y => (
                                            <StructureItem
                                                key={y._id}
                                                icon={Calendar}
                                                title={`Year ${y.yearNumber}`}
                                                colorClass="bg-emerald-50 text-emerald-600"
                                                onClick={() => setSelectedYearId(y._id)}
                                                onDelete={(e) => handleDeleteYear(y._id)}
                                            />
                                        ))}
                                    </div>
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="year-selected"
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="p-6 flex items-center gap-4"
                                >
                                    <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
                                        <Calendar size={24} />
                                    </div>
                                    <div>
                                        <p className="text-sm tracking-wide text-gray-500 uppercase font-semibold">Active Year</p>
                                        <p className="text-2xl font-bold text-gray-900">Year {activeYear?.yearNumber}</p>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* STEP 4: SUBJECTS */}
            <AnimatePresence>
                {selectedCourseId && selectedBranchId && selectedYearId && (
                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        exit="hidden"
                        className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden"
                    >
                        <div className="p-6 border-b border-gray-100 bg-gray-50">
                            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-3">
                                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-orange-100 text-orange-600 text-sm">4</span>
                                Manage Subjects
                            </h2>
                        </div>

                        <div className="p-6">
                            <form onSubmit={handleAddSubject} className="mb-8 p-6 bg-orange-50/50 rounded-xl border border-orange-100 border-dashed">
                                <h3 className="text-sm font-semibold text-orange-800 mb-4 flex items-center gap-2"><Plus size={16} /> Add New Subject</h3>
                                <div className="flex flex-col md:flex-row gap-4">
                                    <div className="w-full md:w-1/3">
                                        <input type="text" value={newSubjectCode} onChange={e => setNewSubjectCode(e.target.value)} placeholder="Subject Code (e.g. BAS101)" className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm outline-none focus:ring-2 focus:ring-orange-500 transition-all" required />
                                    </div>
                                    <div className="w-full md:w-2/3 flex gap-4">
                                        <input type="text" value={newSubjectName} onChange={e => setNewSubjectName(e.target.value)} placeholder="Subject Name..." className="flex-1 px-4 py-3 border border-gray-300 rounded-xl text-sm outline-none focus:ring-2 focus:ring-orange-500 transition-all" required />
                                        <Button type="submit" variant="primary" className="px-8 rounded-xl bg-orange-500 hover:bg-orange-600 border-orange-500 whitespace-nowrap">Create</Button>
                                    </div>
                                </div>
                            </form>

                            <div className="space-y-3">
                                {subjects.length === 0 && <p className="text-gray-400 py-8 text-center border-2 border-dashed border-gray-100 rounded-xl">No subjects found for this year. Add your first one above.</p>}
                                {subjects.map(s => (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        key={s._id}
                                        className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-xl hover:shadow-md transition-shadow group"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center">
                                                <BookOpen size={24} />
                                            </div>
                                            <div>
                                                <p className="font-bold text-gray-900 text-lg">{s.name}</p>
                                                <p className="text-sm font-medium text-orange-600 uppercase tracking-wide">{s.code}</p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => handleDeleteSubject(s._id)}
                                            className="p-3 text-red-400 hover:text-red-700 hover:bg-red-50 rounded-xl opacity-0 group-hover:opacity-100 transition-all"
                                            title="Delete Subject"
                                        >
                                            <Trash2 size={20} />
                                        </button>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default CurriculumAdmin;
