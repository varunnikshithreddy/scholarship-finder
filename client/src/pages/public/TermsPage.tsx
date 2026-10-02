import React from 'react';
import { Breadcrumbs } from '../../components/common/Breadcrumbs';

export const TermsPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <Breadcrumbs items={[{ label: 'Terms of Service' }]} />

      <div className="space-y-4">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Terms of Service & Disclaimer</h1>
        <p className="text-xs text-slate-500">Last updated: October 2026</p>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-8 text-xs text-slate-700 leading-relaxed space-y-6">
        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-900">1. Acceptance of Terms</h2>
          <p>
            By accessing and using Scholarship Finder, you acknowledge and agree to these Terms of Service. If you do not agree, please discontinue use of the platform.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-900">2. Advisory Nature of Information</h2>
          <p>
            Scholarship Finder is an independent educational discovery tool. While we make every reasonable effort to verify information against government gazettes and foundation circulars, scholarship rules, deadlines, and funding quotas may be updated by sponsoring organizations without prior notice.
          </p>
          <p className="font-bold text-slate-900">
            AI-generated eligibility assessments do NOT constitute an official decision or guarantee of funding. Students must verify requirements on official application portals.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-900">3. Official Application Links</h2>
          <p>
            Scholarship Finder provides direct links to official government and institutional portals (e.g. scholarships.gov.in). We never charge application fees, claim processing fees, or act as an intermediary for scholarship awards.
          </p>
        </section>
      </div>
    </div>
  );
};
