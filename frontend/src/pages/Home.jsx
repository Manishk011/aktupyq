import React from 'react';
import Layout from '../components/layout/Layout';
import RotatingBanner from '../components/home/RotatingBanner';
import IntroSection from '../components/home/IntroSection';
import CourseSection from '../components/home/CourseSection';
import PromoSection from '../components/home/PromoSection';
import ImportantSites from '../components/home/ImportantSites';

const Home = () => {
    return (
        <Layout>
            <RotatingBanner />
            <IntroSection />
            <CourseSection />
            <PromoSection />
            <ImportantSites />
        </Layout>
    );
};

export default Home;
