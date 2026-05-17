import { Link } from 'react-router-dom';
import type { ReactNode } from 'react';
import { useAuth } from '../hooks/useAuth';

const BookshelfIllustration = () => (
  <svg
    className="w-full max-w-md mx-auto"
    viewBox="0 0 400 320"
    fill="none"
    aria-hidden="true"
  >
    <rect x="10" y="78" width="380" height="6" rx="1" fill="#1e3a5f" />
    <rect x="10" y="178" width="380" height="6" rx="1" fill="#1e3a5f" />
    <rect x="10" y="278" width="380" height="6" rx="1" fill="#1e3a5f" />

    <rect x="30" y="28" width="22" height="50" fill="#2563eb" />
    <rect x="55" y="32" width="20" height="46" fill="#1e3a5f" />
    <rect x="80" y="20" width="22" height="58" fill="#475569" />
    <rect x="106" y="30" width="26" height="48" fill="#16a34a" />
    <rect x="136" y="26" width="20" height="52" fill="#d97706" />
    <rect x="160" y="34" width="22" height="44" fill="#1e3a5f" />
    <rect x="186" y="28" width="20" height="50" fill="#2563eb" />
    <rect x="210" y="22" width="26" height="56" fill="#475569" />
    <rect x="240" y="30" width="20" height="48" fill="#16a34a" />
    <rect x="264" y="26" width="22" height="52" fill="#1e3a5f" />
    <rect x="290" y="30" width="20" height="48" fill="#dc2626" />
    <rect x="314" y="24" width="22" height="54" fill="#7c3aed" />
    <rect x="340" y="32" width="24" height="46" fill="#2563eb" />

    <rect x="30" y="126" width="20" height="52" fill="#475569" />
    <rect x="54" y="130" width="20" height="48" fill="#2563eb" />
    <rect x="78" y="135" width="24" height="43" fill="#16a34a" />
    <rect x="106" y="124" width="20" height="54" fill="#1e3a5f" />
    <rect x="130" y="130" width="22" height="48" fill="#dc2626" />
    <rect x="156" y="135" width="24" height="43" fill="#475569" />
    <rect x="184" y="124" width="26" height="54" fill="#2563eb" />
    <rect x="214" y="128" width="20" height="50" fill="#1e3a5f" />
    <rect x="238" y="124" width="22" height="54" fill="#d97706" />
    <rect x="264" y="132" width="20" height="46" fill="#475569" />
    <rect x="288" y="126" width="22" height="52" fill="#2563eb" />
    <rect x="314" y="130" width="20" height="48" fill="#7c3aed" />
    <rect x="338" y="124" width="26" height="54" fill="#16a34a" />

    <rect x="30" y="226" width="20" height="52" fill="#1e3a5f" />
    <rect x="54" y="230" width="24" height="48" fill="#2563eb" />
    <rect x="82" y="222" width="20" height="56" fill="#475569" />
    <rect x="106" y="230" width="20" height="48" fill="#d97706" />
    <rect x="130" y="234" width="22" height="44" fill="#16a34a" />
    <rect x="156" y="228" width="20" height="50" fill="#1e3a5f" />
    <rect x="180" y="232" width="26" height="46" fill="#2563eb" />
    <rect x="210" y="224" width="22" height="54" fill="#dc2626" />
    <rect x="236" y="230" width="20" height="48" fill="#475569" />
    <rect x="260" y="222" width="22" height="56" fill="#1e3a5f" />
    <rect x="286" y="226" width="24" height="52" fill="#7c3aed" />
    <rect x="314" y="234" width="20" height="44" fill="#16a34a" />
    <rect x="338" y="228" width="22" height="50" fill="#2563eb" />
  </svg>
);

const Feature = ({
  icon,
  title,
  description,
  borderColor,
  iconBg,
  iconColor,
}: {
  icon: ReactNode;
  title: string;
  description: string;
  borderColor: string;
  iconBg: string;
  iconColor: string;
}) => (
  <div
    className={`bg-white border-t-4 ${borderColor} border-x border-b border-slate-200 shadow-sm rounded-lg p-6 hover:shadow-md transition-shadow`}
  >
    <div className={`inline-flex items-center justify-center w-12 h-12 rounded-lg ${iconBg} ${iconColor} mb-4`}>
      {icon}
    </div>
    <h3 className="text-lg font-semibold text-[#0f172a]">{title}</h3>
    <p className="mt-2 text-sm text-slate-600">{description}</p>
  </div>
);

const BookIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
    />
  </svg>
);

const BoltIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
  </svg>
);

const ChartIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M9 17v-4m4 4v-8m4 8V9m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h12a2 2 0 012 2v12a2 2 0 01-2 2z"
    />
  </svg>
);

const HomePage = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="pt-16 min-h-screen bg-slate-50">
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">
              University Thesis Project
            </span>
            <h1 className="mt-5 text-3xl sm:text-4xl lg:text-5xl font-bold text-[#0f172a] tracking-tight">
              Library Management System
            </h1>
            <p className="mt-5 text-lg text-slate-600 max-w-xl">
              A clean, reliable platform for managing books, members, and borrowing records across your library.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/books"
                className="inline-flex items-center px-5 py-2.5 rounded-lg text-sm font-semibold text-white bg-[#2563eb] hover:bg-blue-700 shadow-sm transition-colors"
              >
                Browse Catalog
              </Link>
              {!isAuthenticated && (
                <Link
                  to="/login"
                  className="inline-flex items-center px-5 py-2.5 rounded-lg text-sm font-semibold text-[#2563eb] bg-white border border-[#2563eb] hover:bg-blue-50 transition-colors"
                >
                  Sign In
                </Link>
              )}
            </div>
          </div>
          <div>
            <BookshelfIllustration />
          </div>
        </div>
      </section>

      <section className="bg-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-white/15 text-center">
            <div className="py-4 sm:py-0">
              <p className="text-3xl sm:text-4xl font-bold text-white">500+</p>
              <p className="mt-1 text-sm uppercase tracking-wider text-slate-400">Books</p>
            </div>
            <div className="py-4 sm:py-0">
              <p className="text-3xl sm:text-4xl font-bold text-white">50+</p>
              <p className="mt-1 text-sm uppercase tracking-wider text-slate-400">Members</p>
            </div>
            <div className="py-4 sm:py-0">
              <p className="text-3xl sm:text-4xl font-bold text-white">1000+</p>
              <p className="mt-1 text-sm uppercase tracking-wider text-slate-400">Borrows</p>
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold text-[#0f172a]">Everything your library needs</h2>
          <p className="mt-3 text-slate-600">
            Powerful tools for both readers and administrators, built on a clean, modern stack.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Feature
            icon={<BookIcon />}
            title="Book Catalog"
            description="Search and browse our complete collection by title, author, or genre."
            borderColor="border-t-[#2563eb]"
            iconBg="bg-blue-50"
            iconColor="text-[#2563eb]"
          />
          <Feature
            icon={<BoltIcon />}
            title="Instant Borrowing"
            description="Reserve any available book instantly with one click."
            borderColor="border-t-[#16a34a]"
            iconBg="bg-green-50"
            iconColor="text-[#16a34a]"
          />
          <Feature
            icon={<ChartIcon />}
            title="Borrow Tracking"
            description="Track your active borrows, due dates, and complete history."
            borderColor="border-t-[#7c3aed]"
            iconBg="bg-purple-50"
            iconColor="text-[#7c3aed]"
          />
        </div>
      </section>

      <section className="bg-[#1e3a5f]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-white">Ready to get started?</h2>
          <p className="mt-3 text-slate-300">Sign in to your account and explore the catalog.</p>
          <div className="mt-6">
            <Link
              to={isAuthenticated ? '/books' : '/login'}
              className="inline-flex items-center px-6 py-2.5 rounded-lg text-sm font-semibold text-[#1e3a5f] bg-white hover:bg-slate-100 transition-colors"
            >
              {isAuthenticated ? 'Browse Catalog' : 'Sign In'}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
