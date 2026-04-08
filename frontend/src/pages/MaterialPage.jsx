import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import Button from '../components/ui/Button';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Download, BookOpen, Send, Lock, Eye, ChevronLeft, Folder, ChevronRight, Layers, SearchX } from 'lucide-react';
import { getCourses, getBranches, getYears, getSubjects, getMaterials } from '../services/api';
import SEO from '../components/SEO';

const ResourceCard = ({ material, subject, isQuantumSection }) => {
    const isQuantumLink = !material.title && material.type === 'link';
    const displayTitle = material.title || 'Quantum Material';

    return (
        <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-all flex flex-col sm:flex-row sm:items-center justify-between group gap-4 relative overflow-hidden">
            <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors shrink-0 ${isQuantumLink ? 'bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white' : 'bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white'}`}>
                    {isQuantumLink ? <Send size={20} /> : <FileText size={20} />}
                </div>
                <div>
                    <h4 className="font-semibold text-gray-800 line-clamp-1" title={displayTitle}>{displayTitle}</h4>
                    <p className="text-xs text-gray-500 font-medium">{subject.name}{!isQuantumSection && ` • ${subject.code}`}</p>
                    {(!isQuantumSection && material.session) && (
                        <span className="inline-block mt-2 bg-gray-50 text-gray-600 text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-gray-200">
                            Session: {material.session}
                        </span>
                    )}
                </div>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto mt-2 sm:mt-0 pt-3 sm:pt-0 border-t border-gray-100 sm:border-0">
                {isQuantumLink ? (
                    <Button variant="primary" className="flex-1 sm:flex-none px-4 py-2 text-sm w-full" onClick={() => window.open(material.telegramLink, '_blank')}>
                        <Send size={16} className="mr-2" /> Telegram
                    </Button>
                ) : (
                    <>
                        <Button variant="outline" className="flex-1 sm:flex-none px-3 py-2 text-sm" onClick={() => {
                            const proxyUrl = `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/${material.title ? 'materials' : 'quantum'}/${material._id}/proxy?action=view`;
                            window.open(proxyUrl, '_blank');
                        }}>
                            <Eye size={16} /> <span className="ml-1 hidden sm:inline">View</span>
                        </Button>
                        <Button variant="primary" className="flex-1 sm:flex-none px-3 py-2 text-sm" onClick={() => {
                            const proxyUrl = `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/${material.title ? 'materials' : 'quantum'}/${material._id}/proxy?action=download`;
                            const link = document.createElement('a');
                            link.href = proxyUrl;
                            link.setAttribute('download', displayTitle);
                            link.target = '_blank';
                            document.body.appendChild(link);
                            link.click();
                            document.body.removeChild(link);
                        }}>
                            <Download size={16} /> <span className="ml-1 hidden sm:inline">Download</span>
                        </Button>
                    </>
                )}
            </div>
        </div>
    );
};

const MaterialPage = () => {
    const { courseId, branchId, yearId } = useParams();
    const [searchParams, setSearchParams] = useSearchParams();
    
    // Read initial state from URL
    const initialTab = searchParams.get('tab') || 'notes';
    const initialSubject = searchParams.get('subject') || null;
    const initialPage = parseInt(searchParams.get('page')) || 1;

    const [activeTab, setActiveTab] = useState(initialTab);

    // Hierarchy State
    const [courseName, setCourseName] = useState(courseId?.toUpperCase());
    const [branchName, setBranchName] = useState(branchId?.replace(/-/g, ' '));
    const [yearName, setYearName] = useState(`${yearId} Year`);
    const [allSubjects, setAllSubjects] = useState([]);
    
    // Viewing State
    const [selectedSubjectName, setSelectedSubjectName] = useState(initialSubject);
    const [uniqueSubjectNames, setUniqueSubjectNames] = useState([]); // Folders to show
    const [allActiveTabMaterials, setAllActiveTabMaterials] = useState([]); // All fetched materials for this tab
    const [materialsData, setMaterialsData] = useState([]); // Filtered subset for selected subject name
    const [loading, setLoading] = useState(true);

    // Pagination State
    const [currentPage, setCurrentPage] = useState(initialPage);

    // Update URL when state changes
    const handleSetTab = (tabId) => {
        setActiveTab(tabId);
        setSearchParams(prev => {
            if (tabId !== 'notes') prev.set('tab', tabId);
            else prev.delete('tab');
            prev.delete('page');
            return prev;
        });
    };

    const handleSetSubject = (subjectName) => {
        setSelectedSubjectName(subjectName);
        setCurrentPage(1);
        setSearchParams(prev => {
            if (subjectName) prev.set('subject', subjectName);
            else prev.delete('subject');
            prev.delete('page');
            return prev;
        });
    };

    const handleSetPage = (pageUpdater) => {
        setCurrentPage(prevPage => {
            const newPage = typeof pageUpdater === 'function' ? pageUpdater(prevPage) : pageUpdater;
            setSearchParams(prev => {
                if (newPage > 1) prev.set('page', newPage);
                else prev.delete('page');
                return prev;
            });
            return newPage;
        });
    };
    const ITEMS_PER_PAGE = 6;

    const tabs = [
        { id: 'notes', label: 'Notes', icon: BookOpen },
        { id: 'pyqs', label: 'PYQs', icon: FileText },
        { id: 'quantum', label: 'Quantum', icon: Lock },
    ];

    // Fetch initial hierarchy and subjects
    useEffect(() => {
        const fetchHierarchy = async () => {
            setLoading(true);
            try {
                const coursesList = await getCourses();
                const courseMatch = coursesList.find(c => c.name.toLowerCase().replace('.', '') === courseId);
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
                setAllSubjects(subjectsData);
            } catch (error) {
                console.error("Error fetching hierarchy:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchHierarchy();
    }, [courseId, branchId, yearId]);

    // Fetch materials when tab changes or hierarchy loads
    useEffect(() => {
        if (!allSubjects.length) {
            setAllActiveTabMaterials([]);
            setUniqueSubjectNames([]);
            return;
        }

        const fetchTabMaterials = async () => {
            setLoading(true);
            try {
                const { default: apiInstance } = await import('../services/api');
                const typeMap = { 'notes': 'Notes', 'pyqs': 'PYQ', 'quantum': 'Quantum' };
                const promises = allSubjects.map(async (subject) => {
                    if (activeTab === 'quantum') {
                        const res = await apiInstance.get(`/quantum/subject/${subject._id}`);
                        return (res.data.materials || []).map(m => ({ material: m, subject }));
                    } else {
                        const res = await getMaterials(subject._id, typeMap[activeTab]);
                        return (res.materials || []).map(m => ({ material: m, subject }));
                    }
                });
                const results = await Promise.all(promises);
                let flattened = results.flat();
                
                const uniqueMaterials = [];
                const matSeen = new Set();
                for (const item of flattened) {
                    if (!matSeen.has(item.material._id)) {
                        matSeen.add(item.material._id);
                        uniqueMaterials.push(item);
                    }
                }
                
                setAllActiveTabMaterials(uniqueMaterials);
                flattened = uniqueMaterials;
                
                // Group to unique names that ACTUALLY have materials
                const seen = new Set();
                const uniques = [];
                flattened.forEach(item => {
                    const name = item.subject.name;
                    if (!seen.has(name)) {
                        seen.add(name);
                        uniques.push(item.subject);
                    }
                });
                
                setUniqueSubjectNames(uniques);
                
                // Reset selected subject if it no longer exists in current tab
                if (selectedSubjectName && !uniques.find(u => u.name === selectedSubjectName)) {
                     setSelectedSubjectName(null);
                }
            } catch (error) {
                console.error("Error fetching tab materials:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchTabMaterials();
    }, [activeTab, allSubjects]);

    // Filter materials for selected subject name
    useEffect(() => {
        if (!selectedSubjectName) {
            setMaterialsData([]);
            return;
        }

        let filtered = allActiveTabMaterials.filter(item => item.subject.name === selectedSubjectName);

        // Sort by session descending (unless quantum)
        filtered.sort((a, b) => {
            if (activeTab === 'quantum') {
                return new Date(b.material.createdAt) - new Date(a.material.createdAt);
            }
            const sA = a.material.session;
            const sB = b.material.session;
            if (sA && sB) return sB.localeCompare(sA);
            if (sA) return -1;
            if (sB) return 1;
            return new Date(b.material.createdAt) - new Date(a.material.createdAt);
        });

        setMaterialsData(filtered);
        // We do not reset page here because if it came from initial URL, we want to maintain it.
        // It's reset in handleSetSubject instead.
    }, [selectedSubjectName, allActiveTabMaterials]);

    // Pagination specific calculations
    const totalPages = Math.ceil(materialsData.length / ITEMS_PER_PAGE);
    const paginatedData = materialsData.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

    // Generate SEO metadata dynamically based on current state
    const displayCourse = courseName || courseId?.toUpperCase() || '';
    const displayBranch = branchName || branchId?.replace(/-/g, ' ') || '';
    const displayYear = yearName || `${yearId} Year` || '';
    
    const seoTitle = selectedSubjectName 
        ? `${selectedSubjectName} - ${displayCourse} ${displayBranch} ${displayYear} Notes & PYQs`
        : `${displayCourse} ${displayBranch} ${displayYear} - Notes, PYQs & Quantum`;

    const seoDescription = selectedSubjectName
        ? `Download free study materials, handwritten notes, previous year question papers (PYQs), and Quantum series for ${selectedSubjectName} (${displayCourse} ${displayBranch} ${displayYear}) for AKTU students.`
        : `Get all study materials, handwritten notes, PYQs, and Quantum series for AKTU ${displayCourse} ${displayBranch} ${displayYear} students in one place.`;

    const seoSchema = {
        "@context": "https://schema.org",
        "@type": "Course",
        "name": selectedSubjectName || `${displayCourse} ${displayBranch} ${displayYear}`,
        "description": seoDescription,
        "provider": {
            "@type": "Organization",
            "name": "AKTU PYQ",
            "url": "https://aktupyq.com"
        }
    };

    // Calculate SEO URLs
    const baseUrl = `https://www.aktupyq.com/course/${courseId}/${branchId}/${yearId}`;
    let currentUrl = baseUrl;
    const urlParams = new URLSearchParams();
    if (activeTab !== 'notes') urlParams.set('tab', activeTab);
    if (selectedSubjectName) urlParams.set('subject', selectedSubjectName);
    if (currentPage > 1) urlParams.set('page', currentPage);
    const queryString = urlParams.toString();
    if (queryString) currentUrl += `?${queryString}`;

    const prevParams = new URLSearchParams(urlParams);
    if (currentPage > 2) prevParams.set('page', currentPage - 1);
    else prevParams.delete('page');
    const prevUrl = currentPage > 1 ? `${baseUrl}${prevParams.toString() ? '?' + prevParams.toString() : ''}` : null;

    const nextParams = new URLSearchParams(urlParams);
    nextParams.set('page', currentPage + 1);
    const nextUrl = currentPage < totalPages ? `${baseUrl}?${nextParams.toString()}` : null;

    return (
        <Layout>
            <SEO 
                title={seoTitle} 
                description={seoDescription} 
                schema={seoSchema} 
                canonicalUrl={currentUrl}
                prevUrl={prevUrl}
                nextUrl={nextUrl}
            />
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
                    <div className="flex bg-white p-1 rounded-xl shadow-sm mb-6 w-full md:w-auto inline-flex overflow-x-auto border border-gray-100">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => handleSetTab(tab.id)}
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

                    {/* Content Area */}
                    <div className="min-h-[400px]">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeTab + (selectedSubjectName || 'subjects')}
                                initial={{ opacity: 0, scale: 0.98 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.98 }}
                                transition={{ duration: 0.2 }}
                            >
                                {loading && !allSubjects.length ? (
                                    <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                                        <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
                                        <p className="font-medium">Loading...</p>
                                    </div>
                                ) : !selectedSubjectName ? (
                                    /* Subject Folders View */
                                    <div>
                                        <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
                                            <Layers size={20} className="text-blue-600" /> Select Subject
                                        </h3>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                                            {uniqueSubjectNames.map((subject, idx) => (
                                                <button
                                                    key={idx}
                                                    onClick={() => handleSetSubject(subject.name)}
                                                    className="bg-white hover:bg-blue-50/50 border border-gray-200 hover:border-blue-300 shadow-sm hover:shadow-md rounded-2xl p-6 text-left transition-all group flex items-center gap-5"
                                                >
                                                    <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-transform duration-300 group-hover:scale-110 shadow-sm">
                                                        <Folder size={24} />
                                                    </div>
                                                    <div>
                                                        <h4 className="text-lg font-bold text-gray-900 group-hover:text-blue-700 transition-colors line-clamp-2">{subject.name}</h4>
                                                    </div>
                                                </button>
                                            ))}
                                            {uniqueSubjectNames.length === 0 && !loading && (
                                                <div className="col-span-full py-12 text-center text-gray-500">
                                                    No subjects found for this year.
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ) : (
                                    /* Materials List View */
                                    <div>
                                        <div className="flex items-center justify-between mb-6 border-b border-gray-100 pb-4">
                                            <div className="flex items-center gap-3">
                                                <button
                                                    onClick={() => handleSetSubject(null)}
                                                    className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-500 transition-colors"
                                                >
                                                    <ChevronLeft size={20} />
                                                </button>
                                                <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2 line-clamp-1" title={selectedSubjectName}>
                                                    <Folder size={18} className="text-blue-600" />
                                                    {selectedSubjectName}
                                                </h3>
                                            </div>
                                            <span className="text-xs font-bold uppercase tracking-wider bg-gray-100 text-gray-600 px-3 py-1 rounded-lg">
                                                {activeTab}
                                            </span>
                                        </div>

                                        {loading ? (
                                            <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                                                <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
                                                <p className="font-medium">Loading materials...</p>
                                            </div>
                                        ) : paginatedData.length > 0 ? (
                                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                                {paginatedData.map((item, idx) => (
                                                    <ResourceCard key={item.material._id || idx} subject={item.subject} material={item.material} isQuantumSection={activeTab === 'quantum'} />
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="flex flex-col items-center justify-center py-16 text-gray-400 text-center">
                                                <SearchX size={48} className="text-gray-300 mb-4" />
                                                <h3 className="text-lg font-bold text-gray-800 mb-2">No {activeTab} found</h3>
                                                <p className="text-sm">There are no uploaded materials for this subject yet.</p>
                                            </div>
                                        )}

                                        {/* Pagination Controls */}
                                        {totalPages > 1 && (
                                            <div className="flex items-center justify-center gap-2 mt-8 pt-6 border-t border-gray-100">
                                                <button
                                                    onClick={() => handleSetPage(prev => Math.max(prev - 1, 1))}
                                                    disabled={currentPage === 1}
                                                    className="p-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                                >
                                                    <ChevronLeft size={18} />
                                                </button>

                                                <div className="flex items-center gap-1">
                                                    {Array.from({ length: totalPages }).map((_, i) => (
                                                        <button
                                                            key={i}
                                                            onClick={() => handleSetPage(i + 1)}
                                                            className={`w-8 h-8 rounded-lg text-sm font-bold transition-all ${currentPage === i + 1 ? 'bg-blue-600 text-white shadow-md' : 'text-gray-600 hover:bg-gray-100'}`}
                                                        >
                                                            {i + 1}
                                                        </button>
                                                    ))}
                                                </div>

                                                <button
                                                    onClick={() => handleSetPage(prev => Math.min(prev + 1, totalPages))}
                                                    disabled={currentPage === totalPages}
                                                    className="p-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                                >
                                                    <ChevronRight size={18} />
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </motion.div>
                        </AnimatePresence>
                    </div>

                    {/* SEO Content Block — year + subject level */}
                    <div className="mt-16 pt-8 border-t border-gray-200">
                        <div className="bg-gradient-to-br from-slate-50 to-blue-50 border border-slate-200 rounded-3xl p-8">
                            <h2 className="text-xl font-bold text-gray-900 mb-5">
                                {selectedSubjectName
                                    ? `${selectedSubjectName} — ${displayCourse} ${displayBranch} ${displayYear} Study Material`
                                    : `${displayCourse} ${displayBranch} ${displayYear} — Notes, PYQs & Quantum`
                                }
                            </h2>
                            <div className="text-gray-600 space-y-4 text-[15px] leading-relaxed">
                                {selectedSubjectName ? (
                                    // Subject-specific SEO content
                                    <>
                                        <p>
                                            You are viewing study materials for <strong>{selectedSubjectName}</strong> — a subject in the <strong>{displayCourse} {displayBranch} {displayYear}</strong> curriculum at AKTU. This page provides all types of resources for this subject: handwritten <strong>BTech Notes</strong>, digital study guides, session-wise <strong>AKTU Previous Year Question papers (PYQs)</strong>, and the complete <strong>Quantum series</strong> booklets.
                                        </p>
                                        <p>
                                            <strong>{selectedSubjectName}</strong> is an important subject in the AKTU semester examination pattern. To perform well, students must combine regular note-revision with consistent practice of <strong>Previous Year Questions</strong>. PYQs from the last 5 to 7 sessions reveal the recurring topics that examiners favour, high-weightage units, and the style of questions asked under each unit — helping you allocate your study time efficiently.
                                        </p>
                                        <p>
                                            Our <strong>BTech Notes</strong> for {selectedSubjectName} are curated from top-performing AKTU students and structured unit-by-unit to match the official syllabus. The <strong>Quantum series</strong> for this subject condenses complex topics into short, exam-ready answers that are ideal for last-minute revision. All materials are available in high-quality PDF format and can be downloaded instantly, free of cost.
                                        </p>
                                        <p>
                                            AKTU PYQ is updated with every new examination session, so you always get the most recent question papers. If you find a paper missing or have notes to contribute, you can contact us through the Contact page and help fellow students get better resources.
                                        </p>
                                    </>
                                ) : (
                                    // Year-level SEO content
                                    <>
                                        <p>
                                            You are browsing the <strong>AKTU PYQ</strong> and <strong>BTech Notes</strong> collection for <strong>{displayCourse} {displayBranch} {displayYear}</strong>. This page contains all subject-wise study materials for this academic year, including handwritten notes, digital PDF notes, the Quantum series, official syllabus documents, and <strong>Previous Year Question papers</strong> from multiple recent AKTU sessions.
                                        </p>
                                        <p>
                                            The {displayYear} of {displayBranch} is a critical academic stage. The subjects covered in this year lay the foundation for advanced topics in later semesters and carry significant weightage in the AKTU semester examinations. Having access to well-organized <strong>BTech Notes</strong> and <strong>AKTU PYQs</strong> for every subject can dramatically improve your score and reduce preparation time.
                                        </p>
                                        <p>
                                            Click on any subject folder above to instantly access all available resources for that subject. Each subject folder contains <strong>Previous Year Questions</strong> sorted by session (e.g., 2023-24, 2022-23), <strong>handwritten BTech Notes</strong> verified by seniors, and the complete <strong>Quantum series</strong> for targeted revision. Our collection is expanded continuously as new papers and notes are uploaded.
                                        </p>
                                        <p>
                                            Preparing with <strong>AKTU PYQ</strong> papers is the most efficient strategy for AKTU exams. PYQs tell you exactly which units are covered most frequently, how many marks each question carries, and whether the paper pattern has changed. Combine PYQs with our <strong>BTech Notes</strong> and Quantum series for a complete preparation strategy that covers theory, practice, and quick revision.
                                        </p>
                                        <p>
                                            All resources on AKTU PYQ are 100% free. No registration required, no ads, no paywalls. Our goal is to make quality study material accessible to every AKTU student, regardless of their college or location. Explore the subjects above and start your preparation today.
                                        </p>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Quick Stats */}
                        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-3">
                            {[
                                { label: 'Updated Syllabus', value: '2024-25 ✅' },
                                { label: 'High Quality PDFs', value: 'Scanned ✅' },
                                { label: 'One-Click Download', value: 'No Ads ✅' },
                                { label: 'Access', value: '100% Free ✅' },
                            ].map((stat, i) => (
                                <div key={i} className="bg-white border border-gray-200 rounded-2xl p-4 text-center shadow-sm">
                                    <p className="text-sm font-bold text-gray-800">{stat.value}</p>
                                    <p className="text-xs text-gray-500 mt-1">{stat.label}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default MaterialPage;
