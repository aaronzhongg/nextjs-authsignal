'use client';

import { lusitana } from '@/app/ui/fonts';
import {
  AtSymbolIcon,
  KeyIcon,
  ExclamationCircleIcon,
} from '@heroicons/react/24/outline';
import { ArrowRightIcon } from '@heroicons/react/20/solid';
import { Button } from './button';
import { useFormState, useFormStatus } from 'react-dom';
import { authenticate } from '@/app/lib/actions';
import { useEffect, useRef } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Authsignal } from '@authsignal/browser';
import { hasChallengeSucceeded } from '../authsignal/authsignal';
import Link from 'next/link';
import { useToast } from '@/components/ui/use-toast';

export default function LoginForm() {
  const [errorMessage, dispatch] = useFormState(authenticate, undefined);
  const { toast } = useToast();
  const router = useRouter();
  const pathname = usePathname();

  const searchParams = useSearchParams();
  const challenging = useRef(false);

  useEffect(() => {
    const challenge = async () => {
      const challengeUrl = searchParams.get('challenge');

      if (challengeUrl) {
        const params = new URLSearchParams(searchParams);
        params.delete('challenge');
        router.replace(`${pathname}?${params}`); // Replace params so we don't challenge again using the same url

        const authsignal = new Authsignal({
          tenantId: process.env.NEXT_PUBLIC_AUTHSIGNAL_TENANT_ID!,
          baseUrl: process.env.NEXT_PUBLIC_AUTHSIGNAL_URL,
        });

        const result = await authsignal.launch(challengeUrl, { mode: 'popup' });

        if (result.token) {
          const success = await hasChallengeSucceeded(result.token, 'login');

          if (success) {
            router.push('/dashboard');
            return;
          }
        }

        toast({ title: 'Challenge failed', variant: 'destructive' });
      }
    };

    if (!challenging.current) {
      challenging.current = true;
      challenge();
    }
  }, []);

  useEffect(() => {
    const message = searchParams.get('message') as string;
    if (message) {
      toast({
        title: message,
        variant: 'success',
      });
    }

    const error = searchParams.get('error') as string;
    if (error) {
      toast({
        title: error,
        variant: 'destructive',
      });
    }
  }, []);

  return (
    <form action={dispatch} className="space-y-3">
      <div className="flex-1 rounded-lg bg-gray-50 px-6 pb-4 pt-8">
        <h1 className={`${lusitana.className} mb-3 text-2xl`}>
          Please log in to continue.
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
          <LoginButton />

          <Link href="/register" className="hover:text-blue-500">
            Register new user
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
          {errorMessage && (
            <>
              <ExclamationCircleIcon className="h-5 w-5 text-red-500" />
              <p className="text-sm text-red-500">{errorMessage}</p>
            </>
          )}
        </div>
      </div>
    </form>
  );
}

function LoginButton() {
  const { pending } = useFormStatus();

  return (
    <Button className="mt-4 w-full" aria-disabled={pending}>
      Log in <ArrowRightIcon className="ml-auto h-5 w-5 text-gray-50" />
    </Button>
  );
}
