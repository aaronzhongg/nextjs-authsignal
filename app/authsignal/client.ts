'use client';

import { Authsignal } from '@authsignal/browser';

export const authsignal = new Authsignal({
  tenantId: process.env.NEXT_PUBLIC_AUTHSIGNAL_TENANT_ID!,
  baseUrl: process.env.NEXT_PUBLIC_AUTHSIGNAL_URL,
});
