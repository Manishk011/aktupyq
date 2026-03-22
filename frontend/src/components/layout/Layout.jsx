import React from 'react';
import Header from './Header';
import Footer from './Footer';

const Layout = ({ children }) => {
    return (
        <div className="min-h-screen flex flex-col pt-[115px] md:pt-[136px]">
            {/* Padding top accounts for fixed header height (mobile/desktop) */}
            <Header />
            <main className="flex-grow bg-slate-50">
                {children}
            </main>
            <Footer />
        </div>
    );
};

export default Layout;
