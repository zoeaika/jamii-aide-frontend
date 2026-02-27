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
      localStorage.setItem('access_token', response.data.access_token);
      localStorage.setItem('refresh_token', response.data.refresh_token);
      localStorage.setItem('user', JSON.stringify(response.data.user));

      // Redirect to dashboard
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Login failed. Please try again.');
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