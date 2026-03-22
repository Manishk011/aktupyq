import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import Button from '../components/ui/Button';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Download, BookOpen, Send, Lock, Eye } from 'lucide-react';
import { getCourses, getBranches, getYears, getSubjects, getMaterials } from '../services/api';

const ResourceCard = ({ material, subject }) => (
    <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-all flex flex-col sm:flex-row sm:items-center justify-between group gap-4">
        <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-blue-50 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors shrink-0">
                <FileText size={20} />
            </div>
            <div>
                <h4 className="font-semibold text-gray-800">{subject.name}</h4>
                <p className="text-xs text-gray-500">{subject.code} • {material.title}</p>
            </div>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto mt-2 sm:mt-0 pt-2 sm:pt-0 border-t border-gray-100 sm:border-0">
            <Button variant="outline" className="flex-1 sm:flex-none px-4 py-2 text-sm" onClick={() => {
                const proxyUrl = `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/materials/${material._id}/proxy?action=view`;
                window.open(proxyUrl, '_blank');
            }}>
                <Eye size={16} />
                <span>View</span>
            </Button>
            <Button variant="primary" className="flex-1 sm:flex-none px-4 py-2 text-sm" onClick={() => {
                const proxyUrl = `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/materials/${material._id}/proxy?action=download`;
                const link = document.createElement('a');
                link.href = proxyUrl;
                link.setAttribute('download', material.title || 'download');
                link.target = '_blank';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            }}>
                <Download size={16} />
                <span>Download</span>
            </Button>
        </div>
    </div>
);

const MaterialPage = () => {
    const { courseId, branchId, yearId } = useParams();
    const [activeTab, setActiveTab] = useState('notes');
    const [materialsData, setMaterialsData] = useState([]);
    const [loading, setLoading] = useState(true);

    const [courseName, setCourseName] = useState(courseId?.toUpperCase());
    const [branchName, setBranchName] = useState(branchId?.replace(/-/g, ' '));
    const [yearName, setYearName] = useState(`${yearId} Year`);

    const tabs = [
        { id: 'notes', label: 'Notes', icon: BookOpen },
        { id: 'pyqs', label: 'PYQs', icon: FileText },
        { id: 'quantum', label: 'Quantum', icon: Lock },
    ];

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const allCourses = await getCourses();
                const courseMatch = allCourses.find(c => c.name.toLowerCase().replace('.', '') === courseId);
                if (!courseMatch) return;
                setCourseName(courseMatch.name);

                const branchesData = await getBranches(courseMatch._id);
                const branchMatch = branchesData.find(b => b.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') === branchId);
                if (!branchMatch) return;
                setBranchName(branchMatch.name);

                const yearsData = await getYears(branchMatch._id);
                const yearMatch = yearsData.find(y => y.yearNumber.toString() === yearId);
                if (!yearMatch) return;
                setYearName(yearMatch.yearNumber === 1 ? '1st Year' : yearMatch.yearNumber === 2 ? '2nd Year' : yearMatch.yearNumber === 3 ? '3rd Year' : `${yearMatch.yearNumber}th Year`);

                const subjectsData = await getSubjects(yearMatch._id);

                const typeMap = {
                    'notes': 'Notes',
                    'pyqs': 'PYQ',
                    'quantum': 'Quantum'
                };

                if (activeTab === 'quantum') {
                    setMaterialsData([]);
                    setLoading(false);
                    return;
                }

                const materialPromises = subjectsData.map(async (subject) => {
                    const res = await getMaterials(subject._id, typeMap[activeTab]);
                    return res.materials.map(m => ({ material: m, subject }));
                });

                const allMaterialsArrays = await Promise.all(materialPromises);
                const flattenedMaterials = allMaterialsArrays.flat();
                setMaterialsData(flattenedMaterials);

            } catch (error) {
                console.error("Error fetching materials data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [courseId, branchId, yearId, activeTab]);

    return (
        <Layout>
            <div className="min-h-screen bg-slate-50 py-12">
                <div className="container mx-auto px-4 lg:px-8 max-w-5xl">

                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">Study Material</h1>
                        <p className="text-gray-600 capitalize">
                            {courseName} • {branchName} • {yearName}
                        </p>
                    </div>

                    {/* Tabs */}
                    <div className="flex bg-white p-1 rounded-xl shadow-sm mb-8 w-full md:w-auto inline-flex overflow-x-auto">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all whitespace-nowrap ${activeTab === tab.id
                                    ? 'bg-primary text-white shadow-md'
                                    : 'text-gray-500 hover:text-gray-800 hover:bg-gray-50'
                                    }`}
                            >
                                <tab.icon size={18} />
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    {/* Content */}
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.3 }}
                            className="space-y-4"
                        >
                            {activeTab === 'quantum' ? (
                                <div className="bg-white rounded-2xl p-8 border border-blue-100 text-center shadow-sm">
                                    <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6 text-primary">
                                        <Send size={32} />
                                    </div>
                                    <h3 className="text-2xl font-bold text-gray-900 mb-4">Quantum Series PDFs</h3>
                                    <p className="text-gray-600 mb-8 max-w-lg mx-auto">
                                        To protect copyright and ensure fast delivery, all Quantum Series PDFs are available exclusively on our Telegram Channel.
                                    </p>
                                    <Button variant="primary" className="mx-auto" onClick={() => window.open('https://t.me/aktunotes', '_blank')}>
                                        Join Telegram Channel
                                    </Button>
                                </div>
                            ) : (
                                <div>
                                    {loading ? (
                                        <div className="text-center py-10 text-gray-500">Loading materials...</div>
                                    ) : materialsData.length > 0 ? (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {materialsData.map((item) => (
                                                <ResourceCard
                                                    key={item.material._id}
                                                    subject={item.subject}
                                                    material={item.material}
                                                />
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-10 text-gray-500 bg-white rounded-xl border border-gray-100 shadow-sm">
                                            No materials found for this section.
                                        </div>
                                    )}
                                </div>
                            )}
                        </motion.div>
                    </AnimatePresence>

                    {/* Branding / SEO Text */}
                    <div className="mt-16 pt-8 border-t border-gray-200">
                        <h3 className="text-lg font-bold text-gray-900 mb-4">Why use aktupyq?</h3>
                        <ul className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                            <li className="flex items-center gap-2">✅ Updated Syllabus 2024-25</li>
                            <li className="flex items-center gap-2">✅ High Quality Scanned PDFs</li>
                            <li className="flex items-center gap-2">✅ One-Click Downloads (No Ads)</li>
                            <li className="flex items-center gap-2">✅ Active Student Community</li>
                        </ul>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default MaterialPage;
