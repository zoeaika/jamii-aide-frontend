'use client';

import { useEffect, useState } from 'react';
import { 
  CreditCard, 
  Download, 
  Check, 
  Clock, 
  X,
  TrendingUp,
  Calendar,
  DollarSign,
  FileText,
  AlertCircle,
  Plus
} from 'lucide-react';

type Transaction = {
  id: string;
  date: string;
  description: string;
  amount: number;
  status: 'completed' | 'pending' | 'failed';
  type: 'charge' | 'refund';
};

type SubscriptionPlan = {
  id: string;
  name: string;
  price: number;
  period: string;
  features: string[];
  current: boolean;
  popular?: boolean;
};

export default function BillingPage() {
  const canUseLocalStorage = typeof globalThis !== 'undefined' && typeof globalThis.localStorage !== 'undefined';
  const [showAddPayment, setShowAddPayment] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [admissionClauseAccepted, setAdmissionClauseAccepted] = useState(() => {
    if (!canUseLocalStorage) {
      return false;
    }
    return globalThis.localStorage.getItem('admission_clause_accepted') === 'true';
  });
  const [includeAdmissionInSubscription, setIncludeAdmissionInSubscription] = useState(() => {
    if (!canUseLocalStorage) {
      return true;
    }
    return globalThis.localStorage.getItem('admission_support_in_subscription') !== 'false';
  });

  useEffect(() => {
    if (!canUseLocalStorage) {
      return;
    }
    globalThis.localStorage.setItem('admission_clause_accepted', admissionClauseAccepted ? 'true' : 'false');
    globalThis.localStorage.setItem('admission_support_in_subscription', includeAdmissionInSubscription ? 'true' : 'false');
  }, [admissionClauseAccepted, canUseLocalStorage, includeAdmissionInSubscription]);

  const subscriptionPlans: SubscriptionPlan[] = [
    {
      id: 'basic',
      name: 'Basic',
      price: 0,
      period: 'Pay as you go',
      current: true,
      features: [
        'Access to all verified CHWs',
        'Medical records storage',
        'Pay per service',
        'Email support',
      ],
    },
    {
      id: 'monthly',
      name: 'Monthly Care',
      price: 3000,
      period: 'per month',
      current: false,
      features: [
        '1 monthly CHW visit included',
        'Care plan follow-ups',
        '10% off additional services',
        'Priority booking',
        'Admission support clause available',
        'SMS notifications',
      ],
    },
    {
      id: 'weekly',
      name: 'Weekly Care',
      price: 8000,
      period: 'per month',
      current: false,
      popular: true,
      features: [
        '4 CHW visits per month',
        'Dedicated CHW assignment',
        '20% off additional services',
        'Priority emergency response',
        'Admission support in emergencies',
        'Weekly health reports',
        'Family health dashboard',
      ],
    },
    {
      id: 'daily',
      name: 'Daily Care',
      price: 20000,
      period: 'per month',
      current: false,
      features: [
        'Daily CHW visits (2hrs each)',
        'Medication administration',
        'Meal prep assistance',
        '24/7 emergency support',
        'Full admission facilitation support',
        'Assigned dedicated CHW',
        'Daily health reports',
        'Light housekeeping',
      ],
    },
  ];

  const transactions: Transaction[] = [
    {
      id: '1',
      date: '2024-11-01',
      description: 'CHW Visit - Dr. Jane Kamau',
      amount: 2000,
      status: 'completed',
      type: 'charge',
    },
    {
      id: '2',
      date: '2024-10-28',
      description: 'Care Supplies Delivery',
      amount: 1500,
      status: 'completed',
      type: 'charge',
    },
    {
      id: '3',
      date: '2024-10-25',
      description: 'Monthly Subscription',
      amount: 3000,
      status: 'completed',
      type: 'charge',
    },
    {
      id: '4',
      date: '2024-10-20',
      description: 'Transportation - Taxi',
      amount: 500,
      status: 'completed',
      type: 'charge',
    },
  ];

  const paymentMethods = [
    {
      id: '1',
      type: 'M-Pesa',
      last4: '4567',
      default: true,
    },
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <Check className="h-4 w-4 text-green-600" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'failed':
        return <X className="h-4 w-4 text-red-600" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-700';
      case 'pending':
        return 'bg-yellow-100 text-yellow-700';
      case 'failed':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const totalSpent = transactions
    .filter((t) => t.type === 'charge' && t.status === 'completed')
    .reduce((sum, t) => sum + t.amount, 0);

  const thisMonthSpent = transactions
    .filter(
      (t) =>
        t.type === 'charge' &&
        t.status === 'completed' &&
        new Date(t.date).getMonth() === new Date().getMonth()
    )
    .reduce((sum, t) => sum + t.amount, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Billing & Payments</h1>
        <p className="text-gray-600 mt-2">Manage your subscription, payments, and billing history</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600">This Month</p>
            <Calendar className="h-5 w-5 text-blue-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900">KES {thisMonthSpent.toLocaleString()}</p>
          <p className="text-sm text-gray-500 mt-1">
            {transactions.filter((t) => new Date(t.date).getMonth() === new Date().getMonth()).length} transactions
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600">Total Spent</p>
            <TrendingUp className="h-5 w-5 text-green-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900">KES {totalSpent.toLocaleString()}</p>
          <p className="text-sm text-gray-500 mt-1">{transactions.length} total transactions</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600">Next Billing</p>
            <Clock className="h-5 w-5 text-purple-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900">--</p>
          <p className="text-sm text-gray-500 mt-1">No active subscription</p>
        </div>
      </div>

      {/* Current Plan */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white">
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
                    {plan.price === 0 ? 'Free' : `KES ${plan.price.toLocaleString()}`}
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
                      {new Date(transaction.date).toLocaleDateString('en-US', {
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
                      {transaction.type === 'refund' ? '-' : ''}KES {transaction.amount.toLocaleString()}
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
