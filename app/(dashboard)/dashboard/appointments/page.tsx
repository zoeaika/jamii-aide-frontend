'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { AlertCircle, Calendar, CheckCircle, Clock, MapPin, Plus, User, XCircle, Edit, AlertTriangle, Trash2 } from 'lucide-react';
import { appointmentService, familyMemberService, nurseService } from '@/app/lib/api';
import { formatDate, formatKES } from '@/app/lib/format';

type Appointment = {
  id: string;
  family_member:
    | string
    | {
        full_name?: string;
        first_name?: string;
        last_name?: string;
      };
  family_member_name?: string;
  nurse?:
    | string
    | {
        id?: string;
        full_name?: string;
        first_name?: string;
        last_name?: string;
        user?: {
          first_name?: string;
          last_name?: string;
          email?: string;
        };
      }
    | null;
  assigned_nurse?:
    | string
    | {
        id?: string;
        full_name?: string;
        first_name?: string;
        last_name?: string;
        user?: {
          first_name?: string;
          last_name?: string;
          email?: string;
        };
      }
    | null;
  suggested_nurse?:
    | string
    | {
        id?: string;
        full_name?: string;
        first_name?: string;
        last_name?: string;
        user?: {
          first_name?: string;
          last_name?: string;
          email?: string;
        };
      }
    | null;
  appointment_date: string;
  start_time: string;
  end_time: string;
  status: string;
  status_display?: string;
  service_type: string;
  reason: string;
  visit_address: string;
  visit_city: string;
  amount: number;
  rejection_reason?: string | null;
};

type FamilyMember = {
  id: string;
  first_name: string;
  last_name: string;
};

type Nurse = {
  id: string;
  user?: {
    first_name?: string;
    last_name?: string;
  };
};

const timeline = ['SUBMITTED', 'NURSE_SUGGESTED', 'APPROVED', 'CONFIRMED', 'COMPLETED'];

const statusLabel: Record<string, string> = {
  SUBMITTED: 'Submitted',
  UNDER_REVIEW: 'Under Review',
  NURSE_SUGGESTED: 'Nurse Suggested',
  APPROVED: 'Approved',
  REJECTED: 'Rejected',
  CONFIRMED: 'Confirmed',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
};

const serviceTypeLabel: Record<string, string> = {
  WELLNESS_VISIT: 'Wellness Visit',
  CARE_VISIT: 'Care Visit',
  CHRONIC_CONDITION_VISIT: 'Chronic Condition Visit',
  DAILY_CARE: 'Daily Care',
  LIVE_IN_CARE: 'Live-in Care',
  EMERGENCY_ACCOMPANIMENT: 'Emergency Accompaniment',
};

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
  const [nurses, setNurses] = useState<Nurse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [rescheduleModal, setRescheduleModal] = useState<{ appointmentId: string; currentDate: string; currentStartTime: string; currentEndTime: string } | null>(null);
  const [rescheduleData, setRescheduleData] = useState({ appointment_date: '', start_time: '', end_time: '' });
  const [isRescheduling, setIsRescheduling] = useState(false);
  const [noShowConfirm, setNoShowConfirm] = useState<string | null>(null);
  const [isMarkingNoShow, setIsMarkingNoShow] = useState(false);
  const [deletingAppointmentId, setDeletingAppointmentId] = useState<string | null>(null);
  const [actionNotice, setActionNotice] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      setLoadError('');

      try {
        const [appointmentsResult, nurseResult, familyResult] = await Promise.allSettled([
          appointmentService.getAll(),
          nurseService.getAll(),
          familyMemberService.getAll(),
        ]);

        if (appointmentsResult.status !== 'fulfilled') {
          throw appointmentsResult.reason;
        }

        const appointmentsResponse = appointmentsResult.value;
        const appointmentItems = appointmentsResponse?.data?.results || appointmentsResponse?.data || [];

        const nurseItems =
          nurseResult.status === 'fulfilled'
            ? nurseResult.value?.data?.results || nurseResult.value?.data || []
            : [];
        const familyItems =
          familyResult.status === 'fulfilled'
            ? familyResult.value?.data?.results || familyResult.value?.data || []
            : [];

        setAppointments(Array.isArray(appointmentItems) ? appointmentItems : []);
        setFamilyMembers(
          Array.isArray(familyItems)
            ? familyItems.map((member: any) => ({
                id: String(member.id),
                first_name: String(member.first_name || member.name || 'Family'),
                last_name: String(member.last_name || ''),
              }))
            : [],
        );
        setNurses(Array.isArray(nurseItems) ? nurseItems : []);

        if (nurseResult.status !== 'fulfilled' || familyResult.status !== 'fulfilled') {
          setLoadError('Some supporting details could not be loaded, but your live appointments are shown.');
        }
      } catch (error) {
        setLoadError('Could not reach the server. No demo appointments are shown.');
        setAppointments([]);
        setFamilyMembers([]);
      } finally {
        setIsLoading(false);
      }
    };

    void load();
  }, []);

  useEffect(() => {
    localStorage.removeItem('appointments_local');
  }, []);

  const familyNameById = useMemo(() => {
    const map: Record<string, string> = {};
    familyMembers.forEach((member) => {
      map[member.id] = `${member.first_name} ${member.last_name}`.trim();
    });
    return map;
  }, [familyMembers]);

  const nurseNameById = useMemo(() => {
    const map: Record<string, string> = {};
    nurses.forEach((nurse) => {
      map[nurse.id] = `${nurse.user?.first_name || ''} ${nurse.user?.last_name || ''}`.trim() || nurse.id;
    });
    return map;
  }, [nurses]);

  const getFamilyMemberName = (familyMember: Appointment['family_member'], fallback?: string) => {
    if (!familyMember) {
      return fallback || 'N/A';
    }

    if (typeof familyMember === 'string') {
      return familyNameById[familyMember] || fallback || familyMember;
    }

    const fullName = String(familyMember.full_name || '').trim();
    if (fullName) {
      return fullName;
    }

    const combined = `${String(familyMember.first_name || '').trim()} ${String(familyMember.last_name || '').trim()}`.trim();
    return combined || fallback || 'N/A';
  };

  const getNurseName = (appointment: Appointment) => {
    const resolveCandidate = (nurse: Appointment['nurse'] | Appointment['assigned_nurse'] | Appointment['suggested_nurse']) => {
      if (!nurse) {
        return '';
      }

      if (typeof nurse === 'string') {
        return nurseNameById[nurse] || nurse;
      }

      const fullName = String(nurse.full_name || '').trim();
      if (fullName) {
        return fullName;
      }

      const directName = `${String(nurse.first_name || '').trim()} ${String(nurse.last_name || '').trim()}`.trim();
      if (directName) {
        return directName;
      }

      const nestedName = `${String(nurse.user?.first_name || '').trim()} ${String(nurse.user?.last_name || '').trim()}`.trim();
      if (nestedName) {
        return nestedName;
      }

      const idCandidate = String(nurse.id || '').trim();
      if (idCandidate) {
        return nurseNameById[idCandidate] || idCandidate;
      }

      return '';
    };

    const resolved =
      resolveCandidate(appointment.nurse) ||
      resolveCandidate(appointment.assigned_nurse) ||
      resolveCandidate(appointment.suggested_nurse);

    if (!resolved) {
      return 'Pending admin matching';
    }

    return resolved;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED':
      case 'CONFIRMED':
      case 'COMPLETED':
        return 'bg-green-100 text-green-700';
      case 'REJECTED':
      case 'CANCELLED':
        return 'bg-red-100 text-red-700';
      case 'NURSE_SUGGESTED':
        return 'bg-indigo-100 text-indigo-700';
      default:
        return 'bg-yellow-100 text-yellow-700';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'APPROVED':
      case 'CONFIRMED':
      case 'COMPLETED':
        return <CheckCircle className="h-4 w-4" />;
      case 'REJECTED':
      case 'CANCELLED':
        return <XCircle className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  const timelineProgress = (status: string) => {
    if (status === 'REJECTED' || status === 'CANCELLED') {
      return 1;
    }
    const idx = timeline.indexOf(status);
    return idx < 0 ? 0 : idx;
  };

  const handleReschedule = async () => {
    if (!rescheduleModal || !rescheduleData.appointment_date || !rescheduleData.start_time || !rescheduleData.end_time) {
      alert('Please fill in all fields');
      return;
    }

    setIsRescheduling(true);
    try {
      await appointmentService.reschedule(rescheduleModal.appointmentId, {
        appointment_date: rescheduleData.appointment_date,
        start_time: rescheduleData.start_time,
        end_time: rescheduleData.end_time,
      });
      
      setAppointments(appointments.map(a => 
        a.id === rescheduleModal.appointmentId
          ? { ...a, appointment_date: rescheduleData.appointment_date, start_time: rescheduleData.start_time, end_time: rescheduleData.end_time }
          : a
      ));
      
      setRescheduleModal(null);
      setRescheduleData({ appointment_date: '', start_time: '', end_time: '' });
      alert('Appointment rescheduled successfully!');
    } catch (err: any) {
      alert('Failed to reschedule: ' + (err?.response?.data?.detail || err?.message || 'Unknown error'));
    } finally {
      setIsRescheduling(false);
    }
  };

  const handleNoShow = async (appointmentId: string) => {
    setIsMarkingNoShow(true);
    try {
      await appointmentService.noShow(appointmentId);
      setAppointments(appointments.map(a => 
        a.id === appointmentId ? { ...a, status: 'NO_SHOW' } : a
      ));
      setNoShowConfirm(null);
      alert('Appointment marked as no-show');
    } catch (err: any) {
      alert('Failed to mark no-show: ' + (err?.response?.data?.detail || err?.message || 'Unknown error'));
    } finally {
      setIsMarkingNoShow(false);
    }
  };

  const handleDeleteRequest = async (appointmentId: string) => {
    const shouldDelete = window.confirm('Delete this care request? This cannot be undone from the app.');
    if (!shouldDelete) {
      return;
    }

    setActionNotice(null);
    setDeletingAppointmentId(appointmentId);
    try {
      await appointmentService.cancel(appointmentId);
      setAppointments((current) => current.filter((appointment) => appointment.id !== appointmentId));
      setActionNotice({ type: 'success', message: 'Care request deleted successfully.' });
    } catch (err: any) {
      setActionNotice({
        type: 'error',
        message: 'Failed to delete request: ' + (err?.response?.data?.detail || err?.message || 'Unknown error'),
      });
    } finally {
      setDeletingAppointmentId(null);
    }
  };

  const canReschedule = (status: string) => ['CONFIRMED', 'APPROVED'].includes(status);
  const canMarkNoShow = (status: string) => status === 'CONFIRMED';
  const canDeleteRequest = (status: string) => ['SUBMITTED', 'UNDER_REVIEW', 'NURSE_SUGGESTED'].includes(status);
  const visibleAppointments = appointments.filter((appointment) => appointment.status !== 'CANCELLED');

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Calendar className="h-12 w-12 text-blue-600 animate-pulse mx-auto mb-4" />
          <p className="text-gray-600">Loading appointments...</p>
        </div>
      </div>
    );
  }

  return (
    <>
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Care Requests</h1>
          <p className="text-gray-600 mt-2">Track request status from submission to decision</p>
        </div>
        <Link href="/dashboard/appointments/new" className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 flex items-center space-x-2 shadow-md">
          <Plus className="h-5 w-5" />
          <span>New Care Request</span>
        </Link>
      </div>

      {loadError && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-amber-900 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
          <p className="text-sm">{loadError}</p>
        </div>
      )}

      {actionNotice && (
        <div
          className={`rounded-lg p-4 text-sm flex items-start gap-3 ${
            actionNotice.type === 'success'
              ? 'border border-green-200 bg-green-50 text-green-900'
              : 'border border-red-200 bg-red-50 text-red-900'
          }`}
        >
          {actionNotice.type === 'success' ? (
            <CheckCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
          ) : (
            <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
          )}
          <p>{actionNotice.message}</p>
        </div>
      )}

      {visibleAppointments.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Calendar className="h-8 w-8 text-blue-600" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No requests yet</h3>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">Submit your first care request and an admin will review and match a nurse.</p>
          <Link href="/dashboard/appointments/new" className="inline-flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700">
            <Plus className="h-5 w-5" />
            <span>Create First Request</span>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {visibleAppointments.map((appointment) => {
            const nurseName = getNurseName(appointment);
            const familyName = getFamilyMemberName(appointment.family_member, appointment.family_member_name);
            const progress = timelineProgress(appointment.status);

            return (
              <div key={appointment.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <Calendar className="h-5 w-5 text-blue-600" />
                      <span className="font-semibold text-lg text-gray-900">
                        {formatDate(appointment.appointment_date, {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </span>
                    </div>

                    <div className="flex items-center space-x-2 mb-2 text-gray-600">
                      <Clock className="h-4 w-4" />
                      <span>{appointment.start_time} - {appointment.end_time}</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                      <div>
                        <p className="text-sm text-gray-500 mb-1">Family Member</p>
                        <div className="flex items-center space-x-2">
                          <User className="h-4 w-4 text-gray-400" />
                          <p className="font-medium text-gray-900">{familyName}</p>
                        </div>
                      </div>

                      <div>
                        <p className="text-sm text-gray-500 mb-1">Assigned Nurse</p>
                        <div className="flex items-center space-x-2">
                          <MapPin className="h-4 w-4 text-gray-400" />
                          <p className="font-medium text-gray-900">{nurseName}</p>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 text-sm text-gray-700">
                      <p className="font-medium">{serviceTypeLabel[appointment.service_type] || appointment.service_type}</p>
                      <p className="text-gray-600">{appointment.reason}</p>
                    </div>
                  </div>

                  <div className="text-right ml-6">
                    <div className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-sm font-medium mb-3 ${getStatusColor(appointment.status)}`}>
                      {getStatusIcon(appointment.status)}
                      <span>{appointment.status_display || statusLabel[appointment.status] || appointment.status}</span>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">KES {formatKES(appointment.amount || 0)}</p>
                    <p className="text-sm text-gray-500 mt-1">Estimated Cost</p>
                  </div>
                </div>

                <div className="mt-5">
                  <p className="text-sm font-semibold text-gray-700 mb-2">Status Timeline</p>
                  <div className="flex items-center gap-2">
                    {timeline.map((step, idx) => (
                      <div key={step} className="flex items-center flex-1">
                        <div
                          className={`px-2 py-1 rounded text-[10px] font-semibold whitespace-nowrap ${
                            idx <= progress ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-500'
                          }`}
                        >
                          {statusLabel[step]}
                        </div>
                        {idx < timeline.length - 1 && <div className={`h-1 flex-1 mx-1 ${idx < progress ? 'bg-blue-600' : 'bg-gray-200'}`} />}
                      </div>
                    ))}
                  </div>
                  {appointment.rejection_reason && (
                    <p className="mt-3 text-sm text-red-700">
                      <span className="font-semibold">Rejection reason:</span> {appointment.rejection_reason}
                    </p>
                  )}
                </div>

                {/* Action Buttons */}
                {(canReschedule(appointment.status) || canMarkNoShow(appointment.status) || canDeleteRequest(appointment.status)) && (
                  <div className="mt-4 flex gap-2">
                    {canDeleteRequest(appointment.status) && (
                      <button
                        onClick={() => handleDeleteRequest(appointment.id)}
                        disabled={deletingAppointmentId === appointment.id}
                        className="px-4 py-2 bg-red-100 text-red-700 rounded-lg font-medium hover:bg-red-200 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Trash2 className="h-4 w-4" />
                        <span>{deletingAppointmentId === appointment.id ? 'Deleting...' : 'Delete Request'}</span>
                      </button>
                    )}
                    {canReschedule(appointment.status) && (
                      <button
                        onClick={() => {
                          setRescheduleModal({
                            appointmentId: appointment.id,
                            currentDate: appointment.appointment_date,
                            currentStartTime: appointment.start_time,
                            currentEndTime: appointment.end_time,
                          });
                          setRescheduleData({
                            appointment_date: appointment.appointment_date,
                            start_time: appointment.start_time,
                            end_time: appointment.end_time,
                          });
                        }}
                        className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg font-medium hover:bg-blue-200 flex items-center gap-2"
                      >
                        <Edit className="h-4 w-4" />
                        Reschedule
                      </button>
                    )}
                    {canMarkNoShow(appointment.status) && (
                      <button
                        onClick={() => setNoShowConfirm(appointment.id)}
                        className="px-4 py-2 bg-red-100 text-red-700 rounded-lg font-medium hover:bg-red-200 flex items-center gap-2"
                      >
                        <AlertTriangle className="h-4 w-4" />
                        Mark No-Show
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>

    {/* Reschedule Modal */}
    {rescheduleModal && (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full">
          <div className="flex items-center gap-2 mb-4">
            <Edit className="h-6 w-6 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900">Reschedule Appointment</h3>
          </div>
          
          <p className="text-sm text-gray-600 mb-4">
            Current: {formatDate(rescheduleModal.currentDate)} at {rescheduleModal.currentStartTime}
          </p>

          <div className="space-y-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">New Date</label>
              <input
                type="date"
                value={rescheduleData.appointment_date}
                onChange={(e) => setRescheduleData({ ...rescheduleData, appointment_date: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent date-input-optimized"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Start Time</label>
              <input
                type="time"
                value={rescheduleData.start_time}
                onChange={(e) => setRescheduleData({ ...rescheduleData, start_time: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">End Time</label>
              <input
                type="time"
                value={rescheduleData.end_time}
                onChange={(e) => setRescheduleData({ ...rescheduleData, end_time: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setRescheduleModal(null)}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleReschedule}
              disabled={isRescheduling}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isRescheduling ? 'Rescheduling...' : 'Reschedule'}
            </button>
          </div>
        </div>
      </div>
    )}

    {/* No-Show Confirmation Modal */}
    {noShowConfirm && (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="h-6 w-6 text-red-600" />
            <h3 className="text-lg font-semibold text-gray-900">Confirm No-Show</h3>
          </div>
          
          <p className="text-sm text-gray-600 mb-6">
            Are you sure you want to mark this appointment as no-show? This action cannot be undone.
          </p>

          <div className="flex gap-3">
            <button
              onClick={() => setNoShowConfirm(null)}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={() => handleNoShow(noShowConfirm)}
              disabled={isMarkingNoShow}
              className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isMarkingNoShow ? 'Marking...' : 'Mark No-Show'}
            </button>
          </div>
        </div>
      </div>
    )}
  </>
  );
}
