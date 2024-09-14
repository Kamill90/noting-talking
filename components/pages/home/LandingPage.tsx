'use client'

import React from 'react';
import Navbar from './Navbar';
import HeroSection from './HeroSection';
import Features from './Features';
import CTA from './CTA';
import Footer from './Footer';

const LandingPage: React.FC = () => {
    return (
        <div>
            <Navbar />
            <HeroSection />
            <Features />
            <CTA />
            <Footer />
        </div>
    );
};

export default LandingPage;