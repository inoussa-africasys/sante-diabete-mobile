import { router } from 'expo-router';
import React from 'react';
import ConsultationsPage from '../src/Components/ConsultationsPage';
import { useDiabetes } from '../src/context/DiabetesContext';

export default function Consultations() {
  const { setDiabetesType} = useDiabetes();
  // Fonction pour gérer le clic sur les options DT1, DT2
  const handleOptionPress = (option: string) => {
    console.log(`Option sélectionnée: ${option}`);
    
    // Navigation vers les pages spécifiques pour DT1, DT2
    if (option === 'dt1') {
      setDiabetesType('DT1');
      router.push('/dt1');
    } else if (option === 'dt2') {
      setDiabetesType('DT2');
      router.push('/dt2');
    }
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
