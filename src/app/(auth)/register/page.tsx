'use client';
import { useEffect, useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import axios, { AxiosError } from 'axios';
import { useRouter } from 'next/navigation';
import MobileShell from '@/components/MobileShell';
import Header from '@/components/Header';
import OverlayMenu from '@/components/OverlayMenu';

const registerSchema = z
  .object({
    name: z.string().min(1, 'Full Name is required'),
    username: z.string().min(1, 'Username is required'),
    email: z.string().email('Invalid email address'),
    phoneNumber: z.string().optional(),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string(),
    agree: z.boolean().refine((val) => val === true, {
      message: 'You must agree to the privacy policy',
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

type RegisterFormInputs = z.infer<typeof registerSchema>;

interface ApiErrorResponse {
  message: string;
}

export default function RegisterPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null); // State untuk menyimpan error API
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormInputs>({
    resolver: zodResolver(registerSchema),
  });

  useEffect(() => {
    const prev = document.body.style.overflow;
    if (menuOpen) document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [menuOpen]);

  const guestMenu = [
    { label: 'Home', href: '/' },
    { label: 'Sign In', href: '/sign-in' },
    { label: 'Register', href: '/register' },
  ];

  const onSubmit: SubmitHandler<RegisterFormInputs> = async (data) => {
    setApiError(null);
    try {
      const response = await axios.post(
        process.env.NEXT_PUBLIC_API_URL + '/auth/register',
        {
          name: data.name,
          username: data.username,
          email: data.email,
          password: data.password,
          phoneNumber: data.phoneNumber,
        }
      );

      router.push(`/verify-otp?email=${data.email}`);
    } catch (error) {
      if (axios.isAxiosError<ApiErrorResponse>(error)) {
        setApiError(error.response?.data?.message || 'Registration failed');
      } else {
        setApiError('An unexpected error occurred. Please try again.');
      }
    }
  };

  return (
    <MobileShell
      header={<Header onMenu={() => setMenuOpen(true)} menuOpen={menuOpen} />}
    >
      <div className="absolute inset-0 bg-[url('/images/ball.png')] bg-cover bg-center opacity-15" />

      <div className="relative z-10 w-full px-5 pt-6 pb-8 text-white">
        <h1 className="text-[28px] font-extrabold mb-6">Sign Up</h1>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div>
            <label className="block text-[12px] mb-1 opacity-80">
              Full Name
            </label>
            <input
              {...register('name')}
              className="w-full bg-transparent border-b border-white/40 px-0 py-2 placeholder-white/40
                         focus:outline-none focus:border-white"
              placeholder="Enter your full name"
            />
            {errors.name && (
              <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>
            )}
          </div>

          <div>
            <label className="block text-[12px] mb-1 opacity-80">
              Username
            </label>
            <input
              {...register('username')}
              className="w-full bg-transparent border-b border-white/40 px-0 py-2 placeholder-white/40
                         focus:outline-none focus:border-white"
              placeholder="Enter username"
            />
            {errors.username && (
              <p className="text-red-500 text-xs mt-1">
                {errors.username.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-[12px] mb-1 opacity-80">Email</label>
            <input
              {...register('email')}
              className="w-full bg-transparent border-b border-white/40 px-0 py-2 placeholder-white/40
                         focus:outline-none focus:border-white"
              placeholder="Enter your email address"
            />
            {errors.email && (
              <p className="text-red-500 text-xs mt-1">
                {errors.email.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-[12px] mb-1 opacity-80">
              Phone Number
            </label>
            <div className="flex items-center gap-2">
              <span className="px-2 py-2 rounded-md bg-white/10 border border-white/20 text-[12px]">
                +62
              </span>
              <input
                {...register('phoneNumber')}
                className="flex-1 bg-transparent border-b border-white/40 px-0 py-2 placeholder-white/40
                           focus:outline-none focus:border-white"
                placeholder="Enter your phone number"
              />
            </div>
            {errors.phoneNumber && (
              <p className="text-red-500 text-xs mt-1">
                {errors.phoneNumber.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-[12px] mb-1 opacity-80">
              Create New Password
            </label>
            <input
              {...register('password')}
              type="password"
              className="w-full bg-transparent border-b border-white/40 px-0 py-2 placeholder-white/40
                         focus:outline-none focus:border-white"
              placeholder="Enter new password"
            />
            {errors.password && (
              <p className="text-red-500 text-xs mt-1">
                {errors.password.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-[12px] mb-1 opacity-80">
              Re-type New Password
            </label>
            <input
              {...register('confirmPassword')}
              type="password"
              className="w-full bg-transparent border-b border-white/40 px-0 py-2 placeholder-white/40
                         focus:outline-none focus:border-white"
              placeholder="Confirm new password"
            />
            {errors.confirmPassword && (
              <p className="text-red-500 text-xs mt-1">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          <label className="flex items-start gap-2 text-[12px] leading-snug">
            <input
              {...register('agree')}
              type="checkbox"
              className="mt-0.5 accent-red-600"
            />
            <span>
              By creating an account, you agree on our{' '}
              <a href="/privacy-policy" className="underline">
                privacy policy
              </a>
              .
            </span>
          </label>
          {errors.agree && (
            <p className="text-red-500 text-xs mt-1 -mt-4">
              {errors.agree.message}
            </p>
          )}

          {apiError && (
            <div className="text-center bg-red-500/20 border border-red-500 text-red-300 text-sm rounded-md p-2">
              {apiError}
            </div>
          )}

          <button
            type="submit"
            className="w-full rounded-md bg-white text-black py-2 font-bold"
          >
            Submit
          </button>
        </form>

        <p className="mt-6 text-center text-[12px]">
          Already have an account?{' '}
          <a href="/sign-in" className="text-red-500 underline">
            Login here
          </a>
        </p>
      </div>

      <OverlayMenu
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        items={guestMenu}
      />
    </MobileShell>
  );
}
