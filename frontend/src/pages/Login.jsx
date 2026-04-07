import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await api.post('/api/auth/login', { username, password });
      if (response.data.success) {
        login(response.data.user, response.data.token);
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex animate-fade-up">
      <section className="hidden lg:flex lg:w-3/5 mesh-gradient relative items-center justify-center overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/20 rounded-full blur-[100px]"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-blue-500/10 rounded-full blur-[120px]"></div>

        <div className="relative z-10 px-12 text-center max-w-2xl">
          <div className="inline-flex items-center gap-3 mb-8 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-white/70">Meru Level 5 HMS</span>
          </div>

          <h1 className="font-display text-5xl xl:text-7xl font-extrabold text-white leading-[1.1] tracking-tight mb-8">
            Clinical Precision.<br />
            <span className="text-primary italic">Absolute</span> Care.
          </h1>

          <p className="text-lg text-slate-400 font-medium leading-relaxed max-w-lg mx-auto">
            Empowering healthcare professionals with a high-performance editorial dashboard for seamless hospital
            management.
          </p>

          <div className="flex items-center justify-center gap-12 mt-16 pt-12 border-t border-white/5">
            <div>
              <p className="text-3xl font-display font-bold text-white mb-1">2.4k+</p>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Active Patients</p>
            </div>
            <div className="w-px h-10 bg-white/10"></div>
            <div>
              <p className="text-3xl font-display font-bold text-white mb-1">98.9%</p>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Uptime Record</p>
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-ink-900 to-transparent"></div>
      </section>

      <section className="w-full lg:w-2/5 bg-white flex flex-col justify-center px-8 sm:px-16 lg:px-12 xl:px-24 py-12">
        <div className="max-w-md mx-auto w-full">
          <div className="lg:hidden mb-12 flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-custom flex items-center justify-center text-ink-900 font-display font-bold text-xl">
              M
            </div>
            <div>
              <h2 className="font-display font-bold text-lg text-ink-900 leading-none">HMS Meru</h2>
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Meru Level 5</span>
            </div>
          </div>

          <div className="mb-10">
            <h2 className="text-3xl font-display font-extrabold text-ink-900 mb-2">Welcome Back</h2>
            <p className="text-slate-500 font-medium">Please enter your clinical credentials to continue.</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-custom">
              <p className="text-sm text-red-600 font-medium">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="username" className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2 pl-1">
                Staff Username
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                  <i className="bi bi-person text-lg"></i>
                </span>
                <input
                  type="text"
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  className="w-full pl-12 pr-4 py-3.5 bg-surface rounded-custom border border-transparent focus:border-primary focus:bg-white transition-all outline-none font-medium placeholder:text-slate-400"
                  placeholder="e.g. j.doe@hms.meru"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2 px-1">
                <label htmlFor="password" className="block text-xs font-bold uppercase tracking-widest text-slate-500">
                  Access Key
                </label>
                <a href="#" className="text-[10px] font-bold text-primary uppercase hover:underline">Forgot?</a>
              </div>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                  <i className="bi bi-shield-lock text-lg"></i>
                </span>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pl-12 pr-12 py-3.5 bg-surface rounded-custom border border-transparent focus:border-primary focus:bg-white transition-all outline-none font-medium placeholder:text-slate-400"
                  placeholder="••••••••••••"
                />
                <button
                  type="button"
                  onClick={() => {
                    const input = document.getElementById('password');
                    input.type = input.type === 'password' ? 'text' : 'password';
                  }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-ink-900 transition-colors"
                >
                  <i id="password-toggle-icon" className="bi bi-eye text-lg"></i>
                </button>
              </div>
            </div>

            <div className="flex items-center px-1">
              <input type="checkbox" id="remember" className="w-4 h-4 rounded text-primary focus:ring-primary border-surface-dim" />
              <label htmlFor="remember" className="ml-2 text-sm font-medium text-slate-600">Keep me active for 12 hours</label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-primary hover:bg-primary-dark text-ink-900 font-display font-extrabold text-lg rounded-custom transition-all transform hover:-translate-y-0.5 active:translate-y-0 shadow-lg shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Authenticating...' : 'Authenticate Securely'}
            </button>
          </form>

          <p className="mt-12 text-center text-xs text-slate-400 font-medium">
            System Assistance: <a href="mailto:it@meru-hms.com" className="text-primary hover:underline">Internal IT Support</a>
          </p>
        </div>
      </section>
    </div>
  );
}