import React, { useState, useEffect } from 'react';
import api, { getCourses, getBranches, getYears } from '../../services/api';
import Button from '../../components/ui/Button';
import { Send, Save } from 'lucide-react';

const QuantumAdmin = () => {
    // Selectors state
    const [courses, setCourses] = useState([]);
    const [selectedCourseId, setSelectedCourseId] = useState('');
    const [branches, setBranches] = useState([]);
    const [selectedBranchId, setSelectedBranchId] = useState('');
    const [years, setYears] = useState([]);
    const [selectedYearId, setSelectedYearId] = useState('');

    // Link state
    const [telegramLink, setTelegramLink] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const [actionLoading, setActionLoading] = useState(false);

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
            else { setSelectedBranchId(''); setYears([]); setTelegramLink(''); }
        });
    }, [selectedCourseId]);

    useEffect(() => {
        if (!selectedBranchId) return;
        getYears(selectedBranchId).then(data => {
            setYears(data);
            if (data.length > 0) setSelectedYearId(data[0]._id);
            else { setSelectedYearId(''); setTelegramLink(''); }
        });
    }, [selectedBranchId]);

    // Fetch existing quantum link
    useEffect(() => {
        if (!selectedBranchId || !selectedYearId) return;
        const fetchLink = async () => {
            setLoading(true);
            try {
                const res = await api.get(`/quantum/${selectedBranchId}/${selectedYearId}`);
                if (res.data && res.data.telegramLink) {
                    setTelegramLink(res.data.telegramLink);
                } else {
                    setTelegramLink('');
                }
            } catch (err) {
                // It might 404 if not found, that's fine
                setTelegramLink('');
            } finally {
                setLoading(false);
            }
        };
        fetchLink();
    }, [selectedBranchId, selectedYearId]);

    const handleSave = async (e) => {
        e.preventDefault();
        if (!selectedBranchId || !selectedYearId || !telegramLink.trim()) return;

        setActionLoading(true);
        setError('');
        setMessage('');

        try {
            await api.post('/quantum', {
                branchId: selectedBranchId,
                yearId: selectedYearId,
                telegramLink
            });
            setMessage('Quantum Telegram link saved successfully!');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to save Quantum link');
        } finally {
            setActionLoading(false);
            setTimeout(() => setMessage(''), 3000);
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Manage Quantum Links</h1>
                    <p className="text-sm text-gray-500 mt-1">Set the Telegram channel URLs mapped to specific combinations.</p>
                </div>
            </div>

            {error && <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-md text-sm border border-red-200">{error}</div>}
            {message && <div className="mb-4 p-3 bg-green-50 text-green-700 rounded-md text-sm border border-green-200">{message}</div>}

            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm max-w-3xl">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Course</label>
                        <select value={selectedCourseId} onChange={e => setSelectedCourseId(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary outline-none">
                            {courses.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Branch</label>
                        <select value={selectedBranchId} onChange={e => setSelectedBranchId(e.target.value)} disabled={!branches.length} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary outline-none">
                            <option value="">{branches.length ? 'Select Branch' : 'No Branches'}</option>
                            {branches.map(b => <option key={b._id} value={b._id}>{b.name}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
                        <select value={selectedYearId} onChange={e => setSelectedYearId(e.target.value)} disabled={!years.length} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary outline-none">
                            <option value="">{years.length ? 'Select Year' : 'No Years'}</option>
                            {years.map(y => <option key={y._id} value={y._id}>Year {y.yearNumber}</option>)}
                        </select>
                    </div>
                </div>

                <div className="border-t border-gray-100 pt-6">
                    <form onSubmit={handleSave} className="flex flex-col gap-4">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-blue-50 text-primary rounded-full flex items-center justify-center shrink-0">
                                <Send size={24} />
                            </div>
                            <div className="flex-1">
                                <label className="block text-sm font-medium text-gray-900 mb-1">Telegram Link</label>
                                <input
                                    type="url"
                                    value={telegramLink}
                                    onChange={(e) => setTelegramLink(e.target.value)}
                                    placeholder="https://t.me/your_channel"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
                                    required
                                    disabled={loading || !selectedBranchId || !selectedYearId}
                                />
                            </div>
                        </div>
                        <div className="flex justify-end mt-2">
                            <Button type="submit" variant="primary" disabled={actionLoading || loading || !selectedBranchId || !selectedYearId}>
                                {actionLoading ? 'Saving...' : <><Save size={18} className="mr-2" /> Save Link</>}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default QuantumAdmin;
