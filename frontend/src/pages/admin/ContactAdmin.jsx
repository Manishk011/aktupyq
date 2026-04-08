import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, CheckCircle2, Trash2, Clock, Inbox, MailOpen } from 'lucide-react';
import { getAdminContacts, updateContactStatus, deleteContact } from '../../services/api';

const ContactAdmin = () => {
    const [contacts, setContacts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchContacts();
    }, []);

    const fetchContacts = async () => {
        try {
            setLoading(true);
            const data = await getAdminContacts();
            setContacts(data);
            setError(null);
        } catch (err) {
            console.error('Failed to fetch contacts:', err);
            setError('Failed to load messages. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleToggleRead = async (id, currentStatus) => {
        try {
            const newStatus = currentStatus === 'read' ? 'unread' : 'read';
            await updateContactStatus(id, newStatus);
            setContacts(contacts.map(c => 
                c._id === id ? { ...c, status: newStatus } : c
            ));
        } catch (err) {
            console.error('Failed to change status:', err);
            alert('Could not update message status');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this message?')) return;
        
        try {
            await deleteContact(id);
            setContacts(contacts.filter(c => c._id !== id));
        } catch (err) {
            console.error('Failed to delete contact:', err);
            alert('Could not delete message');
        }
    };

    const unreadCount = contacts.filter(c => c.status === 'unread').length;

    return (
        <div className="max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2 text-sm text-gray-500 mb-2 font-medium">
                        <Mail size={14} /> <span>Inbox</span>
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight flex items-center gap-3">
                        Messages 
                        {unreadCount > 0 && (
                            <span className="bg-blue-100 text-blue-700 text-sm py-1 px-3 rounded-full font-bold">
                                {unreadCount} new
                            </span>
                        )}
                    </h1>
                    <p className="text-gray-500 mt-1">Manage inquiries and feedback from the contact form.</p>
                </div>
            </div>

            {/* Content */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                {loading ? (
                    <div className="p-8 text-center text-gray-500 flex flex-col items-center justify-center min-h-[300px]">
                        <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
                        <p>Loading messages...</p>
                    </div>
                ) : error ? (
                    <div className="p-8 text-center text-red-500 flex flex-col items-center justify-center min-h-[300px]">
                        <p>{error}</p>
                        <button onClick={fetchContacts} className="mt-4 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100">
                            Try Again
                        </button>
                    </div>
                ) : contacts.length === 0 ? (
                    <div className="p-16 text-center text-gray-500 flex flex-col items-center justify-center min-h-[400px]">
                        <Inbox size={64} className="text-gray-300 mb-4" />
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Inbox Empty</h3>
                        <p>You have no messages at the moment.</p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-100">
                        <AnimatePresence>
                            {contacts.map((contact) => (
                                <motion.div 
                                    key={contact._id}
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className={`p-6 transition-colors hover:bg-slate-50 relative group ${contact.status === 'unread' ? 'bg-blue-50/30' : ''}`}
                                >
                                    {contact.status === 'unread' && (
                                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500"></div>
                                    )}
                                    <div className="flex flex-col md:flex-row gap-6">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <h3 className={`text-lg font-semibold ${contact.status === 'unread' ? 'text-gray-900' : 'text-gray-700'}`}>
                                                    {contact.name}
                                                </h3>
                                                <span className="text-sm text-gray-500">&lt;{contact.email}&gt;</span>
                                                <span className="text-xs text-gray-400 flex items-center gap-1 ml-auto">
                                                    <Clock size={12} />
                                                    {new Date(contact.createdAt).toLocaleString()}
                                                </span>
                                            </div>
                                            <h4 className="font-medium text-gray-900 mb-3">{contact.subject}</h4>
                                            <p className="text-gray-600 whitespace-pre-wrap text-sm leading-relaxed bg-white border border-gray-100 p-4 rounded-xl shadow-sm">
                                                {contact.message}
                                            </p>
                                        </div>
                                        
                                        <div className="flex flex-row md:flex-col justify-end md:justify-start gap-2 border-t md:border-t-0 md:border-l border-gray-100 pt-4 md:pt-0 md:pl-6 shrink-0">
                                            <button 
                                                onClick={() => handleToggleRead(contact._id, contact.status)}
                                                className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors w-full md:w-auto ${
                                                    contact.status === 'unread' 
                                                    ? 'bg-blue-100 text-blue-700 hover:bg-blue-200' 
                                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                                }`}
                                            >
                                                {contact.status === 'unread' ? (
                                                    <><CheckCircle2 size={16} /> Mark Read</>
                                                ) : (
                                                    <><MailOpen size={16} /> Mark Unread</>
                                                )}
                                            </button>
                                            <button 
                                                onClick={() => handleDelete(contact._id)}
                                                className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 transition-colors w-full md:w-auto"
                                            >
                                                <Trash2 size={16} /> Delete
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ContactAdmin;
