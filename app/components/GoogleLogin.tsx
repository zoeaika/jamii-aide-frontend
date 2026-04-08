'use client';

import { GoogleLogin } from '@react-oauth/google';
import { useRouter } from 'next/navigation';
import { authService, persistAuthSession, routeForRole } from '@/app/lib/api';
import { useState } from 'react';

export default function GoogleLoginButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGoogleLogin = async (credentialResponse: any) => {
    try {
      setLoading(true);
      setError('');

      const response = await authService.googleLogin(
        credentialResponse.credential
      );
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
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}
      <div className="flex justify-center">
        <GoogleLogin
          onSuccess={handleGoogleLogin}
          onError={() => setError('Login failed')}
        />
      </div>
    </div>
  );
}
