import { DiabeteType } from '@/src/types';
import { useIsFocused } from '@react-navigation/native';
import { router } from 'expo-router';
import { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import AccueilPage from '../src/Components/AccueilPage';
import { useAuth } from '../src/context/AuthContext';
import { useDiabetes } from '../src/context/DiabetesContext';

function DT1Page() {

  const { setActiveDiabetesType,loading } = useDiabetes();
  const { refreshDiabetesType } = useAuth();
  const isFocused = useIsFocused();

  useEffect(() => {
    if (isFocused) {
     setActiveDiabetesType(DiabeteType.DT1).then(() => {
      refreshDiabetesType();
    });
    }
  }, [isFocused]);

  const handleBackPress = () => {
    router.back();
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <AccueilPage
      onBackPress={handleBackPress}
    />
  );
}

export default DT1Page;
