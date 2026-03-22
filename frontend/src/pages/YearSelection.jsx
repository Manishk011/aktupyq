import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import { motion } from 'framer-motion';
import { Calendar, GraduationCap, Clock, Award } from 'lucide-react';
import { getCourses, getBranches, getYears } from '../services/api';

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
            }
        };
        fetchYearData();
    }, [courseId, branchId]);

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
                            Select Your Year
                        </h1>
                        <p className="text-lg text-gray-600">
                            <span className="uppercase font-semibold text-gray-800">{courseName}</span> • <span className="capitalize font-semibold text-primary">{branchName}</span>
                        </p>
                    </motion.div>
                </div>

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
                                    {/* Simplified Icon handling for this demo context */}
                                    <span className="font-bold text-2xl text-gray-700">{year.yearNumber}</span>
                                </div>

                                <h3 className="text-2xl font-bold text-gray-800 mb-2">{year.formattedName}</h3>
                                <p className="text-gray-500">{year.desc}</p>
                            </Link>
                        </motion.div>
                    ))}
                </div>
            </div>
        </Layout>
    );
};

export default YearSelection;
