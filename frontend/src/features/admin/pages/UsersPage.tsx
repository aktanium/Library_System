import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { adminApi } from '../api/adminApi';
import type { User } from '../types';
import { useToast } from '../../../hooks/useToast';

const PAGE_SIZE = 10;

const ROLE_BADGE_STYLES: Record<string, string> = {
  ADMIN: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300',
  USER: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
};

const RoleBadge = ({ role }: { role: string }) => (
  <span
    className={`px-2 py-1 rounded-full text-xs font-semibold ${
      ROLE_BADGE_STYLES[role] ?? 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300'
    }`}
  >
    {role}
  </span>
);

const getInitials = (name: string) =>
  name
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? '')
    .join('') || '?';

const Avatar = ({ name }: { name: string }) => (
  <div
    className="w-9 h-9 rounded-full bg-[#2563eb] text-white text-xs font-semibold flex items-center justify-center shrink-0"
    aria-hidden="true"
  >
    {getInitials(name)}
  </div>
);

const RowSkeleton = () => (
  <tr className="animate-pulse">
    <td className="px-4 py-3"><div className="w-9 h-9 rounded-full bg-slate-200 dark:bg-slate-700" /></td>
    <td className="px-4 py-3"><div className="h-4 w-40 bg-slate-200 dark:bg-slate-700 rounded" /></td>
    <td className="px-4 py-3"><div className="h-4 w-56 bg-slate-200 dark:bg-slate-700 rounded" /></td>
    <td className="px-4 py-3"><div className="h-6 w-16 bg-slate-200 dark:bg-slate-700 rounded-full" /></td>
    <td className="px-4 py-3">
      <div className="flex gap-2 justify-end">
        <div className="h-8 w-24 bg-slate-200 dark:bg-slate-700 rounded" />
        <div className="h-8 w-24 bg-slate-200 dark:bg-slate-700 rounded" />
      </div>
    </td>
  </tr>
);

const UsersPage = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState<boolean>(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [page, setPage] = useState(1);
  const { showToast } = useToast();

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await adminApi.getAllUsers();
      setUsers(data);
    } catch (err: any) {
      showToast(err?.response?.data?.message || 'Failed to load users', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const filtered = useMemo(() => {
    if (!searchTerm.trim()) return users;
    const q = searchTerm.trim().toLowerCase();
    return users.filter(
      (u) => u.fullName.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)
    );
  }, [users, searchTerm]);

  useEffect(() => {
    setPage(1);
  }, [searchTerm, users.length]);

  const total = filtered.length;
  const lastPage = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const start = (page - 1) * PAGE_SIZE;
  const end = Math.min(start + PAGE_SIZE, total);
  const visible = filtered.slice(start, end);

  const handleChangeRole = async (user: User) => {
    const newRole = user.role === 'ADMIN' ? 'USER' : 'ADMIN';
    if (!window.confirm(`Change ${user.fullName} from ${user.role} to ${newRole}?`)) return;
    try {
      setActionLoading(user.id);
      await adminApi.changeUserRole(user.id, newRole);
      setUsers(users.map((u) => (u.id === user.id ? { ...u, role: newRole } : u)));
      showToast('User role updated', 'success');
    } catch (err: any) {
      showToast(err?.response?.data?.message || 'Failed to change user role', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="pt-16 min-h-screen bg-slate-50 dark:bg-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Users</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1 text-sm">Registered library members</p>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 mb-6 p-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z"
                />
              </svg>
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name or email…"
              className="w-full pl-10 pr-10 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:ring-2 focus:ring-[#2563eb] focus:border-transparent outline-none transition-shadow"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                aria-label="Clear search"
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 uppercase text-xs tracking-wider">
                  <th className="px-4 py-3 text-left w-16"><span className="sr-only">Avatar</span></th>
                  <th className="px-4 py-3 text-left">Full Name</th>
                  <th className="px-4 py-3 text-left">Email</th>
                  <th className="px-4 py-3 text-left">Role</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => <RowSkeleton key={i} />)
                ) : visible.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-10 text-center text-sm text-slate-500 dark:text-slate-400">
                      {searchTerm ? 'No users match your search.' : 'No registered users yet.'}
                    </td>
                  </tr>
                ) : (
                  visible.map((user) => (
                    <tr key={user.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/40 transition-colors">
                      <td className="px-4 py-3"><Avatar name={user.fullName} /></td>
                      <td className="px-4 py-3 font-medium text-slate-900 dark:text-slate-100">{user.fullName}</td>
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{user.email}</td>
                      <td className="px-4 py-3"><RoleBadge role={user.role} /></td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleChangeRole(user)}
                            disabled={actionLoading === user.id}
                            className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold text-[#2563eb] dark:text-blue-300 bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 dark:hover:bg-blue-900/40 disabled:opacity-50 transition-colors"
                          >
                            Change Role
                          </button>
                          <Link
                            to={`/admin/users/${user.id}/history`}
                            className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                          >
                            View History
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {!loading && total > 0 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200 dark:border-slate-700">
              <span className="text-sm text-slate-500 dark:text-slate-400">Showing {start + 1}–{end} of {total} results</span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  Previous
                </button>
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.min(lastPage, p + 1))}
                  disabled={page === lastPage}
                  className="inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UsersPage;
