'use server';

import { auth } from '@/auth';
import jwt from 'jsonwebtoken';

// export const retrieveUser = async (): Promise<any> => {
//   const userId = 'string';
//   console.log(
//     '🚀 ~ retrieveUser ~ ${process.env.NEXT_PUBLIC_AUTHSIGNAL_URL}/users/${userId}:',
//     `${process.env.NEXT_PUBLIC_AUTHSIGNAL_URL}/users/${userId}`,
//   );
//   console.log(`${process.env.AUTHSIGNAL_SECRET}`);

//   const response = await fetch(
//     `${process.env.NEXT_PUBLIC_AUTHSIGNAL_URL}/users/${userId}`,
//     {
//       method: 'GET',
//       headers: {
//         Authorization: `Basic ${btoa(process.env.AUTHSIGNAL_SECRET + ':')}`,
//       },
//     },
//   );

//   if (!response.ok) throw new Error('Authsignal response was not ok.');

//   const body = await response.json();
//   console.log('🚀 ~ retrieveUser ~ response:', body);
//   return body;
// };

export const trackAction = async (
  userId: string,
  action: string,
  redirectToSettings: boolean = false,
): Promise<string | null> => {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_AUTHSIGNAL_URL}/users/${userId}/actions/${action}`,
    {
      method: 'POST',
      headers: {
        Authorization: `Basic ${btoa(process.env.AUTHSIGNAL_SECRET + ':')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        redirectToSettings,
      }),
    },
  );

  if (!response.ok) {
    console.log('🚀 ~ trackAction ~ response:', response);
    throw new Error('Authsignal response was not ok.');
  }

  const body = await response.json();
  console.log('🚀 ~ trackAction ~ response:', body);

  if (body.state === 'CHALLENGE_REQUIRED' || !body.isEnrolled) {
    return body.url;
  }

  return null;
};

// import { Authsignal } from '@authsignal/node';

// const authsignal = new Authsignal({
//   apiBaseUrl: process.env.NEXT_PUBLIC_AUTHSIGNAL_URL,
//   secret: process.env.AUTHSIGNAL_SECRET!,
// });

// export const trackActionSdk = async (): Promise<string | null> => {
//   console.log(process.env.AUTHSIGNAL_SECRET!);
//   const result = await authsignal.track({
//     userId: 'string',
//     action: 'testAction',
//     redirectUrl: 'http://localhost:3000/authsignal/callback',
//   });

//   if (result.state === 'CHALLENGE_REQUIRED') {
//     // The user should be presented with a challenge
//     return result.url;
//   }

//   return null;
// };

export const hasChallengeSucceeded = async (token: string, action: string) => {
  const decodedToken = jwt.decode(token);
  console.log('🚀 ~ NewComponent ~ decodedToken:', decodedToken);

  // @ts-ignore
  const idempotencyKey = decodedToken!.other.idempotencyKey;

  const response = await fetch(
    // @ts-ignore
    `${process.env.NEXT_PUBLIC_AUTHSIGNAL_URL}/users/${decodedToken.other.userId}/actions/${action}/${idempotencyKey}`,
    {
      method: 'GET',
      headers: {
        Authorization: `Basic ${btoa(process.env.AUTHSIGNAL_SECRET + ':')}`,
      },
    },
  );
  console.log(response);

  if (!response.ok) throw new Error('Authsignal response was not ok.');

  const body = await response.json();
  console.log('🚀 ~ getActionStatus ~ response:', body);

  if (body.state === 'CHALLENGE_SUCCEEDED') {
    return true;
  }

  return false;
};

export const addAuthenticator = async (
  userId: string = '',
  redirectToSettings: boolean = true,
): Promise<string | null> => {
  const user = (await auth())?.user?.email || userId;
  console.log('🚀 ~ addAuthenticator ~ user:', user);

  const result = await trackAction(
    user,
    'addAuthenticators',
    redirectToSettings,
  );

  return result;
};
