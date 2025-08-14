import { useAuth } from '@/src/context/AuthContext';
import { Stack, useRouter } from 'expo-router';
import { useEffect } from 'react';

export default function ProtectedLayout() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();


  useEffect(() => {
    console.log('isAuthenticated: '+isAuthenticated);
    if (!isAuthenticated) {
      console.log('Non authentifié dans le layout ; isAuthenticated : '+isAuthenticated);
      console.log('isAuthenticated : '+isAuthenticated);
      router.replace('/errors/unauthenticated');
    }

  }, []);

  return(
    <Stack screenOptions={{ headerShown: false }} />
  );
}
