'use client';

import { DollarSign, TrendingUp, Calendar, Download, CreditCard, CheckCircle } from 'lucide-react';

export default function NurseEarningsPage() {
  const earnings = {
    today: 0,
    week: 0,
    month: 0,
    total: 0,
  };

  const recentPayments: Array<{
    date: string;
    patient: string;
    service: string;
    amount: number;
    status: 'paid' | 'pending';
  }> = [];

  const monthlyBreakdown: Array<{ month: string; visits: number; earnings: number }> = [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Earnings</h1>
          <p className="text-gray-600 mt-2">Track your income and payments</p>
        </div>
        <button className="px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 flex items-center space-x-2">
          <Download className="h-5 w-5" />
          <span>Download Report</span>
        </button>
      </div>

      {/* Earnings Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <DollarSign className="h-8 w-8 opacity-80" />
            <TrendingUp className="h-5 w-5" />
          </div>
          <p className="text-3xl font-bold mb-1">KES {earnings.today.toLocaleString()}</p>
          <p className="text-green-100 text-sm">Today&apos;s Earnings</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <Calendar className="h-8 w-8 text-blue-600" />
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
