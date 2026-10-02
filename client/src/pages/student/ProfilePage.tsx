import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../services/api';
import { Breadcrumbs } from '../../components/common/Breadcrumbs';
import {
  EDUCATION_LEVELS,
  DISCIPLINES,
  INDIAN_STATES,
  UserProfileInput
} from '@scholarship-finder/shared';
import { User, GraduationCap, DollarSign, CheckCircle2, Loader2, AlertCircle } from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const { profile, refreshProfile } = useAuth();
  const [formData, setFormData] = useState<UserProfileInput>({});
  const [loading, setLoading] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (profile) {
      setFormData({
        full_name: profile.full_name || '',
        country: profile.country || 'India',
        state: profile.state || '',
        nationality: profile.nationality || 'Indian',
        date_of_birth: profile.date_of_birth || '',
        education_level: profile.education_level || '',
        course: profile.course || '',
        discipline: profile.discipline || '',
        institution: profile.institution || '',
        institution_type: profile.institution_type || '',
        academic_year: profile.academic_year || '',
        academic_score: profile.academic_score ?? undefined,
        grading_scale: profile.grading_scale || 'percentage',
        expected_graduation_year: profile.expected_graduation_year ?? undefined,
        annual_family_income: profile.annual_family_income ?? undefined,
        income_currency: profile.income_currency || 'INR',
      });
    }
  }, [profile]);

  const handleChange = (field: keyof UserProfileInput, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(null);
    setSavedSuccess(false);

    try {
      await api.updateMyProfile(formData);
      await refreshProfile();
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <Breadcrumbs items={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Student Profile' }]} />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Student Educational Profile
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Keep your academic scores and qualification details updated for accurate eligibility matching.
          </p>
        </div>

        {profile?.profile_completed && (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 self-start sm:self-center">
            <CheckCircle2 className="w-4 h-4" />
            <span>Profile Verified</span>
          </span>
        )}
      </div>

      {savedSuccess && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-800 flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>Your student profile has been saved successfully! Eligibility matching is updated.</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-xs font-bold text-red-700 flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Personal Details */}
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-8 space-y-6">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
            <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900">Personal Information</h3>
              <p className="text-xs text-slate-500">Demographic details for domicile and state scheme validation</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-semibold">
            <div>
              <label className="block text-slate-700 mb-1">Full Legal Name</label>
              <input
                type="text"
                required
                value={formData.full_name || ''}
                onChange={(e) => handleChange('full_name', e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-slate-700 mb-1">Date of Birth</label>
              <input
                type="date"
                value={formData.date_of_birth || ''}
                onChange={(e) => handleChange('date_of_birth', e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-slate-700 mb-1">State of Residence / Domicile</label>
              <select
                value={formData.state || ''}
                onChange={(e) => handleChange('state', e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Select State / UT</option>
                {INDIAN_STATES.map((st) => (
                  <option key={st} value={st}>{st}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-700 mb-1">Nationality</label>
              <input
                type="text"
                value={formData.nationality || 'Indian'}
                onChange={(e) => handleChange('nationality', e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* Academic Details */}
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-8 space-y-6">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
            <div className="p-2 rounded-xl bg-teal-50 text-teal-600">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900">Academic Background</h3>
              <p className="text-xs text-slate-500">Qualification, marks, and discipline details</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-semibold">
            <div>
              <label className="block text-slate-700 mb-1">Current Education Level</label>
              <select
                required
                value={formData.education_level || ''}
                onChange={(e) => handleChange('education_level', e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Select Level</option>
                {EDUCATION_LEVELS.map((lvl) => (
                  <option key={lvl} value={lvl}>{lvl}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-700 mb-1">Discipline / Academic Stream</label>
              <select
                required
                value={formData.discipline || ''}
                onChange={(e) => handleChange('discipline', e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Select Stream</option>
                {DISCIPLINES.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-700 mb-1">Course / Degree Name</label>
              <input
                type="text"
                value={formData.course || ''}
                onChange={(e) => handleChange('course', e.target.value)}
                placeholder="e.g. B.Tech Computer Science, MBBS, B.Com"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-slate-700 mb-1">Qualifying Examination Percentage / Score</label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="100"
                value={formData.academic_score ?? ''}
                onChange={(e) => handleChange('academic_score', e.target.value ? Number(e.target.value) : undefined)}
                placeholder="e.g. 85.5"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-slate-700 mb-1">College / University / School Name</label>
              <input
                type="text"
                value={formData.institution || ''}
                onChange={(e) => handleChange('institution', e.target.value)}
                placeholder="Name of your institution"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-slate-700 mb-1">Expected Year of Graduation</label>
              <input
                type="number"
                min="2020"
                max="2035"
                value={formData.expected_graduation_year ?? ''}
                onChange={(e) => handleChange('expected_graduation_year', e.target.value ? Number(e.target.value) : undefined)}
                placeholder="e.g. 2027"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* Financial Information */}
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-8 space-y-6">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
            <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900">Financial Information</h3>
              <p className="text-xs text-slate-500">Used strictly to evaluate need-based and means-cum-merit income ceilings</p>
            </div>
          </div>

          <div className="max-w-md space-y-2 text-xs font-semibold">
            <label className="block text-slate-700">Gross Annual Household Income (INR)</label>
            <div className="relative">
              <span className="absolute left-3.5 top-2.5 text-slate-400 font-bold">₹</span>
              <input
                type="number"
                min="0"
                value={formData.annual_family_income ?? ''}
                onChange={(e) => handleChange('annual_family_income', e.target.value ? Number(e.target.value) : undefined)}
                placeholder="e.g. 350000"
                className="w-full pl-8 pr-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 font-bold text-slate-900"
              />
            </div>
            <p className="text-[11px] text-slate-400 font-normal leading-relaxed">
              Note: Income criteria for Central Schemes typically range up to ₹4.5 Lakh to ₹8 Lakh per annum.
            </p>
          </div>
        </div>

        {/* Submit Bar */}
        <div className="flex justify-end gap-3 pt-2">
          <button
            type="submit"
            disabled={loading}
            className="px-8 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm shadow-md transition flex items-center gap-2 disabled:opacity-50"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            <span>Save Profile Information</span>
          </button>
        </div>
      </form>
    </div>
  );
};
