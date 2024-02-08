'use client';

import { addAuthenticator } from '@/app/authsignal/authsignal';
import { authsignal } from '@/app/authsignal/client';
import { LockClosedIcon, PowerIcon } from '@heroicons/react/24/outline';

export const Authenticators = (): JSX.Element => {
  return (
    <form
      action={async () => {
        const actionResult = await addAuthenticator();

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
