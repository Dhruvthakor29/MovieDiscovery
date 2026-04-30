import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const Input = ({ label, type, value, onChange, placeholder }) => (
  <div className="flex flex-col gap-1">
    <label className="text-xs font-medium text-white/50 uppercase tracking-wider">{label}</label>
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm text-white placeholder-white/30 outline-none focus:border-purple-500/60 focus:bg-white/8 transition-all"
    />
  </div>
);

const AuthModal = ({ onClose }) => {
  const { login, register } = useAuth();
  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [form, setForm] = useState({ username: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const set = (field) => (e) => setForm(prev => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (mode === 'login') {
        await login(form.email, form.password);
      } else {
        await register(form.username, form.email, form.password);
      }
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backdropFilter: 'blur(12px)', background: 'rgba(3,0,20,0.75)' }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-md bg-dark-100 border border-white/10 rounded-2xl overflow-hidden shadow-2xl animate-fade-in">
        {/* Header */}
        <div className="relative p-6 pb-0">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-all"
          >
            ✕
          </button>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-violet-700 flex items-center justify-center text-sm">🎬</div>
            <span className="text-white font-bold text-lg">StreamVerse</span>
          </div>

          {/* Tabs */}
          <div className="flex bg-white/5 rounded-xl p-1 mb-6">
            {['login', 'register'].map(m => (
              <button
                key={m}
                onClick={() => { setMode(m); setError(''); }}
                className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all capitalize ${
                  mode === m
                    ? 'bg-gradient-to-r from-purple-600 to-violet-600 text-white shadow-lg'
                    : 'text-white/40 hover:text-white/70'
                }`}
              >
                {m === 'login' ? 'Sign In' : 'Sign Up'}
              </button>
            ))}
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 pb-6 flex flex-col gap-4">
          {mode === 'register' && (
            <Input label="Username" type="text" value={form.username} onChange={set('username')} placeholder="Enter Username" />
          )}
          <Input label="Email" type="email" value={form.email} onChange={set('email')} placeholder="Enter Your Email" />
          <Input label="Password" type="password" value={form.password} onChange={set('password')} placeholder="••••••••" />

          {error && (
            <div className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 to-violet-600 text-white font-semibold text-sm hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50 mt-2"
          >
            {loading ? 'Please wait…' : mode === 'login' ? 'Sign In' : 'Create Account'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AuthModal;
