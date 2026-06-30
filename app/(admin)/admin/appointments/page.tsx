'use client';

import { useEffect, useMemo, useState } from 'react';
import { AlertCircle, Calendar, CheckCircle, DollarSign, Search, UserCheck, XCircle } from 'lucide-react';
import { appointmentService, nurseService } from '@/app/lib/api';
import { formatKES } from '@/app/lib/format';

type Status =
  | 'SUBMITTED'
  | 'UNDER_REVIEW'
  | 'NURSE_SUGGESTED'
  | 'APPROVED'
  | 'REJECTED'
  | 'CONFIRMED'
  | 'COMPLETED'
  | 'CANCELLED';

type Nurse = {
  id: string;
  user?: {
    first_name?: string;
    last_name?: string;
  };
  professional_type?: string;
  professional_type_display?: string;
  specializations?: string[];
};

type Appointment = {
  id: string;
  family_member?: string;
  family_member_name?: string;
  nurse?: string | { id?: string } | null;
  assigned_nurse?: string | { id?: string } | null;
  approved_nurse?: string | { id?: string } | null;
  suggested_nurse_name?: string | null;
  assigned_nurse_name?: string | null;
  approved_nurse_name?: string | null;
  nurse_name?: string | null;
  matched_nurse?: string | { id?: string } | null;
  matched_nurse_name?: string | null;
  nurse_id?: string | null;
  appointment_date: string;
  start_time: string;
  end_time: string;
  service_type: string;
  reason: string;
  additional_notes?: string | null;
  shift_type: string;
  evaluation_type?: string | null;
  admission_clause_accepted: boolean;
  admission_support_in_subscription: boolean;
  admission_questionnaire?: Record<string, string | boolean>;
  visit_address: string;
  visit_city: string;
  status: Status;
  rejection_reason?: string | null;
  suggested_nurse?: string | null;
  amount: number;
};

const statusOptions: Array<'all' | Status> = [
  'all',
  'SUBMITTED',
  'UNDER_REVIEW',
  'NURSE_SUGGESTED',
  'APPROVED',
  'REJECTED',
  'CONFIRMED',
  'COMPLETED',
  'CANCELLED',
];

export default function AdminAppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [nurses, setNurses] = useState<Nurse[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | Status>('all');
  const [filterProfessionalType, setFilterProfessionalType] = useState<string>('all');
  const [decisionNote, setDecisionNote] = useState<Record<string, string>>({});
  const [suggestionDraft, setSuggestionDraft] = useState<Record<string, string>>({});
  const [decisionLoading, setDecisionLoading] = useState<Record<string, boolean>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const getErrorMessage = (err: unknown, fallback: string) => {
    if (!err || typeof err !== 'object') {
      return fallback;
    }

    const responseData = (err as { response?: { data?: unknown } }).response?.data;

    if (typeof responseData === 'string' && responseData.trim()) {
      return responseData;
    }

    if (responseData && typeof responseData === 'object') {
      const values = Object.values(responseData as Record<string, unknown>);
      const firstValue = values[0];

      if (typeof firstValue === 'string' && firstValue.trim()) {
        return firstValue;
      }

      if (Array.isArray(firstValue) && typeof firstValue[0] === 'string' && firstValue[0].trim()) {
        return firstValue[0];
      }
    }

    const message = (err as { message?: string }).message;
    if (typeof message === 'string' && message.trim()) {
      return message;
    }

    return fallback;
  };

  const loadData = async () => {
    setIsLoading(true);
    setError('');
    try {
      const [appointmentsResult, nursesResult] = await Promise.allSettled([appointmentService.getAll(), nurseService.getAll()]);

      let appointmentsPayload: Appointment[] = [];
      if (appointmentsResult.status === 'fulfilled') {
        const fulfilledPayload = appointmentsResult.value?.data?.results || appointmentsResult.value?.data || [];
        appointmentsPayload = Array.isArray(fulfilledPayload) ? (fulfilledPayload as Appointment[]) : [];
      }

      const nurseItems =
        nursesResult.status === 'fulfilled'
          ? nursesResult.value?.data?.results || nursesResult.value?.data || []
          : [];

      setAppointments(appointmentsPayload);
      setNurses(Array.isArray(nurseItems) ? (nurseItems as Nurse[]) : []);

      if (appointmentsResult.status === 'rejected' && nursesResult.status === 'rejected') {
        setError('Could not load appointments or nurse details.');
      } else if (appointmentsResult.status === 'rejected') {
        setError('Could not load appointments.');
      } else if (nursesResult.status === 'rejected') {
        setError('Appointment queue loaded, but nurse details could not be loaded.');
      }
    } catch {
      setError('Failed to load appointment queue.');
      setAppointments([]);
      setNurses([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, []);

  const nurseNameById = useMemo(() => {
    const map: Record<string, string> = {};
    nurses.forEach((nurse) => {
      const fullName = `${nurse.user?.first_name || ''} ${nurse.user?.last_name || ''}`.trim();
      map[nurse.id] = fullName || nurse.id;
    });
    return map;
  }, [nurses]);

  const getNurseDisplayName = (appointment: Appointment) => {
    const directNameCandidates = [
      appointment.suggested_nurse_name,
      appointment.assigned_nurse_name,
      appointment.approved_nurse_name,
      appointment.nurse_name,
      appointment.matched_nurse_name,
    ];

    for (const candidate of directNameCandidates) {
      if (typeof candidate === 'string' && candidate.trim()) {
        return candidate.trim();
      }
    }

    const resolveFromCandidate = (candidate: unknown): string => {
      if (!candidate) {
        return '';
      }

      if (typeof candidate === 'string') {
        const value = candidate.trim();
        if (!value) {
          return '';
        }
        return nurseNameById[value] || value;
      }

      if (typeof candidate === 'object') {
        const item = candidate as Record<string, unknown>;
        const fullName = String(item.full_name || '').trim();
        if (fullName) {
          return fullName;
        }

        const firstName = String(item.first_name || '').trim();
        const lastName = String(item.last_name || '').trim();
        const combinedName = `${firstName} ${lastName}`.trim();
        if (combinedName) {
          return combinedName;
        }

        const nestedUser = item.user as Record<string, unknown> | undefined;
        if (nestedUser && typeof nestedUser === 'object') {
          const nestedCombined = `${String(nestedUser.first_name || '').trim()} ${String(nestedUser.last_name || '').trim()}`.trim();
          if (nestedCombined) {
            return nestedCombined;
          }
        }

        const idCandidate = String(item.id || item.uuid || item.pk || '').trim();
        if (idCandidate) {
          return nurseNameById[idCandidate] || idCandidate;
        }
      }

      return '';
    };

    const explicitCandidates: unknown[] = [
      appointment.suggested_nurse,
      appointment.assigned_nurse,
      appointment.approved_nurse,
      appointment.nurse,
      appointment.matched_nurse,
      appointment.nurse_id,
    ];

    for (const candidate of explicitCandidates) {
      const resolved = resolveFromCandidate(candidate);
      if (resolved) {
        return resolved;
      }
    }

    // Fallback for unexpected backend key names that still include 'nurse'.
    for (const [key, value] of Object.entries(appointment as Record<string, unknown>)) {
      if (!key.toLowerCase().includes('nurse')) {
        continue;
      }
      const resolved = resolveFromCandidate(value);
      if (resolved) {
        return resolved;
      }
    }

    return 'Not assigned';
  };

  const professionalTypes = useMemo(() => {
    const types = new Set<string>();
    nurses.forEach((nurse) => {
      if (nurse.professional_type) {
        types.add(nurse.professional_type);
      }
    });
    return Array.from(types).sort();
  }, [nurses]);

  const filteredNurses = useMemo(() => {
    if (filterProfessionalType === 'all') {
      return nurses;
    }
    return nurses.filter((nurse) => nurse.professional_type === filterProfessionalType);
  }, [nurses, filterProfessionalType]);

  const stats = useMemo(
    () => ({
      total: appointments.length,
      pendingMatching: appointments.filter((a) => ['SUBMITTED', 'UNDER_REVIEW'].includes(a.status)).length,
      nurseSuggested: appointments.filter((a) => a.status === 'NURSE_SUGGESTED').length,
      approved: appointments.filter((a) => a.status === 'APPROVED').length,
      totalValue: appointments.reduce((sum, a) => sum + Number(a.amount || 0), 0),
    }),
    [appointments],
  );

  const visibleAppointments = useMemo(
    () =>
      appointments.filter((appointment) => {
        const haystack = [
          appointment.id,
          appointment.service_type,
          appointment.reason,
          appointment.visit_city,
          appointment.visit_address,
          appointment.shift_type,
        ]
          .join(' ')
          .toLowerCase();
        const matchesQuery = haystack.includes(searchQuery.toLowerCase());
        const matchesStatus = filterStatus === 'all' || appointment.status === filterStatus;
        return matchesQuery && matchesStatus;
      }),
    [appointments, filterStatus, searchQuery],
  );

  const assignedCareRows = useMemo(
    () => {
       return appointments
        .filter((appointment) => ['APPROVED', 'CONFIRMED', 'COMPLETED'].includes(appointment.status))
        .map((appointment) => ({
          ...appointment,
          resolvedNurseId: String(appointment.suggested_nurse || ''),
          resolvedNurseName: getNurseDisplayName(appointment),
        }));
    },
    [appointments, nurseNameById],
  );

  const requestQueueRows = useMemo(
    () =>
      visibleAppointments.filter((appointment) =>
        ['SUBMITTED', 'UNDER_REVIEW', 'NURSE_SUGGESTED', 'REJECTED', 'CANCELLED'].includes(appointment.status),
      ),
    [visibleAppointments],
  );

  const statusPill = (status: Status) => {
    if (['APPROVED', 'CONFIRMED', 'COMPLETED'].includes(status)) {
      return 'bg-green-100 text-green-700';
    }
    if (status === 'REJECTED' || status === 'CANCELLED') {
      return 'bg-red-100 text-red-700';
    }
    if (status === 'NURSE_SUGGESTED') {
      return 'bg-indigo-100 text-indigo-700';
    }
    return 'bg-yellow-100 text-yellow-700';
  };

  const handleSuggestNurse = async (appointmentId: string) => {
    const nurseId = suggestionDraft[appointmentId];
    if (!nurseId) {
      return;
    }
    try {
      await appointmentService.suggestNurse(appointmentId, nurseId);
      await loadData();
      alert('Nurse suggested successfully!');
    } catch {
      setError('Could not suggest nurse for this request.');
    }
  };

  const handleDecision = async (appointmentId: string, decision: 'APPROVED' | 'REJECTED') => {
    const rejectionReason = (decisionNote[appointmentId] || '').trim();
    if (decision === 'REJECTED' && !rejectionReason) {
      setError('Rejection requires a reason.');
      return;
    }

    setDecisionLoading((curr) => ({ ...curr, [appointmentId]: true }));
    try {
      await appointmentService.decision(appointmentId, decision, rejectionReason || undefined);
      await loadData();
      alert(`Appointment successfully ${decision.toLowerCase()}!`);
    } catch (err) {
      setError(getErrorMessage(err, 'Could not submit final decision.'));
    } finally {
      setDecisionLoading((curr) => ({ ...curr, [appointmentId]: false }));
    }
  };

  return (
    <div className="space-y-6 pt-16">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Appointments</h1>
        <p className="text-gray-600 mt-2">Admin matching and final decision workflow</p>
      </div>

      {error && <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

      <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
        <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-200">
          <Calendar className="h-6 w-6 text-blue-600 mb-1" />
          <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
          <p className="text-xs text-gray-600">Total</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-200">
          <AlertCircle className="h-6 w-6 text-amber-600 mb-1" />
          <p className="text-2xl font-bold text-gray-900">{stats.pendingMatching}</p>
          <p className="text-xs text-gray-600">Pending Matching</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-200">
          <UserCheck className="h-6 w-6 text-indigo-600 mb-1" />
          <p className="text-2xl font-bold text-gray-900">{stats.nurseSuggested}</p>
          <p className="text-xs text-gray-600">Nurse Suggested</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-200">
          <CheckCircle className="h-6 w-6 text-green-600 mb-1" />
          <p className="text-2xl font-bold text-gray-900">{stats.approved}</p>
          <p className="text-xs text-gray-600">Approved</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-200">
          <DollarSign className="h-6 w-6 text-orange-600 mb-1" />
          <p className="text-2xl font-bold text-gray-900">KES {formatKES(stats.totalValue)}</p>
          <p className="text-xs text-gray-600">Total Value</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex-1 min-w-64 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search appointments..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as 'all' | Status)}
            className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          >
            {statusOptions.map((status) => (
              <option key={status} value={status}>
                {status === 'all' ? 'All Status' : status}
              </option>
            ))}
          </select>
          <select
            value={filterProfessionalType}
            onChange={(e) => setFilterProfessionalType(e.target.value)}
            className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          >
            <option value="all">All Nurse Types</option>
            {professionalTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <div className="mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Approved Care Assignments</h2>
          <p className="mt-1 text-sm text-gray-600">Patient care requests with assigned nurse and confirmed schedule.</p>
        </div>

        {assignedCareRows.length === 0 ? (
          <p className="text-sm text-gray-600">No approved assignments yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="border-b border-gray-200 text-left text-gray-600">
                <tr>
                  <th className="px-3 py-2 font-semibold">Request</th>
                  <th className="px-3 py-2 font-semibold">Patient</th>
                  <th className="px-3 py-2 font-semibold">Nurse</th>
                  <th className="px-3 py-2 font-semibold">Schedule</th>
                  <th className="px-3 py-2 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {assignedCareRows.map((appointment) => (
                  <tr key={appointment.id} className="border-b border-gray-100">
                    <td className="px-3 py-2 text-gray-900 font-mono text-xs">{appointment.id}</td>
                    <td className="px-3 py-2 text-gray-900">{appointment.family_member_name || 'N/A'}</td>
                    <td className="px-3 py-2 text-gray-900">
                      {appointment.resolvedNurseName || (appointment.resolvedNurseId ? nurseNameById[appointment.resolvedNurseId] || appointment.resolvedNurseId : 'Not assigned')}
                    </td>
                    <td className="px-3 py-2 text-gray-900">
                      {appointment.appointment_date} | {appointment.start_time} - {appointment.end_time}
                    </td>
                    <td className="px-3 py-2">
                      <span className={`rounded-full px-2 py-1 text-xs font-semibold ${statusPill(appointment.status)}`}>
                        {appointment.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {isLoading ? (
        <div className="rounded-xl border border-gray-200 bg-white p-8 text-gray-600">Loading appointment queue...</div>
      ) : requestQueueRows.length === 0 ? (
        <div className="rounded-xl border border-gray-200 bg-white p-8 text-gray-600">No pending care requests found.</div>
      ) : (
        <div className="space-y-4">
          {requestQueueRows.map((appointment) => {
            const admissionData = appointment.admission_questionnaire || {};
            const hasAdmissionData = Object.keys(admissionData).length > 0;
            const selectedNurseId = suggestionDraft[appointment.id] || appointment.suggested_nurse || '';
            const canReview = ['SUBMITTED', 'UNDER_REVIEW', 'NURSE_SUGGESTED'].includes(appointment.status);
            return (
              <div key={appointment.id} className="rounded-xl border border-amber-200 bg-amber-50/40 p-5 space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-semibold text-gray-900">{appointment.id}</p>
                    <p className="text-xs font-semibold tracking-wide uppercase text-amber-700 mt-1">Care Request Queue</p>
                    <p className="text-sm text-gray-700 mt-1">
                      {appointment.service_type} - {appointment.reason}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      {appointment.appointment_date} | {appointment.start_time} - {appointment.end_time}
                    </p>
                    <p className="text-sm text-gray-600">
                      {appointment.visit_address}, {appointment.visit_city}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusPill(appointment.status)}`}>{appointment.status}</span>
                    <p className="font-semibold text-gray-900 mt-2">KES {formatKES(appointment.amount || 0)}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 text-sm">
                  <div className="rounded-lg bg-gray-50 p-3">
                    <p className="text-gray-500">Shift</p>
                    <p className="font-medium text-gray-900">{appointment.shift_type}</p>
                  </div>
                  <div className="rounded-lg bg-gray-50 p-3">
                    <p className="text-gray-500">Evaluation</p>
                    <p className="font-medium text-gray-900">{appointment.evaluation_type || 'Not specified'}</p>
                  </div>
                  <div className="rounded-lg bg-gray-50 p-3">
                    <p className="text-gray-500">Suggested Nurse</p>
                    <p className="font-medium text-gray-900">{appointment.suggested_nurse ? nurseNameById[appointment.suggested_nurse] || appointment.suggested_nurse : 'Not suggested'}</p>
                  </div>
                </div>

                {appointment.additional_notes && (
                  <div className="rounded-lg border border-blue-100 bg-blue-50 p-3 text-sm text-blue-900">
                    <p className="font-semibold mb-1">Additional Notes</p>
                    <p>{appointment.additional_notes}</p>
                  </div>
                )}

                <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm">
                  <p className="font-semibold text-amber-900">Admission Support</p>
                  <p className="text-amber-900 mt-1">
                    Clause accepted: {appointment.admission_clause_accepted ? 'Yes' : 'No'} | Subscription support:{' '}
                    {appointment.admission_support_in_subscription ? 'Yes' : 'No'}
                  </p>
                  {hasAdmissionData && (
                    <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-2 text-amber-950">
                      {Object.entries(admissionData).map(([key, value]) => (
                        <p key={key}>
                          <span className="font-semibold">{key.replaceAll('_', ' ')}:</span> {String(value)}
                        </p>
                      ))}
                    </div>
                  )}
                </div>

                {appointment.rejection_reason && (
                  <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                    <p className="font-semibold">Rejection Reason</p>
                    <p>{appointment.rejection_reason}</p>
                  </div>
                )}

                {canReview ? (
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
                    <div className="lg:col-span-1">
                      <label className="block text-xs text-gray-500 mb-1">Suggest Nurse</label>
                      <div className="flex gap-2">
                        <select
                          value={selectedNurseId}
                          onChange={(e) => setSuggestionDraft((curr) => ({ ...curr, [appointment.id]: e.target.value }))}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        >
                          <option value="">Select nurse...</option>
                          {filteredNurses.map((nurse) => (
                            <option key={nurse.id} value={nurse.id}>
                              {nurseNameById[nurse.id]} {nurse.professional_type ? `(${nurse.professional_type})` : ''}
                            </option>
                          ))}
                        </select>
                        <button
                          type="button"
                          onClick={() => void handleSuggestNurse(appointment.id)}
                          className="px-3 py-2 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700"
                        >
                          Suggest
                        </button>
                      </div>
                    </div>
                    <div className="lg:col-span-2">
                      <label className="block text-xs text-gray-500 mb-1">Decision Note (required for reject)</label>
                      <textarea
                        rows={2}
                        value={decisionNote[appointment.id] || ''}
                        onChange={(e) => setDecisionNote((curr) => ({ ...curr, [appointment.id]: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        placeholder="Add reason if rejecting..."
                      />
                      <div className="mt-2 flex gap-2">
                        <button
                          type="button"
                          onClick={() => void handleDecision(appointment.id, 'APPROVED')}
                          disabled={Boolean(decisionLoading[appointment.id])}
                          className="inline-flex items-center px-3 py-2 bg-green-600 text-white rounded-lg text-sm font-semibold hover:bg-green-700 disabled:cursor-not-allowed disabled:bg-green-400"
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          {decisionLoading[appointment.id] ? 'Processing...' : 'Approve'}
                        </button>
                        <button
                          type="button"
                          onClick={() => void handleDecision(appointment.id, 'REJECTED')}
                          disabled={Boolean(decisionLoading[appointment.id])}
                          className="inline-flex items-center px-3 py-2 bg-red-600 text-white rounded-lg text-sm font-semibold hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-red-400"
                        >
                          <XCircle className="h-4 w-4 mr-1" />
                          {decisionLoading[appointment.id] ? 'Processing...' : 'Reject'}
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 text-sm text-gray-600">
                    This request is finalized and cannot be reviewed from the queue.
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
