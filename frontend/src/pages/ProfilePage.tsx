// Backend endpoints used (graceful fallback if missing):
//   GET  /api/users/profile     → falls back to AuthContext data on failure
//   PUT  /api/users/profile     → toast "Profile update unavailable" on failure
//   GET  /api/borrow/history    → falls back to zeros + "Connect backend to see stats"

import { useContext, useEffect, useState } from 'react';
import axiosClient from '../api/axiosClient';
import { AuthContext } from '../context/AuthContext';
import { borrowApi } from '../features/borrow/api/borrowApi';
import type { BorrowRecordResponse } from '../features/borrow/types';
import { useToast } from '../hooks/useToast';

interface ProfileData {
  id?: number;
  fullName: string;
  email: string;
  role: string;
}

const getInitials = (name: string) =>
  name
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? '')
    .join('') || '?';

const formatDate = (dateStr: string | null | undefined) => {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
};

const StatusBadge = ({ status }: { status: string }) => {
  const styles: Record<string, string> = {
    BORROWED: 'bg-amber-100 text-amber-700',
    RETURNED: 'bg-green-100 text-green-700',
  };
  return (
    <span
      className={`px-2 py-1 rounded-full text-xs font-semibold ${
        styles[status] ?? 'bg-slate-100 text-slate-600'
      }`}
    >
      {status}
    </span>
  );
};

const StatTile = ({
  label,
  value,
  pillBg,
  pillText,
}: {
  label: string;
  value: number;
  pillBg: string;
  pillText: string;
}) => (
  <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-5">
    <div className={`inline-flex items-center justify-center w-10 h-10 rounded-lg ${pillBg} ${pillText} mb-3`}>
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
        />
      </svg>
    </div>
    <p className="text-xs uppercase tracking-wider text-slate-500">{label}</p>
    <p className="text-2xl font-bold text-slate-900 mt-1">{value}</p>
  </div>
);

const ProfilePage = () => {
  const auth = useContext(AuthContext);
  const { showToast } = useToast();

  // Build fallback profile from AuthContext (always available once logged in)
  const fallbackProfile: ProfileData = {
    fullName: auth?.displayName ?? 'User',
    email: auth?.email ?? '',
    role: auth?.userRole ?? 'USER',
  };

  const [profile, setProfile] = useState<ProfileData>(fallbackProfile);
  const [profileLoading, setProfileLoading] = useState(true);
  const [backendUnavailable, setBackendUnavailable] = useState(false);

  const [editing, setEditing] = useState(false);
  const [draftName, setDraftName] = useState(fallbackProfile.fullName);
  const [saving, setSaving] = useState(false);

  const [history, setHistory] = useState<BorrowRecordResponse[]>([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [historyFailed, setHistoryFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const fetchProfile = async () => {
      try {
        const response = await axiosClient.get<ProfileData>('/users/profile');
        if (cancelled) return;
        setProfile(response.data);
        setBackendUnavailable(false);
      } catch {
        if (cancelled) return;
        // Silent fallback — page must still render with AuthContext data
        setProfile(fallbackProfile);
        setBackendUnavailable(true);
      } finally {
        if (!cancelled) setProfileLoading(false);
      }
    };
    fetchProfile();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auth?.email, auth?.displayName, auth?.userRole]);

  useEffect(() => {
    let cancelled = false;
    const fetchHistory = async () => {
      try {
        const data = await borrowApi.getMyBorrowHistory();
        if (!cancelled) setHistory(data);
      } catch {
        if (!cancelled) setHistoryFailed(true);
      } finally {
        if (!cancelled) setHistoryLoading(false);
      }
    };
    fetchHistory();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleEdit = () => {
    setDraftName(profile.fullName);
    setEditing(true);
  };

  const handleCancel = () => {
    setEditing(false);
    setDraftName(profile.fullName);
  };

  const handleSave = async () => {
    const trimmed = draftName.trim();
    if (!trimmed) {
      showToast('Name cannot be empty', 'error');
      return;
    }
    const previous = profile.fullName;
    try {
      setSaving(true);
      // Optimistic update so the UI feels responsive
      setProfile((p) => ({ ...p, fullName: trimmed }));
      await axiosClient.put('/users/profile', { fullName: trimmed });
      showToast('Profile updated', 'success');
      setEditing(false);
    } catch {
      // Revert on failure
      setProfile((p) => ({ ...p, fullName: previous }));
      showToast('Profile update unavailable', 'error');
    } finally {
      setSaving(false);
    }
  };

  const totalBorrowed = historyFailed ? 0 : history.length;
  const currentlyActive = historyFailed ? 0 : history.filter((r) => r.status === 'BORROWED').length;
  const totalReturned = historyFailed ? 0 : history.filter((r) => r.status === 'RETURNED').length;

  const recent = [...history]
    .sort((a, b) => new Date(b.borrowDate).getTime() - new Date(a.borrowDate).getTime())
    .slice(0, 3);

  return (
    <div className="pt-16 min-h-screen bg-slate-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-[#0f172a]">My Profile</h1>
          <p className="text-slate-600 mt-1 text-sm">
            Manage your personal information and borrow statistics
          </p>
        </div>

        {/* Personal info card */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-[#0f172a]">Personal Information</h2>
            {!editing && (
              <button
                type="button"
                onClick={handleEdit}
                className="text-sm font-medium text-[#2563eb] hover:text-blue-700"
              >
                Edit
              </button>
            )}
          </div>

          <div className="flex items-start gap-6">
            <div className="w-20 h-20 rounded-full bg-[#2563eb] text-white text-2xl font-bold flex items-center justify-center shrink-0">
              {getInitials(profile.fullName || profile.email || '?')}
            </div>
            <div className="flex-1 space-y-4">
              <div>
                <label className="block text-xs uppercase tracking-wider text-slate-500 mb-1">
                  Full Name
                </label>
                {editing ? (
                  <div className="flex flex-wrap gap-2">
                    <input
                      type="text"
                      value={draftName}
                      onChange={(e) => setDraftName(e.target.value)}
                      className="border border-slate-200 rounded-lg px-3 py-2 flex-1 min-w-[12rem] focus:ring-2 focus:ring-[#2563eb] focus:border-transparent outline-none transition-shadow"
                    />
                    <button
                      type="button"
                      onClick={handleSave}
                      disabled={saving}
                      className="inline-flex items-center px-4 py-2 rounded-lg text-sm font-semibold text-white bg-[#2563eb] hover:bg-blue-700 disabled:opacity-50 transition-colors"
                    >
                      {saving ? 'Saving…' : 'Save'}
                    </button>
                    <button
                      type="button"
                      onClick={handleCancel}
                      disabled={saving}
                      className="inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 disabled:opacity-50 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                ) : profileLoading ? (
                  <div className="h-5 w-40 bg-slate-200 rounded animate-pulse" />
                ) : (
                  <p className="text-base font-medium text-slate-900">{profile.fullName || '—'}</p>
                )}
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-slate-500 mb-1">
                  Email
                </label>
                {profileLoading ? (
                  <div className="h-5 w-56 bg-slate-200 rounded animate-pulse" />
                ) : (
                  <p className="text-base text-slate-900">{profile.email || '—'}</p>
                )}
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-slate-500 mb-1">
                  Role
                </label>
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                    profile.role === 'ADMIN'
                      ? 'bg-purple-100 text-purple-700'
                      : 'bg-blue-100 text-blue-700'
                  }`}
                >
                  {profile.role}
                </span>
              </div>

              {backendUnavailable && !profileLoading && (
                <p className="text-xs text-slate-500 italic">
                  Showing local data. Connect backend (GET /api/users/profile) for the saved name.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-[#0f172a] mb-4">Borrow Statistics</h2>
          {historyLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="animate-pulse bg-white rounded-lg shadow-sm border border-slate-200 p-5"
                >
                  <div className="h-10 w-10 rounded-lg bg-slate-200 mb-3" />
                  <div className="h-3 w-20 bg-slate-200 rounded mb-2" />
                  <div className="h-6 w-10 bg-slate-200 rounded" />
                </div>
              ))}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <StatTile label="Total Borrowed" value={totalBorrowed} pillBg="bg-blue-50" pillText="text-[#2563eb]" />
                <StatTile label="Currently Active" value={currentlyActive} pillBg="bg-amber-50" pillText="text-[#d97706]" />
                <StatTile label="Total Returned" value={totalReturned} pillBg="bg-green-50" pillText="text-[#16a34a]" />
              </div>
              {historyFailed && (
                <p className="mt-3 text-xs text-slate-500 italic">
                  Connect backend to see stats (GET /api/borrow/history unavailable).
                </p>
              )}
            </>
          )}
        </div>

        {/* Recent activity mini table */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200">
            <h3 className="text-base font-semibold text-[#0f172a]">Recent Activity</h3>
            <p className="text-sm text-slate-500 mt-0.5">Your last 3 borrow records</p>
          </div>
          {historyLoading ? (
            <div className="p-6 text-center text-sm text-slate-500">Loading…</div>
          ) : historyFailed ? (
            <div className="p-6 text-center text-sm text-slate-500">
              Borrow history unavailable. Make sure the backend is running.
            </div>
          ) : recent.length === 0 ? (
            <div className="p-6 text-center text-sm text-slate-500">No borrow records yet.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 uppercase text-xs tracking-wider">
                    <th className="px-4 py-2 text-left">Book</th>
                    <th className="px-4 py-2 text-left">Borrowed</th>
                    <th className="px-4 py-2 text-left">Returned</th>
                    <th className="px-4 py-2 text-left">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {recent.map((r) => (
                    <tr key={r.id}>
                      <td className="px-4 py-3 font-medium text-slate-900">{r.bookTitle}</td>
                      <td className="px-4 py-3 text-slate-600">{formatDate(r.borrowDate)}</td>
                      <td className="px-4 py-3 text-slate-600">{formatDate(r.returnDate)}</td>
                      <td className="px-4 py-3">
                        <StatusBadge status={r.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
