import React from 'react';
import { Breadcrumbs } from '../../components/common/Breadcrumbs';

export const PrivacyPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <Breadcrumbs items={[{ label: 'Privacy Policy' }]} />

      <div className="space-y-4">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Privacy Policy</h1>
        <p className="text-xs text-slate-500">Last updated: October 2026</p>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-8 text-xs text-slate-700 leading-relaxed space-y-6">
        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-900">1. Information We Collect</h2>
          <p>
            When you register on Scholarship Finder, we collect your name, email address, and authentication credentials. When you complete your student profile, you may optionally provide academic scores, family income bracket, state of residence, and field of study solely to evaluate scholarship eligibility.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-900">2. How Information is Used</h2>
          <p>
            Profile details are processed through deterministic matching logic to identify relevant scholarships and highlight unfulfilled criteria. We do not sell, rent, or monetize student demographic information to commercial advertisers or credit providers.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-900">3. Artificial Intelligence Processing</h2>
          <p>
            When using our AI Assistant or Eligibility Checker, only anonymized academic parameters (such as degree level and score percentile) are passed to Google Gemini models to generate explanatory summaries. Personal identifiers such as passwords, addresses, or phone numbers are never transmitted to AI endpoints.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-900">4. Data Deletion Rights</h2>
          <p>
            You have full control over your data. You may update or delete your profile and account at any time through the Account Settings dashboard. Account deletion permanently removes your profile, saved scholarships, and assessment history.
          </p>
        </section>
      </div>
    </div>
  );
};
