'use client';

import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function ProtectedRoute({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, isLoading, checkAuth } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    const check = async () => {
      console.log('wkwk');
      await checkAuth();
      if (!isLoading && !isAuthenticated) {
        console.log('wkwk2');

        router.replace('/sign-in');
      }
    };

    check();
    // Jika pengecekan selesai dan pengguna tidak terautentikasi, redirect
  }, [isAuthenticated, isLoading, router]);

  // Selama loading, atau jika tidak terautentikasi, tampilkan loading/null
  if (isLoading || !isAuthenticated) {
    return (
      <div className="flex items-center justify-center h-screen w-full bg-black text-white">
        Loading...
      </div>
    );
  }

  return <>{children}</>;
}
