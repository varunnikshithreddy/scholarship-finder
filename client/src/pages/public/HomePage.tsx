import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../services/api';
import { ScholarshipCard } from '../../components/scholarship/ScholarshipCard';
import { SkeletonGrid } from '../../components/common/SkeletonLoader';
import {
  Search,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  Award,
  HeartHandshake,
  Landmark,
  Cpu,
  GraduationCap
} from 'lucide-react';

export const HomePage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  const { data: latest, isLoading: latestLoading } = useQuery({
    queryKey: ['scholarships', 'latest'],
    queryFn: () => api.getLatestScholarships(6),
  });

  const { data: featured, isLoading: featuredLoading } = useQuery({
    queryKey: ['scholarships', 'featured'],
    queryFn: () => api.getFeaturedScholarships(3),
  });

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: () => api.getCategories(),
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/scholarships?search=${encodeURIComponent(searchTerm.trim())}`);
    }
  };

  const getCategoryIcon = (slug: string) => {
    switch (slug) {
      case 'merit-based': return <Award className="w-5 h-5 text-indigo-500" />;
      case 'need-based': return <HeartHandshake className="w-5 h-5 text-emerald-500" />;
      case 'government': return <Landmark className="w-5 h-5 text-amber-500" />;
      case 'stem-engineering': return <Cpu className="w-5 h-5 text-blue-500" />;
      case 'women-education': return <Sparkles className="w-5 h-5 text-pink-500" />;
      default: return <GraduationCap className="w-5 h-5 text-indigo-500" />;
    }
  };

  return (
    <div className="space-y-16 pb-16">
      {/* Hero Section */}
      <section className="relative gradient-hero text-white py-20 px-4 sm:px-6 lg:px-8 overflow-hidden rounded-b-[2.5rem] shadow-xl">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px]"></div>

        <div className="relative max-w-4xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-semibold text-indigo-200 border border-white/20">
            <Sparkles className="w-3.5 h-3.5 text-indigo-300" />
            <span>AI-Powered Verified Scholarship Discovery</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">
            Discover Real Financial Aid. <br className="hidden sm:inline" />
            <span className="text-teal-300">Verified & AI-Evaluated.</span>
          </h1>

          <p className="text-sm sm:text-base text-indigo-100 max-w-2xl mx-auto leading-relaxed">
            Stop searching across dozens of outdated portals. Access verified Central Government, State, AICTE, and premier Foundation scholarships with automated eligibility checking.
          </p>

          {/* Search bar */}
          <form onSubmit={handleSearch} className="max-w-2xl mx-auto pt-2">
            <div className="relative flex items-center bg-white rounded-2xl p-2 shadow-2xl">
              <Search className="w-5 h-5 text-slate-400 ml-3 shrink-0" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by scholarship title, course (Engineering, Medical), or provider..."
                className="w-full px-3 py-2 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none"
              />
              <button
                type="submit"
                className="px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm transition flex items-center gap-1.5 shadow-md shrink-0"
              >
                <span>Find Scholarships</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>

          {/* Quick tags */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-2 text-xs text-indigo-200">
            <span className="font-semibold text-white/80">Popular:</span>
            {['AICTE Pragati', 'PM-USP Central Sector', 'Infosys STEM Stars', 'Undergraduate'].map((tag, i) => (
              <button
                key={i}
                type="button"
                onClick={() => navigate(`/scholarships?search=${encodeURIComponent(tag)}`)}
                className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 transition text-[11px] font-medium"
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Scholarships Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600">Featured Opportunities</span>
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Prestigious Scholarships</h2>
          </div>
          <Link
            to="/scholarships"
            className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 group"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition" />
          </Link>
        </div>

        {featuredLoading ? (
          <SkeletonGrid count={3} />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featured?.map((s) => (
              <ScholarshipCard key={s.id} scholarship={s} />
            ))}
          </div>
        )}
      </section>

      {/* Browse by Category */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="text-center max-w-xl mx-auto space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600">Categorized Aid</span>
          <h2 className="text-2xl font-extrabold text-slate-900">Explore by Category</h2>
          <p className="text-xs text-slate-500">Filter through government programs, merit grants, or technical sponsorships</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {categories?.map((cat) => (
            <Link
              key={cat.id}
              to={`/scholarships?category=${cat.slug}`}
              className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:shadow-md hover:border-indigo-200 transition text-center flex flex-col items-center justify-center space-y-2 group"
            >
              <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center group-hover:bg-indigo-50 group-hover:scale-110 transition">
                {getCategoryIcon(cat.slug)}
              </div>
              <span className="text-xs font-bold text-slate-900 group-hover:text-indigo-600 transition">
                {cat.name}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Latest Published Scholarships */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600">Recently Published</span>
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Latest Announcements</h2>
          </div>
          <Link
            to="/scholarships?sort_by=latest"
            className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 group"
          >
            <span>See All Listings</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition" />
          </Link>
        </div>

        {latestLoading ? (
          <SkeletonGrid count={6} />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {latest?.map((s) => (
              <ScholarshipCard key={s.id} scholarship={s} />
            ))}
          </div>
        )}
      </section>

      {/* AI Eligibility Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-gradient-to-r from-indigo-900 via-indigo-800 to-teal-800 text-white p-8 sm:p-12 shadow-xl flex flex-col lg:flex-row items-center justify-between gap-8">
          <div className="space-y-4 max-w-xl">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-400/20 text-teal-300 text-xs font-bold border border-teal-400/30">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Instant AI Analysis</span>
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight leading-tight">
              Wondering if you qualify? Check your eligibility in seconds.
            </h2>
            <p className="text-xs sm:text-sm text-indigo-100 leading-relaxed">
              Our deterministic rules engine and Gemini AI compare your academic score, stream, and family income against verified scheme requirements to highlight matched criteria and missing documents.
            </p>
          </div>

          <div className="shrink-0 flex flex-col sm:flex-row items-center gap-3">
            <Link
              to="/eligibility-checker"
              className="px-6 py-3.5 rounded-xl bg-white text-indigo-950 font-bold text-xs sm:text-sm hover:bg-indigo-50 shadow-lg transition flex items-center gap-2"
            >
              <span>Launch Eligibility Checker</span>
              <ArrowRight className="w-4 h-4 text-indigo-600" />
            </Link>
            <Link
              to="/ai-assistant"
              className="px-5 py-3.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs sm:text-sm border border-white/20 transition"
            >
              Talk to AI Assistant
            </Link>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="text-center max-w-xl mx-auto space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600">Simple Process</span>
          <h2 className="text-2xl font-extrabold text-slate-900">How Scholarship Finder Works</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              step: '01',
              title: 'Discover & Search',
              desc: 'Browse verified central government, state, and foundation scholarships with transparent deadlines and verified official links.',
              icon: <Search className="w-6 h-6 text-indigo-600" />
            },
            {
              step: '02',
              title: 'Verify Eligibility',
              desc: 'Use our AI Checker to evaluate your marks, income, and course requirements against official gazette rules.',
              icon: <CheckCircle2 className="w-6 h-6 text-teal-600" />
            },
            {
              step: '03',
              title: 'Track & Apply',
              desc: 'Save scholarships to your dashboard, receive deadline alerts, and apply directly on the official government or foundation portal.',
              icon: <Calendar className="w-6 h-6 text-indigo-600" />
            }
          ].map((item, idx) => (
            <div key={idx} className="p-8 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-4">
              <div className="flex items-center justify-between">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  {item.icon}
                </div>
                <span className="text-2xl font-black text-slate-200">{item.step}</span>
              </div>
              <h3 className="font-bold text-base text-slate-900">{item.title}</h3>
              <p className="text-xs text-slate-500 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
