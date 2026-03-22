import React from 'react';
import { motion } from 'framer-motion';
import { ExternalLink, Globe } from 'lucide-react';

const SiteCard = ({ name, description, url }) => (
    <motion.a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="group block bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-gray-100 relative"
        whileHover={{ scale: 1.02 }}
    >
        <div className="h-40 bg-gray-100 relative overflow-hidden">
            {/* Fallback pattern while loading */}
            <div className="absolute inset-0 bg-slate-50 flex items-center justify-center">
                <Globe className="text-slate-200 animate-pulse" size={48} />
            </div>
            
            {/* Live Website Preview */}
            <iframe
                src={url}
                title={`${name} preview`}
                className="absolute top-0 left-0 w-[400%] h-[400%] origin-top-left scale-25 border-0 pointer-events-none opacity-80 group-hover:opacity-100 transition-opacity duration-500"
                scrolling="no"
                loading="lazy"
                tabIndex={-1}
            />
            
            {/* Overlay to ensure hover/click works and improve text legibility */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300" />
        </div>
        <div className="p-5 border-t border-gray-100">
            <div className="flex items-center justify-between mb-2">
                <h3 className="font-bold text-gray-900">{name}</h3>
                <ExternalLink size={16} className="text-gray-400 group-hover:text-primary transition-colors" />
            </div>
            <p className="text-sm text-gray-500">{description}</p>
        </div>
    </motion.a>
);

const ImportantSites = () => {
    const sites = [
        {
            name: 'AKTU Main Site',
            description: 'Official university notices and circulars.',
            url: 'https://aktu.ac.in',
        },
        {
            name: 'AKTU ERP',
            description: 'Student login, admit cards, and results.',
            url: 'https://erp.aktu.ac.in/login.aspx',
        },
        {
            name: 'UP Scholarship',
            description: 'Status check and application portal.',
            url: 'https://scholarship.up.gov.in',
        }
    ];

    return (
        <section className="py-20 bg-white">
            <div className="container mx-auto px-4 lg:px-8">
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold text-gray-900 mb-4">Important Websites</h2>
                    <p className="text-gray-600">Quick access to essential official portals.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {sites.map((site, index) => (
                        <SiteCard key={index} {...site} />
                    ))}
                </div>
            </div>
        </section>
    );
};

export default ImportantSites;
