import React from 'react';
import { Link } from 'react-router-dom';
import { GraduationCap, ShieldCheck, Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-slate-300 pt-16 pb-12 border-t border-slate-800 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          {/* Brand info */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-600/30">
                <GraduationCap className="w-5 h-5" />
              </div>
              <span className="font-extrabold text-lg text-white tracking-tight">
                Scholarship<span className="text-indigo-400">Finder</span>
              </span>
            </Link>
            <p className="text-xs text-slate-400 leading-relaxed">
              Empowering students across India with factual, verified scholarship information, AI-powered eligibility assessments, and timely deadline tracking.
            </p>
            <div className="flex items-center gap-2 text-xs text-emerald-400">
              <ShieldCheck className="w-4 h-4" />
              <span>Verified Government & Foundation Sources</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4">Discovery</h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link to="/scholarships" className="hover:text-indigo-400 transition">All Scholarships</Link>
              </li>
              <li>
                <Link to="/categories" className="hover:text-indigo-400 transition">Browse by Category</Link>
              </li>
              <li>
                <Link to="/eligibility-checker" className="hover:text-indigo-400 transition">AI Eligibility Checker</Link>
              </li>
              <li>
                <Link to="/deadlines" className="hover:text-indigo-400 transition">Application Deadlines</Link>
              </li>
              <li>
                <Link to="/ai-assistant" className="hover:text-indigo-400 transition">AI Financial Aid Assistant</Link>
              </li>
            </ul>
          </div>

          {/* Education Domains */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4">Education Levels</h4>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li>Undergraduate Programs (B.Tech, B.Sc, B.Com)</li>
              <li>Postgraduate & Master's Degrees</li>
              <li>STEM & Girls in Technology</li>
              <li>National Means-cum-Merit School Grants</li>
              <li>Doctoral & Research Fellowships</li>
            </ul>
          </div>

          {/* Legal & About */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4">Platform</h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link to="/about" className="hover:text-indigo-400 transition">About Scholarship Finder</Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-indigo-400 transition">Contact & Verification Support</Link>
              </li>
              <li>
                <Link to="/privacy" className="hover:text-indigo-400 transition">Student Privacy Policy</Link>
              </li>
              <li>
                <Link to="/terms" className="hover:text-indigo-400 transition">Terms of Service & Disclaimer</Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Advisory Disclaimer */}
        <div className="pt-8 border-t border-slate-800 text-center space-y-3">
          <p className="text-[11px] text-slate-500 max-w-4xl mx-auto leading-relaxed">
            <strong>Official Disclaimer:</strong> Scholarship Finder compiles and verifies data from official government gazettes, the National Scholarship Portal (NSP), AICTE, state welfare departments, and verified philanthropic trusts. AI eligibility determinations are advisory simulations to assist student planning and do not guarantee an award. Always confirm final requirements on the scholarship provider's official portal before applying.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 pt-4">
            <p>© {new Date().getFullYear()} Scholarship Finder Platform. All rights reserved.</p>
            <p className="flex items-center gap-1 mt-2 sm:mt-0">
              Built for students with <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500" />
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};
