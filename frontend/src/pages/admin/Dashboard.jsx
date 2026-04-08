import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard, ExternalLink, Plus, BookOpen, Layers,
    FileText, Link as LinkIcon, Activity, HardDrive, Server,
    Upload, Folder, PieChart, TrendingUp, Trash2, Clock
} from 'lucide-react';
import Button from '../../components/ui/Button';
import { getDashboardStats } from '../../services/api';

// Animation variants
const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.1 }
    }
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } }
};

const Dashboard = () => {
    const navigate = useNavigate();
    const [dashboardData, setDashboardData] = useState({
        stats: {
            totalCourses: 0,
            totalBranches: 0,
            totalSubjects: 0,
            totalMaterials: 0
        },
        materialsByType: { Notes: 0, PYQ: 0, Syllabus: 0, Quantum: 0 },
        recentActivity: []
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const data = await getDashboardStats();
                setDashboardData(data);
            } catch (error) {
                console.error("Failed to fetch dashboard stats:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    const { stats: dbStats, materialsByType, recentActivity, systemStatus } = dashboardData;

    // Use fetched system status or default fallbacks
    const isActive = systemStatus?.isActive ?? false;
    const storageUsedMB = systemStatus?.dbStorageUsedMB ?? 0;
    const storageLimitMB = systemStatus?.dbStorageLimitMB ?? 512;
    const storagePercentage = Math.min(100, (storageUsedMB / storageLimitMB) * 100).toFixed(1);

    // Computed stats
    const stats = [
        { id: 1, title: 'Total Courses', value: dbStats.totalCourses, label: 'Active programs', trend: 'Active', icon: Folder, color: 'text-blue-600', bg: 'bg-blue-50' },
        { id: 2, title: 'Total Branches', value: dbStats.totalBranches, label: 'Across all courses', trend: 'Active', icon: Layers, color: 'text-indigo-600', bg: 'bg-indigo-50' },
        { id: 3, title: 'Total Subjects', value: dbStats.totalSubjects, label: 'Active syllabi', trend: 'Active', icon: BookOpen, color: 'text-emerald-600', bg: 'bg-emerald-50' },
        { id: 4, title: 'Total Materials', value: dbStats.totalMaterials, label: 'Notes, PYQs, PDFs', trend: 'Active', icon: FileText, color: 'text-purple-600', bg: 'bg-purple-50' }
    ];

    const quickActions = [
        { id: 1, title: 'Add New Course', desc: 'Create a new degree program', icon: Plus, color: 'text-blue-600', bg: 'bg-blue-50', path: '/admin/curriculum' },
        { id: 2, title: 'Upload Material', desc: 'Add notes, PYQs, or syllabus', icon: Upload, color: 'text-emerald-600', bg: 'bg-emerald-50', path: '/admin/materials' },
        { id: 3, title: 'Manage Curriculum', desc: 'Edit branches and subjects', icon: Layers, color: 'text-indigo-600', bg: 'bg-indigo-50', path: '/admin/curriculum' },
        { id: 4, title: 'Add Quantum Link', desc: 'Update external resources', icon: LinkIcon, color: 'text-orange-600', bg: 'bg-orange-50', path: '/admin/quantum' }
    ];

    // Compute distribution percentages safely
    const totalDist = (materialsByType.Notes || 0) + (materialsByType.PYQ || 0) + (materialsByType.Syllabus || 0);
    const notesRatio = totalDist > 0 ? ((materialsByType.Notes || 0) / totalDist) * 100 : 0;
    const pyqRatio = totalDist > 0 ? ((materialsByType.PYQ || 0) / totalDist) * 100 : 0;
    const syllabusRatio = totalDist > 0 ? ((materialsByType.Syllabus || 0) / totalDist) * 100 : 0;

    return (
        <motion.div
            className="max-w-7xl mx-auto pb-12 space-y-6"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            {/* 1. HEADER SECTION */}
            <motion.div variants={itemVariants} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2 text-sm text-gray-500 mb-2 font-medium">
                        <LayoutDashboard size={14} /> <span>Dashboard</span>
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Dashboard Overview</h1>
                    <p className="text-gray-500 mt-1">Manage courses, subjects, and study materials efficiently.</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="outline" className="py-2.5 px-4 rounded-xl shadow-sm hover:bg-gray-50 transition-colors" onClick={() => window.open('/', '_blank')}>
                        <ExternalLink size={18} className="mr-2" /> View Website
                    </Button>
                    <Button variant="primary" className="py-2.5 px-6 rounded-xl shadow-md hover:shadow-lg transition-all" onClick={() => navigate('/admin/curriculum')}>
                        <Plus size={18} className="mr-2" /> Add Course
                    </Button>
                </div>
            </motion.div>

            {/* 2. PRIMARY STATS GRID */}
            <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map(stat => (
                    <div key={stat.id} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow group relative overflow-hidden">
                        <div className={`absolute -right-6 -top-6 w-24 h-24 rounded-full ${stat.bg} opacity-50 group-hover:scale-150 transition-transform duration-500`}></div>
                        <div className="relative">
                            <div className="flex justify-between items-start mb-4">
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.bg} ${stat.color}`}>
                                    <stat.icon size={24} />
                                </div>
                                <span className="flex items-center text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg">
                                    <TrendingUp size={12} className="mr-1" /> {stat.trend}
                                </span>
                            </div>
                            <div>
                                <h3 className="text-sm font-semibold text-gray-500 tracking-wide uppercase">{stat.title}</h3>
                                <div className="flex items-baseline gap-2 mt-1">
                                    <p className="text-3xl font-extrabold text-gray-900">{stat.value}</p>
                                </div>
                                <p className="text-xs text-gray-400 mt-1">{stat.label}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* 3. QUICK ACTIONS */}
                <motion.div variants={itemVariants} className="lg:col-span-2 space-y-6">
                    <div>
                        <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2"><Activity size={20} className="text-blue-600" /> Quick Actions</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {quickActions.map(action => (
                                <Link
                                    key={action.id}
                                    to={action.path}
                                    className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-blue-200 transition-all flex items-center gap-4 group"
                                >
                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${action.bg} ${action.color} group-hover:scale-110 transition-transform`}>
                                        <action.icon size={24} />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors">{action.title}</h4>
                                        <p className="text-xs text-gray-500 mt-0.5">{action.desc}</p>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* 5. SYSTEM OVERVIEW SECTION */}
                    <div>
                        <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2"><PieChart size={20} className="text-indigo-600" /> System Overview</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {/* Bar Chart Placeholder */}
                            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between h-64">
                                <div>
                                    <h4 className="font-bold text-gray-900">Materials Distribution</h4>
                                    <p className="text-xs text-gray-500">By Type (Notes, PYQs, Syllabus)</p>
                                </div>
                                <div className="flex-1 flex items-end justify-center gap-4 mt-6 pb-2 border-b border-gray-100">
                                    <div className="w-12 bg-blue-100 rounded-t-lg relative group">
                                        <div className={`absolute bottom-0 w-full bg-blue-500 rounded-t-lg group-hover:opacity-80 transition-opacity`} style={{ height: `${notesRatio || 5}%` }}></div>
                                        <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[10px] font-bold text-gray-400">Notes</span>
                                    </div>
                                    <div className="w-12 bg-purple-100 rounded-t-lg relative group">
                                        <div className={`absolute bottom-0 w-full bg-purple-500 rounded-t-lg group-hover:opacity-80 transition-opacity`} style={{ height: `${pyqRatio || 5}%` }}></div>
                                        <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[10px] font-bold text-gray-400">PYQs</span>
                                    </div>
                                    <div className="w-12 bg-emerald-100 rounded-t-lg relative group">
                                        <div className={`absolute bottom-0 w-full bg-emerald-500 rounded-t-lg group-hover:opacity-80 transition-opacity`} style={{ height: `${syllabusRatio || 5}%` }}></div>
                                        <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[10px] font-bold text-gray-400">Syllabi</span>
                                    </div>
                                </div>
                            </div>

                            {/* Pie Chart Placeholder */}
                            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between h-64">
                                <div>
                                    <h4 className="font-bold text-gray-900">Subjects by Course</h4>
                                    <p className="text-xs text-gray-500">Overview of academic spread</p>
                                </div>
                                <div className="flex-1 flex items-center justify-center mt-4">
                                    <div className="w-32 h-32 rounded-full border-[12px] border-gray-50 relative flex items-center justify-center">
                                        <div className="absolute inset-0 rounded-full border-[12px] border-indigo-500 border-t-transparent border-r-transparent transform -rotate-45"></div>
                                        <div className="absolute inset-0 rounded-full border-[12px] border-blue-400 border-b-transparent border-l-transparent transform rotate-12"></div>
                                        <span className="text-sm font-bold text-gray-900">{dbStats.totalSubjects}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* RIGHT COLUMN */}
                <motion.div variants={itemVariants} className="space-y-6">

                    {/* 6. STORAGE / SYSTEM STATUS */}
                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2"><Server size={20} className="text-gray-600" /> Database Status</h2>
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                <span className={`w-2 h-2 rounded-full ${isActive ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></span> {isActive ? 'Active' : 'Offline'}
                            </span>
                        </div>

                        <div className="mb-6">
                            <div className="flex justify-between text-sm mb-2">
                                <span className="font-semibold text-gray-700">Storage Used</span>
                                <span className="font-bold text-gray-900">{storagePercentage}%</span>
                            </div>
                            <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                                <div className="bg-gradient-to-r from-blue-500 to-indigo-500 h-2.5 rounded-full transition-all duration-1000" style={{ width: `${storagePercentage}%` }}></div>
                            </div>
                            <p className="text-xs text-gray-400 mt-2">{storageUsedMB} MB of {storageLimitMB} MB local limit</p>
                        </div>

                        <div className="grid grid-cols-2 gap-4 border-t border-gray-100 pt-4">
                            <div>
                                <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">Total Materials</p>
                                <p className="font-bold text-gray-900 text-lg">{dbStats.totalMaterials}</p>
                            </div>
                            <div>
                                <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">Last Backup</p>
                                <p className="font-bold text-gray-900 text-lg shrink-0 text-sm mt-1">Today, 2:00 AM</p>
                            </div>
                        </div>
                    </div>

                    {/* 4. RECENT ACTIVITY SECTION */}
                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                        <h2 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2"><Clock size={20} className="text-emerald-600" /> Recent Activity</h2>
                        <div className="space-y-6 relative before:absolute before:inset-0 before:ml-[11px] before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-gray-100 before:to-transparent">
                            {recentActivity.length > 0 ? recentActivity.map((item, index) => (
                                <div key={item._id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                                    <div className="flex items-center justify-center w-6 h-6 rounded-full bg-white border-2 border-gray-100 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10 transition-colors group-hover:border-blue-200">
                                        <div className={`w-2 h-2 rounded-full bg-blue-400`}></div>
                                    </div>
                                    <div className="w-[calc(100%-2.5rem)] md:w-[calc(50%-1.5rem)] p-3 rounded-xl border border-transparent group-hover:border-gray-100 group-hover:bg-gray-50/50 transition-all">
                                        <div className="flex items-center gap-2 mb-1">
                                            <FileText size={14} className="text-blue-500" />
                                            <p className="text-xs font-bold text-gray-500">{new Date(item.createdAt).toLocaleDateString()}</p>
                                        </div>
                                        <p className="text-sm font-semibold text-gray-800 line-clamp-2">Material added: {item.type}</p>
                                    </div>
                                </div>
                            )) : (
                                <div className="text-center py-4 text-sm text-gray-500 w-full relative z-10">No recent activity</div>
                            )}
                        </div>
                        <Button variant="outline" className="w-full mt-4 rounded-xl py-2 text-xs">View All Activity</Button>
                    </div>

                </motion.div>
            </div>
        </motion.div>
    );
};

export default Dashboard;
