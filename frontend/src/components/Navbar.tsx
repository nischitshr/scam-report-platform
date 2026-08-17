import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { AlertTriangle } from 'lucide-react';

export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
    setMenuOpen(false);
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 font-bold text-lg text-gray-900 hover:text-[#E03535] transition-colors">
          <AlertTriangle className="w-5 h-5" />
          <span>ScamAlert</span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-1">
          <Link
            to="/"
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${isActive('/') ? 'bg-red-50 text-[#E03535]' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'}`}
          >
            Browse Scams
          </Link>
          {isAuthenticated && (
            <Link
              to="/report"
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${isActive('/report') ? 'bg-red-50 text-[#E03535]' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'}`}
            >
              Report a Scam
            </Link>
          )}
          {isAuthenticated && user?.is_admin && (
            <Link
              to="/admin"
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${isActive('/admin') ? 'bg-red-50 text-[#E03535]' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'}`}
            >
              Admin Panel
            </Link>
          )}
        </div>

        {/* Desktop auth */}
        <div className="hidden md:flex items-center gap-3">
          {isAuthenticated ? (
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-600">
                Hi, <span className="font-semibold text-gray-800">{user?.username}</span>
                {user?.is_admin && (
                  <span className="ml-1 text-xs bg-red-100 text-[#E03535] px-1.5 py-0.5 rounded font-medium">Admin</span>
                )}
              </span>
              <button
                onClick={handleLogout}
                className="text-sm text-gray-500 hover:text-red-600 transition-colors font-medium"
              >
                Sign out
              </button>
              <Link
                to="/report"
                className="bg-[#E03535] text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
              >
                + Report
              </Link>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/login" className="text-sm text-gray-600 hover:text-gray-900 font-medium px-3 py-2">
                Sign in
              </Link>
              <Link
                to="/signup"
                className="bg-[#E03535] text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
              >
                Sign up
              </Link>
            </div>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          <div className="w-5 h-0.5 bg-current mb-1 transition-all" style={{ transform: menuOpen ? 'rotate(45deg) translate(2px, 6px)' : '' }} />
          <div className="w-5 h-0.5 bg-current mb-1 transition-all" style={{ opacity: menuOpen ? 0 : 1 }} />
          <div className="w-5 h-0.5 bg-current transition-all" style={{ transform: menuOpen ? 'rotate(-45deg) translate(2px, -6px)' : '' }} />
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white px-4 pb-4 pt-2 flex flex-col gap-2">
          <Link to="/" className="px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg" onClick={() => setMenuOpen(false)}>Browse Scams</Link>
          {isAuthenticated && (
            <Link to="/report" className="px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg" onClick={() => setMenuOpen(false)}>Report a Scam</Link>
          )}
          {isAuthenticated && user?.is_admin && (
            <Link to="/admin" className="px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg" onClick={() => setMenuOpen(false)}>Admin Panel</Link>
          )}
          {isAuthenticated ? (
            <button onClick={handleLogout} className="text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg font-medium">Sign out</button>
          ) : (
            <>
              <Link to="/login" className="px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg" onClick={() => setMenuOpen(false)}>Sign in</Link>
              <Link to="/signup" className="px-3 py-2 text-sm bg-[#E03535] text-white rounded-lg text-center font-medium" onClick={() => setMenuOpen(false)}>Sign up</Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
