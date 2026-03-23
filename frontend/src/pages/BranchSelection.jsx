import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import { motion } from 'framer-motion';
import { Code, Cpu, Hammer, Zap, Radio, Globe, Folder } from 'lucide-react';
import { getCourses, getBranches } from '../services/api';

const iconMap = {
    'computer science': { icon: Code, color: 'bg-blue-500' },
    'information tech': { icon: Globe, color: 'bg-indigo-500' },
    'mechanical engineeering': { icon: Hammer, color: 'bg-orange-500' },
    'electronics & comm': { icon: Radio, color: 'bg-green-500' },
    'electrical engg': { icon: Zap, color: 'bg-yellow-500' },
    'civil engineering': { icon: Hammer, color: 'bg-red-500' },
    'default': { icon: Folder, color: 'bg-gray-500' }
};

const BranchSelection = () => {
    const { courseId } = useParams();
    const [branches, setBranches] = useState([]);
    const [courseName, setCourseName] = useState(courseId?.toUpperCase());
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchBranchData = async () => {
            try {
                const allCourses = await getCourses();
                const courseMatch = allCourses.find(c => c.name.toLowerCase().replace('.', '') === courseId);
                if (courseMatch) {
                    setCourseName(courseMatch.name);
                    const branchesData = await getBranches(courseMatch._id);
                    const formattedBranches = branchesData.map(b => {
                        const mapped = iconMap[b.name.toLowerCase()] || iconMap['default'];
                        return {
                            ...b,
                            icon: mapped.icon,
                            color: mapped.color,
                            slug: b.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')
                        };
                    });
                    setBranches(formattedBranches);
                }
            } catch (error) {
                console.error("Error fetching branches:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchBranchData();
    }, [courseId]);

    return (
        <Layout>
            <div className="container mx-auto px-4 py-16">
                <div className="text-center mb-12">
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <h1 className="text-4xl font-bold text-gray-900 mb-4">
                            Select Your Branch
                        </h1>
                        <p className="text-lg text-gray-600">
                            For <span className="text-primary font-semibold">{courseName}</span>
                        </p>
                    </motion.div>
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <div className="w-12 h-12 border-4 border-blue-200 border-t-primary rounded-full animate-spin mb-4"></div>
                        <p className="text-gray-500 font-medium">Loading branches...</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
                        {branches.map((branch, index) => (
                            <motion.div
                                key={branch._id}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: index * 0.1, duration: 0.3 }}
                                whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}
                            >
                                <Link
                                    to={`/course/${courseId}/${branch.slug}`}
                                    className="block bg-white rounded-xl p-6 border border-gray-100 shadow-sm hover:border-primary/30 transition-all h-full"
                                >
                                    <div className={`w-12 h-12 ${branch.color} rounded-lg flex items-center justify-center mb-4 text-white shadow-md`}>
                                        <branch.icon size={24} />
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-800 mb-2">{branch.name}</h3>
                                    <p className="text-sm text-gray-500">
                                        Access notes, PYQs, and syllabus for {branch.name} students.
                                    </p>
                                </Link>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </Layout>
    );
};

export default BranchSelection;
