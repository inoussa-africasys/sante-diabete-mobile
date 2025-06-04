import { router } from 'expo-router';
import React from 'react';
import AccueilPage from '../src/Components/AccueilPage';

function DT1Page() {
  // Fonction pour gérer le clic sur un patient
  const handlePatientPress = (patientId: string) => {
    // Navigation vers la page de détails du patient
    console.log(`Patient sélectionné: ${patientId}`);
    // router.push(`/patient/${patientId}`);
  };

  const handleOptionPress = (option: string) => {
    if (option === 'patients') {
      router.push('/liste-patient?dt=DT1');
    }
    // Ajoute ici d'autres options si besoin
  };

  const handleBackPress = () => {
    router.back();
  };

  return (
    <AccueilPage
      onBackPress={handleBackPress}
    />
  );
}

export default DT1Page;
