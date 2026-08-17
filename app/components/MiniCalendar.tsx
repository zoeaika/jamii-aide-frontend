'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const WEEKDAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const toIsoDate = (year: number, month: number, day: number) => {
  const mm = String(month + 1).padStart(2, '0');
  const dd = String(day).padStart(2, '0');
  return `${year}-${mm}-${dd}`;
};

type MiniCalendarProps = {
  value: string;
  onChange: (isoDate: string) => void;
  markedDates: Set<string>;
};

export default function MiniCalendar({ value, onChange, markedDates }: MiniCalendarProps) {
  const parsedValue = value ? new Date(`${value}T00:00:00`) : new Date();
  const [viewedYear, setViewedYear] = useState(parsedValue.getFullYear());
  const [viewedMonth, setViewedMonth] = useState(parsedValue.getMonth());

  const todayIso = toIsoDate(new Date().getFullYear(), new Date().getMonth(), new Date().getDate());

  const firstOfMonth = new Date(viewedYear, viewedMonth, 1);
  const daysInMonth = new Date(viewedYear, viewedMonth + 1, 0).getDate();
  // JS getDay(): 0=Sun..6=Sat. Convert to Monday-first index (0=Mon..6=Sun).
  const leadingBlanks = (firstOfMonth.getDay() + 6) % 7;

  const monthLabel = firstOfMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  const goToPreviousMonth = () => {
    if (viewedMonth === 0) {
      setViewedMonth(11);
      setViewedYear((y) => y - 1);
    } else {
      setViewedMonth((m) => m - 1);
    }
  };

  const goToNextMonth = () => {
    if (viewedMonth === 11) {
      setViewedMonth(0);
      setViewedYear((y) => y + 1);
    } else {
      setViewedMonth((m) => m + 1);
    }
  };

  const cells: Array<{ day: number; iso: string } | null> = [
    ...Array.from({ length: leadingBlanks }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => ({
      day: i + 1,
      iso: toIsoDate(viewedYear, viewedMonth, i + 1),
    })),
  ];

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-3 w-full max-w-xs">
      <div className="flex items-center justify-between mb-2">
        <button
          type="button"
          onClick={goToPreviousMonth}
          className="p-1 rounded hover:bg-gray-100 text-gray-500"
          aria-label="Previous month"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <span className="text-sm font-semibold text-gray-900">{monthLabel}</span>
        <button
          type="button"
          onClick={goToNextMonth}
          className="p-1 rounded hover:bg-gray-100 text-gray-500"
          aria-label="Next month"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-1">
        {WEEKDAY_LABELS.map((label) => (
          <div key={label} className="text-center text-[11px] font-medium text-gray-400">
            {label}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {cells.map((cell, idx) => {
          if (!cell) {
            return <div key={`blank-${idx}`} />;
          }
          const isSelected = cell.iso === value;
          const isToday = cell.iso === todayIso;
          const hasAppointments = markedDates.has(cell.iso);

          return (
            <button
              key={cell.iso}
              type="button"
              onClick={() => onChange(cell.iso)}
              className={`relative h-8 w-8 mx-auto rounded-full text-sm flex items-center justify-center transition ${
                isSelected
                  ? 'bg-green-600 text-white font-semibold'
                  : isToday
                    ? 'border border-green-400 text-green-700 font-semibold'
                    : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              {cell.day}
              {hasAppointments && (
                <span
                  className={`absolute bottom-0.5 h-1.5 w-1.5 rounded-full ${
                    isSelected ? 'bg-white' : 'bg-green-600'
                  }`}
                />
              )}
            </button>
          );
        })}
      </div>

      <div className="mt-3 flex items-center gap-1.5 text-xs text-gray-500">
        <span className="h-1.5 w-1.5 rounded-full bg-green-600" />
        Has upcoming appointment
      </div>
    </div>
  );
}
