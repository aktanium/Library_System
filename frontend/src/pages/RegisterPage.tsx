import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { register } from '../api/auth';
import { useAuth } from '../hooks/useAuth';

const PersonIcon = () => (
  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
    />
  </svg>
);

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

type Strength = 'none' | 'weak' | 'medium' | 'strong';

const RegisterPage = () => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login: authLogin } = useAuth();

  const strength: Strength = useMemo(() => {
    if (!password) return 'none';
    if (password.length < 6) return 'weak';
    if (password.length < 10) return 'medium';
    return 'strong';
  }, [password]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      setSubmitting(true);
      const data = await register({ fullName, email, password });
      authLogin(data.token);
      navigate('/');
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Registration failed. Please try again.');
      setSubmitting(false);
    }
  };

  const barClass = (filled: boolean, color: string) =>
    `h-1.5 flex-1 rounded-full transition-colors ${filled ? color : 'bg-slate-200'}`;

  const strengthLabel: Record<Strength, string> = {
    none: '',
    weak: 'Weak — use at least 6 characters',
    medium: 'Medium — getting better',
    strong: 'Strong password',
  };

  const strengthTextColor: Record<Strength, string> = {
    none: 'text-slate-500',
    weak: 'text-red-600',
    medium: 'text-amber-600',
    strong: 'text-green-600',
  };

  return (
    <div className="pt-16 min-h-screen bg-slate-50 flex">
      <div className="hidden lg:flex lg:w-1/2 bg-[#1e3a5f] text-white p-12 flex-col justify-between">
        <div>
          <div className="flex items-center gap-3">
            <span className="text-xl font-bold tracking-tight">LibraryMS</span>
            <span className="h-5 w-px bg-white/30" aria-hidden="true" />
            <span className="text-xs uppercase tracking-wider text-slate-300">Management System</span>
          </div>
          <h1 className="mt-16 text-3xl xl:text-4xl font-bold leading-tight">
            Join the library<br />in under a minute.
          </h1>
          <p className="mt-4 text-slate-300 max-w-md">
            Create an account to start borrowing books, tracking your reading history, and exploring the catalog.
          </p>
          <ul className="mt-10 space-y-3 text-sm text-slate-200">
            <li className="flex items-start"><CheckIcon /> Borrow up to your account limit at once</li>
            <li className="flex items-start"><CheckIcon /> Get overdue alerts before fees stack up</li>
            <li className="flex items-start"><CheckIcon /> Personal dashboard with reading stats</li>
          </ul>
        </div>
        <p className="text-xs text-slate-400">© 2026 University Thesis Project</p>
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-[#0f172a]">Create account</h2>
            <p className="mt-1 text-sm text-slate-600">Join the library today</p>
          </div>

          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm" role="alert">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-slate-700 mb-1">
                Full Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <PersonIcon />
                </div>
                <input
                  id="fullName"
                  type="text"
                  required
                  autoComplete="name"
                  placeholder="Jane Doe"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="pl-10 border border-slate-200 rounded-lg py-2.5 w-full focus:ring-2 focus:ring-[#2563eb] focus:border-transparent outline-none transition-shadow"
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1">
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
                  className="pl-10 border border-slate-200 rounded-lg py-2.5 w-full focus:ring-2 focus:ring-[#2563eb] focus:border-transparent outline-none transition-shadow"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-1">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <LockIcon />
                </div>
                <input
                  id="password"
                  type="password"
                  required
                  autoComplete="new-password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 border border-slate-200 rounded-lg py-2.5 w-full focus:ring-2 focus:ring-[#2563eb] focus:border-transparent outline-none transition-shadow"
                />
              </div>

              <div className="mt-2 flex gap-1.5">
                <div className={barClass(strength !== 'none', strength === 'weak' ? 'bg-red-400' : strength === 'medium' ? 'bg-amber-400' : 'bg-green-500')} />
                <div className={barClass(strength === 'medium' || strength === 'strong', strength === 'medium' ? 'bg-amber-400' : 'bg-green-500')} />
                <div className={barClass(strength === 'strong', 'bg-green-500')} />
              </div>
              {strength !== 'none' && (
                <p className={`mt-1.5 text-xs font-medium ${strengthTextColor[strength]}`}>
                  {strengthLabel[strength]}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full inline-flex items-center justify-center px-4 py-2.5 rounded-lg text-sm font-semibold text-white bg-[#2563eb] hover:bg-blue-700 shadow-sm disabled:opacity-50 transition-colors"
            >
              {submitting && <Spinner />}
              {submitting ? 'Creating account…' : 'Create Account'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-600">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-[#2563eb] hover:text-blue-700">
              Sign in →
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
