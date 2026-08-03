'use client';

import { useEffect, useMemo, useState } from 'react';
import { DollarSign, TrendingUp, Calendar, Download, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { getAccountVerificationState, nurseEarningService } from '@/app/lib/api';
import { formatDate, formatKES } from '@/app/lib/format';

type EarningRecord = {
  id: string;
  appointment_id?: string;
  amount: number;
  status: 'PENDING' | 'COMPLETED';
  created_at?: string;
  updated_at?: string;
};

export default function NurseEarningsPage() {
  const [earnings, setEarnings] = useState<EarningRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [verificationState, setVerificationState] = useState(getAccountVerificationState());

  useEffect(() => {
    const loadEarnings = async () => {
      setIsLoading(true);
      try {
        const response = await nurseEarningService.getAll();
        const items = response?.data?.results || response?.data || [];
        setEarnings(Array.isArray(items) ? items : []);
      } catch (err: any) {
        const errorMsg = err?.response?.data?.detail || 'Failed to load earnings';
        setError(errorMsg);
        setEarnings([]);
      } finally {
        setIsLoading(false);
      }
    };

    void loadEarnings();
  }, []);

  useEffect(() => {
    const storedUser = typeof window !== 'undefined' ? localStorage.getItem('authUser') || localStorage.getItem('user') : null;
    if (!storedUser) {
      return;
    }

    try {
      const parsed = JSON.parse(storedUser);
      setVerificationState(getAccountVerificationState(parsed));
    } catch {
      setVerificationState(getAccountVerificationState());
    }
  }, []);

  const isPendingAccess = verificationState.isPending;

  const stats = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const thisWeek = new Date(today);
    thisWeek.setDate(thisWeek.getDate() - thisWeek.getDay());

    const thisMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    const todayEarnings = earnings
      .filter(
        (e) =>
          e.status === 'COMPLETED' &&
          new Date(e.updated_at || e.created_at || '').setHours(0, 0, 0, 0) === today.getTime(),
      )
      .reduce((sum, e) => sum + Number(e.amount || 0), 0);

    const weekEarnings = earnings
      .filter((e) => e.status === 'COMPLETED' && new Date(e.updated_at || e.created_at || '') >= thisWeek)
      .reduce((sum, e) => sum + Number(e.amount || 0), 0);

    const monthEarnings = earnings
      .filter((e) => e.status === 'COMPLETED' && new Date(e.updated_at || e.created_at || '') >= thisMonth)
      .reduce((sum, e) => sum + Number(e.amount || 0), 0);

    const totalEarnings = earnings
      .filter((e) => e.status === 'COMPLETED')
      .reduce((sum, e) => sum + Number(e.amount || 0), 0);

    const pendingAmount = earnings
      .filter((e) => e.status === 'PENDING')
      .reduce((sum, e) => sum + Number(e.amount || 0), 0);

    return {
      today: todayEarnings,
      week: weekEarnings,
      month: monthEarnings,
      total: totalEarnings,
      pending: pendingAmount,
    };
  }, [earnings]);

  const pendingEarnings = useMemo(() => earnings.filter((e) => e.status === 'PENDING'), [earnings]);
  const completedEarnings = useMemo(() => earnings.filter((e) => e.status === 'COMPLETED'), [earnings]);

  return (
    <div className="space-y-6 pt-16">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Earnings</h1>
          <p className="mt-2 text-gray-600">Track your income and payments</p>
        </div>
        <button
          className="flex items-center space-x-2 rounded-lg bg-green-600 px-6 py-3 font-semibold text-white hover:bg-green-700 disabled:opacity-50"
          disabled={isPendingAccess}
        >
          <Download className="h-5 w-5" />
          <span>{isPendingAccess ? 'Locked Until Verified' : 'Download Report'}</span>
        </button>
      </div>

      {isPendingAccess && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          Earnings reports stay locked until your account is verified.
        </div>
      )}

      {error && (
        <div className="flex items-start rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle className="mr-2 mt-0.5 h-5 w-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-5">
        <div className="rounded-xl bg-gradient-to-br from-green-500 to-green-600 p-6 text-white shadow-lg">
          <div className="mb-4 flex items-center justify-between">
            <DollarSign className="h-8 w-8 opacity-80" />
            <TrendingUp className="h-5 w-5" />
          </div>
          <p className="mb-1 text-3xl font-bold">KES {formatKES(stats.today)}</p>
          <p className="text-sm text-green-100">Today&apos;s Earnings</p>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <Calendar className="h-8 w-8 text-blue-600" />
          </div>
          <p className="mb-1 text-3xl font-bold text-gray-900">KES {formatKES(stats.week)}</p>
          <p className="text-sm text-gray-600">This Week</p>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <Calendar className="h-8 w-8 text-indigo-600" />
          </div>
          <p className="mb-1 text-3xl font-bold text-gray-900">KES {formatKES(stats.month)}</p>
          <p className="text-sm text-gray-600">This Month</p>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <TrendingUp className="h-8 w-8 text-emerald-600" />
          </div>
          <p className="mb-1 text-3xl font-bold text-gray-900">KES {formatKES(stats.total)}</p>
          <p className="text-sm text-gray-600">Total Earned</p>
        </div>

        <div className="rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 p-6 text-white shadow-lg">
          <div className="mb-4 flex items-center justify-between">
            <Clock className="h-8 w-8 opacity-80" />
          </div>
          <p className="mb-1 text-3xl font-bold">KES {formatKES(stats.pending)}</p>
          <p className="text-sm text-amber-100">Pending Payment</p>
        </div>
      </div>

      {pendingEarnings.length > 0 && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-6">
          <h3 className="mb-4 flex items-center text-lg font-semibold text-amber-900">
            <AlertCircle className="mr-2 h-5 w-5" />
            Pending Payments ({pendingEarnings.length})
          </h3>
          <div className="space-y-2">
            {pendingEarnings.map((earning) => (
              <div
                key={earning.id}
                className="flex items-center justify-between rounded border border-amber-100 bg-white p-3"
              >
                <div>
                  <p className="font-medium text-gray-900">Appointment ID: {earning.appointment_id}</p>
                  <p className="text-sm text-gray-600">
                    {formatDate(earning.created_at || '')}
                  </p>
                </div>
                <p className="font-semibold text-amber-600">
                  KES {formatKES(earning.amount || 0)}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h3 className="mb-4 flex items-center text-lg font-semibold text-gray-900">
          <CheckCircle className="mr-2 h-5 w-5 text-green-600" />
          Paid Earnings ({completedEarnings.length})
        </h3>

        {isLoading ? (
          <div className="py-8 text-center text-gray-600">Loading earnings...</div>
        ) : completedEarnings.length === 0 ? (
          <div className="py-8 text-center text-gray-600">No paid earnings yet</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Date</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Appointment</th>
                  <th className="px-4 py-3 text-right font-semibold text-gray-700">Amount</th>
                  <th className="px-4 py-3 text-center font-semibold text-gray-700">Status</th>
                </tr>
              </thead>
              <tbody>
                {completedEarnings.map((earning) => (
                  <tr key={earning.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-900">
                      {formatDate(earning.updated_at || earning.created_at || '')}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-900">
                      {earning.appointment_id || 'N/A'}
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-gray-900">
                      KES {formatKES(earning.amount || 0)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                        <CheckCircle className="mr-1 h-3 w-3" />
                        Paid
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
