import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  GraduationCap,
  Sparkles,
  Calendar,
  Bookmark,
  Bell,
  User,
  ShieldAlert,
  LogOut,
  Menu,
  X,
  Compass,
  Layers,
  CheckCircle2,
  Bot
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, profile, isAdmin, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    setUserDropdownOpen(false);
    navigate('/');
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="sticky top-0 z-40 w-full glass-nav">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-500 text-white flex items-center justify-center shadow-md shadow-indigo-500/20 group-hover:scale-105 transition">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <span className="font-extrabold text-lg text-slate-900 tracking-tight flex items-center gap-1.5">
                Scholarship<span className="text-indigo-600">Finder</span>
              </span>
              <span className="block text-[10px] uppercase tracking-wider text-slate-400 font-semibold -mt-1">
                AI Financial Aid
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-1 text-sm font-semibold">
            <Link
              to="/scholarships"
              className={`px-3 py-2 rounded-lg transition ${
                isActive('/scholarships') ? 'text-indigo-600 bg-indigo-50/80' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
              }`}
            >
              Directory
            </Link>
            <Link
              to="/categories"
              className={`px-3 py-2 rounded-lg transition ${
                isActive('/categories') ? 'text-indigo-600 bg-indigo-50/80' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
              }`}
            >
              Categories
            </Link>
            <Link
              to="/eligibility-checker"
              className={`px-3 py-2 rounded-lg transition flex items-center gap-1.5 ${
                isActive('/eligibility-checker') ? 'text-indigo-600 bg-indigo-50/80' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
              }`}
            >
              <Sparkles className="w-4 h-4 text-indigo-500" />
              <span>AI Checker</span>
            </Link>
            <Link
              to="/deadlines"
              className={`px-3 py-2 rounded-lg transition flex items-center gap-1.5 ${
                isActive('/deadlines') ? 'text-indigo-600 bg-indigo-50/80' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
              }`}
            >
              <Calendar className="w-4 h-4 text-slate-400" />
              <span>Deadlines</span>
            </Link>
            <Link
              to="/ai-assistant"
              className={`px-3 py-2 rounded-lg transition flex items-center gap-1.5 ${
                isActive('/ai-assistant') ? 'text-indigo-600 bg-indigo-50/80' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
              }`}
            >
              <Bot className="w-4 h-4 text-teal-600" />
              <span>AI Assistant</span>
            </Link>
          </nav>

          {/* Right Header: User Controls */}
          <div className="flex items-center space-x-3">
            {user ? (
              <div className="flex items-center space-x-2">
                <Link
                  to="/saved-scholarships"
                  className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition"
                  title="Saved Scholarships"
                >
                  <Bookmark className="w-5 h-5" />
                </Link>
                <Link
                  to="/notifications"
                  className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition relative"
                  title="Notifications"
                >
                  <Bell className="w-5 h-5" />
                </Link>

                {/* Profile menu dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    className="flex items-center gap-2 p-1.5 rounded-xl border border-slate-200 hover:bg-slate-100 transition focus:outline-none"
                  >
                    <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white font-bold text-xs flex items-center justify-center">
                      {(profile?.full_name || user.email || 'U')[0].toUpperCase()}
                    </div>
                    <span className="hidden md:inline text-xs font-semibold text-slate-800 max-w-[120px] truncate">
                      {profile?.full_name || 'My Account'}
                    </span>
                  </button>

                  {userDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-56 rounded-xl bg-white shadow-xl border border-slate-200/80 py-1.5 z-50 text-xs font-medium">
                      <div className="px-4 py-2 border-b border-slate-100">
                        <p className="font-bold text-slate-900 truncate">{profile?.full_name || 'Student'}</p>
                        <p className="text-slate-500 text-[11px] truncate">{user.email}</p>
                        {isAdmin && (
                          <span className="inline-block mt-1 px-2 py-0.5 bg-purple-100 text-purple-700 font-bold text-[10px] rounded">
                            Administrator
                          </span>
                        )}
                      </div>

                      <Link
                        to="/dashboard"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 hover:bg-slate-50 text-slate-700"
                      >
                        <Compass className="w-4 h-4 text-indigo-500" />
                        <span>Student Dashboard</span>
                      </Link>
                      <Link
                        to="/profile"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 hover:bg-slate-50 text-slate-700"
                      >
                        <User className="w-4 h-4 text-slate-400" />
                        <span>My Profile</span>
                      </Link>
                      <Link
                        to="/recommendations"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 hover:bg-slate-50 text-slate-700"
                      >
                        <Sparkles className="w-4 h-4 text-amber-500" />
                        <span>Recommended for You</span>
                      </Link>
                      <Link
                        to="/settings"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 hover:bg-slate-50 text-slate-700"
                      >
                        <Layers className="w-4 h-4 text-slate-400" />
                        <span>Account Settings</span>
                      </Link>

                      {isAdmin && (
                        <Link
                          to="/admin"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2 px-4 py-2 hover:bg-purple-50 text-purple-700 font-bold border-t border-slate-100"
                        >
                          <ShieldAlert className="w-4 h-4 text-purple-600" />
                          <span>Admin Portal</span>
                        </Link>
                      )}

                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-4 py-2 hover:bg-red-50 text-red-600 border-t border-slate-100 text-left"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  to="/login"
                  className="px-3.5 py-2 text-xs font-semibold text-slate-700 hover:text-indigo-600 transition"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition"
                >
                  Create Account
                </Link>
              </div>
            )}

            {/* Mobile menu trigger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-2 text-sm font-semibold shadow-lg">
          <Link
            to="/scholarships"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-slate-700 hover:bg-slate-50"
          >
            Directory
          </Link>
          <Link
            to="/categories"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-slate-700 hover:bg-slate-50"
          >
            Categories
          </Link>
          <Link
            to="/eligibility-checker"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-slate-700 hover:bg-slate-50"
          >
            <Sparkles className="w-4 h-4 text-indigo-500" />
            <span>AI Eligibility Checker</span>
          </Link>
          <Link
            to="/deadlines"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-slate-700 hover:bg-slate-50"
          >
            <Calendar className="w-4 h-4 text-slate-400" />
            <span>Deadlines</span>
          </Link>
          <Link
            to="/ai-assistant"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-slate-700 hover:bg-slate-50"
          >
            <Bot className="w-4 h-4 text-teal-600" />
            <span>AI Assistant</span>
          </Link>

          {user && (
            <div className="pt-2 border-t border-slate-100">
              <Link
                to="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-slate-700 hover:bg-slate-50"
              >
                Dashboard
              </Link>
              <Link
                to="/recommendations"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-slate-700 hover:bg-slate-50"
              >
                Recommendations
              </Link>
              <Link
                to="/saved-scholarships"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-slate-700 hover:bg-slate-50"
              >
                Saved Scholarships
              </Link>
              <Link
                to="/profile"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-slate-700 hover:bg-slate-50"
              >
                Profile Settings
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
};
