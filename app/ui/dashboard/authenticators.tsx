'use client';

import { addAuthenticator } from '@/app/authsignal/authsignal';
import { Authsignal } from '@authsignal/browser';
import { LockClosedIcon } from '@heroicons/react/24/outline';
import Cookies from 'js-cookie';

export const Authenticators = (): JSX.Element => {
  return (
    <form
      action={async () => {
        const authsignal = new Authsignal({
          tenantId: process.env.NEXT_PUBLIC_AUTHSIGNAL_TENANT_ID!,
          baseUrl: process.env.NEXT_PUBLIC_AUTHSIGNAL_URL,
        });

        const actionResult = await addAuthenticator(
          JSON.parse(Cookies.get('session')!).userId,
        );

        if (actionResult) {
          // Authsignal handles the authenticators, don't need to do anything here
          await authsignal.launch(actionResult, {
            mode: 'popup',
          });
        }
      }}
    >
      <button className="flex h-[48px] w-full grow items-center justify-center gap-2 rounded-md bg-gray-50 p-3 text-sm font-medium hover:bg-sky-100 hover:text-blue-600 md:flex-none md:justify-start md:p-2 md:px-3">
        <LockClosedIcon className="w-6" />
        <div className="hidden md:block">Add Authenticators</div>
      </button>
    </form>
  );
};
