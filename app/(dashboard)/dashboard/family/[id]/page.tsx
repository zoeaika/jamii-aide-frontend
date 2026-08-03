'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft, Calendar, MapPin, Phone, User } from 'lucide-react';
import { familyMemberService } from '@/app/lib/api';

type FamilyMember = {
  id: string;
  first_name?: string;
  last_name?: string;
  date_of_birth?: string | null;
  gender?: string | null;
  phone?: string | null;
  phone_number?: string | null;
  city?: string | null;
  location?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
};

export default function FamilyMemberProfilePage() {
  const params = useParams<{ id: string }>();
  const memberId = params?.id;
  const [member, setMember] = useState<FamilyMember | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadMember = async () => {
      if (!memberId) {
        setError('Missing family member id.');
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError('');
      try {
        const response = await familyMemberService.getById(memberId);
        setMember(response?.data || null);
      } catch (fetchError) {
        console.error('Failed to load family member profile:', fetchError);
        setError('Unable to load this family member profile.');
      } finally {
        setIsLoading(false);
      }
    };

    void loadMember();
  }, [memberId]);

  const fullName = useMemo(() => {
    const name = `${member?.first_name || ''} ${member?.last_name || ''}`.trim();
    return name || 'Family Member';
  }, [member]);

  const age = useMemo(() => {
    if (!member?.date_of_birth) return 'Not provided';
    return String(Math.max(0, new Date().getFullYear() - new Date(member.date_of_birth).getFullYear()));
  }, [member]);

  const contact = member?.phone || member?.phone_number || 'Not provided';
  const location = member?.city || member?.location || 'Not provided';
  const gender = member?.gender || 'Not provided';
  const createdAt = member?.created_at ? new Date(member.created_at).toLocaleString() : 'Not available';
  const updatedAt = member?.updated_at ? new Date(member.updated_at).toLocaleString() : 'Not available';

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <Link href="/dashboard/family" className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Family Members
        </Link>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-3xl font-bold text-gray-900">Family Member Profile</h1>
          {memberId && (
            <Link
              href={`/dashboard/family/${memberId}/edit`}
              className="inline-flex items-center justify-center rounded-lg border border-blue-600 px-4 py-2 text-blue-600 font-semibold hover:bg-blue-50"
            >
              Edit Profile
            </Link>
          )}
        </div>
      </div>

      {isLoading ? (
        <div className="bg-white rounded-xl border border-gray-200 p-8 text-gray-600">Loading profile...</div>
      ) : error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-blue-600 text-white flex items-center justify-center text-xl font-bold">
              {fullName.charAt(0)}
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{fullName}</p>
              <p className="text-sm text-gray-600">Age: {age} • Gender: {gender}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="rounded-lg border border-gray-200 p-4">
              <p className="text-xs uppercase tracking-wide text-gray-500 mb-2">Contact</p>
              <p className="flex items-center text-gray-900"><Phone className="h-4 w-4 mr-2 text-gray-500" />{contact}</p>
            </div>
            <div className="rounded-lg border border-gray-200 p-4">
              <p className="text-xs uppercase tracking-wide text-gray-500 mb-2">Location</p>
              <p className="flex items-center text-gray-900"><MapPin className="h-4 w-4 mr-2 text-gray-500" />{location}</p>
            </div>
            <div className="rounded-lg border border-gray-200 p-4">
              <p className="text-xs uppercase tracking-wide text-gray-500 mb-2">Created</p>
              <p className="flex items-center text-gray-900"><Calendar className="h-4 w-4 mr-2 text-gray-500" />{createdAt}</p>
            </div>
            <div className="rounded-lg border border-gray-200 p-4">
              <p className="text-xs uppercase tracking-wide text-gray-500 mb-2">Last Updated</p>
              <p className="flex items-center text-gray-900"><User className="h-4 w-4 mr-2 text-gray-500" />{updatedAt}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
