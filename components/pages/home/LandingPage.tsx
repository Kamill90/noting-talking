'use client';

import React from 'react';
import CTA from './CTA';
import Features from './Features';
import Footer from './Footer';
import HeroSection from './HeroSection';
import Navbar from './Navbar';

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
