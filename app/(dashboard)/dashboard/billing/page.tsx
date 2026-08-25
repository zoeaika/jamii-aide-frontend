'use client';

import { useEffect, useState } from 'react';
import {
  Check,
  Clock,
  X,
  DollarSign,
  AlertCircle,
  Plus
} from 'lucide-react';
import { paymentService, appointmentService } from '@/app/lib/api';
import { readLocalStorageBoolean } from '@/app/lib/clientStorage';
import { formatDate, formatKES } from '@/app/lib/format';

type Payment = {
  id: string;
  amount: number;
  method: 'MPESA' | 'STRIPE' | 'PESAPAL';
  status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
  appointment_ids?: string[];
  created_at?: string;
  updated_at?: string;
};

type PaymentStats = {
  total_paid: number;
  total_pending: number;
  total_failed: number;
  transaction_count: number;
};

type Appointment = {
  id: string;
  appointment_date: string;
  service_type: string;
  amount: number;
  status: string;
  payment?: string | null;
};

export default function BillingPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [stats, setStats] = useState<PaymentStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [showNewPayment, setShowNewPayment] = useState(false);
  const [selectedAppointments, setSelectedAppointments] = useState<string[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<'MPESA' | 'STRIPE' | 'PESAPAL'>('MPESA');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [admissionClauseAccepted, setAdmissionClauseAccepted] = useState(() =>
    readLocalStorageBoolean('admission_clause_accepted', false),
  );
  const [includeAdmissionInSubscription, setIncludeAdmissionInSubscription] = useState(() =>
    readLocalStorageBoolean('admission_support_in_subscription', false),
  );

  useEffect(() => {
    if (typeof window === 'undefined') return;
    localStorage.setItem('admission_clause_accepted', admissionClauseAccepted ? 'true' : 'false');
    localStorage.setItem('admission_support_in_subscription', includeAdmissionInSubscription ? 'true' : 'false');
  }, [admissionClauseAccepted, includeAdmissionInSubscription]);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const [paymentsResult, appointmentsResult, statsResult] = await Promise.allSettled([
          paymentService.getAll(),
          appointmentService.getAll(),
          paymentService.getStats(),
        ]);

        if (paymentsResult.status === 'fulfilled') {
          const paymentItems = paymentsResult.value?.data?.results || paymentsResult.value?.data || [];
          setPayments(Array.isArray(paymentItems) ? paymentItems : []);
        }

        if (appointmentsResult.status === 'fulfilled') {
          const appointmentItems = appointmentsResult.value?.data?.results || appointmentsResult.value?.data || [];
          setAppointments(Array.isArray(appointmentItems) ? appointmentItems : []);
        }

        if (statsResult.status === 'fulfilled') {
          setStats(statsResult.value?.data || null);
        }

        if (paymentsResult.status === 'rejected') {
          setError('Could not load payment history');
        }
      } catch (err: any) {
        setError('Failed to load billing information');
      } finally {
        setIsLoading(false);
      }
    };

    void loadData();
  }, []);

  const handleCreatePayment = async () => {
    if (selectedAppointments.length === 0) {
      alert('Please select at least one appointment');
      return;
    }

    const totalAmount = selectedAppointments.reduce((sum, id) => {
      const apt = appointments.find(a => a.id === id);
      return sum + (apt?.amount || 0);
    }, 0);

    setIsSubmitting(true);
    try {
      const response = await paymentService.create({
        amount: totalAmount,
        method: paymentMethod,
        appointment_ids: selectedAppointments,
      });

      const redirectUrl = response?.data?.redirect_url || response?.data?.checkout_url;
      if (redirectUrl) {
        window.location.href = redirectUrl;
        return;
      }

      alert(`Payment initiated successfully! Method: ${paymentMethod}, Amount: KES ${formatKES(totalAmount)}`);
      setSelectedAppointments([]);
      setShowNewPayment(false);

      // Reload payments
      const refreshed = await paymentService.getAll();
      const paymentItems = refreshed?.data?.results || refreshed?.data || [];
      setPayments(Array.isArray(paymentItems) ? paymentItems : []);
    } catch (err: any) {
      const errorMsg = err?.response?.data?.detail || err?.response?.data?.message || 'Failed to create payment';
      alert(`Error: ${errorMsg}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-green-100 text-green-700';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-700';
      case 'FAILED':
      case 'CANCELLED':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return <Check className="h-4 w-4" />;
      case 'PENDING':
        return <Clock className="h-4 w-4" />;
      case 'FAILED':
      case 'CANCELLED':
        return <X className="h-4 w-4" />;
      default:
        return null;
    }
  };

  // Payment is only requested once a care request has been approved and matched with a nurse.
  const pendingAppointments = appointments.filter(a =>
    a.status === 'APPROVED' &&
    !a.payment &&
    !payments.some(p => p.appointment_ids?.includes(a.id) && p.status === 'COMPLETED')
  );

  const awaitingApprovalCount = appointments.filter(a =>
    ['SUBMITTED', 'UNDER_REVIEW', 'NURSE_SUGGESTED'].includes(a.status)
  ).length;

  const totalPending = selectedAppointments.reduce((sum, id) => {
    const apt = appointments.find(a => a.id === id);
    return sum + (apt?.amount || 0);
  }, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Billing & Payments</h1>
        <p className="text-gray-600 mt-2">Manage your payments and billing history</p>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 flex items-start">
          <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600">Total Paid</p>
            <Check className="h-5 w-5 text-green-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900">KES {formatKES(stats?.total_paid || 0)}</p>
          <p className="text-sm text-gray-500 mt-1">Completed payments</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600">Pending</p>
            <Clock className="h-5 w-5 text-yellow-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900">KES {formatKES(stats?.total_pending || 0)}</p>
          <p className="text-sm text-gray-500 mt-1">Awaiting payment</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600">Failed</p>
            <X className="h-5 w-5 text-red-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900">KES {formatKES(stats?.total_failed || 0)}</p>
          <p className="text-sm text-gray-500 mt-1">Failed transactions</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600">Transactions</p>
            <DollarSign className="h-5 w-5 text-blue-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900">{stats?.transaction_count || 0}</p>
          <p className="text-sm text-gray-500 mt-1">Total transactions</p>
        </div>
      </div>

      {/* Admission Support Clause */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-6">
        <h2 className="text-lg font-bold text-amber-900">Admission Support Clause</h2>
        <p className="text-sm text-amber-900 mt-2">
          In emergency cases where relatives are unavailable, assigned care staff may facilitate hospital admission using the approved medical details and insurance information provided in your care request.
        </p>
        <div className="mt-4 space-y-3">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={admissionClauseAccepted}
              onChange={(e) => setAdmissionClauseAccepted(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300"
            />
            <span className="text-sm text-amber-900">I accept the admission support clause</span>
          </label>
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={includeAdmissionInSubscription}
              onChange={(e) => setIncludeAdmissionInSubscription(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300"
            />
            <span className="text-sm text-amber-900">Include admission support in subscription coverage</span>
          </label>
        </div>
      </div>

      {/* New Payment Section */}
      {pendingAppointments.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-blue-900">Outstanding Payments</h3>
              <p className="text-sm text-blue-700 mt-1">{pendingAppointments.length} approved appointment(s) awaiting payment</p>
            </div>
            <button
              onClick={() => setShowNewPayment(true)}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 flex items-center space-x-2"
            >
              <Plus className="h-5 w-5" />
              <span>Pay Now</span>
            </button>
          </div>
        </div>
      )}

      {awaitingApprovalCount > 0 && (
        <div className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-600">
          {awaitingApprovalCount} request(s) still awaiting admin/nurse approval. You&apos;ll be able to pay for these once they&apos;re approved.
        </div>
      )}

      {/* Payment History */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Payment History</h2>
        
        {isLoading ? (
          <div className="text-center py-8 text-gray-600">Loading payments...</div>
        ) : payments.length === 0 ? (
          <div className="text-center py-8 text-gray-600">No payments yet</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-gray-200">
                <tr>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Date</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Method</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Appointments</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-700">Amount</th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-700">Status</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((payment) => (
                  <tr key={payment.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 text-gray-900">
                      {formatDate(payment.created_at || '')}
                    </td>
                    <td className="py-3 px-4 text-gray-900">{payment.method}</td>
                    <td className="py-3 px-4 text-gray-900">
                      {payment.appointment_ids?.length || 0} appointment(s)
                    </td>
                    <td className="py-3 px-4 text-right font-semibold text-gray-900">
                      KES {formatKES(payment.amount || 0)}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(payment.status)}`}>
                        {getStatusIcon(payment.status)}
                        {payment.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Payment Modal */}
      {showNewPayment && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Create Payment</h3>
            
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Select Appointments</label>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {pendingAppointments.map((apt) => (
                    <label key={apt.id} className="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                      <input
                        type="checkbox"
                        checked={selectedAppointments.includes(apt.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedAppointments([...selectedAppointments, apt.id]);
                          } else {
                            setSelectedAppointments(selectedAppointments.filter(id => id !== apt.id));
                          }
                        }}
                        className="h-4 w-4 rounded"
                      />
                      <div className="ml-3 flex-1">
                        <p className="text-sm font-medium text-gray-900">{apt.service_type}</p>
                        <p className="text-xs text-gray-500">{formatDate(apt.appointment_date)}</p>
                      </div>
                      <p className="text-sm font-semibold text-gray-900">KES {formatKES(apt.amount || 0)}</p>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Payment Method</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value as 'MPESA' | 'STRIPE' | 'PESAPAL')}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="MPESA">M-Pesa</option>
                  <option value="STRIPE">Card (Stripe)</option>
                  <option value="PESAPAL">PesaPal</option>
                </select>
              </div>

              {totalPending > 0 && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-sm text-gray-600">Total Amount:</p>
                  <p className="text-2xl font-bold text-gray-900">KES {formatKES(totalPending)}</p>
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowNewPayment(false);
                  setSelectedAppointments([]);
                }}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleCreatePayment}
                disabled={isSubmitting || selectedAppointments.length === 0}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Processing...' : 'Proceed'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
