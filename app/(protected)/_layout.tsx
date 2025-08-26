import { useAuth } from '@/src/context/AuthContext';
import * as Location from 'expo-location';
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
    (async () => {
      try {
        const servicesEnabled = await Location.hasServicesEnabledAsync();
        if (!servicesEnabled) {
          router.replace('/errors/gps-required');
          return;
        }
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          router.replace('/errors/gps-required');
        }
      } catch (e) {
        console.warn('Erreur vérification GPS (layout):', e);
      }
    })();
  }, []);

  return(
    <Stack screenOptions={{ 
      headerShown: false,
      statusBarStyle: 'light',
      statusBarBackgroundColor: '#FF0000',
    }} />
    
  );
}
