import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { HeroSection } from './HeroSection';
import { QueueAndTimingSection } from './QueueAndTimingSection';
import { DoctorCrmSection } from './DoctorCrmSection';
import { QrWalkinSection } from './QrWalkinSection';
import { HowItWorksSection } from './HowItWorksSection';
import { DoctorCtaSection } from './DoctorCtaSection';

export const LandingPage: React.FC = () => {
  const location = useLocation();

  useEffect(() => {
    if (location.hash) {
      const id = location.hash.replace('#', '');
      const element = document.getElementById(id);
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      }
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [location.hash]);

  return (
    <div className="flex flex-col">
      <HeroSection />
      <HowItWorksSection />
      <QueueAndTimingSection />
      <DoctorCrmSection />
      <QrWalkinSection />
      <DoctorCtaSection />
    </div>
  );
};
