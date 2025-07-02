import React from 'react';
import { SafeAreaView } from 'react-native';
import AdministrationPage from '@/src/Components/Administration/AdministrationPage';

export default function Administration() {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <AdministrationPage />
    </SafeAreaView>
  );
}
