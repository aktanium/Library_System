import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const decodePayload = (): { sub?: string; role?: string } | null => {
  try {
    const token = localStorage.getItem('library_jwt_token');
    if (!token) return null;
    return JSON.parse(atob(token.split('.')[1]));
  } catch {
    return null;
  }
};

const deriveName = (email: string) =>
  email
    .split('@')[0]
    .split(/[.\-_]+/)
    .filter(Boolean)
    .map((p) => p[0].toUpperCase() + p.slice(1))
    .join(' ');

const getInitials = (name: string) =>
  name
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? '')
    .join('') || '?';

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  `text-sm font-medium px-3 py-2 rounded-lg transition-colors ${
    isActive ? 'bg-white/20 text-white' : 'text-white hover:bg-white/10'
  }`;

const HamburgerIcon = ({ open }: { open: boolean }) => (
  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    {open ? (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    ) : (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
    )}
  </svg>
);

const Navbar = () => {
  const { isAuthenticated, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const payload = decodePayload();
  const email = payload?.sub ?? '';
  const displayName = email ? deriveName(email) : '';
  const initials = getInitials(displayName);

  const userLinks = (
    <>
      <NavLink to="/books" onClick={() => setMobileOpen(false)} className={navLinkClass}>
        Books
      </NavLink>
      <NavLink to="/borrow" onClick={() => setMobileOpen(false)} className={navLinkClass}>
        My Borrowings
      </NavLink>
      <NavLink to="/profile" onClick={() => setMobileOpen(false)} className={navLinkClass}>
        Profile
      </NavLink>
    </>
  );

  const adminLinks = (
    <>
      <NavLink to="/admin/dashboard" onClick={() => setMobileOpen(false)} className={navLinkClass}>
        Dashboard
      </NavLink>
      <NavLink to="/admin/books" onClick={() => setMobileOpen(false)} className={navLinkClass}>
        Manage Books
      </NavLink>
      <NavLink to="/admin/users" onClick={() => setMobileOpen(false)} className={navLinkClass}>
        Users
      </NavLink>
      <NavLink to="/admin/borrows" onClick={() => setMobileOpen(false)} className={navLinkClass}>
        All Borrows
      </NavLink>
    </>
  );

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#1e3a5f] shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-3 text-white">
            <span className="text-lg font-bold tracking-tight">LibraryMS</span>
            <span className="hidden sm:inline-block h-5 w-px bg-white/30" aria-hidden="true" />
            <span className="hidden sm:inline-block text-xs uppercase tracking-wider text-slate-300">
              Management System
            </span>
          </Link>

          {isAuthenticated && (
            <div className="hidden md:flex items-center gap-1">
              {userLinks}
              {isAdmin && adminLinks}
            </div>
          )}

          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <>
                <button
                  type="button"
                  className="md:hidden text-white p-2 rounded-lg hover:bg-white/10 transition-colors"
                  onClick={() => setMobileOpen((o) => !o)}
                  aria-label="Toggle menu"
                  aria-expanded={mobileOpen}
                >
                  <HamburgerIcon open={mobileOpen} />
                </button>

                <div className="hidden sm:flex items-center gap-2">
                  <div className="w-9 h-9 rounded-full bg-[#2563eb] text-white text-sm font-semibold flex items-center justify-center">
                    {initials}
                  </div>
                  <span className="text-sm text-white max-w-[10rem] truncate">
                    {displayName || 'User'}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    logout();
                    navigate('/login');
                  }}
                  className="border border-white/30 text-white hover:bg-white/10 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-sm font-medium text-white hover:bg-white/10 px-3 py-2 rounded-lg transition-colors"
                >
                  Sign in
                </Link>
                <Link
                  to="/register"
                  className="text-sm font-semibold text-[#1e3a5f] bg-white hover:bg-slate-100 px-4 py-1.5 rounded-lg transition-colors"
                >
                  Sign up
                </Link>
              </>
            )}
          </div>
        </div>

        {isAuthenticated && mobileOpen && (
          <div className="md:hidden border-t border-white/10 py-2 flex flex-col gap-1">
            {userLinks}
            {isAdmin && adminLinks}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
