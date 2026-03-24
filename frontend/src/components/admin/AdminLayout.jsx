import React, { useState, useEffect } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LayoutDashboard, BookOpen, Layers, Calendar, FileText, Link as LinkIcon, LogOut, Mail, Key } from 'lucide-react';
import { getUnreadContactCount } from '../../services/api';

const AdminLayout = () => {
    const { logout, user } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [unreadCount, setUnreadCount] = useState(0);

    useEffect(() => {
        const fetchUnreadCount = async () => {
            try {
                const data = await getUnreadContactCount();
                setUnreadCount(data.count);
            } catch (error) {
                console.error('Failed to fetch unread count:', error);
            }
        };

        // Fetch immediately
        // Only fetch if logged in
        if (user) {
            fetchUnreadCount();
            
            // Poll every 30 seconds
            const interval = setInterval(fetchUnreadCount, 30000);
            return () => clearInterval(interval);
        }
    }, [user]);

    const handleLogout = () => {
        logout();
        navigate('/admin/login');
    };

    const navItems = [
        { path: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
        { path: '/admin/curriculum', icon: Layers, label: 'Curriculum' },
        { path: '/admin/materials', icon: FileText, label: 'Materials' },
        { path: '/admin/quantum', icon: LinkIcon, label: 'Quantum Links' },
        { path: '/admin/contacts', icon: Mail, label: 'Messages' },
        { path: '/admin/change-password', icon: Key, label: 'Change Password' },
    ];

    return (
        <div className="min-h-screen bg-slate-50 flex">
            {/* Sidebar */}
            <aside className="w-64 bg-gray-900 text-white flex flex-col hidden md:flex">
                <div className="p-6 border-b border-gray-800">
                    <h2 className="text-2xl font-bold tracking-tight text-white">Admin Panel</h2>
                    <p className="text-sm text-gray-400 mt-1">aktupyq Management</p>
                </div>
                <nav className="flex-1 px-4 py-6 space-y-1">
                    {navItems.map((item) => {
                        const isActive = location.pathname.startsWith(item.path);
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                                    }`}
                            >
                                <item.icon size={20} />
                                <span className="font-medium flex-1">{item.label}</span>
                                {item.label === 'Messages' && unreadCount > 0 && (
                                    <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                                        {unreadCount}
                                    </span>
                                )}
                            </Link>
                        );
                    })}
                </nav>
                <div className="p-4 border-t border-gray-800">
                    <div className="flex items-center gap-3 px-4 py-3">
                        <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center">
                            <span className="font-bold text-sm uppercase">{user?.name?.charAt(0) || 'A'}</span>
                        </div>
                        <div className="flex-1 truncate">
                            <p className="text-sm font-medium">{user?.name}</p>
                            <p className="text-xs text-gray-400 truncate">{user?.email}</p>
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="mt-2 flex items-center gap-3 w-full px-4 py-3 text-red-400 hover:bg-gray-800 hover:text-red-300 rounded-lg transition-colors"
                    >
                        <LogOut size={20} />
                        <span className="font-medium">Logout</span>
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Mobile Header (optional - omitted for brevity) */}
                <header className="bg-white border-b border-gray-200 shadow-sm h-16 flex items-center px-8 md:hidden justify-between">
                    <h2 className="text-xl font-bold text-gray-900">Admin Panel</h2>
                    <button onClick={handleLogout} className="text-red-500"><LogOut size={24} /></button>
                </header>

                {/* Page Content */}
                <main className="flex-1 p-8 overflow-y-auto">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;
