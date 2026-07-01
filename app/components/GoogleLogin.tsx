'use client';

import { GoogleLogin, type CredentialResponse } from '@react-oauth/google';
import { useRouter } from 'next/navigation';
import { authService, persistAuthSession, routeForRole } from '@/app/lib/api';
import { memo, useCallback, useRef, useState } from 'react';

const StableGoogleWidget = memo(function StableGoogleWidget({
  onSuccess,
  onError,
}: {
  onSuccess: (response: CredentialResponse) => void;
  onError: () => void;
}) {
  return <GoogleLogin onSuccess={onSuccess} onError={onError} />;
});

export default function GoogleLoginButton() {
  const router = useRouter();
  const [error, setError] = useState('');
  const isSubmittingRef = useRef(false);
  const handledCredentialRef = useRef<string | null>(null);
  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

  const handleGoogleLogin = useCallback(async (credentialResponse: CredentialResponse) => {
    const credential = credentialResponse.credential;

    if (!credential) {
      setError('Google did not return a credential. Please try again.');
      return;
    }

    if (isSubmittingRef.current || handledCredentialRef.current === credential) {
      return;
    }

    isSubmittingRef.current = true;
    handledCredentialRef.current = credential;

    try {
      setError('');

      const response = await authService.googleLogin(credential);
      const { user } = persistAuthSession(response.data);
      router.push(routeForRole(user.role));
    } catch (err: any) {
      const details = err?.response?.data;
      const message =
        (Array.isArray(details?.non_field_errors) && details.non_field_errors[0]) ||
        (typeof details?.detail === 'string' && details.detail) ||
        (typeof details?.message === 'string' && details.message) ||
        (typeof details === 'string' && details) ||
        (err?.message === 'Network Error'
          ? 'Cannot reach auth server. Check NEXT_PUBLIC_API_URL and backend availability.'
          : null) ||
        'Login failed. Please try again.';
      setError(message);
    } finally {
      isSubmittingRef.current = false;
      handledCredentialRef.current = null;
    }
  }, [router]);

  const handleGoogleError = useCallback(() => {
    setError('Login failed');
  }, []);

  return (
    <div className="w-full">
      {!googleClientId && (
        <div className="mb-4 rounded border border-amber-300 bg-amber-50 p-3 text-sm text-amber-800">
          Google sign-in is unavailable. Set NEXT_PUBLIC_GOOGLE_CLIENT_ID to enable it.
        </div>
      )}

      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}
      {googleClientId && (
        <div className="flex justify-center">
          <StableGoogleWidget onSuccess={handleGoogleLogin} onError={handleGoogleError} />
        </div>
      )}
    </div>
  );
}
