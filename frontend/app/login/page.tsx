'use client';

import { useForm } from 'react-hook-form';

import { z } from 'zod';

import { zodResolver } from '@hookform/resolvers/zod';

import { useRouter } from 'next/navigation';

import { useChatStore } from '@/lib/store';

import { wsManager } from '@/lib/websocket';

import Link from 'next/link';

import { Button } from '@/components/ui/button';

import { Input } from '@/components/ui/input';

const loginSchema = z.object({
  email: z
    .string()
    .email('Invalid email address'),

  password: z
    .string()
    .min(
      6,
      'Password must be at least 6 characters'
    ),
});

type LoginFormData = z.infer<
  typeof loginSchema
>;

export default function LoginPage() {
  const router = useRouter();

  const setCurrentUser =
    useChatStore(
      (state) => state.setCurrentUser
    );

  const {
    register,

    handleSubmit,

    formState: {
      errors,
      isSubmitting,
    },
  } = useForm<LoginFormData>({
    resolver:
      zodResolver(loginSchema),
  });

  const onSubmit = async (
    data: LoginFormData
  ) => {
    try {
      // =========================
      // LOGIN API
      // =========================

      const response = await fetch(
        'http://localhost:8000/auth/login',
        {
          method: 'POST',

          headers: {
            'Content-Type':
              'application/json',
          },

          body: JSON.stringify(data),
        }
      );

      if (!response.ok) {
        throw new Error(
          'Login failed'
        );
      }

      // =========================
      // GET TOKEN
      // =========================

      const result =
        await response.json();

      console.log(
        '[LOGIN RESPONSE]',
        result
      );

      // =========================
      // STORE TOKEN
      // =========================

      localStorage.setItem(
        'access_token',
        result.access_token
      );

      // =========================
      // FETCH CURRENT USER
      // =========================

      const meResponse = await fetch(
        'http://localhost:8000/auth/me',
        {
          headers: {
            Authorization: `Bearer ${result.access_token}`,
          },
        }
      );

      if (!meResponse.ok) {
        throw new Error(
          'Failed to fetch user'
        );
      }

      const user =
        await meResponse.json();

      console.log(
        '[CURRENT USER]',
        user
      );

      // =========================
      // STORE USER
      // =========================

      setCurrentUser(user);

      // =========================
      // CONNECT WEBSOCKET
      // =========================

      wsManager.connect(
        result.access_token
      );

      // =========================
      // REDIRECT
      // =========================

      router.push('/chat');
    } catch (error) {
      console.error(
        '[Login] Error:',
        error
      );
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="w-full max-w-md px-6 py-8 bg-card rounded-lg shadow-lg">
        <h1 className="text-3xl font-bold text-center mb-2 text-foreground">
          Welcome Back
        </h1>

        <p className="text-center text-muted-foreground mb-8">
          Sign in to your chat account
        </p>

        <form
          onSubmit={handleSubmit(
            onSubmit
          )}
          className="space-y-4"
        >
          {/* EMAIL */}

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Email
            </label>

            <Input
              {...register(
                'email'
              )}
              type="email"
              placeholder="you@example.com"
              className="w-full"
            />

            {errors.email && (
              <p className="text-red-500 text-sm mt-1">
                {
                  errors.email
                    .message
                }
              </p>
            )}
          </div>

          {/* PASSWORD */}

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Password
            </label>

            <Input
              {...register(
                'password'
              )}
              type="password"
              placeholder="••••••••"
              className="w-full"
            />

            {errors.password && (
              <p className="text-red-500 text-sm mt-1">
                {
                  errors.password
                    .message
                }
              </p>
            )}
          </div>

          {/* BUTTON */}

          <Button
            type="submit"
            disabled={
              isSubmitting
            }
            className="w-full bg-primary text-primary-foreground font-semibold py-2"
          >
            {isSubmitting
              ? 'Signing in...'
              : 'Sign In'}
          </Button>
        </form>

        {/* REGISTER LINK */}

        <p className="text-center text-muted-foreground mt-6">
          Don&apos;t have an
          account?{' '}
          <Link
            href="/register"
            className="text-primary font-semibold hover:underline"
          >
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}