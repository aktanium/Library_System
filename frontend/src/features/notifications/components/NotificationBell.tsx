import { useEffect, useRef, useState } from 'react';
import { notificationApi } from '../api/notificationApi';
import type { NotificationResponse } from '../api/notificationApi';
import { useAuth } from '../../../hooks/useAuth';

const POLL_INTERVAL_MS = 60_000;

const BellIcon = () => (
  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
    />
  </svg>
);

const typeBorderClass = (type: string | null | undefined): string => {
  switch ((type ?? '').toUpperCase()) {
    case 'OVERDUE':
      return 'border-l-4 border-red-500';
    case 'REMINDER':
      return 'border-l-4 border-amber-500';
    case 'SYSTEM':
      return 'border-l-4 border-blue-500';
    default:
      return '';
  }
};

const formatRelative = (dateStr: string): string => {
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return '';
  const diffMs = Date.now() - d.getTime();
  const diffMin = Math.floor(diffMs / 60_000);
  if (diffMin < 1) return 'just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDay = Math.floor(diffHr / 24);
  if (diffDay < 7) return `${diffDay}d ago`;
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
};

const NotificationBell = () => {
  const { isAuthenticated } = useAuth();
  const [unread, setUnread] = useState(0);
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<NotificationResponse[]>([]);
  const [listLoading, setListLoading] = useState(false);
  const [listError, setListError] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Poll unread count when authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      setUnread(0);
      return;
    }

    let cancelled = false;
    const fetchCount = async () => {
      try {
        const count = await notificationApi.getUnreadCount();
        if (!cancelled) setUnread(count);
      } catch {
        // Endpoint might be missing / unavailable — fall back to 0, no toast spam
        if (!cancelled) setUnread(0);
      }
    };
    fetchCount();
    const interval = setInterval(fetchCount, POLL_INTERVAL_MS);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [isAuthenticated]);

  // Click outside closes dropdown
  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, [open]);

  const loadList = async () => {
    setListLoading(true);
    setListError(false);
    try {
      const data = await notificationApi.getMyNotifications();
      setItems(data);
    } catch {
      setListError(true);
    } finally {
      setListLoading(false);
    }
  };

  const handleToggle = async () => {
    const next = !open;
    setOpen(next);
    if (next) await loadList();
  };

  const handleMarkOne = async (n: NotificationResponse) => {
    if (n.read) return;
    try {
      await notificationApi.markRead(n.id);
      setItems((prev) => prev.map((i) => (i.id === n.id ? { ...i, read: true } : i)));
      setUnread((c) => Math.max(0, c - 1));
    } catch {
      // ignore — keep optimistic state minimal
    }
  };

  const handleMarkAll = async () => {
    try {
      await notificationApi.markAllRead();
      setItems((prev) => prev.map((i) => ({ ...i, read: true })));
      setUnread(0);
    } catch {
      // ignore
    }
  };

  if (!isAuthenticated) return null;

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={handleToggle}
        aria-label={`Notifications${unread > 0 ? ` (${unread} unread)` : ''}`}
        aria-expanded={open}
        className="relative text-white p-2 rounded-lg hover:bg-white/10 transition-colors"
      >
        <BellIcon />
        {unread > 0 && (
          <span
            className="absolute -top-0.5 -right-0.5 inline-flex items-center justify-center min-w-[1.1rem] h-[1.1rem] px-1 rounded-full text-[10px] font-bold leading-none bg-red-500 text-white ring-2 ring-[#1e3a5f]"
            aria-hidden="true"
          >
            {unread > 99 ? '99+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 mt-2 w-80 max-w-[calc(100vw-1rem)] bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 z-50 overflow-hidden"
        >
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-slate-700">
            <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">Notifications</p>
            {items.some((i) => !i.read) && (
              <button
                type="button"
                onClick={handleMarkAll}
                className="text-xs font-medium text-[#2563eb] hover:text-blue-700 dark:text-blue-400"
              >
                Mark all read
              </button>
            )}
          </div>

          {listLoading ? (
            <div className="px-4 py-6 text-center text-sm text-slate-500 dark:text-slate-400">
              Loading…
            </div>
          ) : listError ? (
            <div className="px-4 py-6 text-center text-sm text-slate-500 dark:text-slate-400">
              Notifications unavailable.
            </div>
          ) : items.length === 0 ? (
            <div className="px-4 py-8 text-center text-sm text-slate-500 dark:text-slate-400">
              You're all caught up. 🎉
            </div>
          ) : (
            <ul className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-700">
              {items.slice(0, 10).map((n) => (
                <li key={n.id}>
                  <button
                    type="button"
                    onClick={() => handleMarkOne(n)}
                    className={`w-full text-left px-4 py-3 flex gap-3 transition-colors ${typeBorderClass(n.type)} ${
                      n.read
                        ? 'hover:bg-slate-50 dark:hover:bg-slate-700/40'
                        : 'bg-blue-50/60 dark:bg-blue-900/20 hover:bg-blue-50 dark:hover:bg-blue-900/30'
                    }`}
                  >
                    <div className="mt-1.5 shrink-0">
                      <span
                        className={`block w-2 h-2 rounded-full ${
                          n.read ? 'bg-transparent' : 'bg-[#2563eb]'
                        }`}
                        aria-hidden="true"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p
                        className={`text-sm ${
                          n.read
                            ? 'text-slate-700 dark:text-slate-300'
                            : 'font-semibold text-slate-900 dark:text-slate-100'
                        }`}
                      >
                        {n.title}
                      </p>
                      {n.message && (
                        <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5 line-clamp-2">
                          {n.message}
                        </p>
                      )}
                      <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                        {formatRelative(n.createdAt)}
                      </p>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
