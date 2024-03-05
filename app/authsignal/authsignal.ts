'use server';

import { authsignal } from './client';

// This is a little awkward with a proxy method that calls the authsignal track function but it's due to the Next.js's app router design for calling Server Actions from Client Components
// See: https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations#client-components
export const trackAction = async (
  userId: string,
  action: string,
  redirectToSettings: boolean = false,
): Promise<string | null> => {
  const result = await authsignal.track({
    userId: userId,
    action: action,
    redirectToSettings: redirectToSettings,
  });

  return result.url;
};

export const hasChallengeSucceeded = async (token: string) => {
  const { state } = await authsignal.validateChallenge({ token });

  if (state === 'CHALLENGE_SUCCEEDED') {
    // The user completed the challenge successfully
    // Proceed with authenticated action or integrate with IdP to create authenticated session
    return true;
  } else {
    // The user did not complete the challenge successfully
    return false;
  }
};

export const addAuthenticator = async (
  userId: string,
  redirectToSettings: boolean = true,
): Promise<string | null> => {
  console.log('🚀 ~ addAuthenticator ~ user:', userId);

  const result = await authsignal.track({
    userId: userId,
    action: 'addAuthenticators',
    redirectToSettings: redirectToSettings,
  });

  // The configured action should always return a URL
  return result.url;
};
