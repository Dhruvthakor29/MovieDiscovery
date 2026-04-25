import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const AuthContext = createContext(null);
const API = 'http://localhost:5000/api';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('mm_token'));
  const [loading, setLoading] = useState(true);

  const authHeaders = useCallback(() => ({
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  }), [token]);

  // Restore session on mount
  useEffect(() => {
    if (!token) { setLoading(false); return; }
    fetch(`${API}/auth/me`, { headers: authHeaders() })
      .then(r => r.json())
      .then(data => { if (data.user) setUser(data.user); })
      .catch(() => { localStorage.removeItem('mm_token'); setToken(null); })
      .finally(() => setLoading(false));
  }, []);

  const login = async (email, password) => {
    const res = await fetch(`${API}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Login failed');
    localStorage.setItem('mm_token', data.token);
    setToken(data.token);
    setUser(data.user);
    return data.user;
  };

  const register = async (username, email, password) => {
    const res = await fetch(`${API}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Registration failed');
    localStorage.setItem('mm_token', data.token);
    setToken(data.token);
    setUser(data.user);
    return data.user;
  };

  const logout = () => {
    localStorage.removeItem('mm_token');
    setToken(null);
    setUser(null);
  };

  // Watchlist helpers
  const addToWatchlist = async (movie) => {
    const res = await fetch(`${API}/user/watchlist`, {
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
    if (res.ok) setUser(prev => ({ ...prev, watchlist: data.watchlist }));
    else if (res.status !== 409) throw new Error(data.message);
  };

  const removeFromWatchlist = async (movieId) => {
    const res = await fetch(`${API}/user/watchlist/${movieId}`, {
      method: 'DELETE',
      headers: authHeaders(),
    });
    const data = await res.json();
    if (res.ok) setUser(prev => ({ ...prev, watchlist: data.watchlist }));
  };

  // Favourites helpers
  const addToFavourites = async (movie) => {
    const res = await fetch(`${API}/user/favourites`, {
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
    if (res.ok) setUser(prev => ({ ...prev, favourites: data.favourites }));
    else if (res.status !== 409) throw new Error(data.message);
  };

  const removeFromFavourites = async (movieId) => {
    const res = await fetch(`${API}/user/favourites/${movieId}`, {
      method: 'DELETE',
      headers: authHeaders(),
    });
    const data = await res.json();
    if (res.ok) setUser(prev => ({ ...prev, favourites: data.favourites }));
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
