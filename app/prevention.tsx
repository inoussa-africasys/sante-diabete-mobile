import { router } from 'expo-router';
import React from 'react';
import PreventionPage from '../src/Components/PreventionPage';

export default function Prevention() {
  // Fonction pour gérer le clic sur le bouton Commencer
  const handleStartPress = () => {
    // Ici, vous pourriez naviguer vers une page de test de risque
    console.log('Démarrage du test de risque');
    router.push('/errors/comming-soon');
  };

  // Fonction pour revenir à la page précédente
  const handleBackPress = () => {
    router.back();
  };

  return (
    <PreventionPage 
      onStartPress={handleStartPress}
      onBackPress={handleBackPress}
    />
  );
}
