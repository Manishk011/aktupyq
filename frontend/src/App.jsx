import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ScrollToTop from './components/common/ScrollToTop';
import Home from './pages/Home';
import BranchSelection from './pages/BranchSelection';
import YearSelection from './pages/YearSelection';
import MaterialPage from './pages/MaterialPage';

// Auth Components
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import AdminLogin from './pages/auth/AdminLogin';
import ProtectedRoute from './components/auth/ProtectedRoute';
import AdminRoute from './components/auth/AdminRoute';

// Admin Components
import AdminLayout from './components/admin/AdminLayout';
import Dashboard from './pages/admin/Dashboard';
import CurriculumAdmin from './pages/admin/CurriculumAdmin';
import MaterialsAdmin from './pages/admin/MaterialsAdmin';
import QuantumAdmin from './pages/admin/QuantumAdmin';
import ContactAdmin from './pages/admin/ContactAdmin';
import AboutUs from './pages/AboutUs';
import ContactUs from './pages/ContactUs';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsAndConditions from './pages/TermsAndConditions';

function App() {
    return (
        <>
            <ScrollToTop />
            <Routes>
                {/* Public Routes */}
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/admin/login" element={<AdminLogin />} />

                {/* Dynamic Course Routes */}
                <Route path="/course/:courseId" element={<BranchSelection />} />
                <Route path="/course/:courseId/:branchId" element={<YearSelection />} />
                <Route path="/course/:courseId/:branchId/:yearId" element={<MaterialPage />} />

                {/* Static Pages */}
                <Route path="/about" element={<AboutUs />} />
                <Route path="/contact" element={<ContactUs />} />
                <Route path="/privacy" element={<PrivacyPolicy />} />
                <Route path="/terms" element={<TermsAndConditions />} />

                {/* Student Protected Routes (Optional currently, but ready to use) */}
                {/* <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} /> */}

                {/* Admin Routes */}
                <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
                    <Route index element={<Navigate to="/admin/dashboard" replace />} />
                    <Route path="dashboard" element={<Dashboard />} />
                    <Route path="curriculum" element={<CurriculumAdmin />} />
                    <Route path="materials" element={<MaterialsAdmin />} />
                    <Route path="quantum" element={<QuantumAdmin />} />
                    <Route path="contacts" element={<ContactAdmin />} />
                </Route>

                {/* Fallback */}
                <Route path="*" element={
                    <div className="pt-32 pb-20 text-center min-h-screen bg-slate-50 flex items-center justify-center">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 mb-4">404 - Page Not Found</h1>
                            <p className="text-gray-600">We couldn't find the page you were looking for.</p>
                        </div>
                    </div>
                } />
            </Routes>
        </>
    );
}

export default App;
