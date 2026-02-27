'use client';

import { useEffect, useState } from 'react';
import { Bell, CheckCheck, Clock } from 'lucide-react';
import { notificationService } from '@/app/lib/api';

type NotificationItem = {
  id: string;
  title: string;
  message: string;
  event_type: 'NURSE_SUGGESTED' | 'REQUEST_APPROVED' | 'REQUEST_REJECTED' | string;
  event_type_display?: string;
  is_read: boolean;
  created_at: string;
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const [response, unreadResponse] = await Promise.all([
          notificationService.getAll(showUnreadOnly ? false : undefined),
          notificationService.unreadCount(),
        ]);
        const items = response?.data?.results || response?.data || [];
        if (Array.isArray(items)) {
          setNotifications(items);
        }
        const count = Number(unreadResponse?.data?.unread_count ?? 0);
        setUnreadCount(Number.isFinite(count) ? count : 0);
      } catch {
      } finally {
        setIsLoading(false);
      }
    };

    void load();
  }, [showUnreadOnly]);

  const markRead = async (id: string) => {
    setNotifications((curr) => curr.map((n) => (n.id === id ? { ...n, is_read: true } : n)));
    try {
      await notificationService.markRead(id);
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch {
    }
  };

  const markAllRead = async () => {
    setNotifications((curr) => curr.map((n) => ({ ...n, is_read: true })));
    try {
      await notificationService.markAllRead();
      setUnreadCount(0);
    } catch {
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
          <p className="text-gray-600 mt-2">Track request lifecycle updates</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowUnreadOnly(false)}
            className={`px-3 py-2 rounded-lg text-sm font-semibold ${!showUnreadOnly ? 'bg-blue-600 text-white' : 'border border-gray-300 hover:bg-gray-50'}`}
          >
            All
          </button>
          <button
            type="button"
            onClick={() => setShowUnreadOnly(true)}
            className={`px-3 py-2 rounded-lg text-sm font-semibold ${showUnreadOnly ? 'bg-blue-600 text-white' : 'border border-gray-300 hover:bg-gray-50'}`}
          >
            Unread ({unreadCount})
          </button>
          <button
            type="button"
            onClick={markAllRead}
            className="inline-flex items-center px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 text-sm font-semibold"
          >
            <CheckCheck className="h-4 w-4 mr-2" />
            Mark all read
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="bg-white border border-gray-200 rounded-xl p-10 text-center text-gray-600">Loading notifications...</div>
      ) : notifications.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-xl p-10 text-center">
          <Bell className="mx-auto h-8 w-8 text-gray-400 mb-3" />
          <p className="text-gray-700 font-medium">No notifications yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className={`rounded-xl border p-4 ${notification.is_read ? 'bg-white border-gray-200' : 'bg-blue-50 border-blue-200'}`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-gray-900">{notification.title}</p>
                  <p className="text-sm text-gray-700 mt-1">{notification.message}</p>
                  <div className="text-xs text-gray-500 mt-2 flex items-center gap-2">
                    <span>{notification.event_type_display || notification.event_type}</span>
                    <span>-</span>
                    <span className="inline-flex items-center"><Clock className="h-3.5 w-3.5 mr-1" />{new Date(notification.created_at).toLocaleString()}</span>
                  </div>
                </div>
                {!notification.is_read && (
                  <button
                    type="button"
                    onClick={() => markRead(notification.id)}
                    className="text-xs font-semibold text-blue-700 hover:text-blue-900"
                  >
                    Mark read
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
