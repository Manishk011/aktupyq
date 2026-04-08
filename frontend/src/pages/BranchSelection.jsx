import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import { motion } from 'framer-motion';
import { Code, Hammer, Zap, Radio, Globe, Folder } from 'lucide-react';
import { getCourses, getBranches } from '../services/api';
import SEO from '../components/SEO';

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
            <SEO
                title={`${courseName} Branches — Choose Your Branch for Notes & PYQs`}
                description={`Browse all branches for ${courseName} at AKTU. Select your engineering branch to access handwritten notes, previous year questions (PYQs), and Quantum series.`}
                canonicalUrl={`https://www.aktupyq.com/course/${courseId}`}
            />
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

                {/* SEO Content Block — course-level */}
                {!loading && (
                    <div className="mt-20 max-w-4xl mx-auto">
                        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 rounded-3xl p-8 md:p-10">
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">
                                {courseName} Study Materials — AKTU PYQ
                            </h2>
                            <div className="prose prose-gray max-w-none text-gray-600 space-y-4 text-[15px] leading-relaxed">
                                <p>
                                    Welcome to the <strong>AKTU PYQ</strong> portal for <strong>{courseName}</strong> — your one-stop destination for all academic resources needed to excel in your AKTU examinations. Whether you are looking for <strong>BTech Notes</strong>, <strong>Previous Year Questions (PYQs)</strong>, Quantum series, or the official AKTU syllabus, everything is organized branch-wise for your convenience.
                                </p>
                                <p>
                                    Dr. A.P.J. Abdul Kalam Technical University (AKTU), formerly known as UPTU, conducts semester examinations for thousands of students across Uttar Pradesh. Preparing with <strong>AKTU Previous Year Question papers</strong> is one of the most proven strategies to score high — they reveal exam patterns, frequently asked topics, and the level of difficulty you should expect. Our curated collection of <strong>AKTU PYQ</strong> papers covers multiple sessions and is updated with the latest examination cycles.
                                </p>
                                <p>
                                    Selecting the right branch is your first step. Each branch under {courseName} — whether Computer Science, Electronics &amp; Communication, Mechanical Engineering, Civil Engineering, or Information Technology — has its own unique subject structure. Our platform organizes <strong>BTech Notes</strong> and study resources branch-wise so that you always land exactly where you need to be, without wading through unrelated content.
                                </p>
                                <p>
                                    Every subject page contains <strong>handwritten notes</strong> verified by senior students, digital PDF notes from top educators, <strong>Previous Year Questions</strong> sorted by session, and the popular <strong>Quantum series</strong> — practice booklets that condense the entire syllabus into exam-ready formats. All materials are available for <strong>free, without any registration or hidden charges</strong>.
                                </p>
                                <p>
                                    Choose your branch below to explore year-wise study resources for {courseName}. Our platform is updated regularly as new sessions are released, ensuring that you always have access to the most recent <strong>AKTU PYQ</strong> papers and <strong>BTech Notes</strong>. Bookmark this page and share it with your batchmates — the more students use organized resources, the better everyone performs.
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </Layout>
    );
};

export default BranchSelection;
