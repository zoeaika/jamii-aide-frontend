'use client';

import { useEffect, useState, useMemo } from 'react';
import { DollarSign, TrendingUp, Calendar, Download, CreditCard, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { nurseEarningService } from '@/app/lib/api';

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

  const stats = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const thisWeek = new Date(today);
    thisWeek.setDate(thisWeek.getDate() - thisWeek.getDay());
    
    const thisMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    const todayEarnings = earnings
      .filter(e => e.status === 'COMPLETED' && new Date(e.updated_at || e.created_at || '').setHours(0, 0, 0, 0) === today.getTime())
      .reduce((sum, e) => sum + Number(e.amount || 0), 0);

    const weekEarnings = earnings
      .filter(e => e.status === 'COMPLETED' && new Date(e.updated_at || e.created_at || '') >= thisWeek)
      .reduce((sum, e) => sum + Number(e.amount || 0), 0);

    const monthEarnings = earnings
      .filter(e => e.status === 'COMPLETED' && new Date(e.updated_at || e.created_at || '') >= thisMonth)
      .reduce((sum, e) => sum + Number(e.amount || 0), 0);

    const totalEarnings = earnings
      .filter(e => e.status === 'COMPLETED')
      .reduce((sum, e) => sum + Number(e.amount || 0), 0);

    const pendingAmount = earnings
      .filter(e => e.status === 'PENDING')
      .reduce((sum, e) => sum + Number(e.amount || 0), 0);

    return {
      today: todayEarnings,
      week: weekEarnings,
      month: monthEarnings,
      total: totalEarnings,
      pending: pendingAmount,
    };
  }, [earnings]);

  const pendingEarnings = useMemo(() => earnings.filter(e => e.status === 'PENDING'), [earnings]);
  const completedEarnings = useMemo(() => earnings.filter(e => e.status === 'COMPLETED'), [earnings]);

  return (
    <div className="space-y-6 pt-16">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Earnings</h1>
          <p className="text-gray-600 mt-2">Track your income and payments</p>
        </div>
        <button className="px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 flex items-center space-x-2 disabled:opacity-50">
          <Download className="h-5 w-5" />
          <span>Download Report</span>
        </button>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 flex items-start">
          <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Earnings Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <DollarSign className="h-8 w-8 opacity-80" />
            <TrendingUp className="h-5 w-5" />
          </div>
          <p className="text-3xl font-bold mb-1">KES {stats.today.toLocaleString()}</p>
          <p className="text-green-100 text-sm">Today&apos;s Earnings</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <Calendar className="h-8 w-8 text-blue-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900 mb-1">KES {stats.week.toLocaleString()}</p>
          <p className="text-gray-600 text-sm">This Week</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <Calendar className="h-8 w-8 text-indigo-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900 mb-1">KES {stats.month.toLocaleString()}</p>
          <p className="text-gray-600 text-sm">This Month</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <TrendingUp className="h-8 w-8 text-emerald-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900 mb-1">KES {stats.total.toLocaleString()}</p>
          <p className="text-gray-600 text-sm">Total Earned</p>
        </div>

        <div className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <Clock className="h-8 w-8 opacity-80" />
          </div>
          <p className="text-3xl font-bold mb-1">KES {stats.pending.toLocaleString()}</p>
          <p className="text-amber-100 text-sm">Pending Payment</p>
        </div>
      </div>

      {/* Pending Earnings Section */}
      {pendingEarnings.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-amber-900 mb-4 flex items-center">
            <AlertCircle className="h-5 w-5 mr-2" />
            Pending Payments ({pendingEarnings.length})
          </h3>
          <div className="space-y-2">
            {pendingEarnings.map((earning) => (
              <div key={earning.id} className="flex items-center justify-between p-3 bg-white rounded border border-amber-100">
                <div>
                  <p className="font-medium text-gray-900">Appointment ID: {earning.appointment_id}</p>
                  <p className="text-sm text-gray-600">{new Date(earning.created_at || '').toLocaleDateString()}</p>
                </div>
                <p className="font-semibold text-amber-600">KES {Number(earning.amount || 0).toLocaleString()}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Completed Earnings History */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <CheckCircle className="h-5 w-5 mr-2 text-green-600" />
          Paid Earnings ({completedEarnings.length})
        </h3>
        
        {isLoading ? (
          <div className="text-center py-8 text-gray-600">Loading earnings...</div>
        ) : completedEarnings.length === 0 ? (
          <div className="text-center py-8 text-gray-600">No paid earnings yet</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-gray-200">
                <tr>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Date</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Appointment</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-700">Amount</th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-700">Status</th>
                </tr>
              </thead>
              <tbody>
                {completedEarnings.map((earning) => (
                  <tr key={earning.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 text-gray-900">
                      {new Date(earning.updated_at || earning.created_at || '').toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 text-gray-900 font-mono text-xs">{earning.appointment_id || 'N/A'}</td>
                    <td className="py-3 px-4 text-right font-semibold text-gray-900">
                      KES {Number(earning.amount || 0).toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        <CheckCircle className="h-3 w-3 mr-1" />
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
          </div>
          <p className="text-3xl font-bold text-gray-900 mb-1">KES {earnings.week.toLocaleString()}</p>
          <p className="text-gray-600 text-sm">This Week</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <Calendar className="h-8 w-8 text-purple-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900 mb-1">KES {earnings.month.toLocaleString()}</p>
          <p className="text-gray-600 text-sm">This Month</p>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <TrendingUp className="h-8 w-8 opacity-80" />
          </div>
          <p className="text-3xl font-bold mb-1">KES {earnings.total.toLocaleString()}</p>
          <p className="text-purple-100 text-sm">Total Earned</p>
        </div>
      </div>

      {/* Charts and Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Performance */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Monthly Performance</h2>
          <div className="space-y-4">
            {monthlyBreakdown.map((month, idx) => (
              <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-semibold text-gray-900">{month.month}</p>
                  <p className="text-sm text-gray-600">{month.visits} visits</p>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold text-green-600">
                    KES {month.earnings.toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-500">
                    KES {Math.round(month.earnings / month.visits).toLocaleString()} avg
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Payment Method */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Payment Information</h2>
          <div className="space-y-4">
            <div className="p-4 border-2 border-green-200 bg-green-50 rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <CreditCard className="h-6 w-6 text-green-600" />
                  <div>
                    <p className="font-semibold text-gray-900">M-Pesa</p>
                    <p className="text-sm text-gray-600">+254 712 345 678</p>
                  </div>
                </div>
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <p className="text-xs text-gray-600">Primary payment method</p>
            </div>

            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-3">Payment Schedule</h3>
              <div className="space-y-2 text-sm text-gray-600">
                <p>• Payments processed every Friday</p>
                <p>• Direct deposit to M-Pesa</p>
                <p>• Processing time: 24-48 hours</p>
              </div>
            </div>

            <button className="w-full py-3 border-2 border-green-600 text-green-600 rounded-lg hover:bg-green-50 font-medium">
              Update Payment Method
            </button>
          </div>
        </div>
      </div>

      {/* Recent Payments */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Payments</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Date</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Patient</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Service</th>
                <th className="text-right py-3 px-4 font-semibold text-gray-700">Amount</th>
                <th className="text-center py-3 px-4 font-semibold text-gray-700">Status</th>
              </tr>
            </thead>
            <tbody>
              {recentPayments.map((payment, idx) => (
                <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4 text-sm text-gray-900">
                    {new Date(payment.date).toLocaleDateString()}
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-900">{payment.patient}</td>
                  <td className="py-3 px-4 text-sm text-gray-600">{payment.service}</td>
                  <td className="py-3 px-4 text-sm font-semibold text-gray-900 text-right">
                    KES {payment.amount.toLocaleString()}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        payment.status === 'paid'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-yellow-100 text-yellow-700'
                      }`}
                    >
                      {payment.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
