import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Tag, Layers, AlertCircle } from 'lucide-react';
import { api } from '../../services/api';
import { ScholarshipCard } from '../../components/scholarship/ScholarshipCard';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import type { Scholarship, ScholarshipCategory } from '@scholarship-finder/shared';

export const CategoryDetailsPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();

  // Fetch categories to find the matching one
  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: () => api.getCategories(),
  });

  const category = (categories || []).find((c: ScholarshipCategory) => c.slug === slug);

  // Fetch scholarships for this category
  const { data: scholarshipsData, isLoading, isError } = useQuery({
    queryKey: ['scholarships-by-category', slug],
    queryFn: () => api.getScholarships({ category: slug }),
    enabled: !!slug,
  });

  const scholarships: Scholarship[] = scholarshipsData?.scholarships || [];
  const totalCount = scholarshipsData?.meta?.total || scholarships.length;

  return (
    <div className="container-custom py-8">
      {/* Back button */}
      <Link
        to="/categories"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-indigo-600 mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to All Categories
      </Link>

      {/* Header */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-8 shadow-sm mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200 mb-3">
          <Tag className="w-3.5 h-3.5" />
          Scholarship Domain
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          {category?.name || (slug ? slug.replace(/-/g, ' ').toUpperCase() : 'Category Opportunities')}
        </h1>
        <p className="text-slate-600 text-sm max-w-2xl mt-2 leading-relaxed">
          {category?.description || 'Browse all published and verified scholarship programs available under this academic category.'}
        </p>
      </div>

      {/* Results */}
      {isLoading ? (
        <div className="py-20 flex justify-center">
          <LoadingSpinner size="lg" />
        </div>
      ) : isError ? (
        <div className="p-8 text-center bg-red-50 border border-red-200 rounded-2xl text-red-700">
          <AlertCircle className="w-8 h-8 mx-auto mb-2 text-red-500" />
          <p className="font-bold">Failed to load scholarships for this category</p>
        </div>
      ) : scholarships.length > 0 ? (
        <div>
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              {totalCount} Opportunities Found
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {scholarships.map((scholarship: Scholarship) => (
              <ScholarshipCard key={scholarship.id} scholarship={scholarship} />
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center max-w-md mx-auto">
          <Layers className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">No Scholarships in this Category Yet</h3>
          <p className="text-xs text-slate-500 mt-1">
            New programs are reviewed and published weekly. Explore other scholarship categories.
          </p>
          <Link to="/categories" className="btn-primary text-xs px-4 py-2 rounded-xl mt-4 inline-block">
            Browse Other Categories
          </Link>
        </div>
      )}
    </div>
  );
};
