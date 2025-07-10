import TraficAssistantPage from '@/src/Components/Administration/TraficAssistantPage';
import { useRouter } from 'expo-router';
import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';

const TraficAssistant = () => {
    const router = useRouter();
    const goBack = () => {
        router.back();
    }
  return (
    <SafeAreaView style={{ flex: 1 }}>
        <TraficAssistantPage goBack={goBack}/>
    </SafeAreaView>
  )
}

export default TraficAssistant