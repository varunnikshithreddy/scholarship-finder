import React, { useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { Navbar } from './components/common/Navbar';
import { Footer } from './components/common/Footer';

// Public Pages
import { HomePage } from './pages/public/HomePage';
import { ScholarshipDirectoryPage } from './pages/public/ScholarshipDirectoryPage';
import { ScholarshipDetailsPage } from './pages/public/ScholarshipDetailsPage';
import { CategoriesPage } from './pages/public/CategoriesPage';
import { CategoryDetailsPage } from './pages/public/CategoryDetailsPage';
import { AboutPage } from './pages/public/AboutPage';
import { ContactPage } from './pages/public/ContactPage';
import { PrivacyPage } from './pages/public/PrivacyPage';
import { TermsPage } from './pages/public/TermsPage';
import { NotFoundPage } from './pages/public/NotFoundPage';

// Auth Pages
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';

// Student Pages
import { DashboardPage } from './pages/student/DashboardPage';
import { ProfilePage } from './pages/student/ProfilePage';
import { EligibilityCheckerPage } from './pages/student/EligibilityCheckerPage';
import { RecommendationsPage } from './pages/student/RecommendationsPage';
import { SavedScholarshipsPage } from './pages/student/SavedScholarshipsPage';
import { DeadlineTrackerPage } from './pages/student/DeadlineTrackerPage';
import { AIAssistantPage } from './pages/student/AIAssistantPage';
import { NotificationsPage } from './pages/student/NotificationsPage';
import { SettingsPage } from './pages/student/SettingsPage';

// Admin Pages
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';
import { AdminScholarshipsPage } from './pages/admin/AdminScholarshipsPage';
import { CreateScholarshipPage } from './pages/admin/CreateScholarshipPage';
import { EditScholarshipPage } from './pages/admin/EditScholarshipPage';
import { AdminSourcesPage } from './pages/admin/AdminSourcesPage';
import { AdminReportsPage } from './pages/admin/AdminReportsPage';
import { AdminAuditLogsPage } from './pages/admin/AdminAuditLogsPage';

// Route Guards
import { ProtectedRoute } from './components/layout/ProtectedRoute';
import { AdminRoute } from './components/layout/AdminRoute';

// Scroll to top on navigation helper
const ScrollToTop: React.FC = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

export const App: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 selection:bg-indigo-500 selection:text-white">
      <ScrollToTop />
      <Navbar />

      <main className="flex-1">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/scholarships" element={<ScholarshipDirectoryPage />} />
          <Route path="/scholarships/:id" element={<ScholarshipDetailsPage />} />
          <Route path="/categories" element={<CategoriesPage />} />
          <Route path="/categories/:slug" element={<CategoryDetailsPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Authenticated Student Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/eligibility-checker"
            element={
              <ProtectedRoute>
                <EligibilityCheckerPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/recommendations"
            element={
              <ProtectedRoute>
                <RecommendationsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/saved-scholarships"
            element={
              <ProtectedRoute>
                <SavedScholarshipsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/deadlines"
            element={
              <ProtectedRoute>
                <DeadlineTrackerPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/ai-assistant"
            element={
              <ProtectedRoute>
                <AIAssistantPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/notifications"
            element={
              <ProtectedRoute>
                <NotificationsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <SettingsPage />
              </ProtectedRoute>
            }
          />

          {/* Admin Routes */}
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminDashboardPage />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/scholarships"
            element={
              <AdminRoute>
                <AdminScholarshipsPage />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/scholarships/new"
            element={
              <AdminRoute>
                <CreateScholarshipPage />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/scholarships/:id/edit"
            element={
              <AdminRoute>
                <EditScholarshipPage />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/sources"
            element={
              <AdminRoute>
                <AdminSourcesPage />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/reports"
            element={
              <AdminRoute>
                <AdminReportsPage />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/audit-logs"
            element={
              <AdminRoute>
                <AdminAuditLogsPage />
              </AdminRoute>
            }
          />

          {/* 404 Route */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>

      <Footer />
    </div>
  );
};

export default App;
