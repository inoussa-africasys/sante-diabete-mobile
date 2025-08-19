import HomePage from '@/src/Components/HomePage';
import { useIsOnline } from '@/src/Hooks/useIsOnline';
import { useAuth } from '@/src/context/AuthContext';
import Logger from '@/src/utils/Logger';
import { router } from 'expo-router';
import React from 'react';

export default function Index() {

  const isOnline = useIsOnline()
  const {splashScreenCheckOnlineAuth} = useAuth()
  const handleOptionPress = (option: string) => {
    console.log(`Option sélectionnée: ${option}`);
    
    // Navigation vers les différentes pages selon l'option sélectionnée
    switch(option) {
      case 'prevention':
        router.push('/prevention');
        break;
      case 'monitoring':
        router.push('/monitoring');
        break;
      case 'consultations':
        router.push('/consultations');
        break;
      case 'community':
        router.push('/communaute');
        break;
      case 'links':
        router.push('/lien-utile');
        break;
      default:
        console.log('Option non reconnue');
    }
  };

  if (isOnline) {
    try {
      splashScreenCheckOnlineAuth()
    } catch (error) {
      console.error('Error checking online auth', error);
      Logger.error('Error checking online auth', { error });
      
    }
  }

  return (
   <>
      <HomePage onOptionPress={handleOptionPress} />
      
    </>
  );
}
