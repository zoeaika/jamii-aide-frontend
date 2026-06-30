'use client';

import { useEffect, useState } from 'react';
import { CreditCard, DollarSign, Search, AlertCircle, RefreshCw, CheckCircle, XCircle, Clock } from 'lucide-react';
import { paymentService } from '@/app/lib/api';
import { formatDate, formatKES } from '@/app/lib/format';

type Payment = {
  id: string;
  amount: string | number;
  method: string;
  status: string;
  created_at: string;
  transaction_id?: string;
};

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  const loadData = async () => {
    setIsLoading(true);
    setError('');
    try {
      const [paymentsRes, statsRes] = await Promise.allSettled([
        paymentService.getAll(),
        paymentService.getStats()
      ]);

      if (paymentsRes.status === 'fulfilled') {
        const data = paymentsRes.value.data;
        setPayments(Array.isArray(data.results) ? data.results : Array.isArray(data) ? data : []);
      }
      if (statsRes.status === 'fulfilled') {
        setStats(statsRes.value.data);
      }
    } catch {
      setError('Failed to load payment data from the server.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let cancelled = false;

    const fetchInitialData = async () => {
      try {
        const [paymentsRes, statsRes] = await Promise.allSettled([
          paymentService.getAll(),
          paymentService.getStats(),
        ]);

        if (cancelled) {
          return;
        }

        if (paymentsRes.status === 'fulfilled') {
          const data = paymentsRes.value.data;
          setPayments(Array.isArray(data.results) ? data.results : Array.isArray(data) ? data : []);
        }
        if (statsRes.status === 'fulfilled') {
          setStats(statsRes.value.data);
        }
      } catch {
        if (!cancelled) {
          setError('Failed to load payment data from the server.');
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    void fetchInitialData();

    return () => {
      cancelled = true;
    };
  }, []);

  const filteredPayments = payments.filter(p =>
    (p.transaction_id || '').toLowerCase().includes(search.toLowerCase()) ||
    (p.id || '').toLowerCase().includes(search.toLowerCase())
  );

  const getStatusIcon = (status: string) => {
    const s = status?.toUpperCase();
    if (s === 'COMPLETED' || s === 'SUCCESS') return <CheckCircle className="h-4 w-4 text-green-600" />;
    if (s === 'FAILED' || s === 'CANCELLED') return <XCircle className="h-4 w-4 text-red-600" />;
    return <Clock className="h-4 w-4 text-yellow-600" />;
  };

  const getStatusColor = (status: string) => {
    const s = status?.toUpperCase();
    if (s === 'COMPLETED' || s === 'SUCCESS') return 'bg-green-100 text-green-700';
    if (s === 'FAILED' || s === 'CANCELLED') return 'bg-red-100 text-red-700';
    return 'bg-yellow-100 text-yellow-700';
  };

  return (
    <div className="space-y-6 pt-16">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Payments</h1>
          <p className="text-gray-600 mt-1">Manage platform transactions and refunds</p>
        </div>
        <button onClick={loadData} className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 flex items-center gap-2">
          <RefreshCw className="h-4 w-4" />
          Refresh
        </button>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
          <p className="text-sm">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-green-100 rounded-lg"><DollarSign className="h-5 w-5 text-green-700" /></div>
            <h3 className="font-semibold text-gray-700">Total Volume</h3>
          </div>
          <p className="text-2xl font-bold text-gray-900">KES {formatKES(stats?.total_volume || 0)}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-100 rounded-lg"><CreditCard className="h-5 w-5 text-blue-700" /></div>
            <h3 className="font-semibold text-gray-700">Total Transactions</h3>
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats?.total_transactions || payments.length}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-yellow-100 rounded-lg"><Clock className="h-5 w-5 text-yellow-700" /></div>
            <h3 className="font-semibold text-gray-700">Pending Escrow</h3>
          </div>
          <p className="text-2xl font-bold text-gray-900">KES {formatKES(stats?.pending_escrow || 0)}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-200 flex gap-4 bg-gray-50">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by Transaction ID..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-600 text-sm border-b border-gray-200">
                <th className="p-4 font-semibold whitespace-nowrap">Date</th>
                <th className="p-4 font-semibold whitespace-nowrap">Transaction ID</th>
                <th className="p-4 font-semibold whitespace-nowrap">Method</th>
                <th className="p-4 font-semibold whitespace-nowrap">Amount</th>
                <th className="p-4 font-semibold whitespace-nowrap">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {isLoading ? (
                <tr><td colSpan={5} className="p-8 text-center text-gray-500">Loading payments...</td></tr>
              ) : filteredPayments.length === 0 ? (
                <tr><td colSpan={5} className="p-8 text-center text-gray-500">No payments found.</td></tr>
              ) : (
                filteredPayments.map((payment) => (
                  <tr key={payment.id} className="hover:bg-gray-50 transition">
                    <td className="p-4 text-sm text-gray-600 whitespace-nowrap">
                      {payment.created_at ? formatDate(payment.created_at) : 'N/A'}
                    </td>
                    <td className="p-4 font-medium text-gray-900 whitespace-nowrap">{payment.transaction_id || payment.id.substring(0,8) + '...'}</td>
                    <td className="p-4 text-sm text-gray-600 whitespace-nowrap">{payment.method || 'Unknown'}</td>
                    <td className="p-4 font-bold text-gray-900 whitespace-nowrap">KES {formatKES(payment.amount)}</td>
                    <td className="p-4 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(payment.status)}`}>
                        {getStatusIcon(payment.status)}
                        {payment.status || 'PENDING'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}