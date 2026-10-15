import React from 'react';
import { Link } from 'react-router-dom';
import { Stethoscope, ArrowLeft, Search, Home } from 'lucide-react';
import { Button } from '../../components/ui/Button';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-[70vh] flex items-center justify-center py-16 px-4 sm:px-6 lg:px-8 bg-slate-50">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-teal-50 border border-teal-200 flex items-center justify-center mx-auto text-teal-700 shadow-xs">
          <Stethoscope className="w-8 h-8 stroke-[2]" />
        </div>

        <div className="space-y-2">
          <span className="text-xs font-bold uppercase tracking-widest text-teal-700 font-mono">
            Error 404 · Route Not Found
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Page Does Not Exist
          </h1>
          <p className="text-sm text-slate-600 leading-relaxed">
            The page or practice portal you are looking for does not exist or may have been relocated.
          </p>
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-200 text-xs text-slate-600 text-left space-y-2">
          <p className="font-semibold text-slate-900">Suggested destinations:</p>
          <ul className="space-y-1.5 pl-4 list-disc text-slate-600">
            <li>Find independent doctors across Indian cities</li>
            <li>Register your clinic for the 30-day free trial</li>
            <li>Doctor &amp; Assistant login portal</li>
          </ul>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link to="/" className="w-full sm:w-auto">
            <Button
              variant="primary"
              size="md"
              leftIcon={<Home className="w-4 h-4" />}
              className="w-full sm:w-auto justify-center"
            >
              Return Home
            </Button>
          </Link>
          <Link to="/doctors" className="w-full sm:w-auto">
            <Button
              variant="outline"
              size="md"
              leftIcon={<Search className="w-4 h-4" />}
              className="w-full sm:w-auto justify-center"
            >
              Search Doctors
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};
