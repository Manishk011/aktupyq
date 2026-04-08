import React from 'react';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import SEO from '../components/SEO';

const TermsAndConditions = () => {
    return (
        <div className="min-h-screen bg-slate-50">
            <SEO
                title="Terms and Conditions — AKTU PYQ"
                description="Review the terms of service for AKTU PYQ. Understand how you can use our free study material platform, your responsibilities, and our content policies."
                canonicalUrl="https://www.aktupyq.com/terms"
            />
            <Header />
            <div className="pt-32 pb-12 container mx-auto px-4 lg:px-8 max-w-4xl">
                <div className="bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-gray-100">
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">Terms and Conditions</h1>
                    <p className="text-gray-500 mb-8 border-b border-gray-100 pb-8">Last updated: Option Date, 2026</p>
                    
                    <div className="space-y-8 text-gray-600">
                        <section>
                            <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Acceptance of Terms</h2>
                            <p className="leading-relaxed">
                                By accessing and using aktupyq (the "Website"), you agree to be bound by these Terms and Conditions. If you do not agree to these Terms, please do not use our website or services.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Educational Purposes Only</h2>
                            <p className="leading-relaxed">
                                The materials, questions, and notes provided on this website are for educational and informational purposes only. While we strive to provide accurate content, we do not guarantee the completeness or accuracy of any study material. These resources are intended to supplement, not replace, university-provided materials and official syllabi.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. User Accounts</h2>
                            <p className="leading-relaxed mb-4">If you create an account on our website, you are responsible for:</p>
                            <ul className="list-disc pl-6 space-y-2">
                                <li>Maintaining the confidentiality of your account and password.</li>
                                <li>Restricting access to your computer or device.</li>
                                <li>All activities that occur under your account.</li>
                                <li>Ensuring your account information is accurate and up-to-date.</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Intellectual Property</h2>
                            <p className="leading-relaxed">
                                The design, layout, and original content of this website are owned by aktupyq. However, past examination papers, syllabus documents, and other official university materials remain the property of Dr. A.P.J. Abdul Kalam Technical University (AKTU) or their respective copyright holders. We host these files purely for the convenience of students under fair use principles for educational purposes.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. User Contributions</h2>
                            <p className="leading-relaxed">
                                Users may optionally submit study materials. By submitting content, you grant us a non-exclusive, royalty-free license to host, display, and distribute that content. You warrant that you have the right to share the content you submit and that it does not violate any third-party copyrights or academic integrity policies.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Limitation of Liability</h2>
                            <p className="leading-relaxed">
                                In no event shall aktupyq, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your access to or use of or inability to access or use the Service.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Changes to Terms</h2>
                            <p className="leading-relaxed">
                                We reserve the right, at our sole discretion, to modify or replace these Terms at any time. We will try to provide at least 30 days' notice prior to any new terms taking effect.
                            </p>
                        </section>
                        
                        <section>
                            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Contact</h2>
                            <p className="leading-relaxed">
                                If you have any questions about these Terms, please contact us at <a href="mailto:legal@aktupyq.com" className="text-blue-600 hover:underline">legal@aktupyq.com</a>.
                            </p>
                        </section>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default TermsAndConditions;
