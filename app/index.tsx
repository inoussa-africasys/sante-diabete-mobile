import HomePage from '@/src/Components/HomePage';
import { router } from 'expo-router';
import React from 'react';

export default function Index() {
  // Fonction pour gérer l'ouverture du portail
  const handleOpenPortal = () => {
    // Navigation vers la page portal de l'application
    router.push('/portal');
  };

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
        // Retour à la page d'accueil communauté
        router.push('/communaute');
        break;
      case 'links':
        // Pour les liens utiles, on pourrait ouvrir une page web ou une autre page
        console.log('Liens utiles sélectionnés');
        break;
      default:
        console.log('Option non reconnue');
    }
  };

  return (
   <>
      <HomePage onOptionPress={handleOptionPress} />
      
    </>
  );
}
