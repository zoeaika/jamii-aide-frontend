'use client';

import { useEffect, useMemo, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, CheckCircle, Clock, Download, FileText } from 'lucide-react';
import { appointmentService, familyMemberService } from '@/app/lib/api';
import { readLocalStorageBoolean } from '@/app/lib/clientStorage';
import { formatKES } from '@/app/lib/format';

type FamilyMember = {
  id: string;
  name: string;
  age: number;
  medical_conditions: string;
};

type AdmissionQuestionnaire = {
  insurance_details: string;
  last_procedure: string;
  medical_conditions: string;
  allergies: string;
  emergency_contact: string;
  consent_for_emergency_admission: boolean;
};

type FormDataState = {
  family_member: string;
  service_type: string;
  appointment_date: string;
  start_time: string;
  end_time: string;
  reason: string;
  visit_address: string;
  visit_city: string;
  notes: string;
  additional_notes: string;
  shift_type: string;
  evaluation_type: string;
  admission_clause_accepted: boolean;
  admission_support_in_subscription: boolean;
  admission_questionnaire: AdmissionQuestionnaire;
};

const requiredAdmissionKeys: Array<keyof Omit<AdmissionQuestionnaire, 'consent_for_emergency_admission'>> = [
  'insurance_details',
  'last_procedure',
  'medical_conditions',
  'allergies',
  'emergency_contact',
];

const getAgeFromDateOfBirth = (dateOfBirth?: string | null) => {
  if (!dateOfBirth) {
    return 0;
  }
  const dob = new Date(dateOfBirth);
  if (Number.isNaN(dob.getTime())) {
    return 0;
  }
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const monthDifference = today.getMonth() - dob.getMonth();
  if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < dob.getDate())) {
    age -= 1;
  }
  return Math.max(age, 0);
};

const stringifyConditions = (value: unknown) => {
  if (Array.isArray(value)) {
    return value.map((item) => String(item).trim()).filter(Boolean).join(', ');
  }
  if (typeof value === 'string') {
    return value.trim();
  }
  return '';
};

const generateTimeIntervals = () => {
  const times: string[] = [];
  for (let hours = 5; hours <= 22; hours++) {
    for (let minutes = 0; minutes < 60; minutes += 15) {
      const time = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
      times.push(time);
    }
  }
  return times;
};

const timeIntervals = generateTimeIntervals();
const patientConsentFormUrl = '/api/patient-consent-form';

const formatTimeLabel = (value: string) => {
  const [hoursPart, minutesPart] = value.split(':');
  const hours = Number(hoursPart);
  if (Number.isNaN(hours)) {
    return value;
  }

  const suffix = hours >= 12 ? 'PM' : 'AM';
  const displayHours = ((hours + 11) % 12) + 1;
  return `${displayHours}:${minutesPart} ${suffix}`;
};

const normalizeTimeForApi = (value: string) => {
  const trimmed = String(value || '').trim();
  if (!trimmed) {
    return '';
  }
  return /^\d{2}:\d{2}$/.test(trimmed) ? `${trimmed}:00` : trimmed;
};

const normalizeTimeForCompare = (value: unknown) => String(value || '').slice(0, 5);

const extractApiErrorMessage = (details: any) => {
  if (!details) {
    return '';
  }
  if (typeof details === 'string') {
    return details;
  }
  if (typeof details?.detail === 'string' && details.detail.trim()) {
    return details.detail;
  }
  if (Array.isArray(details?.non_field_errors) && details.non_field_errors.length > 0) {
    return String(details.non_field_errors[0]);
  }

  const fieldEntries = Object.entries(details).filter(([key]) => key !== 'detail');
  for (const [field, value] of fieldEntries) {
    if (Array.isArray(value) && value.length > 0) {
      return `${field.replaceAll('_', ' ')}: ${String(value[0])}`;
    }
    if (typeof value === 'string' && value.trim()) {
      return `${field.replaceAll('_', ' ')}: ${value}`;
    }
  }

  return '';
};

export default function NewAppointmentPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMembers, setIsLoadingMembers] = useState(true);
  const [error, setError] = useState('');
  const [step, setStep] = useState(1);
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
  const [formData, setFormData] = useState<FormDataState>(() => ({
    family_member: '',
    service_type: '',
    appointment_date: '',
    start_time: '',
    end_time: '',
    reason: '',
    visit_address: '',
    visit_city: '',
    notes: '',
    additional_notes: '',
    shift_type: 'DAILY_PER_HOUR_12H',
    evaluation_type: 'PHYSICAL_VISIT',
    admission_clause_accepted: readLocalStorageBoolean('admission_clause_accepted', false),
    admission_support_in_subscription: readLocalStorageBoolean('admission_support_in_subscription', true),
    admission_questionnaire: {
      insurance_details: '',
      last_procedure: '',
      medical_conditions: '',
      allergies: '',
      emergency_contact: '',
      consent_for_emergency_admission: false,
    } satisfies AdmissionQuestionnaire,
  }));
  const [selectedTierDetails, setSelectedTierDetails] = useState<any | null>(null);

  useEffect(() => {
    const loadMembers = async () => {
      setIsLoadingMembers(true);
      try {
        const response = await familyMemberService.getAll();
        const apiItems = response?.data?.results || response?.data || [];
        if (Array.isArray(apiItems) && apiItems.length > 0) {
          const normalizedApiMembers = apiItems.map((member: any) => ({
            id: String(member.id),
            name: String(
              member.full_name ||
                `${member.first_name || ''} ${member.last_name || ''}`.trim() ||
                member.name ||
                'Family Member',
            ),
            age: getAgeFromDateOfBirth(member.date_of_birth),
            medical_conditions: stringifyConditions(
              member.chronic_conditions || member.medical_conditions || member.conditions,
            ),
          }));
          setFamilyMembers(normalizedApiMembers);
          setIsLoadingMembers(false);
          return;
        }
      } catch (fetchError) {
        console.error('Failed to load live family members for appointment request:', fetchError);
      }

      setFamilyMembers([]);
      setIsLoadingMembers(false);
    };

    void loadMembers();
  }, []);

  useEffect(() => {
    localStorage.removeItem('family_members');
  }, []);

  const serviceTiers = [
    {
      tier: '01',
      name: 'Wellness Visit',
      duration: '60–90 min',
      caregiverType: 'Registered Nurse',
      service_type: 'WELLNESS_VISIT',
      description: 'Routine in-home check-in. Vital signs, medication review, observation, conversation, and a written report submitted before the nurse leaves.',
      bestFor: 'Monthly check-ins on a relative who is generally well but lives alone or far from family.',
    },
    {
      tier: '02',
      name: 'Care Visit',
      duration: '2 hrs',
      caregiverType: 'Registered Nurse',
      service_type: 'CARE_VISIT',
      description: 'All wellness elements plus support with daily living, mobility help, hygiene assistance, light meal supervision, and an environmental safety check.',
      bestFor: 'Weekly support for an elder with reduced mobility, early cognitive decline, or post-illness recovery.',
    },
    {
      tier: '03',
      name: 'Chronic Condition Visit',
      duration: '2–3 hrs',
      caregiverType: 'Registered Nurse',
      service_type: 'CHRONIC_CONDITION_VISIT',
      description: "Disease-specific monitoring per a structured clinical care plan agreed with your loved one's treating physician. Includes condition-specific education.",
      bestFor: 'Diabetes, hypertension, post-surgical recovery, ongoing wound care, or palliative observation.',
    },
    {
      tier: '04',
      name: 'Daily Care',
      duration: 'Day or evening shift',
      caregiverType: 'Registered Nurse',
      service_type: 'DAILY_CARE',
      description: "Structured daily presence, morning or evening. Continuity with the same primary nurse is prioritised.",
      bestFor: 'Recently discharged patients, rapid decline, or families who need a daily anchor.',
    },
    {
      tier: '05',
      name: 'Live-in Care',
      duration: '24/7',
      caregiverType: 'Nurse or Health Aide',
      service_type: 'LIVE_IN_CARE',
      description: 'A nurse or experienced caregiver present around the clock, with structured handovers between shifts and a designated lead nurse coordinating the care plan.',
      bestFor: 'End-of-life care, complex post-operative recovery, advanced dementia, or full dependency.',
    },
    {
      tier: '06',
      name: 'Emergency Accompaniment',
      duration: 'On call',
      caregiverType: 'Registered Nurse',
      service_type: 'EMERGENCY_ACCOMPANIMENT',
      description: 'A nurse accompanies your loved one to a hospital appointment, ER visit, or admission and reports back to you in real time.',
      bestFor: 'Specialist appointments, hospital admissions, ER visits where the family wants a clinical advocate present.',
    },
  ];

  const requiresAdmissionQuestionnaire = useMemo(
    () => formData.admission_clause_accepted || formData.admission_support_in_subscription,
    [formData.admission_clause_accepted, formData.admission_support_in_subscription],
  );

  const hasCompleteAdmissionQuestionnaire = useMemo(() => {
    if (!requiresAdmissionQuestionnaire) {
      return true;
    }
    return (
      requiredAdmissionKeys.every((key) => Boolean(formData.admission_questionnaire[key].trim())) &&
      formData.admission_questionnaire.consent_for_emergency_admission
    );
  }, [formData.admission_questionnaire, requiresAdmissionQuestionnaire]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const payload = {
      family_member: formData.family_member,
      appointment_date: formData.appointment_date,
      start_time: normalizeTimeForApi(formData.start_time),
      end_time: normalizeTimeForApi(formData.end_time),
      reason: formData.reason,
      service_type: formData.service_type,
      shift_type: formData.shift_type,
      evaluation_type: formData.evaluation_type || null,
      visit_address: formData.visit_address,
      visit_city: formData.visit_city,
      notes: formData.notes || null,
      additional_notes: formData.additional_notes || null,
      admission_clause_accepted: formData.admission_clause_accepted,
      admission_support_in_subscription: formData.admission_support_in_subscription,
      admission_questionnaire: requiresAdmissionQuestionnaire ? formData.admission_questionnaire : {},
    };

    try {
      await appointmentService.create(payload);
      router.push('/dashboard/appointments');
    } catch (submitError: any) {
      const statusCode = submitError?.response?.status;
      const details = submitError?.response?.data;

      // Some backend setups can persist successfully but fail later (e.g., async task broker issues).
      if (statusCode >= 500) {
        try {
          const verifyResponse = await appointmentService.getAll();
          const verifyItems = verifyResponse?.data?.results || verifyResponse?.data || [];
          if (Array.isArray(verifyItems)) {
            const foundPersistedRequest = verifyItems.some((item: any) => {
              const hasMatchingCoreFields =
                String(item?.family_member || '') === payload.family_member &&
                String(item?.appointment_date || '') === payload.appointment_date &&
                normalizeTimeForCompare(item?.start_time) === normalizeTimeForCompare(payload.start_time) &&
                normalizeTimeForCompare(item?.end_time) === normalizeTimeForCompare(payload.end_time) &&
                String(item?.reason || '').trim() === String(payload.reason).trim() &&
                String(item?.service_type || '') === payload.service_type;

              const status = String(item?.status || '');
              const isExpectedStatus = ['SUBMITTED', 'UNDER_REVIEW', 'NURSE_SUGGESTED', 'APPROVED'].includes(status);
              return hasMatchingCoreFields && isExpectedStatus;
            });

            if (foundPersistedRequest) {
              router.push('/dashboard/appointments');
              return;
            }
          }
        } catch {
          // Ignore verification errors and fall back to showing API error below.
        }
      }

      const detailMessage =
        extractApiErrorMessage(details) ||
        (submitError?.message === 'Network Error'
          ? 'Unable to reach the backend. Please confirm the API server is running and try again.'
          : 'Unable to submit request. Please check the form and try again.');
      setError(detailMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const canGoNext =
    (step === 1 && Boolean(formData.family_member)) ||
    (step === 2 && Boolean(formData.service_type && formData.reason && formData.shift_type)) ||
    (step === 3 &&
      Boolean(formData.appointment_date && formData.start_time && formData.end_time && formData.visit_address && formData.visit_city) &&
      hasCompleteAdmissionQuestionnaire);
  const selectedMember = familyMembers.find((member) => member.id === formData.family_member);

  return (
    <div className="w-full">
      <div className="mb-8">
        <Link href="/dashboard/appointments" className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Appointments
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">Create Care Request</h1>
        <p className="text-gray-600 mt-2">Submit your request for admin matching and decision</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 lg:p-8 mb-6">
        <div className="flex items-center justify-between">
          {[
            { num: 1, title: 'Member' },
            { num: 2, title: 'Care Details' },
            { num: 3, title: 'Schedule & Admission' },
            { num: 4, title: 'Confirm' },
          ].map((s, idx) => (
            <div key={s.num} className="flex items-center flex-1">
              <div className="flex flex-col items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${step >= s.num ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'}`}>
                  {step > s.num ? <CheckCircle className="h-6 w-6" /> : s.num}
                </div>
                <span className="text-xs font-medium text-gray-600 mt-2">{s.title}</span>
              </div>
              {idx < 3 && <div className={`flex-1 h-1 mx-4 ${step > s.num ? 'bg-blue-600' : 'bg-gray-200'}`} />}
            </div>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 lg:p-8">
        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}
        {step === 1 && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900">Select Family Member</h2>
            {isLoadingMembers ? (
              <div className="rounded-lg border border-gray-200 bg-gray-50 p-6 text-center text-sm text-gray-700">
                Loading family members...
              </div>
            ) : familyMembers.length === 0 ? (
              <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-6 text-center">
                <p className="text-sm text-gray-700">No family members found.</p>
                <p className="mt-2 text-sm text-gray-500">Create one first so this request can use a real backend family member record.</p>
                <Link href="/dashboard/family/new" className="mt-3 inline-block text-sm font-semibold text-blue-700 hover:text-blue-900">
                  Add family member first
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {familyMembers.map((member) => (
                  <label
                    key={member.id}
                    className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition ${
                      formData.family_member === member.id ? 'border-blue-600 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="family_member"
                      value={member.id}
                      checked={formData.family_member === member.id}
                      onChange={(e) => setFormData({ ...formData, family_member: e.target.value })}
                      className="sr-only"
                    />
                    <div className="flex items-center space-x-4 flex-1">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                        <span className="text-white font-bold">{member.name.charAt(0)}</span>
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{member.name}</p>
                        <p className="text-sm text-gray-600">{member.age} years old</p>
                        {member.medical_conditions && (
                          <p className="text-xs text-gray-500 mt-1">Conditions: {member.medical_conditions}</p>
                        )}
                      </div>
                    </div>
                    {formData.family_member === member.id && <CheckCircle className="h-6 w-6 text-blue-600" />}
                  </label>
                ))}
              </div>
            )}
          </div>
        )}

        {step === 2 && (
          <div className="space-y-8">
            {/* Tier Selection Cards */}
            {!selectedTierDetails ? (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-6">What care tier fits your loved one?</h2>
                <p className="text-gray-600 text-sm mb-4">Click a tier to learn more before confirming your choice.</p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {serviceTiers.map((tier) => (
                    <button
                      key={tier.service_type}
                      type="button"
                      onClick={() => setSelectedTierDetails(tier)}
                      className={`text-left p-4 rounded-lg border-2 transition cursor-pointer ${
                        formData.service_type === tier.service_type
                          ? 'border-blue-600 bg-blue-50'
                          : 'border-gray-200 hover:border-blue-400 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="text-xs font-bold text-gray-500 uppercase">Tier {tier.tier}</p>
                          <h3 className="text-lg font-semibold text-gray-900">{tier.name}</h3>
                        </div>
                        {formData.service_type === tier.service_type && (
                          <CheckCircle className="h-5 w-5 text-blue-600 flex-shrink-0" />
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{tier.duration}</p>
                      <p className="text-xs text-gray-500">👤 {tier.caregiverType}</p>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              /* Tier Details & Confirmation */
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-8 border border-blue-200">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <p className="text-sm font-bold text-blue-600 uppercase">Tier {selectedTierDetails.tier}</p>
                    <h2 className="text-3xl font-bold text-gray-900 mt-1">{selectedTierDetails.name}</h2>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedTierDetails(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </button>
                </div>

                <div className="grid md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <p className="text-xs text-gray-500 font-semibold uppercase mb-1">Duration</p>
                    <p className="text-lg font-semibold text-gray-900">{selectedTierDetails.duration}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-semibold uppercase mb-1">Caregiver Type</p>
                    <p className="text-lg font-semibold text-gray-900">👤 {selectedTierDetails.caregiverType}</p>
                  </div>
                </div>

                <div className="bg-white rounded-lg p-4 mb-6">
                  <p className="text-sm text-gray-700 leading-relaxed mb-4">{selectedTierDetails.description}</p>
                  <div className="border-t border-gray-200 pt-4">
                    <p className="text-xs text-gray-500 font-semibold uppercase mb-2">Best For</p>
                    <p className="text-sm text-gray-700">{selectedTierDetails.bestFor}</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      const shiftType = selectedTierDetails.tier === '05' ? 'LIVE_IN_24H' : 'DAILY_PER_HOUR_12H';
                      setFormData({ 
                        ...formData, 
                        service_type: selectedTierDetails.service_type,
                        shift_type: shiftType
                      });
                      setSelectedTierDetails(null);
                    }}
                    className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
                  >
                    Confirm & Continue
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedTierDetails(null)}
                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition"
                  >
                    Back
                  </button>
                </div>
              </div>
            )}

            {formData.service_type && !selectedTierDetails && (
              <div className="space-y-6">
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm font-semibold text-green-700 mb-2">✓ {serviceTiers.find(t => t.service_type === formData.service_type)?.name} selected</p>
                  <p className="text-xs text-green-600">Shift type: {formData.shift_type === 'LIVE_IN_24H' ? 'Live-in (24h)' : 'Daily / Per Hour (12h)'}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Shift Type * <span className="text-xs text-gray-500 font-normal">(auto-selected)</span></label>
                    <select
                      value={formData.shift_type}
                      onChange={(e) => setFormData({ ...formData, shift_type: e.target.value })}
                      className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-blue-50"
                    >
                      <option value="DAILY_PER_HOUR_12H">Daily / Per Hour (12h)</option>
                      <option value="LIVE_IN_24H">Live-in (24h)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Evaluation Type</label>
                    <select
                      value={formData.evaluation_type}
                      onChange={(e) => setFormData({ ...formData, evaluation_type: e.target.value })}
                      className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    >
                      <option value="PHYSICAL_VISIT">Physical Visit</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Reason *</label>
                  <textarea
                    value={formData.reason}
                    onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                    className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    rows={3}
                    placeholder="Why is care needed?"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Additional Notes</label>
                  <textarea
                    value={formData.additional_notes}
                    onChange={(e) => setFormData({ ...formData, additional_notes: e.target.value })}
                    className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    rows={3}
                    placeholder="Preferences, language, extra context"
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900">Schedule, Address, and Admission</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Date *</label>
                <input
                  type="date"
                  value={formData.appointment_date}
                  onChange={(e) => setFormData({ ...formData, appointment_date: e.target.value })}
                  className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none date-input-optimized"
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Start Time *</label>
                <select
                  value={formData.start_time}
                  onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                  className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="">Select start time</option>
                  {timeIntervals.map((time) => (
                    <option key={time} value={time}>
                      {formatTimeLabel(time)}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">End Time *</label>
                <select
                  value={formData.end_time}
                  onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                  className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="">Select end time</option>
                  {timeIntervals.map((time) => (
                    <option key={time} value={time}>
                      {formatTimeLabel(time)}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Visit Address *</label>
                <input
                  type="text"
                  value={formData.visit_address}
                  onChange={(e) => setFormData({ ...formData, visit_address: e.target.value })}
                  className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Visit City *</label>
                <input
                  type="text"
                  value={formData.visit_city}
                  onChange={(e) => setFormData({ ...formData, visit_city: e.target.value })}
                  className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
            </div>

            <div className="space-y-3 rounded-lg border border-gray-200 p-4">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.admission_clause_accepted}
                  onChange={(e) => {
                    const checked = e.target.checked;
                    setFormData({ ...formData, admission_clause_accepted: checked });
                  }}
                />
                <span className="text-sm text-gray-700">Admission clause accepted</span>
              </label>
              {formData.admission_clause_accepted && (
                <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 rounded-full bg-blue-100 p-2 text-blue-700">
                      <FileText className="h-4 w-4" />
                    </div>
                    <div className="flex-1 space-y-2">
                      <div>
                        <h3 className="text-sm font-semibold text-blue-900">Patient consent form available</h3>
                        <p className="text-sm text-blue-800">
                          Download the patient consent form before continuing with the appointment request.
                        </p>
                      </div>
                      <a
                        href={patientConsentFormUrl}
                        download="Patient Consent Form.docx"
                        className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
                      >
                        <Download className="h-4 w-4" />
                        Download patient consent form
                      </a>
                    </div>
                  </div>
                </div>
              )}
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.admission_support_in_subscription}
                  onChange={(e) => setFormData({ ...formData, admission_support_in_subscription: e.target.checked })}
                />
                <span className="text-sm text-gray-700">Admission support in subscription</span>
              </label>
            </div>

            {requiresAdmissionQuestionnaire && (
              <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 space-y-4">
                <h3 className="font-semibold text-amber-900">Admission Questionnaire (Required)</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {requiredAdmissionKeys.map((key) => (
                    <div key={key}>
                      <label className="block text-xs uppercase tracking-wide text-amber-900 mb-1">{key.replaceAll('_', ' ')}</label>
                      <input
                        type="text"
                        value={formData.admission_questionnaire[key]}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            admission_questionnaire: {
                              ...formData.admission_questionnaire,
                              [key]: e.target.value,
                            },
                          })
                        }
                        className="w-full px-3 py-2 border border-amber-300 rounded-lg bg-white"
                      />
                    </div>
                  ))}
                </div>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.admission_questionnaire.consent_for_emergency_admission}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        admission_questionnaire: {
                          ...formData.admission_questionnaire,
                          consent_for_emergency_admission: e.target.checked,
                        },
                      })
                    }
                  />
                  <span className="text-sm text-amber-900">Consent for emergency admission</span>
                </label>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                rows={3}
              />
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900">Confirm Care Request</h2>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 space-y-3 text-sm">
              <p><span className="font-semibold">Family Member:</span> {selectedMember?.name}</p>
              <p><span className="font-semibold">Age:</span> {selectedMember?.age ?? 0} years</p>
              <p><span className="font-semibold">Medical Conditions:</span> {selectedMember?.medical_conditions || 'None recorded'}</p>
              <p><span className="font-semibold">Service:</span> {formData.service_type}</p>
              <p><span className="font-semibold">Shift:</span> {formData.shift_type}</p>
              <p><span className="font-semibold">Evaluation:</span> {formData.evaluation_type || 'Not specified'}</p>
              <p><span className="font-semibold">Date:</span> {formData.appointment_date}</p>
              <p><span className="font-semibold">Time:</span> {formData.start_time} - {formData.end_time}</p>
              <p><span className="font-semibold">Address:</span> {formData.visit_address}, {formData.visit_city}</p>
              <p><span className="font-semibold">Admission Questionnaire Required:</span> {requiresAdmissionQuestionnaire ? 'Yes' : 'No'}</p>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between pt-8 mt-8 border-t border-gray-200">
          <button
            type="button"
            onClick={() => setStep(Math.max(1, step - 1))}
            disabled={step === 1}
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>

          {step < 4 ? (
            <button
              type="button"
              onClick={() => setStep(step + 1)}
              disabled={!canGoNext}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next Step
            </button>
          ) : (
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 flex items-center space-x-2"
            >
              <CheckCircle className="h-5 w-5" />
              <span>{isLoading ? 'Submitting...' : 'Submit Request'}</span>
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
