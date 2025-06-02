import React from 'react';
import { router } from 'expo-router';
import AccueilPage from '../src/Components/AccueilPage';

function DT2Page() {
  // Fonction pour gérer le clic sur un patient
  const handlePatientPress = (patientId: string) => {
    // Navigation vers la page de détails du patient
    console.log(`Patient sélectionné: ${patientId}`);
    // router.push(`/patient/${patientId}`);
  };

  // Fonction pour revenir à la page précédente
  const handleBackPress = () => {
    router.back();
  };

  // Fonction pour ajouter un nouveau patient
  const handleAddPress = () => {
    // Navigation vers la page d'ajout de patient
    console.log('Ajouter un nouveau patient DT2');
    // router.push('/add-patient/dt2');
  };

  return (
    <AccueilPage dtType="DT2" onOptionPress={() => {}} onBackPress={handleBackPress} />
  );
}

export default DT2Page;
