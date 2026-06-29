'use client';

import { useEffect, useState } from 'react';
import { 
  CreditCard, 
  Download, 
  FileText,
  Check, 
  Clock, 
  X,
  TrendingUp,
  Calendar,
  DollarSign,
  AlertCircle,
  Plus
} from 'lucide-react';
import { paymentService, appointmentService } from '@/app/lib/api';
import { formatDate, formatKES } from '@/app/lib/format';

type Payment = {
  id: string;
  amount: number;
  method: 'MPESA' | 'STRIPE' | 'PESAPAL' | 'CARD' | 'BANK_TRANSFER';
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
};

type SubscriptionPlan = {
  id: string;
  name: string;
  price: number;
  period: string;
  features: string[];
  popular?: boolean;
  current?: boolean;
};

type PaymentMethod = {
  id: string;
  type: string;
  last4: string;
  default?: boolean;
};

type Transaction = {
  id: string;
  date: string;
  description: string;
  amount: number;
  type: 'charge' | 'refund';
  status: Payment['status'];
};

export default function BillingPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [stats, setStats] = useState<PaymentStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [showNewPayment, setShowNewPayment] = useState(false);
  const [selectedAppointments, setSelectedAppointments] = useState<string[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<'MPESA' | 'CARD' | 'BANK_TRANSFER'>('MPESA');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAddPayment, setShowAddPayment] = useState(false);
  const [, setSelectedPlan] = useState<string | null>(null);

  const subscriptionPlans: SubscriptionPlan[] = [];
  const paymentMethods: PaymentMethod[] = [];
  const transactions: Transaction[] = [];

  const [admissionClauseAccepted, setAdmissionClauseAccepted] = useState(false);
  const [includeAdmissionInSubscription, setIncludeAdmissionInSubscription] = useState(true);

  useEffect(() => {
    try {
      setAdmissionClauseAccepted(localStorage.getItem('admission_clause_accepted') === 'true');
      setIncludeAdmissionInSubscription(localStorage.getItem('admission_support_in_subscription') !== 'false');
    } catch {
      // Keep defaults when local storage is unavailable.
    }
  }, []);

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
      await paymentService.create({
        amount: totalAmount,
        method: paymentMethod,
        appointment_ids: selectedAppointments,
      });

      alert(`Payment initiated successfully! Method: ${paymentMethod}, Amount: KES ${formatKES(totalAmount)}`);
      setSelectedAppointments([]);
      setShowNewPayment(false);

      // Reload payments
      const response = await paymentService.getAll();
      const paymentItems = response?.data?.results || response?.data || [];
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

  const pendingAppointments = appointments.filter(a => 
    !payments.some(p => p.appointment_ids?.includes(a.id) && p.status === 'COMPLETED')
  );

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
              <p className="text-sm text-blue-700 mt-1">{pendingAppointments.length} appointment(s) awaiting payment</p>
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
                  onChange={(e) => setPaymentMethod(e.target.value as 'MPESA' | 'CARD' | 'BANK_TRANSFER')}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="MPESA">M-Pesa</option>
                  <option value="CARD">Card</option>
                  <option value="BANK_TRANSFER">Bank Transfer</option>
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
        <div className="flex items-start justify-between">
          <div>
            <p className="text-blue-100 text-sm mb-1">Current Plan</p>
            <h2 className="text-2xl font-bold mb-2">Basic Plan</h2>
            <p className="text-blue-100 mb-4">Pay as you go • No monthly fees</p>
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <Check className="h-4 w-4 mr-1" />
                <span className="text-sm">All CHWs</span>
              </div>
              <div className="flex items-center">
                <Check className="h-4 w-4 mr-1" />
                <span className="text-sm">Medical Records</span>
              </div>
            </div>
          </div>
          <button className="px-6 py-3 bg-white text-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition">
            Upgrade Plan
          </button>
        </div>

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
            />
            <span className="text-sm text-amber-900">I accept the admission support clause</span>
          </label>
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={includeAdmissionInSubscription}
              onChange={(e) => setIncludeAdmissionInSubscription(e.target.checked)}
            />
            <span className="text-sm text-amber-900">Include admission support in subscription coverage</span>
          </label>
        </div>
      </div>

      {/* Subscription Plans */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-4">Available Plans</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {subscriptionPlans.map((plan) => (
            <div
              key={plan.id}
              className={`bg-white rounded-xl shadow-sm border-2 p-6 transition hover:shadow-lg ${
                plan.current ? 'border-blue-600' : plan.popular ? 'border-purple-600' : 'border-gray-200'
              } relative`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <span className="bg-purple-600 text-white px-3 py-1 rounded-full text-xs font-semibold">
                    Most Popular
                  </span>
                </div>
              )}
              {plan.current && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center">
                    <Check className="h-3 w-3 mr-1" />
                    Current Plan
                  </span>
                </div>
              )}

              <div className="mb-4">
                <h3 className="text-xl font-bold text-gray-900 mb-1">{plan.name}</h3>
                <div className="flex items-baseline">
                  <span className="text-3xl font-bold text-gray-900">
                    {plan.price === 0 ? 'Free' : `KES ${formatKES(plan.price)}`}
                  </span>
                  {plan.price > 0 && <span className="text-gray-600 text-sm ml-2">{plan.period}</span>}
                </div>
              </div>

              <ul className="space-y-3 mb-6">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-start text-sm text-gray-600">
                    <Check className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => setSelectedPlan(plan.id)}
                disabled={plan.current}
                className={`w-full py-3 rounded-lg font-semibold transition ${
                  plan.current
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {plan.current ? 'Current Plan' : 'Choose Plan'}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Payment Methods */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">Payment Methods</h2>
          <button
            onClick={() => setShowAddPayment(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>Add Method</span>
          </button>
        </div>

        {paymentMethods.length > 0 ? (
          <div className="space-y-3">
            {paymentMethods.map((method) => (
              <div key={method.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <CreditCard className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{method.type}</p>
                    <p className="text-sm text-gray-600">•••• {method.last4}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  {method.default && (
                    <span className="px-3 py-1 bg-blue-100 text-blue-600 text-xs font-medium rounded-full">
                      Default
                    </span>
                  )}
                  <button className="text-gray-600 hover:text-gray-900 text-sm font-medium">Edit</button>
                  <button className="text-red-600 hover:text-red-700 text-sm font-medium">Remove</button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-lg">
            <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600 mb-4">No payment methods added</p>
            <button
              onClick={() => setShowAddPayment(true)}
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Add Your First Payment Method
            </button>
          </div>
        )}
      </div>

      {/* Transaction History */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">Transaction History</h2>
          <button className="text-blue-600 hover:text-blue-700 font-medium text-sm flex items-center space-x-1">
            <Download className="h-4 w-4" />
            <span>Export</span>
          </button>
        </div>

        {transactions.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Date</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Description</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Amount</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Status</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Invoice</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((transaction) => (
                  <tr key={transaction.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-4 px-4 text-sm text-gray-600">
                      {formatDate(transaction.date, {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center">
                        <DollarSign className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="text-sm text-gray-900">{transaction.description}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-sm font-semibold text-gray-900">
                      {transaction.type === 'refund' ? '-' : ''}KES {formatKES(transaction.amount)}
                    </td>
                    <td className="py-4 px-4">
                      <span
                        className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                          transaction.status
                        )}`}
                      >
                        {getStatusIcon(transaction.status)}
                        <span className="capitalize">{transaction.status}</span>
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <button className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center space-x-1">
                        <FileText className="h-4 w-4" />
                        <span>View</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-lg">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600">No transactions yet</p>
          </div>
        )}
      </div>

      {/* Billing Information */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <div className="flex items-start">
          <AlertCircle className="h-6 w-6 text-blue-600 mr-3 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-blue-900 mb-2">Need help with billing?</h3>
            <p className="text-sm text-blue-800 mb-3">
              If you have questions about your subscription, payments, or need a refund, our support team is here to help.
            </p>
            <button className="text-blue-600 hover:text-blue-700 font-medium text-sm">
              Contact Support →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
