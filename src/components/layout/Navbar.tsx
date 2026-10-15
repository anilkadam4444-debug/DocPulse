import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, Stethoscope, ArrowRight } from 'lucide-react';
import { Button } from '../ui/Button';

export const Navbar: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const isCurrent = (path: string) => location.pathname === path;

  // Handle in-page smooth navigation whether on home or secondary route
  const handleSectionNav = (sectionId: string) => {
    setMobileMenuOpen(false);
    if (location.pathname === '/') {
      const el = document.getElementById(sectionId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
        window.history.pushState(null, '', `/#${sectionId}`);
      }
    } else {
      navigate(`/#${sectionId}`);
    }
  };

  // Close mobile drawer on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMobileMenuOpen(false);
      }
    };
    if (mobileMenuOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mobileMenuOpen]);

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Brand Wordmark (Single element) */}
        <Link
          to="/"
          className="flex items-center gap-2.5 text-slate-900 hover:opacity-90 transition-opacity whitespace-nowrap shrink-0"
        >
          <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center text-teal-400 shadow-xs">
            <Stethoscope className="w-4 h-4 text-teal-400 stroke-[2.2]" />
          </div>
          <span className="text-lg font-bold tracking-tight text-slate-900">
            DocPulse<span className="text-teal-600 font-semibold ml-0.5">.in</span>
          </span>
        </Link>

        {/* Zone 2: 4-5 single-line clean text navigation links */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-600">
          <Link
            to="/doctors"
            className={`transition-colors whitespace-nowrap shrink-0 ${
              isCurrent('/doctors') ? 'text-teal-600 font-semibold' : 'hover:text-slate-900'
            }`}
          >
            Find Doctors
          </Link>
          <button
            type="button"
            onClick={() => handleSectionNav('how-it-works')}
            className="hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 text-slate-600 text-sm font-medium bg-transparent cursor-pointer p-0"
          >
            How It Works
          </button>
          <button
            type="button"
            onClick={() => handleSectionNav('queue-tech')}
            className="hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 text-slate-600 text-sm font-medium bg-transparent cursor-pointer p-0"
          >
            Queue &amp; WhatsApp
          </button>
          <button
            type="button"
            onClick={() => handleSectionNav('doctor-crm')}
            className="hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 text-slate-600 text-sm font-medium bg-transparent cursor-pointer p-0"
          >
            Clinic CRM
          </button>
          <button
            type="button"
            onClick={() => handleSectionNav('walkin-qr')}
            className="hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 text-slate-600 text-sm font-medium bg-transparent cursor-pointer p-0"
          >
            Walk-In QR
          </button>
        </nav>

        {/* Zone 3: Primary Action CTA */}
        <div className="hidden sm:flex items-center gap-3 shrink-0">
          <Link to="/doctor/login">
            <Button variant="outline" size="sm" className="hidden lg:inline-flex">
              Doctor Sign In
            </Button>
          </Link>
          <Link to="/doctor/register">
            <Button variant="primary" size="sm" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
              Start Free Trial
            </Button>
          </Link>
        </div>

        {/* Mobile menu button */}
        <div className="flex md:hidden items-center gap-2">
          <Link to="/doctor/register">
            <Button variant="primary" size="sm">
              Free Trial
            </Button>
          </Link>
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-slate-600 hover:text-slate-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 rounded-lg"
            aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-200 bg-white px-4 pt-3 pb-6 space-y-3 shadow-lg">
          <div className="flex flex-col space-y-2 text-sm font-medium text-slate-700">
            <Link
              to="/doctors"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2 px-3 rounded-md hover:bg-slate-50 transition-colors"
            >
              Find Doctors (City Search)
            </Link>
            <button
              type="button"
              onClick={() => handleSectionNav('how-it-works')}
              className="py-2 px-3 rounded-md hover:bg-slate-50 transition-colors text-left"
            >
              How It Works
            </button>
            <button
              type="button"
              onClick={() => handleSectionNav('queue-tech')}
              className="py-2 px-3 rounded-md hover:bg-slate-50 transition-colors text-left"
            >
              Queue &amp; WhatsApp Estimates
            </button>
            <button
              type="button"
              onClick={() => handleSectionNav('doctor-crm')}
              className="py-2 px-3 rounded-md hover:bg-slate-50 transition-colors text-left"
            >
              Doctor CRM &amp; Assistant
            </button>
            <button
              type="button"
              onClick={() => handleSectionNav('walkin-qr')}
              className="py-2 px-3 rounded-md hover:bg-slate-50 transition-colors text-left"
            >
              Walk-In QR System
            </button>
          </div>

          <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
            <Link to="/doctor/login" onClick={() => setMobileMenuOpen(false)} className="w-full">
              <Button variant="outline" size="md" className="w-full justify-center">
                Doctor Sign In
              </Button>
            </Link>
            <Link
              to="/doctor/register"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full"
            >
              <Button variant="primary" size="md" className="w-full justify-center">
                Register Practice (1-Month Free Trial)
              </Button>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};
