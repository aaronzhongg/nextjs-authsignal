'use client';

import { lusitana } from '@/app/ui/fonts';
import {
  AtSymbolIcon,
  KeyIcon,
  ExclamationCircleIcon,
} from '@heroicons/react/24/outline';
import { ArrowRightIcon } from '@heroicons/react/20/solid';
import { useFormState, useFormStatus } from 'react-dom';
import { register } from '@/app/lib/actions';
import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Authsignal } from '@authsignal/browser';
import { hasChallengeSucceeded, trackAction } from '../authsignal/authsignal';
import { Button } from '../ui/button';
import AcmeLogo from '../ui/acme-logo';
import Link from 'next/link';
import { RegisterResult } from '../lib/definitions';
import { toast } from '@/components/ui/use-toast';

export default function RegisterForm() {
  const [registerResult, dispatch] = useFormState<
    RegisterResult | undefined,
    FormData
  >(register, undefined);
  const email = useRef('');
  const router = useRouter();

  useEffect(() => {
    const challenge = async () => {
      const authsignal = new Authsignal({
        tenantId: process.env.NEXT_PUBLIC_AUTHSIGNAL_TENANT_ID!,
        baseUrl: process.env.NEXT_PUBLIC_AUTHSIGNAL_URL,
      });

      const actionResult = await trackAction(email.current, 'register');

      if (actionResult) {
        const result = await authsignal.launch(actionResult, {
          mode: 'popup',
        });

        if (result.token) {
          const success = await hasChallengeSucceeded(result.token, 'register');

          if (success) {
            router.replace('/login');
            toast({
              title: 'Successfully registered',
              variant: 'success',
            });
            return;
          }
        }

        router.replace('/login');
        toast({
          title:
            'Successfully registered. However, you must add an authenticator to log in',
          variant: 'success',
        });
      }
    };

    if (registerResult === RegisterResult.Registered) {
      challenge();
    }
  }, [registerResult]);

  const handleSubmit = (formData: FormData) => {
    dispatch(formData);
  };

  return (
    <main className="flex items-center justify-center md:h-screen">
      <div className="relative mx-auto flex w-full max-w-[400px] flex-col space-y-2.5 p-4 md:-mt-32">
        <div className="flex h-20 w-full items-end rounded-lg bg-blue-500 p-3 md:h-36">
          <div className="w-32 text-white md:w-36">
            <AcmeLogo />
          </div>
        </div>
        <form
          action={(formData) => {
            email.current = formData.get('email') as string;
            handleSubmit(formData);
          }}
          className="space-y-3"
        >
          <div className="flex-1 rounded-lg bg-gray-50 px-6 pb-4 pt-8">
            <h1 className={`${lusitana.className} mb-3 text-2xl`}>
              Register a new user
            </h1>
            <div className="w-full">
              <div>
                <label
                  className="mb-3 mt-5 block text-xs font-medium text-gray-900"
                  htmlFor="email"
                >
                  Email
                </label>
                <div className="relative">
                  <input
                    className="peer block w-full rounded-md border border-gray-200 py-[9px] pl-10 text-sm outline-2 placeholder:text-gray-500"
                    id="email"
                    type="email"
                    name="email"
                    defaultValue={'user@nextmail.com'}
                    placeholder="Enter your email address"
                    required
                  />
                  <AtSymbolIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500 peer-focus:text-gray-900" />
                </div>
              </div>
              <div className="mt-4">
                <label
                  className="mb-3 mt-5 block text-xs font-medium text-gray-900"
                  htmlFor="password"
                >
                  Password
                </label>
                <div className="relative">
                  <input
                    className="peer block w-full rounded-md border border-gray-200 py-[9px] pl-10 text-sm outline-2 placeholder:text-gray-500"
                    id="password"
                    type="password"
                    name="password"
                    placeholder="Enter password"
                    required
                    minLength={6}
                    defaultValue={'123456'}
                  />
                  <KeyIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500 peer-focus:text-gray-900" />
                </div>
              </div>
            </div>
            <div className="flex flex-col items-center space-y-4">
              <RegisterButton />

              <Link href="/login" className="hover:text-blue-500">
                Login
              </Link>
            </div>
            <div className="flex h-8 items-end space-x-1">
              {/* Add form errors here */}
            </div>
            <div
              className="flex h-8 items-end space-x-1"
              aria-live="polite"
              aria-atomic="true"
            >
              {registerResult == RegisterResult.Error && (
                <>
                  <ExclamationCircleIcon className="h-5 w-5 text-red-500" />
                  <p className="text-sm text-red-500">
                    {'There was a problem registering'}
                  </p>
                </>
              )}
            </div>
          </div>
        </form>
      </div>
    </main>
  );
}

function RegisterButton() {
  const { pending } = useFormStatus();

  return (
    <Button className="mt-4 w-full" aria-disabled={pending}>
      Register <ArrowRightIcon className="ml-auto h-5 w-5 text-gray-50" />
    </Button>
  );
}
