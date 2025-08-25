'use client';

import { useAuthStore } from '@/store/authStore';
import { useEffect } from 'react';

function AuthInitializer() {
  const checkAuth = useAuthStore((state) => state.checkAuth);

  useEffect(() => {
    
    checkAuth();
  }, [checkAuth]);

  return null;
}

export default AuthInitializer;
