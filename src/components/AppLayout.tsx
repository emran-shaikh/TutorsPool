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
import { lazy, Suspense } from 'react';

const ExitIntentPopup = lazy(() => import('./ExitIntentPopup'));

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
      <Suspense fallback={null}>
        <ExitIntentPopup />
      </Suspense>
    </div>
  );
};

export default AppLayout;
