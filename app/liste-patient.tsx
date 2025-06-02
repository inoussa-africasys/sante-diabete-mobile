import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import PatientListPage from '../src/Components/Patients/PatientListPage';

export default function ListePatientScreen() {
  
  const router = useRouter();
  const params = useLocalSearchParams();
  const dtType = (typeof params.dt === 'string' && (params.dt === 'DT1' || params.dt === 'DT2')) ? params.dt : 'DT1';

  return (
    <PatientListPage
      diabetesType={dtType as 'DT1' | 'DT2'}
      onPatientPress={id => {}}
      onBackPress={() => router.back()}
      onAddPress={() => {}}
    />
  );
}
