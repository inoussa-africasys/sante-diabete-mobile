import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { View } from 'react-native';
import { useDiabetes } from '../src/context/DiabetesContext';
import PatientListPage from '../src/Components/Patients/PatientListPage';

export default function ListePatientScreen() {
  
  const router = useRouter();
  const params = useLocalSearchParams();
  const dtType = (typeof params.dt === 'string' && (params.dt === 'DT1' || params.dt === 'DT2')) ? params.dt : 'DT1';

  const handlePatientPress = (patientId: string) => {
    router.push({ pathname: '/patient/[id]', params: { id: patientId } });
  };

  return (
    <PatientListPage
      diabetesType={dtType as 'DT1' | 'DT2'}
      onPatientPress={handlePatientPress}
      onBackPress={() => router.back()}
      onAddPress={() => router.push('/nouveau-patient')}
    />
  );
}
