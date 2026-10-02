import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../services/api';
import { Breadcrumbs } from '../../components/common/Breadcrumbs';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { Award, HeartHandshake, Landmark, Cpu, Sparkles, GraduationCap, ArrowRight } from 'lucide-react';

export const CategoriesPage: React.FC = () => {
  const { data: categories, isLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: () => api.getCategories(),
  });

  const getCategoryIcon = (slug: string) => {
    switch (slug) {
      case 'merit-based': return <Award className="w-8 h-8 text-indigo-500" />;
      case 'need-based': return <HeartHandshake className="w-8 h-8 text-emerald-500" />;
      case 'government': return <Landmark className="w-8 h-8 text-amber-500" />;
      case 'stem-engineering': return <Cpu className="w-8 h-8 text-blue-500" />;
      case 'women-education': return <Sparkles className="w-8 h-8 text-pink-500" />;
      default: return <GraduationCap className="w-8 h-8 text-indigo-500" />;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <Breadcrumbs items={[{ label: 'Scholarship Categories' }]} />

      <div className="text-center max-w-2xl mx-auto space-y-2">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Scholarship Funding Categories
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          Discover opportunities tailored by award criteria, sponsorship type, or field of academic study.
        </p>
      </div>

      {isLoading ? (
        <LoadingSpinner message="Loading categories..." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories?.map((cat) => (
            <Link
              key={cat.id}
              to={`/scholarships?category=${cat.slug}`}
              className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:shadow-md hover:border-indigo-300 transition flex flex-col justify-between group"
            >
              <div className="space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center group-hover:scale-105 group-hover:bg-indigo-50 transition">
                  {getCategoryIcon(cat.slug)}
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900 group-hover:text-indigo-600 transition">
                    {cat.name}
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed mt-1">
                    {cat.description || 'Verified scholarship opportunities tailored to your needs.'}
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-indigo-600 mt-4">
                <span>Browse Scholarships</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};
