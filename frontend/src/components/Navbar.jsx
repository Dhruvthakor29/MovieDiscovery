import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AuthModal from './AuthModal';

const NAV_LINKS = [
  { label: 'Home', path: '/' },
  { label: 'Popular', path: '/popular' },
  { label: 'Top Rated', path: '/top-rated' },
  { label: 'Watchlist', path: '/watchlist', protected: true },
  { label: 'Favourites', path: '/favourites', protected: true },
];

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showAuth, setShowAuth] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const handleNavClick = (link) => {
    if (link.protected && !user) {
      setShowAuth(true);
    } else {
      navigate(link.path);
    }
    setMenuOpen(false);
  };

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-40 border-b border-white/5"
        style={{ background: 'rgba(3,0,20,0.85)', backdropFilter: 'blur(20px)' }}>
        <div className="max-w-7xl mx-auto px-5 h-14 flex items-center justify-between gap-4">
          {/* Logo */}
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 flex-shrink-0"
          >
            <span className="text-lg">🎬</span>
            <span className="font-bold text-white text-sm hidden xs:block">MyMovie</span>
          </button>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center gap-1 flex-1 justify-center">
            {NAV_LINKS.map(link => (
              <button
                key={link.path}
                onClick={() => handleNavClick(link)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  location.pathname === link.path
                    ? 'bg-white/10 text-white'
                    : 'text-white/50 hover:text-white hover:bg-white/5'
                }`}
              >
                {link.label}
              </button>
            ))}
          </div>

          {/* Auth area */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setShowDropdown(p => !p)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 transition-all"
                >
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-500 to-violet-700 flex items-center justify-center text-xs font-bold text-white">
                    {user.username[0].toUpperCase()}
                  </div>
                  <span className="text-sm text-white/80 hidden sm:block max-w-[100px] truncate">{user.username}</span>
                  <svg className="w-3 h-3 text-white/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {showDropdown && (
                  <div className="absolute right-0 top-full mt-2 w-44 bg-[#0f0d23] border border-white/10 rounded-xl overflow-hidden shadow-xl z-50">
                    <div className="px-4 py-3 border-b border-white/5">
                      <p className="text-xs text-white/40">Signed in as</p>
                      <p className="text-sm text-white font-medium truncate">{user.username}</p>
                    </div>
                    {[
                      { label: '🔖 Watchlist', path: '/watchlist' },
                      { label: '❤️ Favourites', path: '/favourites' },
                    ].map(item => (
                      <button
                        key={item.path}
                        onClick={() => { navigate(item.path); setShowDropdown(false); }}
                        className="w-full text-left px-4 py-2.5 text-sm text-white/70 hover:text-white hover:bg-white/5 transition-all"
                      >
                        {item.label}
                      </button>
                    ))}
                    <div className="border-t border-white/5">
                      <button
                        onClick={() => { logout(); setShowDropdown(false); }}
                        className="w-full text-left px-4 py-2.5 text-sm text-red-400 hover:text-red-300 hover:bg-white/5 transition-all"
                      >
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => setShowAuth(true)}
                className="px-4 py-1.5 rounded-lg bg-gradient-to-r from-purple-600 to-violet-600 text-white text-sm font-medium hover:opacity-90 transition-all"
              >
                Sign In
              </button>
            )}

            {/* Mobile hamburger */}
            <button
              onClick={() => setMenuOpen(p => !p)}
              className="md:hidden w-8 h-8 flex flex-col items-center justify-center gap-1.5"
            >
              <span className={`block w-5 h-0.5 bg-white/70 transition-all ${menuOpen ? 'rotate-45 translate-y-2' : ''}`} />
              <span className={`block w-5 h-0.5 bg-white/70 transition-all ${menuOpen ? 'opacity-0' : ''}`} />
              <span className={`block w-5 h-0.5 bg-white/70 transition-all ${menuOpen ? '-rotate-45 -translate-y-2' : ''}`} />
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden border-t border-white/5 px-5 py-3 flex flex-col gap-1"
            style={{ background: 'rgba(3,0,20,0.95)' }}>
            {NAV_LINKS.map(link => (
              <button
                key={link.path}
                onClick={() => handleNavClick(link)}
                className={`text-left px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  location.pathname === link.path
                    ? 'bg-white/10 text-white'
                    : 'text-white/60 hover:text-white hover:bg-white/5'
                }`}
              >
                {link.label}
                {link.protected && !user && <span className="ml-2 text-[10px] text-purple-400">Sign in</span>}
              </button>
            ))}
          </div>
        )}
      </nav>

      {showDropdown && (
        <div className="fixed inset-0 z-30" onClick={() => setShowDropdown(false)} />
      )}

      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
    </>
  );
};

export default Navbar;
