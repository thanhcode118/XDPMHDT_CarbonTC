import React from 'react';

import HeroSection from '../components/home/HeroSection.jsx';
import StatsSection from '../components/home/StatsSection.jsx';
import FeaturesSection from '../components/home/FeaturesSection.jsx';
import UserTypesSection from '../components/home/UserTypesSection.jsx';
import CtaSection from '../components/home/CtaSection.jsx';

function HomePage() {
  return (
    <>
      <HeroSection />
      <StatsSection />
      <FeaturesSection />
      <UserTypesSection />
      <CtaSection />
    </>
  );
}

export default HomePage;