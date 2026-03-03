'use client';

import { GoogleLogin } from '@react-oauth/google';
import { useRouter } from 'next/navigation';
import { authService } from '@/app/lib/api';
import { useState } from 'react';

export default function GoogleLoginButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGoogleLogin = async (credentialResponse: any) => {
    try {
      setLoading(true);
      setError('');

      console.log('Google Response:', credentialResponse);
      console.log('Token:', credentialResponse.credential);

      const response = await authService.googleLogin(
        credentialResponse.credential
      );

      // Save tokens
      const accessToken = response.data?.access_token || response.data?.access;
      const refreshToken = response.data?.refresh_token || response.data?.refresh;
      const user = response.data?.user;

      if (!accessToken || !refreshToken || !user) {
        throw new Error('Invalid Google login response. Missing tokens or user payload.');
      }

      localStorage.setItem('access_token', accessToken);
      localStorage.setItem('refresh_token', refreshToken);
      localStorage.setItem('user', JSON.stringify(user));

      // Redirect to dashboard
      router.push('/dashboard');
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
      console.error('Login error:', err);
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
