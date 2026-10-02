"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ELIGIBILITY_STATUS_LABELS = exports.APPLICATION_STATUS_LABELS = exports.INDIAN_STATES = exports.DISCIPLINES = exports.EDUCATION_LEVELS = void 0;
exports.EDUCATION_LEVELS = [
    'School',
    'Secondary',
    'Higher Secondary',
    'Diploma',
    'Undergraduate',
    'Postgraduate',
    'Doctoral',
    'Vocational'
];
exports.DISCIPLINES = [
    'Computer Science',
    'Information Technology',
    'Artificial Intelligence',
    'Data Science',
    'Engineering',
    'Medical Sciences',
    'Nursing',
    'Pharmacy',
    'Agriculture',
    'Business Administration',
    'Commerce',
    'Economics',
    'Law',
    'Humanities',
    'Social Sciences',
    'Arts and Design',
    'Natural Sciences',
    'Mathematics',
    'Environmental Studies',
    'Education',
    'Other disciplines'
];
exports.INDIAN_STATES = [
    'Andhra Pradesh',
    'Arunachal Pradesh',
    'Assam',
    'Bihar',
    'Chhattisgarh',
    'Goa',
    'Gujarat',
    'Haryana',
    'Himachal Pradesh',
    'Jharkhand',
    'Karnataka',
    'Kerala',
    'Madhya Pradesh',
    'Maharashtra',
    'Manipur',
    'Meghalaya',
    'Mizoram',
    'Nagaland',
    'Odisha',
    'Punjab',
    'Rajasthan',
    'Sikkim',
    'Tamil Nadu',
    'Telangana',
    'Tripura',
    'Uttar Pradesh',
    'Uttarakhand',
    'West Bengal',
    'Delhi',
    'Jammu and Kashmir',
    'Ladakh',
    'Puducherry',
    'Chandigarh'
];
exports.APPLICATION_STATUS_LABELS = {
    interested: { label: 'Interested', color: 'bg-blue-100 text-blue-800' },
    planning_to_apply: { label: 'Planning to Apply', color: 'bg-amber-100 text-amber-800' },
    in_progress: { label: 'Application in Progress', color: 'bg-purple-100 text-purple-800' },
    submitted: { label: 'Submitted', color: 'bg-indigo-100 text-indigo-800' },
    awarded: { label: 'Awarded', color: 'bg-emerald-100 text-emerald-800' },
    not_selected: { label: 'Not Selected', color: 'bg-rose-100 text-rose-800' },
    no_longer_interested: { label: 'No Longer Interested', color: 'bg-gray-100 text-gray-800' }
};
exports.ELIGIBILITY_STATUS_LABELS = {
    likely_eligible: {
        label: 'Likely Eligible',
        badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-300',
        description: 'Your profile satisfies the primary documented eligibility criteria.'
    },
    potentially_eligible: {
        label: 'Potentially Eligible',
        badgeClass: 'bg-blue-50 text-blue-700 border-blue-300',
        description: 'Your profile matches key requirements, but some details need confirmation.'
    },
    likely_ineligible: {
        label: 'Likely Ineligible',
        badgeClass: 'bg-rose-50 text-rose-700 border-rose-300',
        description: 'One or more mandatory documented criteria do not match your current profile.'
    },
    insufficient_information: {
        label: 'Insufficient Information',
        badgeClass: 'bg-amber-50 text-amber-700 border-amber-300',
        description: 'Important profile information is missing to evaluate eligibility accurately.'
    }
};
