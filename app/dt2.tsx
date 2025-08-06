import { DiabeteType } from '@/src/types';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import AccueilPage from '../src/Components/AccueilPage';
import { useAuth } from '../src/context/AuthContext';
import { useDiabetes } from '../src/context/DiabetesContext';

function DT2Page() {

  const { setActiveDiabetesType } = useDiabetes();
  const { refreshDiabetesType } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    setActiveDiabetesType(DiabeteType.DT2).then(() => {
      console.log('Diabetes type set to DT2');
      refreshDiabetesType();
      setIsLoading(false);
    });
  }, []);


  const handleBackPress = () => {
    router.back();
  };

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <AccueilPage onBackPress={handleBackPress} />
  );
}

export default DT2Page;
