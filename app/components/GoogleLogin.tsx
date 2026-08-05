'use client';

import { useRouter } from 'next/navigation';
import { authService, persistAuthSession, routeForRole } from '@/app/lib/api';
import { useCallback, useEffect, useRef, useState } from 'react';

type GoogleCredentialResponse = {
  credential?: string;
};

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (options: {
            client_id: string;
            callback: (response: GoogleCredentialResponse) => void;
          }) => void;
          renderButton: (
            parent: HTMLElement,
            options: Record<string, string | number | boolean>,
          ) => void;
        };
      };
    };
    __jamiiGsiInitialized?: boolean;
  }
}

const GSI_SCRIPT_ID = 'google-gsi-client-script';
const GSI_EVENT_NAME = 'jamii-gsi-credential';

type GoogleLoginButtonProps = {
  mode?: 'continue_with' | 'signin_with' | 'signup_with';
};

export default function GoogleLoginButton({ mode = 'continue_with' }: GoogleLoginButtonProps) {
  const router = useRouter();
  const [error, setError] = useState('');
  const [isReady, setIsReady] = useState(false);
  const isSubmittingRef = useRef(false);
  const handledCredentialRef = useRef<string | null>(null);
  const buttonContainerRef = useRef<HTMLDivElement | null>(null);
  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

  const handleGoogleLogin = useCallback(async (credentialResponse: GoogleCredentialResponse) => {
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
      const persistedSession = persistAuthSession(response.data);
      const resolvedRoute = routeForRole(persistedSession.user.role);
      router.push(resolvedRoute);
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

  useEffect(() => {
    if (!googleClientId || typeof window === 'undefined') {
      return;
    }

    const handleCredentialEvent = (event: Event) => {
      const customEvent = event as CustomEvent<GoogleCredentialResponse>;
      void handleGoogleLogin(customEvent.detail || {});
    };

    window.addEventListener(GSI_EVENT_NAME, handleCredentialEvent as EventListener);

    const initializeGoogleIdentity = () => {
      if (!window.google?.accounts?.id || !buttonContainerRef.current) {
        return;
      }

      if (!window.__jamiiGsiInitialized) {
        window.google.accounts.id.initialize({
          client_id: googleClientId,
          callback: (response: GoogleCredentialResponse) => {
            window.dispatchEvent(new CustomEvent<GoogleCredentialResponse>(GSI_EVENT_NAME, { detail: response }));
          },
        });
        window.__jamiiGsiInitialized = true;
      }

      buttonContainerRef.current.innerHTML = '';
      window.google.accounts.id.renderButton(buttonContainerRef.current, {
        type: 'standard',
        theme: 'outline',
        size: 'large',
        text: mode,
        shape: 'rectangular',
      });

      setIsReady(true);
    };

    const existingScript = document.getElementById(GSI_SCRIPT_ID) as HTMLScriptElement | null;
    if (existingScript) {
      if (window.google?.accounts?.id) {
        initializeGoogleIdentity();
      } else {
        existingScript.addEventListener('load', initializeGoogleIdentity, { once: true });
      }
    } else {
      const script = document.createElement('script');
      script.id = GSI_SCRIPT_ID;
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.addEventListener('load', initializeGoogleIdentity, { once: true });
      script.addEventListener('error', handleGoogleError, { once: true });
      document.head.appendChild(script);
    }

    return () => {
      window.removeEventListener(GSI_EVENT_NAME, handleCredentialEvent as EventListener);
    };
  }, [googleClientId, handleGoogleError, handleGoogleLogin, mode]);

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
          <div ref={buttonContainerRef} aria-live="polite" />
          {!isReady && <span className="sr-only">Loading Google sign-in</span>}
        </div>
      )}
    </div>
  );
}
