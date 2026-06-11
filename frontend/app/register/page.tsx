'use client';

import { useForm } from 'react-hook-form';

import { z } from 'zod';

import { zodResolver } from '@hookform/resolvers/zod';

import { useRouter } from 'next/navigation';

import Link from 'next/link';

import { Button } from '@/components/ui/button';

import { Input } from '@/components/ui/input';

const registerSchema = z
  .object({
    name: z
      .string()
      .min(
        2,
        'Name must be at least 2 characters'
      ),

    email: z
      .string()
      .email(
        'Invalid email address'
      ),

    phoneNumber: z
      .string()
      .min(
        10,
        'Phone number required'
      ),

    password: z
      .string()
      .min(
        6,
        'Password must be at least 6 characters'
      ),

    confirmPassword:
      z.string(),
  })
  .refine(
    (data) =>
      data.password ===
      data.confirmPassword,
    {
      message:
        'Passwords do not match',

      path: [
        'confirmPassword',
      ],
    }
  );

type RegisterFormData =
  z.infer<
    typeof registerSchema
  >;

export default function RegisterPage() {
  const router = useRouter();

  const {
    register,

    handleSubmit,

    formState: {
      errors,
      isSubmitting,
    },
  } = useForm<RegisterFormData>({
    resolver:
      zodResolver(
        registerSchema
      ),
  });

  const onSubmit = async (
    data: RegisterFormData
  ) => {
    try {
      // =========================
      // REGISTER API
      // =========================

      const response =
        await fetch(
          'http://localhost:8000/auth/register',
          {
            method: 'POST',

            headers: {
              'Content-Type':
                'application/json',
            },

            body: JSON.stringify({
              name: data.name,

              email: data.email,

              phone_number:
                data.phoneNumber,

              password:
                data.password,
            }),
          }
        );

      if (!response.ok) {
        const err =
          await response
            .json()
            .catch(() => ({}));

        throw new Error(
          err.detail ||
            'Registration failed'
        );
      }

      console.log(
        '[Register] Success'
      );

      router.push('/login');
    } catch (error) {
      console.error(
        '[Register] Error:',
        error
      );
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="w-full max-w-md px-6 py-8 bg-card rounded-lg shadow-lg">
        <h1 className="text-3xl font-bold text-center mb-2 text-foreground">
          Create Account
        </h1>

        <p className="text-center text-muted-foreground mb-8">
          Join us to start chatting
        </p>

        <form
          onSubmit={handleSubmit(
            onSubmit
          )}
          className="space-y-4"
        >
          {/* NAME */}

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Name
            </label>

            <Input
              {...register(
                'name'
              )}
              placeholder="John Doe"
              className="w-full"
            />

            {errors.name && (
              <p className="text-red-500 text-sm mt-1">
                {
                  errors.name
                    .message
                }
              </p>
            )}
          </div>

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

          {/* PHONE NUMBER */}

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Phone Number
            </label>

            <Input
              {...register(
                'phoneNumber'
              )}
              type="text"
              placeholder="9876543210"
              className="w-full"
            />

            {errors.phoneNumber && (
              <p className="text-red-500 text-sm mt-1">
                {
                  errors
                    .phoneNumber
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

          {/* CONFIRM PASSWORD */}

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Confirm Password
            </label>

            <Input
              {...register(
                'confirmPassword'
              )}
              type="password"
              placeholder="••••••••"
              className="w-full"
            />

            {errors.confirmPassword && (
              <p className="text-red-500 text-sm mt-1">
                {
                  errors
                    .confirmPassword
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
              ? 'Creating account...'
              : 'Create Account'}
          </Button>
        </form>

        <p className="text-center text-muted-foreground mt-6">
          Already have an account?{' '}
          <Link
            href="/login"
            className="text-primary font-semibold hover:underline"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}