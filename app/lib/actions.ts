'use server';

import bcrypt from 'bcrypt';

import { z } from 'zod';
import { sql } from '@vercel/postgres';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { AuthError, User } from 'next-auth';
import { signIn } from '@/auth';
import { RegisterResult } from './definitions';
import { authsignal } from '../authsignal/client';

const FormSchema = z.object({
  id: z.string(),
  customerId: z.string({
    invalid_type_error: 'Please select a customer.',
  }),
  amount: z.coerce
    .number()
    .gt(0, { message: 'Please enter an amount greater than $0.' }),
  status: z.enum(['pending', 'paid'], {
    invalid_type_error: 'Please select an invoice status.',
  }),
  date: z.string(),
});

const CreateInvoice = FormSchema.omit({ id: true, date: true });

export type State = {
  errors?: {
    customerId?: string[];
    amount?: string[];
    status?: string[];
  };
  message?: string | null;
};

export async function createInvoice(prevState: State, formData: FormData) {
  try {
    const validatedFields = CreateInvoice.safeParse({
      customerId: formData.get('customerId'),
      amount: formData.get('amount'),
      status: formData.get('status'),
    });

    console.log('🚀 ~ createInvoice ~ validatedFields:', validatedFields);
    if (!validatedFields.success) {
      return {
        errors: validatedFields.error.flatten().fieldErrors,
        message: 'Missing Fields. Failed to Create Invoice.',
      };
    }

    const amountInCents = validatedFields.data.amount * 100;
    const date = new Date().toISOString().split('T')[0];

    await sql`
  INSERT INTO invoices (customer_id, amount, status, date)
  VALUES (${validatedFields.data.customerId}, ${amountInCents}, ${status}, ${date})
`;
  } catch (error) {
    console.error(error);
    return { message: 'Failed to create Invoice' };
  }

  revalidatePath('/dashboard/invoices');
  redirect('/dashboard/invoices');
}

// Use Zod to update the expected types
const UpdateInvoice = FormSchema.omit({ id: true, date: true });

// ...

export async function updateInvoice(
  id: string,
  prevState: State,
  formData: FormData,
) {
  try {
    const validatedFields = UpdateInvoice.safeParse({
      customerId: formData.get('customerId'),
      amount: formData.get('amount'),
      status: formData.get('status'),
    });

    if (!validatedFields.success) {
      return {
        errors: validatedFields.error.flatten().fieldErrors,
        message: 'Missing Fields. Failed to Update Invoice.',
      };
    }

    const { customerId, amount, status } = validatedFields.data;

    const amountInCents = amount * 100;

    await sql`
    UPDATE invoices
    SET customer_id = ${customerId}, amount = ${amountInCents}, status = ${status}
    WHERE id = ${id}
  `;
  } catch (error) {
    return { message: 'Failed to update Invoice' };
  }

  revalidatePath('/dashboard/invoices');
  redirect('/dashboard/invoices');
}

export async function deleteInvoice(id: string) {
  try {
    await sql`DELETE FROM invoices WHERE id = ${id}`;
    revalidatePath('/dashboard/invoices');
    return { message: 'Deleted Invoice' };
  } catch (error) {
    return { message: 'Failed to delete Invoice' };
  }
}

export async function authenticate(
  prevState: string | undefined,
  formData: FormData,
) {
  try {
    const res = await signIn('credentials', {
      redirect: false,
      email: formData.get('email') as string,
      password: formData.get('password') as string,
    });

    const result = await authsignal.track({
      userId: formData.get('email') as string,
      action: 'login',
    });

    // Challenge is not required
    if (!result.url) {
      redirect('/dashboard');
    }

    const baseUrl = res.split('?')[0];
    const params = new URLSearchParams(res.split('?')[1]);
    params.append('challenge', result.url);
    params.append('user', formData.get('email') as string);

    return redirect(`${baseUrl}?${params.toString()}`);
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case 'CredentialsSignin':
          return 'Invalid credentials.';
        default:
          return 'Something went wrong.';
      }
    }
    throw error;
  }
}

export async function register(
  prevState: RegisterResult | undefined,
  formData: FormData,
): Promise<RegisterResult | undefined> {
  try {
    const credentials = {
      email: formData.get('email') as string,
      password: formData.get('password') as string,
    };

    const parsedCredentials = z
      .object({ email: z.string().email(), password: z.string().min(6) })
      .safeParse(credentials);

    if (parsedCredentials.success) {
      const { email, password } = parsedCredentials.data;
      const hashedPassword = await bcrypt.hash(password, 10);
      await registerUser(email, hashedPassword);

      return RegisterResult.Registered;
    }

    throw Error('Something went wrong');
  } catch (error) {
    if (error instanceof AuthError) {
      return RegisterResult.Error;
    }
    throw error;
  }
}

async function registerUser(
  email: string,
  hashedPassword: string,
): Promise<void> {
  try {
    await sql<User>`INSERT INTO users (Name, Email, Password) VALUES ('TestName', ${email}, ${hashedPassword})`;
  } catch (error) {
    redirect('/login?error=User already exists');
  }
}
