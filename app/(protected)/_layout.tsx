import { useAuth } from '@/src/context/AuthContext';
import { Stack, useRouter } from 'expo-router';
import { useEffect } from 'react';

export default function ProtectedLayout() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      console.log('Non authentifié dans le layout ; isAuthenticated : '+isAuthenticated);
      console.log('isAuthenticated : '+isAuthenticated);
      router.replace('/errors/unauthenticated');
    }
  }, [isAuthenticated]);

  return(
    <Stack screenOptions={{ headerShown: false }} />
  );
}
