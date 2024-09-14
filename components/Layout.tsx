import Header from './ui/Header';
import LandingHeader from './ui/LandingHeader';

const Layout = ({ isLandingPage, children }: { isLandingPage: boolean; children: React.ReactNode }) => {
    return (
        <div>
            {isLandingPage ? <LandingHeader /> : <Header />}
            {children}
        </div>
    );
};

export default Layout;