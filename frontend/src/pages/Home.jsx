import Layout from '../components/layout/Layout';
import RotatingBanner from '../components/home/RotatingBanner';
import IntroSection from '../components/home/IntroSection';
import CourseSection from '../components/home/CourseSection';
import PromoSection from '../components/home/PromoSection';
import ImportantSites from '../components/home/ImportantSites';
import SEO from '../components/SEO';

const Home = () => {
    return (
        <Layout>
            <SEO 
                title="AKTU PYQ | Latest AKTU Quantum, Notes & PYQs" 
                description="Your ultimate destination for the latest AKTU Quantum series, previous year question papers (PYQs), handwritten notes, and updated syllabus for B.Tech students."
                canonicalUrl="https://www.aktupyq.com/"
            />
            <RotatingBanner />
            <IntroSection />
            <CourseSection />
            <PromoSection />
            <ImportantSites />
        </Layout>
    );
};

export default Home;
