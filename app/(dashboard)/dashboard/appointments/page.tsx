'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { AlertCircle, Calendar, CheckCircle, Clock, MapPin, Plus, User, XCircle } from 'lucide-react';
import { appointmentService, familyMemberService, nurseService } from '@/app/lib/api';

type Appointment = {
  id: string;
  family_member: string;
  suggested_nurse?: string | null;
  appointment_date: string;
  start_time: string;
  end_time: string;
  status: string;
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

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
  const [nurses, setNurses] = useState<Nurse[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      try {
        const [appointmentsResponse, familyResponse, nurseResponse] = await Promise.all([
          appointmentService.getAll(),
          familyMemberService.getAll(),
          nurseService.getAll(),
        ]);

        const appointmentItems = appointmentsResponse?.data?.results || appointmentsResponse?.data || [];
        const familyItems = familyResponse?.data?.results || familyResponse?.data || [];
        const nurseItems = nurseResponse?.data?.results || nurseResponse?.data || [];

        setAppointments(Array.isArray(appointmentItems) ? appointmentItems : []);
        setFamilyMembers(Array.isArray(familyItems) ? familyItems : []);
        setNurses(Array.isArray(nurseItems) ? nurseItems : []);
      } catch (error) {
        console.error('Error fetching appointments:', error);
        setAppointments([]);
      } finally {
        setIsLoading(false);
      }
    };

    void load();
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

      {appointments.length === 0 ? (
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
          {appointments.map((appointment) => {
            const nurseName = appointment.suggested_nurse ? nurseNameById[appointment.suggested_nurse] || appointment.suggested_nurse : 'Pending admin matching';
            const familyName = familyNameById[appointment.family_member] || appointment.family_member;
            const progress = timelineProgress(appointment.status);

            return (
              <div key={appointment.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <Calendar className="h-5 w-5 text-blue-600" />
                      <span className="font-semibold text-lg text-gray-900">
                        {new Date(appointment.appointment_date).toLocaleDateString('en-US', {
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
                        <p className="text-sm text-gray-500 mb-1">Suggested Nurse</p>
                        <div className="flex items-center space-x-2">
                          <MapPin className="h-4 w-4 text-gray-400" />
                          <p className="font-medium text-gray-900">{nurseName}</p>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 text-sm text-gray-700">
                      <p className="font-medium">{appointment.service_type}</p>
                      <p className="text-gray-600">{appointment.reason}</p>
                    </div>
                  </div>

                  <div className="text-right ml-6">
                    <div className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-sm font-medium mb-3 ${getStatusColor(appointment.status)}`}>
                      {getStatusIcon(appointment.status)}
                      <span>{statusLabel[appointment.status] || appointment.status}</span>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">KES {Number(appointment.amount || 0).toLocaleString()}</p>
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
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
