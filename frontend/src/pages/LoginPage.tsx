import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { login } from '../api/auth';
import { useAuth } from '../hooks/useAuth';

const EnvelopeIcon = () => (
  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
    />
  </svg>
);

const LockIcon = () => (
  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 11c0-1.105.895-2 2-2s2 .895 2 2-.895 2-2 2-2-.895-2-2zm0 0V7a4 4 0 00-8 0v4m-2 0h14a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2v-6a2 2 0 012-2z"
    />
  </svg>
);

const EyeIcon = ({ off }: { off: boolean }) => (
  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    {off ? (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.066 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.243 4.243L9.88 9.88"
      />
    ) : (
      <>
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
        />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </>
    )}
  </svg>
);

const Spinner = () => (
  <svg className="animate-spin h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" aria-hidden="true">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
  </svg>
);

const CheckIcon = () => (
  <svg className="h-4 w-4 mr-2 mt-0.5 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
);

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login: authLogin } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      setSubmitting(true);
      const data = await login({ email, password });
      authLogin(data.token);
      navigate('/');
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Invalid email or password.');
      setSubmitting(false);
    }
  };

  return (
    <div className="pt-16 min-h-screen bg-slate-50 dark:bg-slate-900 flex">
      <div className="hidden lg:flex lg:w-1/2 bg-[#1e3a5f] dark:bg-slate-950 text-white p-12 flex-col justify-between">
        <div>
          <div className="flex items-center gap-3">
            <span className="text-xl font-bold tracking-tight">LibraryMS</span>
            <span className="h-5 w-px bg-white/30" aria-hidden="true" />
            <span className="text-xs uppercase tracking-wider text-slate-300">Management System</span>
          </div>
          <h1 className="mt-16 text-3xl xl:text-4xl font-bold leading-tight">
            Manage your library<br />with confidence.
          </h1>
          <p className="mt-4 text-slate-300 max-w-md">
            A clean, professional platform for cataloging books, tracking borrows, and managing members.
          </p>
          <ul className="mt-10 space-y-3 text-sm text-slate-200">
            <li className="flex items-start"><CheckIcon /> Browse 20+ books with live search</li>
            <li className="flex items-start"><CheckIcon /> Instant borrowing in one click</li>
            <li className="flex items-start"><CheckIcon /> Track your complete history</li>
          </ul>
        </div>
        <p className="text-xs text-slate-400">© 2026 University Thesis Project</p>
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Welcome back</h2>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">Sign in to continue</p>
          </div>

          {error && (
            <div
              className="mb-4 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-300 rounded-lg px-4 py-3 text-sm"
              role="alert"
            >
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <EnvelopeIcon />
                </div>
                <input
                  id="email"
                  type="email"
                  required
                  autoComplete="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-lg py-2.5 w-full focus:ring-2 focus:ring-[#2563eb] focus:border-transparent outline-none transition-shadow"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <LockIcon />
                </div>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-lg py-2.5 w-full focus:ring-2 focus:ring-[#2563eb] focus:border-transparent outline-none transition-shadow"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                >
                  <EyeIcon off={showPassword} />
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full inline-flex items-center justify-center px-4 py-2.5 rounded-lg text-sm font-semibold text-white bg-[#2563eb] hover:bg-blue-700 shadow-sm disabled:opacity-50 transition-colors"
            >
              {submitting && <Spinner />}
              {submitting ? 'Signing in…' : 'Sign In'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-600 dark:text-slate-400">
            Don&apos;t have an account?{' '}
            <Link to="/register" className="font-semibold text-[#2563eb] hover:text-blue-700 dark:text-blue-400">
              Register →
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
