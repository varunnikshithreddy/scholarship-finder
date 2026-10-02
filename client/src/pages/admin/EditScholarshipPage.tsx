import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { ArrowLeft, Save, AlertCircle } from 'lucide-react';
import { api } from '../../services/api';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { EDUCATION_LEVELS, DISCIPLINES, ScholarshipProvider, ScholarshipCategory } from '@scholarship-finder/shared';

export const EditScholarshipPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: scholarship, isLoading: isLoadingScholarship } = useQuery({
    queryKey: ['scholarship', id],
    queryFn: () => api.getScholarshipById(id!),
    enabled: !!id,
  });

  const { data: providers } = useQuery({
    queryKey: ['providers'],
    queryFn: () => api.getProviders(),
  });

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: () => api.getCategories(),
  });

  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    provider_id: '',
    category_id: '',
    short_description: '',
    description: '',
    education_levels: [] as string[],
    disciplines: [] as string[],
    eligible_countries: ['India'],
    eligible_states: [] as string[],
    funding_amount: '',
    funding_currency: 'INR',
    funding_frequency: 'Annual',
    funding_coverage: '',
    application_start_date: '',
    application_deadline: '',
    official_source_url: '',
    official_application_url: '',
    status: 'draft',
    verification_status: 'unverified',
    is_featured: false,
  });

  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (scholarship) {
      setFormData({
        title: scholarship.title || '',
        slug: scholarship.slug || '',
        provider_id: scholarship.provider_id || '',
        category_id: scholarship.category_id || '',
        short_description: scholarship.short_description || '',
        description: scholarship.description || '',
        education_levels: scholarship.education_levels || [],
        disciplines: scholarship.disciplines || [],
        eligible_countries: scholarship.eligible_countries || ['India'],
        eligible_states: scholarship.eligible_states || [],
        funding_amount: scholarship.funding_amount?.toString() || '',
        funding_currency: scholarship.funding_currency || 'INR',
        funding_frequency: scholarship.funding_frequency || 'Annual',
        funding_coverage: scholarship.funding_coverage || '',
        application_start_date: scholarship.application_start_date || '',
        application_deadline: scholarship.application_deadline || '',
        official_source_url: scholarship.official_source_url || '',
        official_application_url: scholarship.official_application_url || '',
        status: scholarship.status || 'draft',
        verification_status: scholarship.verification_status || 'unverified',
        is_featured: scholarship.is_featured || false,
      });
    }
  }, [scholarship]);

  const updateMutation = useMutation({
    mutationFn: (payload: any) => api.updateScholarship(id!, payload),
    onSuccess: () => {
      navigate('/admin/scholarships');
    },
    onError: (err: any) => {
      setFormError(err?.response?.data?.error?.message || 'Failed to update scholarship');
    },
  });

  const handleToggleArrayItem = (field: 'education_levels' | 'disciplines' | 'eligible_states', item: string) => {
    setFormData((prev) => {
      const exists = prev[field].includes(item);
      return {
        ...prev,
        [field]: exists ? prev[field].filter((x) => x !== item) : [...prev[field], item],
      };
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const payload: any = {
      ...formData,
      funding_amount: formData.funding_amount ? parseFloat(formData.funding_amount) : null,
      application_start_date: formData.application_start_date || null,
      application_deadline: formData.application_deadline || null,
      official_application_url: formData.official_application_url || null,
    };

    updateMutation.mutate(payload);
  };

  if (isLoadingScholarship) {
    return (
      <div className="py-24 flex justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="container-custom py-8 max-w-4xl">
      <Link
        to="/admin/scholarships"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-indigo-600 mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Scholarships
      </Link>

      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Edit Scholarship</h1>
        <p className="text-slate-600 text-sm mt-1">
          Update criteria, official links, funding details, or publication lifecycle state.
        </p>
      </div>

      {formError && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-3 text-red-700 text-xs">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{formError}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Details */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 space-y-4">
          <h2 className="text-base font-bold text-slate-900">1. Basic Details</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">Scholarship Title *</label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">URL Slug</label>
              <input
                type="text"
                required
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Provider *</label>
              <select
                required
                value={formData.provider_id}
                onChange={(e) => setFormData({ ...formData, provider_id: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white"
              >
                {providers?.map((p: ScholarshipProvider) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white font-medium capitalize"
              >
                <option value="draft">Draft</option>
                <option value="pending_review">Pending Review</option>
                <option value="published">Published</option>
                <option value="archived">Archived</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Category</label>
              <select
                value={formData.category_id}
                onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white"
              >
                <option value="">Select Category</option>
                {categories?.map((c: ScholarshipCategory) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">Short Description</label>
              <input
                type="text"
                value={formData.short_description}
                onChange={(e) => setFormData({ ...formData, short_description: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">Full Description *</label>
              <textarea
                rows={4}
                required
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Education & Disciplines */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 space-y-4">
          <h2 className="text-base font-bold text-slate-900">2. Eligibility Scope</h2>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2">Education Levels</label>
            <div className="flex flex-wrap gap-2">
              {EDUCATION_LEVELS.map((lvl: string) => {
                const selected = formData.education_levels.includes(lvl);
                return (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => handleToggleArrayItem('education_levels', lvl)}
                    className={`px-3 py-1 rounded-lg text-xs font-medium border transition-colors ${
                      selected ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {lvl}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2">Disciplines</label>
            <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto pr-1">
              {DISCIPLINES.map((disc: string) => {
                const selected = formData.disciplines.includes(disc);
                return (
                  <button
                    key={disc}
                    type="button"
                    onClick={() => handleToggleArrayItem('disciplines', disc)}
                    className={`px-3 py-1 rounded-lg text-xs font-medium border transition-colors ${
                      selected ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {disc}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Funding & Deadlines */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 space-y-4">
          <h2 className="text-base font-bold text-slate-900">3. Funding & Deadlines</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Funding Amount (INR)</label>
              <input
                type="number"
                min="0"
                value={formData.funding_amount}
                onChange={(e) => setFormData({ ...formData, funding_amount: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Application Closing Deadline</label>
              <input
                type="date"
                value={formData.application_deadline}
                onChange={(e) => setFormData({ ...formData, application_deadline: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Provenance URLs */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 space-y-4">
          <h2 className="text-base font-bold text-slate-900">4. Official Links</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Official Source URL *</label>
              <input
                type="url"
                required
                value={formData.official_source_url}
                onChange={(e) => setFormData({ ...formData, official_source_url: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Official Application URL</label>
              <input
                type="url"
                value={formData.official_application_url}
                onChange={(e) => setFormData({ ...formData, official_application_url: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4">
          <Link to="/admin/scholarships" className="btn-secondary px-5 py-2.5 text-xs rounded-xl font-semibold">
            Cancel
          </Link>
          <button
            type="submit"
            disabled={updateMutation.isPending}
            className="btn-primary px-6 py-2.5 text-xs rounded-xl font-semibold inline-flex items-center gap-2 shadow-sm disabled:opacity-50"
          >
            {updateMutation.isPending ? <LoadingSpinner size="sm" /> : <Save className="w-4 h-4" />}
            Save Changes
          </button>
        </div>
      </form>
    </div>
  );
};
