import { useAuth } from '@/src/context/AuthContext';
import { Stack, useRouter } from 'expo-router';
import { useEffect } from 'react';

export default function ProtectedLayout() {
  const { isAuthenticated,getIsAuthenticated } = useAuth();
  const router = useRouter();


  useEffect(() => {
    console.log('isAuthenticated: '+getIsAuthenticated());
    if (!getIsAuthenticated()) {
      console.log('Non authentifié dans le layout ; isAuthenticated : '+getIsAuthenticated());
      console.log('isAuthenticated : '+getIsAuthenticated());
      router.replace('/errors/unauthenticated');
    }

  }, []);

  return(
    <Stack screenOptions={{ headerShown: false }} />
  );
}
