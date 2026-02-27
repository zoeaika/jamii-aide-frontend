'use client';

import { DollarSign, TrendingUp, CreditCard, Download, CheckCircle, Clock, XCircle } from 'lucide-react';

export default function AdminPaymentsPage() {
  const payments: Array<{
    id: number;
    date: string;
    user: string;
    nurse: string;
    appointment: string;
    amount: number;
    platform_fee: number;
    nurse_payout: number;
    status: 'completed' | 'pending' | 'failed';
    method: string;
  }> = [];

  const stats = {
    totalRevenue: payments.reduce((sum, p) => sum + p.amount, 0),
    platformFees: payments.reduce((sum, p) => sum + p.platform_fee, 0),
    nursePayout: payments.reduce((sum, p) => sum + p.nurse_payout, 0),
    completed: payments.filter(p => p.status === 'completed').length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Payment Management</h1>
          <p className="text-gray-600 mt-2">Track platform revenue and payouts</p>
        </div>
        <button className="px-6 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 flex items-center space-x-2">
          <Download className="h-5 w-5" />
          <span>Export Report</span>
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white">
          <DollarSign className="h-8 w-8 opacity-80 mb-2" />
          <p className="text-3xl font-bold">KES {stats.totalRevenue.toLocaleString()}</p>
          <p className="text-green-100 text-sm mt-1">Total Revenue</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <TrendingUp className="h-8 w-8 text-purple-600 mb-2" />
          <p className="text-3xl font-bold text-gray-900">KES {stats.platformFees.toLocaleString()}</p>
          <p className="text-sm text-gray-600 mt-1">Platform Fees</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <CreditCard className="h-8 w-8 text-blue-600 mb-2" />
          <p className="text-3xl font-bold text-gray-900">KES {stats.nursePayout.toLocaleString()}</p>
          <p className="text-sm text-gray-600 mt-1">Nurse Payouts</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <CheckCircle className="h-8 w-8 text-green-600 mb-2" />
          <p className="text-3xl font-bold text-gray-900">{stats.completed}</p>
          <p className="text-sm text-gray-600 mt-1">Completed</p>
        </div>
      </div>

      {/* Payments Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left py-4 px-6 font-semibold text-gray-700">Date</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-700">User</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-700">Nurse</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-700">Service</th>
                <th className="text-right py-4 px-6 font-semibold text-gray-700">Amount</th>
                <th className="text-right py-4 px-6 font-semibold text-gray-700">Platform Fee</th>
                <th className="text-right py-4 px-6 font-semibold text-gray-700">Nurse Payout</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-700">Method</th>
                <th className="text-center py-4 px-6 font-semibold text-gray-700">Status</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((payment) => (
                <tr key={payment.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-4 px-6 text-sm text-gray-900">
                    {new Date(payment.date).toLocaleDateString()}
                  </td>
                  <td className="py-4 px-6 text-sm text-gray-900">{payment.user}</td>
                  <td className="py-4 px-6 text-sm text-gray-900">{payment.nurse}</td>
                  <td className="py-4 px-6 text-sm text-gray-600">{payment.appointment}</td>
                  <td className="py-4 px-6 text-sm font-semibold text-gray-900 text-right">
                    KES {payment.amount.toLocaleString()}
                  </td>
                  <td className="py-4 px-6 text-sm text-purple-600 text-right font-medium">
                    KES {payment.platform_fee.toLocaleString()}
                  </td>
                  <td className="py-4 px-6 text-sm text-green-600 text-right font-medium">
                    KES {payment.nurse_payout.toLocaleString()}
                  </td>
                  <td className="py-4 px-6 text-sm text-gray-600">{payment.method}</td>
                  <td className="py-4 px-6 text-center">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        payment.status === 'completed'
                          ? 'bg-green-100 text-green-700'
                          : payment.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-red-100 text-red-700'
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
