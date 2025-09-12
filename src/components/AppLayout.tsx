import React from 'react';
import { useAppContext } from '@/contexts/AppContext';
import { useIsMobile } from '@/hooks/use-mobile';
import Header from './Header';
import HeroSection from './HeroSection';
import SubjectsSection from './SubjectsSection';
import FeaturedTutors from './FeaturedTutors';
import ReviewsSection from './ReviewsSection';
import FeaturesSection from './FeaturesSection';
import CTASection from './CTASection';
import Footer from './Footer';

const AppLayout: React.FC = () => {
  const { sidebarOpen, toggleSidebar } = useAppContext();
  const isMobile = useIsMobile();

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <HeroSection />
      <SubjectsSection />
      <FeaturedTutors />
      <ReviewsSection />
      <FeaturesSection />
      <CTASection />
      <Footer />
    </div>
  );
};

export default AppLayout;
