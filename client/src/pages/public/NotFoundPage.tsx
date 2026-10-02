import React from 'react';
import { Link } from 'react-router-dom';
import { HelpCircle, Home, Search } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-[70vh] flex items-center justify-center container-custom py-16">
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-12 text-center max-w-lg mx-auto">
        <div className="w-16 h-16 rounded-2xl bg-indigo-50 border border-indigo-200 text-indigo-600 flex items-center justify-center mx-auto mb-4">
          <HelpCircle className="w-8 h-8" />
        </div>

        <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">Error 404</span>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mt-1">Page Not Found</h1>
        <p className="text-slate-600 text-sm mt-3 leading-relaxed">
          The scholarship, directory page, or resource you are looking for might have been moved, expired, or does not exist.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            to="/"
            className="w-full sm:w-auto btn-primary text-sm px-5 py-2.5 rounded-xl inline-flex items-center justify-center gap-2"
          >
            <Home className="w-4 h-4" /> Go to Homepage
          </Link>
          <Link
            to="/scholarships"
            className="w-full sm:w-auto btn-secondary text-sm px-5 py-2.5 rounded-xl inline-flex items-center justify-center gap-2"
          >
            <Search className="w-4 h-4" /> Search Scholarships
          </Link>
        </div>
      </div>
    </div>
  );
};
