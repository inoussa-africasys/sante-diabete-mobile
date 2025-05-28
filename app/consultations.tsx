import React from 'react';
import { router } from 'expo-router';
import ConsultationsPage from '../src/Components/ConsultationsPage';

export default function Consultations() {
  // Fonction pour gérer le clic sur les options DT1 ou DT2
  const handleOptionPress = (option: string) => {
    // Ici, vous pourriez naviguer vers des pages spécifiques pour DT1 ou DT2
    console.log(`Option sélectionnée: ${option}`);
    // if (option === 'dt1') {
    //   router.push('/dt1');
    // } else if (option === 'dt2') {
    //   router.push('/dt2');
    // }
  };

  // Fonction pour revenir à la page précédente
  const handleBackPress = () => {
    router.back();
  };

  return (
    <ConsultationsPage 
      onOptionPress={handleOptionPress}
      onBackPress={handleBackPress}
    />
  );
}
