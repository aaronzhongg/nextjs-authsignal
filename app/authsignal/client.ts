import { Authsignal } from '@authsignal/node';

export const authsignal = new Authsignal({
  apiBaseUrl: process.env.NEXT_PUBLIC_AUTHSIGNAL_URL,
  secret: process.env.AUTHSIGNAL_SECRET!,
});
