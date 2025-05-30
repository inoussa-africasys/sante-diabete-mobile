import React from 'react';
import { router } from 'expo-router';
import PatientListPage from '../src/Components/PatientListPage';

export default function DT2Page() {
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
    <PatientListPage 
      diabetesType="DT2"
      onPatientPress={handlePatientPress}
      onBackPress={handleBackPress}
      onAddPress={handleAddPress}
    />
  );
}
