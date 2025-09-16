import { useRouter } from 'expo-router';
import React from 'react';
import PatientListPage from '../../src/Components/Patients/PatientListPage';
import { PatientSearchProvider } from '../../src/Contexts/PatientSearchContext';

export default function ListePatientScreen() {
  
  const router = useRouter();

  const handlePatientPress = (patientId: string) => {
    router.push({ pathname: '/patient/[id]', params: { id: patientId } });
  };

  return (
    <PatientSearchProvider>
      <PatientListPage
        onPatientPress={handlePatientPress}
        onBackPress={() => router.back()}
        onAddPress={() => router.push('/nouveau-patient')}
      />
    </PatientSearchProvider>
  );
}
