import React from 'react';
import { router } from 'expo-router';
import MonitoringPage from '../src/Components/MonitoringPage';

export default function Monitoring() {
  // Fonction pour gérer le clic sur le bouton Commencer
  const handleStartPress = () => {
    // Ici, vous pourriez naviguer vers une page de données de monitoring
    console.log('Démarrage du monitoring');
    // router.push('/monitoring-data');
  };

  // Fonction pour revenir à la page précédente
  const handleBackPress = () => {
    router.back();
  };

  return (
    <MonitoringPage 
      onStartPress={handleStartPress}
      onBackPress={handleBackPress}
    />
  );
}
