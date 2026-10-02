import React from 'react';
import { Breadcrumbs } from '../../components/common/Breadcrumbs';
import { ShieldCheck, Sparkles, Database, Users } from 'lucide-react';

export const AboutPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      <Breadcrumbs items={[{ label: 'About' }]} />

      <div className="space-y-4">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          About Scholarship Finder
        </h1>
        <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
          Scholarship Finder was built with a singular mission: to eliminate the confusion and fragmentation in student financial aid discovery across India.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-base text-slate-900">Verified Provenance</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Every record is traceable to official state gazettes, the National Scholarship Portal (NSP), or vetted philanthropic foundation circulars.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-3">
          <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
            <Sparkles className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-base text-slate-900">AI-Assisted Guidance</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            We use Google Gemini AI grounded strictly in factual scheme documentation to explain complex eligibility rules in plain language.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Database className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-base text-slate-900">Structured Data</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Eligibility requirements, dates, and document checklists are stored as normalized criteria to enable accurate automated matching.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-3">
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
            <Users className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-base text-slate-900">Student Privacy First</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            We do not share your private income or academic records with advertisers or third parties. Your data remains isolated with Row Level Security.
          </p>
        </div>
      </div>
    </div>
  );
};
