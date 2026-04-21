import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import Card from '../components/ui/Card';

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
      const response = await api.post('/auth/login', { username, password });
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
    <div className="min-h-screen flex animate-fade-up bg-[var(--color-surface)]">
      <section className="hidden lg:flex lg:w-3/5 mesh-gradient relative items-center justify-center overflow-hidden">
        {/* Dynamic Glow Layers */}
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-primary/10 via-transparent to-blue-500/5"></div>
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-primary/20 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute -bottom-24 -right-24 w-[30rem] h-[30rem] bg-blue-600/10 rounded-full blur-[150px]"></div>

        <div className="relative z-10 px-16 text-left max-w-3xl">
          <div className="inline-flex items-center gap-3 mb-10 px-5 py-2.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse shadow-[0_0_10px_var(--color-primary)]"></span>
            <span className="text-[10px] font-extrabold uppercase tracking-[0.3em] text-white/80">Meru Level 5 Digital Health</span>
          </div>

          <h1 className="font-display text-6xl xl:text-8xl font-extrabold text-white leading-[1.05] tracking-tighter mb-10">
            Clinical <span className="text-primary italic">Intelligence</span>.<br />
            Absolute Care.
          </h1>

          <p className="text-xl text-slate-400 font-medium leading-relaxed max-w-xl">
            Empowering healthcare professionals with an editorial-grade dashboard for high-performance hospital management.
          </p>

          <div className="flex items-center gap-16 mt-20 pt-12 border-t border-white/5">
            <div>
              <p className="text-4xl font-display font-bold text-white mb-2">2.4k+</p>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em]">Monthly Admissions</p>
            </div>
            <div>
              <p className="text-4xl font-display font-bold text-white mb-2">99.9%</p>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em]">System Reliability</p>
            </div>
          </div>

          <div className="mt-16 opacity-40">
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.4em]">Proprietary Clinical Architect System</p>
          </div>
        </div>

      </section>

      <section className="w-full lg:w-2/5 bg-[var(--color-surface)] flex flex-col justify-center px-6 sm:px-12 lg:px-8 xl:px-12 py-12">
        <div className="max-w-lg mx-auto w-full">
          <Card accent="mint" className="shadow-[0_20px_40px_rgba(8,12,20,0.06)] animate-fade-up">
            <div className="lg:hidden mb-12 flex items-center gap-3">
              <div className="w-10 h-10 bg-[var(--color-primary)] rounded-custom flex items-center justify-center text-[var(--color-ink-900)] font-display font-bold text-xl">
                M
              </div>
              <div>
                <h2 className="font-display font-bold text-lg text-[var(--color-ink-900)] leading-none">HMS Meru</h2>
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Meru Level 5</span>
              </div>
            </div>

            <div className="mb-10">
              <h2 className="text-3xl font-display font-extrabold text-[var(--color-ink-900)] mb-2">Welcome Back</h2>
              <p className="text-slate-500 font-medium leading-relaxed">Please enter your clinical credentials to continue to the administrative panel.</p>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-custom">
                <p className="text-sm text-red-600 font-medium">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="space-y-3">
                <label htmlFor="username" className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 pl-1">
                  Clinical Identifier
                </label>
                <div className="relative group">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors">
                    <i className="bi bi-person-badge text-xl"></i>
                  </span>
                  <input
                    type="text"
                    id="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    className="w-full pl-14 pr-4 py-4 bg-[var(--color-surface-low)] rounded-[12px] border-2 border-transparent focus:border-primary/30 focus:bg-white transition-all outline-none font-medium text-[var(--color-ink-900)] placeholder:text-slate-400"
                    placeholder="Enter staff ID or email"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between px-1">
                  <label htmlFor="password" className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                    Security Key
                  </label>
                  <a href="#" className="text-[10px] font-black text-primary uppercase hover:underline tracking-widest">Recovery</a>
                </div>
                <div className="relative group">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors">
                    <i className="bi bi-key-fill text-xl"></i>
                  </span>
                  <input
                    type="password"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full pl-14 pr-14 py-4 bg-[var(--color-surface-low)] rounded-[12px] border-2 border-transparent focus:border-primary/30 focus:bg-white transition-all outline-none font-medium text-[var(--color-ink-900)] placeholder:text-slate-400"
                    placeholder="••••••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const input = document.getElementById('password');
                      input.type = input.type === 'password' ? 'text' : 'password';
                    }}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-primary transition-colors"
                  >
                    <i id="password-toggle-icon" className="bi bi-eye text-lg"></i>
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-5 bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-[var(--color-ink-900)] font-display font-black text-lg rounded-[12px] transition-all transform hover:-translate-y-1 active:translate-y-0 shadow-xl shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed group"
              >
                {loading ? 'Validating...' : (
                  <span className="flex items-center justify-center gap-3">
                    Bypass Secure Gateway
                    <i className="bi bi-arrow-right transition-transform group-hover:translate-x-1"></i>
                  </span>
                )}
              </button>
            </form>

            <p className="mt-10 text-center text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-loose">
              System Assistance: <br/>
              <a href="mailto:it@meru-hms.com" className="text-[var(--color-primary)] hover:underline">Internal IT Support</a>
            </p>
          </Card>
        </div>
      </section>
    </div>
  );
}