'use client';

import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from '@/components/ui/toast';
import { toast, useToast } from '@/components/ui/use-toast';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

import { useEffect } from 'react';

export function Toaster() {
  const { toasts } = useToast();

  const searchParams = useSearchParams();
  const pathname = usePathname();
  const route = useRouter();

  useEffect(() => {
    const error = searchParams.get('error');
    const params = new URLSearchParams(searchParams);
    params.delete('error');
    route.replace(`${pathname}?${params.toString()}`);

    if (error) {
      toast({
        title: error,
        variant: 'destructive',
      });
    }
  }, [searchParams]);

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, ...props }) {
        return (
          <Toast key={id} {...props}>
            <div className="grid gap-1">
              {title && <ToastTitle>{title}</ToastTitle>}
              {description && (
                <ToastDescription>{description}</ToastDescription>
              )}
            </div>
            {action}
            <ToastClose />
          </Toast>
        );
      })}
      <ToastViewport />
    </ToastProvider>
  );
}
