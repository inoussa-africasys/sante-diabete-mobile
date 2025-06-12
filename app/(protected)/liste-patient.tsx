import { useRouter } from 'expo-router';
import React from 'react';
import PatientListPage from '../../src/Components/Patients/PatientListPage';

export default function ListePatientScreen() {
  
  const router = useRouter();

  const handlePatientPress = (patientId: string) => {
    router.push({ pathname: '/patient/[id]', params: { id: patientId } });
  };

  return (
    <PatientListPage
      onPatientPress={handlePatientPress}
      onBackPress={() => router.back()}
      onAddPress={() => router.push('/nouveau-patient')}
    />
  );
}
