import Layout from '../components/Layout';
import Banner from '../components/pages/home/Banner';

const LandingPage = () => {
    return (
        <Layout isLandingPage={true}>
            <Banner />
            {/* Other landing page content */}
        </Layout>
    );
};

export default LandingPage;