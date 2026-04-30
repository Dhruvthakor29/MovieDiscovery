import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const AuthContext = createContext(null);
const API = 'https://cloudtv-s74y.onrender.com';

// helpers to persist user in localStorage
const saveUser = (user) => localStorage.setItem('mm_user', JSON.stringify(user));
const loadUser = () => {
  try { return JSON.parse(localStorage.getItem('mm_user')); }
  catch { return null; }
};
const clearAuth = () => {
  localStorage.removeItem('mm_token');
  localStorage.removeItem('mm_user');
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => loadUser()); // restore instantly from localStorage
  const [token, setToken] = useState(() => localStorage.getItem('mm_token'));
  const [loading, setLoading] = useState(true);

  const authHeaders = useCallback(() => ({
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  }), [token]);

  // Restore session on mount
  useEffect(() => {
    if (!token) { setLoading(false); return; }

    fetch(`${API}/api/auth/me`, { headers: authHeaders() }) // fixed: added /api/
      .then(async (r) => {
        if (r.status === 401) {
          // Token truly expired/invalid → logout
          clearAuth();
          setToken(null);
          setUser(null);
          return;
        }
        const data = await r.json();
        if (data.user) {
          setUser(data.user);
          saveUser(data.user);
        }
      })
      .catch(() => {
        // Network error / server offline → keep cached session, do NOT logout
        console.warn('Backend unreachable — keeping cached session.');
      })
      .finally(() => setLoading(false));
  }, []);

  const login = async (email, password) => {
    const res = await fetch(`${API}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Login failed');
    localStorage.setItem('mm_token', data.token);
    setToken(data.token);
    setUser(data.user);
    saveUser(data.user);
    return data.user;
  };

  const register = async (username, email, password) => {
    const res = await fetch(`${API}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Registration failed');
    localStorage.setItem('mm_token', data.token);
    setToken(data.token);
    setUser(data.user);
    saveUser(data.user);
    return data.user;
  };

  const logout = () => {
    clearAuth();
    setToken(null);
    setUser(null);
  };

  // Watchlist helpers
  const addToWatchlist = async (movie) => {
    const res = await fetch(`${API}/api/user/watchlist`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({
        movieId: movie.id,
        title: movie.title,
        poster_path: movie.poster_path,
        vote_average: movie.vote_average,
        release_date: movie.release_date,
      }),
    });
    const data = await res.json();
    if (res.ok) setUser(prev => { const u = { ...prev, watchlist: data.watchlist }; saveUser(u); return u; });
    else if (res.status !== 409) throw new Error(data.message);
  };

  const removeFromWatchlist = async (movieId) => {
    const res = await fetch(`${API}/api/user/watchlist/${movieId}`, {
      method: 'DELETE',
      headers: authHeaders(),
    });
    const data = await res.json();
    if (res.ok) setUser(prev => { const u = { ...prev, watchlist: data.watchlist }; saveUser(u); return u; });
  };

  // Favourites helpers
  const addToFavourites = async (movie) => {
    const res = await fetch(`${API}/api/user/favourites`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({
        movieId: movie.id,
        title: movie.title,
        poster_path: movie.poster_path,
        vote_average: movie.vote_average,
        release_date: movie.release_date,
      }),
    });
    const data = await res.json();
    if (res.ok) setUser(prev => { const u = { ...prev, favourites: data.favourites }; saveUser(u); return u; });
    else if (res.status !== 409) throw new Error(data.message);
  };

  const removeFromFavourites = async (movieId) => {
    const res = await fetch(`${API}/api/user/favourites/${movieId}`, {
      method: 'DELETE',
      headers: authHeaders(),
    });
    const data = await res.json();
    if (res.ok) setUser(prev => { const u = { ...prev, favourites: data.favourites }; saveUser(u); return u; });
  };

  const isInWatchlist = (movieId) => user?.watchlist?.some(m => m.movieId === movieId) ?? false;
  const isInFavourites = (movieId) => user?.favourites?.some(m => m.movieId === movieId) ?? false;

  return (
    <AuthContext.Provider value={{
      user, token, loading,
      login, register, logout,
      addToWatchlist, removeFromWatchlist,
      addToFavourites, removeFromFavourites,
      isInWatchlist, isInFavourites,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
};
