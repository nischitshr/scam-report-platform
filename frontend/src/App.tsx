import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import ReportFormPage from './pages/ReportFormPage';
import ReportDetailsPage from './pages/ReportDetailsPage';
import AdminReviewPage from './pages/AdminReviewPage';
import { Search } from 'lucide-react';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3500,
            style: { borderRadius: '12px', fontSize: '14px', fontWeight: 500 },
            success: { iconTheme: { primary: '#22c55e', secondary: '#fff' } },
            error: { iconTheme: { primary: '#E03535', secondary: '#fff' } },
          }}
        />
        <Navbar />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/reports/:id" element={<ReportDetailsPage />} />
          <Route
            path="/report"
            element={
              <ProtectedRoute>
                <ReportFormPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <ProtectedRoute adminOnly>
                <AdminReviewPage />
              </ProtectedRoute>
            }
          />
          {/* 404 */}
          <Route
            path="*"
            element={
              <div className="min-h-screen bg-[#F7F6F2] flex items-center justify-center px-4">
                <div className="text-center">
                  <Search className="mx-auto h-14 w-14 text-gray-300 mb-4" />
                  <h1 className="text-2xl font-bold text-gray-900 mb-2">Page not found</h1>
                  <p className="text-gray-500 mb-6">The page you're looking for doesn't exist.</p>
                  <a href="/" className="bg-[#E03535] text-white font-semibold px-5 py-2.5 rounded-xl hover:bg-red-700 transition-colors">
                    Back to home
                  </a>
                </div>
              </div>
            }
          />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
