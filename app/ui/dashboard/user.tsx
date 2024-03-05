'use client';

import Cookies from 'js-cookie';
import { UserIcon } from 'lucide-react';
import { useEffect, useState } from 'react';

export const User = (): JSX.Element => {
  const [session, setSession] = useState<string>();

  useEffect(() => {
    const sessionCookie = Cookies.get('session');
    console.log('🚀 ~ useEffect ~ sessionCookie:', sessionCookie);
    sessionCookie && setSession(JSON.parse(sessionCookie));
  }, []);

  // @ts-ignore
  return (
    <button className="flex h-[48px] w-full grow items-center justify-center gap-2 rounded-md bg-gray-50 p-3 text-sm font-medium hover:bg-sky-100 hover:text-blue-600 md:flex-none md:justify-start md:p-2 md:px-3">
      <UserIcon className="w-6" />

      <div className="hidden md:block">
        {
          // @ts-ignore
          session && session.userId
        }
      </div>
    </button>
  );
};
