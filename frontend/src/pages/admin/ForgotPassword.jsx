import React, { useState } from 'react';
import { forgotPassword } from '../../services/api';
import { Mail, CheckCircle, AlertCircle, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState({ type: '', message: '' });
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus({ type: '', message: '' });

        try {
            setIsLoading(true);
            await forgotPassword(email);
            setStatus({ type: 'success', message: 'If an account with that email exists, we sent a password reset link.' });
        } catch (error) {
            setStatus({
                type: 'error',
                message: error.response?.data?.message || 'An error occurred. Please try again.'
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            <div className="max-w-md w-full">
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center text-white mx-auto mb-4 shadow-lg shadow-blue-500/30">
                        <Mail size={32} />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">aktupyq Admin</h1>
                    <p className="text-gray-500">Security Access Portal</p>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-8">
                        <div className="mb-6">
                            <h2 className="text-xl font-bold text-gray-900">Forgot Password</h2>
                            <p className="text-sm text-gray-500 mt-1">Enter your email address and we'll send you a link to reset your password.</p>
                        </div>

                        {status.message && (
                            <div className={`p-4 rounded-xl mb-6 flex items-start gap-3 ${
                                status.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                            }`}>
                                {status.type === 'success' ? <CheckCircle size={20} className="mt-0.5 shrink-0" /> : <AlertCircle size={20} className="mt-0.5 shrink-0" />}
                                <p className="text-sm">{status.message}</p>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium text-gray-700" htmlFor="email">Email Address</label>
                                <input
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="admin@aktupyq.com"
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                    required
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full bg-primary hover:bg-blue-700 text-white font-medium py-3 rounded-xl transition-colors mt-2 flex items-center justify-center gap-2 disabled:bg-blue-400"
                            >
                                {isLoading ? (
                                    <>
                                        <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                                        Sending Link...
                                    </>
                                ) : 'Send Reset Link'}
                            </button>
                        </form>
                        
                        <div className="mt-6 text-center">
                            <Link to="/admin/login" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-primary font-medium transition-colors">
                                <ArrowLeft size={16} />
                                Back to Login
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;
