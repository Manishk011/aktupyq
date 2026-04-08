import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import { motion } from 'framer-motion';
import { getCourses, getBranches, getYears } from '../services/api';
import SEO from '../components/SEO';

const iconMap = {
    '1': { desc: 'Foundation & Basics', color: 'bg-emerald-500' },
    '2': { desc: 'Core Subjects Start', color: 'bg-blue-500' },
    '3': { desc: 'Advanced Topics', color: 'bg-violet-500' },
    '4': { desc: 'Final Project & Electives', color: 'bg-rose-500' },
    'default': { desc: 'Academic Year', color: 'bg-gray-500' }
};

const ordinalSuffix = (i) => {
    var j = i % 10, k = i % 100;
    if (j == 1 && k != 11) return i + "st";
    if (j == 2 && k != 12) return i + "nd";
    if (j == 3 && k != 13) return i + "rd";
    return i + "th";
};

const YearSelection = () => {
    const { courseId, branchId } = useParams();
    const [years, setYears] = useState([]);
    const [courseName, setCourseName] = useState(courseId?.toUpperCase());
    const [branchName, setBranchName] = useState(branchId?.replace(/-/g, ' '));
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchYearData = async () => {
            try {
                const allCourses = await getCourses();
                const courseMatch = allCourses.find(c => c.name.toLowerCase().replace('.', '') === courseId);
                if (courseMatch) {
                    setCourseName(courseMatch.name);
                    const branchesData = await getBranches(courseMatch._id);
                    const branchMatch = branchesData.find(b => b.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') === branchId);

                    if (branchMatch) {
                        setBranchName(branchMatch.name);
                        const yearsData = await getYears(branchMatch._id);
                        const formattedYears = yearsData.map(y => {
                            const strNum = y.yearNumber.toString();
                            const mapped = iconMap[strNum] || iconMap['default'];
                            return {
                                ...y,
                                formattedName: ordinalSuffix(y.yearNumber) + ' Year',
                                desc: mapped.desc,
                                color: mapped.color
                            };
                        });
                        setYears(formattedYears);
                    }
                }
            } catch (error) {
                console.error("Error fetching years:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchYearData();
    }, [courseId, branchId]);

    return (
        <Layout>
            <SEO
                title={`${courseName} ${branchName} — Select Year for Notes & PYQs`}
                description={`Access study materials for ${courseName} ${branchName} at AKTU. Choose your academic year to download handwritten notes, PYQs, and Quantum series — all free.`}
                canonicalUrl={`https://www.aktupyq.com/course/${courseId}/${branchId}`}
            />
            <div className="container mx-auto px-4 py-16">
                <div className="text-center mb-12">
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <h1 className="text-4xl font-bold text-gray-900 mb-4">
                            Select Your Year
                        </h1>
                        <p className="text-lg text-gray-600">
                            <span className="uppercase font-semibold text-gray-800">{courseName}</span> • <span className="capitalize font-semibold text-primary">{branchName}</span>
                        </p>
                    </motion.div>
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <div className="w-12 h-12 border-4 border-blue-200 border-t-primary rounded-full animate-spin mb-4"></div>
                        <p className="text-gray-500 font-medium">Loading academic years...</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
                        {years.map((year, index) => (
                            <motion.div
                                key={year._id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1, duration: 0.4 }}
                                whileHover={{ scale: 1.03 }}
                            >
                                <Link
                                    to={`/course/${courseId}/${branchId}/${year.yearNumber}`}
                                    className="block bg-white rounded-2xl p-8 border border-gray-100 shadow-lg hover:shadow-2xl transition-all text-center group h-full relative overflow-hidden"
                                >
                                    <div className={`absolute top-0 left-0 w-full h-2 ${year.color}`} />

                                    <div className={`w-16 h-16 mx-auto ${year.color} bg-opacity-10 rounded-full flex items-center justify-center mb-6 group-hover:bg-opacity-20 transition-all text-${year.color.split('-')[1]}-600`}>
                                        <span className="font-bold text-2xl text-gray-700">{year.yearNumber}</span>
                                    </div>

                                    <h3 className="text-2xl font-bold text-gray-800 mb-2">{year.formattedName}</h3>
                                    <p className="text-gray-500">{year.desc}</p>
                                </Link>
                            </motion.div>
                        ))}
                    </div>
                )}

                {/* SEO Content Block — branch-level */}
                {!loading && (
                    <div className="mt-20 max-w-4xl mx-auto">
                        <div className="bg-gradient-to-br from-violet-50 to-purple-50 border border-violet-100 rounded-3xl p-8 md:p-10">
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">
                                {courseName} {branchName} — Notes, PYQs &amp; Quantum Series
                            </h2>
                            <div className="prose prose-gray max-w-none text-gray-600 space-y-4 text-[15px] leading-relaxed">
                                <p>
                                    You are now browsing the <strong>AKTU PYQ</strong> and <strong>BTech Notes</strong> section for <strong>{courseName} {branchName}</strong>. This page gives you direct access to year-wise study resources, helping you jump straight to the content relevant to your current semester — without any clutter or distraction.
                                </p>
                                <p>
                                    The {branchName} branch is one of the most sought-after engineering disciplines under AKTU, covering a wide range of subjects from foundational mathematics and physics in the first year to specialized advanced topics by the final year. Students in this branch require well-organized <strong>BTech Notes</strong> and reliable <strong>AKTU Previous Year Question papers</strong> to thoroughly prepare for both semester theory exams and practical assessments.
                                </p>
                                <p>
                                    Our platform structures all study materials year-wise — <strong>1st Year, 2nd Year, 3rd Year, and 4th Year</strong> — so you can navigate directly to your current academic level. Each year contains subject-wise folders with <strong>handwritten notes</strong> from top-performing students, concise PDF notes, official AKTU syllabus documents, the famous <strong>Quantum series</strong> booklets, and session-wise <strong>Previous Year Questions (PYQs)</strong> covering all recent AKTU exam cycles.
                                </p>
                                <p>
                                    Using <strong>Previous Year Questions</strong> is the single most effective revision strategy for AKTU exams. PYQs help you understand the exact marks distribution, identify high-frequency topics, and practice writing answers within the expected word limit. Our collection of <strong>AKTU PYQ</strong> papers for {branchName} is updated with every examination cycle and covers multiple sessions so you can track how questions evolve over time.
                                </p>
                                <p>
                                    All resources on AKTU PYQ are completely free — no subscription, no login required, no popups. We believe every student in {courseName} {branchName} deserves equal access to quality study material. Select your academic year above to start downloading <strong>BTech Notes</strong>, <strong>PYQs</strong>, and the full Quantum series for your branch right now.
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </Layout>
    );
};

export default YearSelection;
