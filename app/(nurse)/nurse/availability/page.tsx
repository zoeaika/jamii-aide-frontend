'use client';

import { useCallback, useEffect, useState } from 'react';
import { CalendarClock, Power, AlertCircle } from 'lucide-react';
import { getAccountVerificationState, nurseService, availabilitySlotService, type AvailabilitySlotRecord } from '@/app/lib/api';

const DAYS = [
  { value: 0, label: 'Monday' },
  { value: 1, label: 'Tuesday' },
  { value: 2, label: 'Wednesday' },
  { value: 3, label: 'Thursday' },
  { value: 4, label: 'Friday' },
  { value: 5, label: 'Saturday' },
  { value: 6, label: 'Sunday' },
];

type NurseProfile = {
  id: string;
  is_accepting_requests?: boolean;
  availability_status?: 'AVAILABLE' | 'BUSY' | 'OFFLINE' | 'OFF_DUTY';
  availability_slots?: AvailabilitySlotRecord[];
};

const statusBadge = (status?: string) => {
  switch (status) {
    case 'AVAILABLE':
      return { label: 'Available', classes: 'bg-green-100 text-green-700 border border-green-200' };
    case 'BUSY':
      return { label: 'Busy — ongoing visit', classes: 'bg-orange-100 text-orange-700 border border-orange-200' };
    case 'OFFLINE':
      return { label: 'Offline', classes: 'bg-gray-100 text-gray-700 border border-gray-200' };
    case 'OFF_DUTY':
      return { label: 'Off duty', classes: 'bg-slate-100 text-slate-600 border border-slate-200' };
    default:
      return { label: 'Unknown', classes: 'bg-gray-100 text-gray-500 border border-gray-200' };
  }
};

export default function NurseAvailabilityPage() {
  const [nurse, setNurse] = useState<NurseProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isTogglingOnline, setIsTogglingOnline] = useState(false);
  const [savingDay, setSavingDay] = useState<number | null>(null);
  const [draft, setDraft] = useState<Record<number, { working: boolean; start: string; end: string }>>({});
  const [verificationState, setVerificationState] = useState(getAccountVerificationState());

  const load = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      const response = await nurseService.me();
      const profile = response?.data as NurseProfile;
      setNurse(profile);

      const nextDraft: Record<number, { working: boolean; start: string; end: string }> = {};
      DAYS.forEach(({ value }) => {
        const slot = (profile.availability_slots || []).find((s) => s.day_of_week === value);
        nextDraft[value] = {
          working: slot ? slot.is_available : false,
          start: slot ? slot.start_time.slice(0, 5) : '08:00',
          end: slot ? slot.end_time.slice(0, 5) : '17:00',
        };
      });
      setDraft(nextDraft);
    } catch {
      setError('Could not load your availability settings.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    const storedUser = typeof window !== 'undefined' ? localStorage.getItem('authUser') || localStorage.getItem('user') : null;
    if (!storedUser) return;
    try {
      setVerificationState(getAccountVerificationState(JSON.parse(storedUser)));
    } catch {
      setVerificationState(getAccountVerificationState());
    }
  }, []);

  const isPendingAccess = verificationState.isPending;

  const handleToggleOnline = async () => {
    if (!nurse) return;
    setIsTogglingOnline(true);
    try {
      const response = await nurseService.toggleAvailability(nurse.id, !nurse.is_accepting_requests);
      setNurse((curr) => (curr ? { ...curr, ...response.data } : curr));
    } catch {
      setError('Could not update your online status. Please try again.');
    } finally {
      setIsTogglingOnline(false);
    }
  };

  const handleSaveDay = async (day: number) => {
    const dayDraft = draft[day];
    if (!dayDraft) return;

    if (dayDraft.working && dayDraft.start >= dayDraft.end) {
      setError('End time must be after start time.');
      return;
    }

    setSavingDay(day);
    setError('');
    try {
      const existingSlot = (nurse?.availability_slots || []).find((s) => s.day_of_week === day);
      if (existingSlot) {
        await availabilitySlotService.update(existingSlot.id, {
          is_available: dayDraft.working,
          start_time: dayDraft.start,
          end_time: dayDraft.end,
        });
      } else {
        await availabilitySlotService.create({
          day_of_week: day,
          start_time: dayDraft.start,
          end_time: dayDraft.end,
          is_available: dayDraft.working,
        });
      }
      await load();
    } catch {
      setError('Could not save this day. Please try again.');
    } finally {
      setSavingDay(null);
    }
  };

  const badge = statusBadge(nurse?.availability_status);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">My Availability</h1>
        <p className="text-gray-600 mt-2">Set your weekly working hours and control whether you&apos;re currently accepting new requests.</p>
      </div>

      {isPendingAccess && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800 flex items-start gap-2">
          <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
          Your account is pending verification. You can review your availability settings, but changes won&apos;t affect matching until your account is approved.
        </div>
      )}

      {error && <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

      {isLoading ? (
        <div className="rounded-xl border border-gray-200 bg-white p-8 text-sm text-gray-600">Loading availability...</div>
      ) : (
        <>
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <p className="text-sm font-semibold text-gray-500">Current status</p>
                <span className={`mt-2 inline-flex rounded-full px-3 py-1 text-sm font-semibold ${badge.classes}`}>
                  {badge.label}
                </span>
              </div>
              <button
                type="button"
                onClick={() => void handleToggleOnline()}
                disabled={isTogglingOnline || isPendingAccess}
                className={`inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${
                  nurse?.is_accepting_requests
                    ? 'bg-red-50 text-red-700 border border-red-200 hover:bg-red-100'
                    : 'bg-green-600 text-white hover:bg-green-700'
                }`}
              >
                <Power className="h-4 w-4" />
                {isTogglingOnline
                  ? 'Updating...'
                  : nurse?.is_accepting_requests
                    ? 'Go Offline'
                    : 'Go Online'}
              </button>
            </div>
            <p className="mt-3 text-sm text-gray-500">
              {nurse?.is_accepting_requests
                ? 'You are currently accepting new automatically-matched care requests during your working hours.'
                : 'You are offline. New requests will not be auto-matched to you until you go back online. An admin can still assign you manually if needed.'}
            </p>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 flex items-center text-lg font-semibold text-gray-900">
              <CalendarClock className="mr-2 h-5 w-5 text-brand-dark-blue" />
              Weekly working hours
            </h2>
            <div className="space-y-3">
              {DAYS.map(({ value, label }) => {
                const dayDraft = draft[value] || { working: false, start: '08:00', end: '17:00' };
                return (
                  <div key={value} className="flex flex-wrap items-center gap-3 rounded-lg border border-gray-200 p-3">
                    <label className="flex w-32 items-center gap-2">
                      <input
                        type="checkbox"
                        checked={dayDraft.working}
                        onChange={(e) =>
                          setDraft((curr) => ({ ...curr, [value]: { ...dayDraft, working: e.target.checked } }))
                        }
                        className="h-4 w-4 text-brand-dark-blue"
                      />
                      <span className="text-sm font-medium text-gray-900">{label}</span>
                    </label>
                    <input
                      type="time"
                      value={dayDraft.start}
                      disabled={!dayDraft.working}
                      onChange={(e) => setDraft((curr) => ({ ...curr, [value]: { ...dayDraft, start: e.target.value } }))}
                      className="rounded-lg border border-gray-300 px-2 py-1.5 text-sm disabled:bg-gray-50 disabled:text-gray-400"
                    />
                    <span className="text-sm text-gray-400">to</span>
                    <input
                      type="time"
                      value={dayDraft.end}
                      disabled={!dayDraft.working}
                      onChange={(e) => setDraft((curr) => ({ ...curr, [value]: { ...dayDraft, end: e.target.value } }))}
                      className="rounded-lg border border-gray-300 px-2 py-1.5 text-sm disabled:bg-gray-50 disabled:text-gray-400"
                    />
                    <button
                      type="button"
                      onClick={() => void handleSaveDay(value)}
                      disabled={savingDay === value}
                      className="ml-auto rounded-lg bg-brand-dark-blue px-3 py-1.5 text-sm font-semibold text-white hover:bg-brand-deep-navy disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {savingDay === value ? 'Saving...' : 'Save'}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
