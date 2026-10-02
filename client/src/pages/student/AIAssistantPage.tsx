import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Bot, Sparkles, BookOpen, HelpCircle, ShieldCheck } from 'lucide-react';
import { api } from '../../services/api';
import { AIChatWindow } from '../../components/assistant/AIChatWindow';
import type { Scholarship } from '@scholarship-finder/shared';

export const AIAssistantPage: React.FC = () => {
  const [selectedScholarshipId, setSelectedScholarshipId] = useState<string | undefined>(undefined);

  // Fetch scholarships for context selection
  const { data: scholarshipsData } = useQuery({
    queryKey: ['published-scholarships-picker'],
    queryFn: () => api.getScholarships({ page: 1, limit: 50 } as any),
  });

  const scholarships: Scholarship[] = scholarshipsData?.scholarships || [];
  const selectedScholarship = scholarships.find((s: Scholarship) => s.id === selectedScholarshipId);

  return (
    <div className="container-custom py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200 mb-2">
          <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
          Factual Sourced AI Assistant (Gemini 2.5)
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
          <Bot className="w-8 h-8 text-indigo-600" />
          AI Scholarship Assistant
        </h1>
        <p className="text-slate-600 text-sm max-w-3xl mt-1">
          Have questions about eligibility criteria, required documentation, renewal rules, or application steps? Ask our factual assistant trained on our verified database.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Chat Interface (Left 8 cols) */}
        <div className="lg:col-span-8">
          <AIChatWindow
            key={selectedScholarshipId || 'general'}
            initialScholarshipId={selectedScholarshipId}
          />
        </div>

        {/* Sidebar Controls & Guidelines (Right 4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Context Selector */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5">
            <h2 className="text-sm font-bold text-slate-900 mb-2 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-indigo-600" />
              Focus on a Specific Scholarship
            </h2>
            <p className="text-xs text-slate-500 mb-3">
              Optional: Select a scholarship to narrow down the AI's contextual knowledge base.
            </p>

            <select
              value={selectedScholarshipId || ''}
              onChange={(e) => setSelectedScholarshipId(e.target.value || undefined)}
              className="w-full text-xs font-medium py-2 px-3 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            >
              <option value="">General Inquiries (All Opportunities)</option>
              {scholarships.map((s: Scholarship) => (
                <option key={s.id} value={s.id}>
                  {s.title}
                </option>
              ))}
            </select>

            {selectedScholarship && (
              <div className="mt-3 p-2.5 bg-indigo-50/70 border border-indigo-100 rounded-xl text-xs text-indigo-900">
                <span className="font-semibold">Active Context:</span> {selectedScholarship.title}
              </div>
            )}
          </div>

          {/* Assistant Directives Card */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5 space-y-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-indigo-600" />
              What can the AI do?
            </h3>
            <ul className="text-xs text-slate-600 space-y-2 list-disc list-inside">
              <li>Clarify academic percentage and GPA requirements</li>
              <li>Break down required documents (income certificates, marksheets, bonafide)</li>
              <li>Explain difference between merit-based and need-cum-merit schemes</li>
              <li>Find which central or state government portals host official forms</li>
              <li>Highlight critical application closing deadlines</li>
            </ul>
          </div>

          {/* Accuracy & Integrity Badge */}
          <div className="bg-slate-50 rounded-2xl border border-slate-200 p-4 text-xs text-slate-600 flex items-start gap-2.5">
            <ShieldCheck className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-slate-800">Strict Factual Grounding</p>
              <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                The assistant only references verified database records and never fabricates deadlines or URLs. Official links are cited directly when available.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
