'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { CheckCircle, XCircle, Bell, X } from 'lucide-react';
import { notificationService, type NotificationRecord } from '@/app/lib/api';

const POLL_INTERVAL_MS = 25000;
const AUTO_DISMISS_MS = 6000;

const toastIcon = (eventType: string) => {
  if (eventType.includes('REJECTED')) {
    return <XCircle className="h-5 w-5 text-red-600 flex-shrink-0" />;
  }
  if (eventType.includes('VERIFIED') || eventType.includes('APPROVED')) {
    return <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />;
  }
  return <Bell className="h-5 w-5 text-blue-600 flex-shrink-0" />;
};

const toastAccent = (eventType: string) => {
  if (eventType.includes('REJECTED')) {
    return 'border-red-200 bg-red-50';
  }
  if (eventType.includes('VERIFIED') || eventType.includes('APPROVED')) {
    return 'border-green-200 bg-green-50';
  }
  return 'border-blue-200 bg-blue-50';
};

export default function NotificationToasts() {
  const [toasts, setToasts] = useState<NotificationRecord[]>([]);
  const seenIds = useRef<Set<string>>(new Set());
  const dismissTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  const dismiss = useCallback((id: string) => {
    setToasts((curr) => curr.filter((toast) => toast.id !== id));
    if (dismissTimers.current[id]) {
      clearTimeout(dismissTimers.current[id]);
      delete dismissTimers.current[id];
    }
  }, []);

  const poll = useCallback(async () => {
    if (typeof window === 'undefined' || !localStorage.getItem('access_token')) {
      return;
    }
    try {
      const response = await notificationService.getAll(false);
      const items: NotificationRecord[] = Array.isArray(response?.data?.results)
        ? response.data.results
        : Array.isArray(response?.data)
          ? response.data
          : [];

      const fresh = items.filter((item) => !seenIds.current.has(item.id));
      if (fresh.length === 0) return;

      fresh.forEach((item) => seenIds.current.add(item.id));
      setToasts((curr) => [...fresh, ...curr]);

      fresh.forEach((item) => {
        void notificationService.markRead(item.id).catch(() => {});
        // Approval means payment is now due. Keep it on screen until the user
        // acts on it or dismisses it manually, instead of it vanishing unread.
        if (item.event_type !== 'REQUEST_APPROVED') {
          dismissTimers.current[item.id] = setTimeout(() => dismiss(item.id), AUTO_DISMISS_MS);
        }
      });
    } catch {
      // Silent — toasts are a nice-to-have, not a page-critical data source.
    }
  }, [dismiss]);

  useEffect(() => {
    void poll();
    const interval = setInterval(() => void poll(), POLL_INTERVAL_MS);
    return () => {
      clearInterval(interval);
      Object.values(dismissTimers.current).forEach(clearTimeout);
    };
  }, [poll]);

  if (toasts.length === 0) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-[100] flex w-full max-w-sm flex-col gap-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`flex items-start gap-3 rounded-xl border p-4 shadow-lg ${toastAccent(toast.event_type)}`}
        >
          {toastIcon(toast.event_type)}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-900">{toast.title}</p>
            <p className="mt-0.5 text-sm text-gray-600">{toast.message}</p>
            {toast.event_type === 'REQUEST_APPROVED' && (
              <Link
                href="/dashboard/billing"
                onClick={() => dismiss(toast.id)}
                className="mt-2 inline-block px-4 py-1.5 bg-blue-600 text-white text-xs font-semibold rounded-lg hover:bg-blue-700"
              >
                Pay Now
              </Link>
            )}
          </div>
          <button
            type="button"
            onClick={() => dismiss(toast.id)}
            className="text-gray-400 hover:text-gray-600 flex-shrink-0"
            aria-label="Dismiss notification"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
