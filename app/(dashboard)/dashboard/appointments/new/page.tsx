'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Calendar, CheckCircle, Clock } from 'lucide-react';
import { appointmentService, familyMemberService } from '@/app/lib/api';

type FamilyMember = {
  id: string;
  name: string;
  age: number;
};

type AdmissionQuestionnaire = {
  insurance_details: string;
  last_procedure: string;
  medical_conditions: string;
  prescriptions: string;
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
  'prescriptions',
  'allergies',
  'emergency_contact',
];

const admissionFieldLabels: Record<(typeof requiredAdmissionKeys)[number], string> = {
  insurance_details: 'Insurance details',
  last_procedure: 'Last procedure',
  medical_conditions: 'Medical conditions',
  prescriptions: 'Current medications',
  allergies: 'Allergies',
  emergency_contact: 'Emergency contact',
};

export default function NewAppointmentPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState(1);
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
  const [formData, setFormData] = useState<FormDataState>({
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
    evaluation_type: 'ONLINE_CALL',
    admission_clause_accepted: false,
    admission_support_in_subscription: false,
    admission_questionnaire: {
      insurance_details: '',
      last_procedure: '',
      medical_conditions: '',
      prescriptions: '',
      allergies: '',
      emergency_contact: '',
      consent_for_emergency_admission: false,
    } satisfies AdmissionQuestionnaire,
  });

  const isUuid = (value: string) =>
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);

  useEffect(() => {
    const localMemberId = searchParams.get('member');
    if (localMemberId) {
      setFormData((current) => ({ ...current, family_member: localMemberId }));
    }
  }, [searchParams]);

  useEffect(() => {
    const mapFromApi = (items: any[]): FamilyMember[] =>
      items.map((member: any) => ({
        id: String(member.id),
        name: `${member.first_name || ''} ${member.last_name || ''}`.trim() || 'Family Member',
        age: member.date_of_birth
          ? Math.max(0, new Date().getFullYear() - new Date(member.date_of_birth).getFullYear())
          : 0,
      }));

    const loadMembers = async () => {
      try {
        const response = await familyMemberService.getAll();
        const items = response?.data?.results || response?.data || [];
        if (!Array.isArray(items)) {
          setFamilyMembers([]);
          return;
        }
        setFamilyMembers(mapFromApi(items));
      } catch (fetchError) {
        console.error('Failed to load family members for appointment request:', fetchError);
        setFamilyMembers([]);
      }
    };

    void loadMembers();
  }, []);

  useEffect(() => {
    const clauseAccepted = localStorage.getItem('admission_clause_accepted') === 'true';
    const subscriptionSupport = localStorage.getItem('admission_support_in_subscription') !== 'false';
    setFormData((curr) => ({
      ...curr,
      admission_clause_accepted: clauseAccepted || curr.admission_clause_accepted,
      admission_support_in_subscription: subscriptionSupport,
    }));
  }, []);

  const serviceTypes = [
    { id: 'Home Visit', name: 'Home Visit', price: 2000, duration: '1-2 hours' },
    { id: 'Post-Discharge Support', name: 'Post-Discharge Support', price: 2800, duration: '2-4 hours' },
    { id: 'Medication Administration', name: 'Medication Administration', price: 2500, duration: '45 min' },
    { id: 'Wound Care', name: 'Wound Care', price: 3000, duration: '1 hour' },
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

    if (!isUuid(formData.family_member)) {
      setError('Selected family member is not synced to the server. Please create/select a server-synced family member and try again.');
      setIsLoading(false);
      return;
    }

    const payload = {
      family_member: formData.family_member,
      appointment_date: formData.appointment_date,
      start_time: formData.start_time,
      end_time: formData.end_time,
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
      const details = submitError?.response?.data;
      const fieldErrorMessage =
        details && typeof details === 'object'
          ? Object.entries(details)
              .map(([field, message]) => {
                const first = Array.isArray(message) ? message[0] : message;
                return `${field}: ${String(first)}`;
              })
              .join(' | ')
          : '';
      const detailMessage =
        fieldErrorMessage ||
        (typeof details?.detail === 'string' && details.detail) ||
        (typeof details === 'string' && details) ||
        'Unable to submit request. Please check the form and try again.';
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

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <Link href="/dashboard/appointments" className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Appointments
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">Create Care Request</h1>
        <p className="text-gray-600 mt-2">Submit your request for admin matching and decision</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
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

      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}
        {step === 1 && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900">Select Family Member</h2>
            {familyMembers.length === 0 ? (
              <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-6 text-center">
                <p className="text-sm text-gray-700">No family members found.</p>
                <Link href="/dashboard/family/new" className="mt-3 inline-block text-sm font-semibold text-blue-700 hover:text-blue-900">
                  Add family member first
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {familyMembers.map((member) => (
                  <label
                    key={member.id}
                    className={`flex items-center p-4 border-2 rounded-lg transition ${
                      formData.family_member === member.id
                        ? 'cursor-pointer border-blue-600 bg-blue-50'
                        : 'cursor-pointer border-gray-200 hover:border-gray-300'
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
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Service Type</h2>
              <div className="grid grid-cols-1 gap-4">
                {serviceTypes.map((service) => (
                  <label
                    key={service.id}
                    className={`flex items-center justify-between p-4 border-2 rounded-lg cursor-pointer transition ${
                      formData.service_type === service.id ? 'border-blue-600 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="service_type"
                      value={service.id}
                      checked={formData.service_type === service.id}
                      onChange={(e) => setFormData({ ...formData, service_type: e.target.value })}
                      className="sr-only"
                    />
                    <div>
                      <p className="font-semibold text-gray-900">{service.name}</p>
                      <p className="text-sm text-gray-600">{service.duration}</p>
                    </div>
                    <p className="font-bold text-gray-900">KES {service.price.toLocaleString()}</p>
                  </label>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Shift Type *</label>
                <select
                  value={formData.shift_type}
                  onChange={(e) => setFormData({ ...formData, shift_type: e.target.value })}
                  className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
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
                  <option value="ONLINE_CALL">Online Call</option>
                  <option value="PHYSICAL_VISIT">Physical Visit</option>
                  <option value="">Not specified</option>
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

        {step === 3 && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900">Schedule, Address, and Admission</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Date *</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <input
                    type="date"
                    value={formData.appointment_date}
                    onChange={(e) => setFormData({ ...formData, appointment_date: e.target.value })}
                    className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Start Time *</label>
                <div className="relative">
                  <Clock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <input
                    type="time"
                    value={formData.start_time}
                    onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                    className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">End Time *</label>
                <div className="relative">
                  <Clock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <input
                    type="time"
                    value={formData.end_time}
                    onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                    className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
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
                  onChange={(e) => setFormData({ ...formData, admission_clause_accepted: e.target.checked })}
                />
                <span className="text-sm text-gray-700">Admission clause accepted</span>
              </label>
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
                      <label className="block text-xs uppercase tracking-wide text-amber-900 mb-1">{admissionFieldLabels[key]}</label>
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
              <p><span className="font-semibold">Family Member:</span> {familyMembers.find((m) => m.id === formData.family_member)?.name}</p>
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

