import { useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { adminApi } from '../api/adminApi';
import type { DashboardData } from '../types';
import type { BorrowRecordResponse } from '../../borrow/types';
import { useToast } from '../../../hooks/useToast';

interface StatCardProps {
  title: string;
  value: number | string;
  icon: ReactNode;
  iconBg: string;
  iconColor: string;
}

const StatCard = ({ title, value, icon, iconBg, iconColor }: StatCardProps) => (
  <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-6 flex items-center gap-4 hover:shadow-md transition-shadow">
    <div className={`p-3 rounded-lg ${iconBg} ${iconColor}`}>{icon}</div>
    <div>
      <p className="text-sm text-slate-500 dark:text-slate-400">{title}</p>
      <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{value}</p>
    </div>
  </div>
);

const StatCardSkeleton = () => (
  <div className="animate-pulse bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-6 flex items-center gap-4">
    <div className="h-12 w-12 rounded-lg bg-slate-200 dark:bg-slate-700" />
    <div className="flex-1 space-y-2">
      <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/2" />
      <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-1/3" />
    </div>
  </div>
);

const BookIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
      d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
  </svg>
);

const CheckCircleIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const BookmarkIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
      d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
  </svg>
);

const UsersIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
  </svg>
);

const buildLast6Months = (records: BorrowRecordResponse[]) => {
  const months: { month: string; count: number; key: string }[] = [];
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const label = d.toLocaleDateString('en-GB', { month: 'short' });
    months.push({ month: label, count: 0, key });
  }
  records.forEach((r) => {
    if (!r.borrowDate) return;
    const d = new Date(r.borrowDate);
    if (Number.isNaN(d.getTime())) return;
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const bucket = months.find((m) => m.key === key);
    if (bucket) bucket.count += 1;
  });
  return months;
};

const PIE_COLORS = ['#16a34a', '#d97706'];

const DashboardPage = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [allBorrows, setAllBorrows] = useState<BorrowRecordResponse[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [chartsLoading, setChartsLoading] = useState<boolean>(true);
  const [statsError, setStatsError] = useState(false);
  const [borrowsError, setBorrowsError] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    let cancelled = false;

    const fetchStats = async () => {
      try {
        const result = await adminApi.getDashboard();
        if (!cancelled) setData(result);
      } catch (err: any) {
        if (cancelled) return;
        setStatsError(true);
        showToast(err?.response?.data?.message || 'Failed to load dashboard data', 'error');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    const fetchBorrows = async () => {
      try {
        const all = await adminApi.getAllBorrows();
        if (!cancelled) setAllBorrows(all);
      } catch (err: any) {
        if (cancelled) return;
        setBorrowsError(true);
        showToast(err?.response?.data?.message || 'Failed to load chart data', 'error');
      } finally {
        if (!cancelled) setChartsLoading(false);
      }
    };

    fetchStats();
    fetchBorrows();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const monthlyData = useMemo(() => buildLast6Months(allBorrows), [allBorrows]);

  const pieData = useMemo(
    () => [
      { name: 'Available', value: data?.availableBooks ?? 0 },
      { name: 'Borrowed', value: data?.borrowedBooks ?? 0 },
    ],
    [data]
  );

  const totalPieValue = pieData.reduce((sum, slice) => sum + slice.value, 0);

  return (
    <div className="pt-16 min-h-screen bg-slate-50 dark:bg-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Dashboard</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1 text-sm">System overview and key metrics</p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => <StatCardSkeleton key={i} />)
          ) : (
            <>
              <StatCard
                title="Total Books"
                value={data?.totalBooks ?? 0}
                icon={<BookIcon />}
                iconBg="bg-indigo-100 dark:bg-indigo-900/40"
                iconColor="text-indigo-600 dark:text-indigo-300"
              />
              <StatCard
                title="Available Books"
                value={data?.availableBooks ?? 0}
                icon={<CheckCircleIcon />}
                iconBg="bg-green-100 dark:bg-green-900/40"
                iconColor="text-green-600 dark:text-green-300"
              />
              <StatCard
                title="Borrowed Books"
                value={data?.borrowedBooks ?? 0}
                icon={<BookmarkIcon />}
                iconBg="bg-amber-100 dark:bg-amber-900/40"
                iconColor="text-amber-600 dark:text-amber-300"
              />
              <StatCard
                title="Total Users"
                value={data?.totalUsers ?? 0}
                icon={<UsersIcon />}
                iconBg="bg-purple-100 dark:bg-purple-900/40"
                iconColor="text-purple-600 dark:text-purple-300"
              />
            </>
          )}
        </div>

        {statsError && !loading && (
          <p className="mt-3 text-xs text-slate-500 dark:text-slate-400 italic">
            Dashboard stats unavailable (GET /api/admin/dashboard). Showing zeros.
          </p>
        )}

        <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-6">
            <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
              Borrow Activity — Last 6 Months
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5 mb-4">Borrow records grouped by month</p>
            <div style={{ width: '100%', height: 280 }}>
              {chartsLoading ? (
                <div className="h-full w-full flex items-center justify-center text-sm text-slate-500 dark:text-slate-400">
                  Loading chart…
                </div>
              ) : borrowsError ? (
                <div className="h-full w-full flex items-center justify-center text-sm text-slate-500 dark:text-slate-400">
                  Chart data unavailable.
                </div>
              ) : (
                <ResponsiveContainer>
                  <BarChart data={monthlyData} margin={{ top: 10, right: 10, bottom: 0, left: -10 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} className="dark:stroke-slate-700" />
                    <XAxis
                      dataKey="month"
                      tick={{ fill: '#64748b', fontSize: 12 }}
                      axisLine={{ stroke: '#cbd5e1' }}
                      tickLine={false}
                    />
                    <YAxis
                      allowDecimals={false}
                      tick={{ fill: '#64748b', fontSize: 12 }}
                      axisLine={{ stroke: '#cbd5e1' }}
                      tickLine={false}
                    />
                    <Tooltip
                      cursor={{ fill: 'rgba(37,99,235,0.08)' }}
                      contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 12 }}
                    />
                    <Bar dataKey="count" fill="#2563eb" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-6">
            <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">Book Status Distribution</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5 mb-4">Available vs borrowed copies</p>
            <div style={{ width: '100%', height: 280 }}>
              {loading ? (
                <div className="h-full w-full flex items-center justify-center text-sm text-slate-500 dark:text-slate-400">
                  Loading chart…
                </div>
              ) : totalPieValue === 0 ? (
                <div className="h-full w-full flex items-center justify-center text-sm text-slate-500 dark:text-slate-400">
                  No book data yet.
                </div>
              ) : (
                <ResponsiveContainer>
                  <PieChart>
                    <Pie
                      data={pieData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="45%"
                      outerRadius={90}
                      innerRadius={45}
                      paddingAngle={2}
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={entry.name} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 12 }} />
                    <Legend verticalAlign="bottom" iconType="circle" wrapperStyle={{ fontSize: 12 }} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
