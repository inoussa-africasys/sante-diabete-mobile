import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import SurveyScreenDom from '@/src/Components/Survey/SurveyScreenDom';


export default function QuestionnaireScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ 
    patientId?: string; 
    consultationId?: string;
    type?: 'initial' | 'suivi' | 'prevention';
  }>();
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Récupérer les paramètres de l'URL ou utiliser des valeurs par défaut
  const patientId = params.patientId || '';
  const consultationId = params.consultationId || '';
  const questionnaireType = (params.type as 'initial' | 'suivi' | 'prevention') || 'initial';
  
  const surveyJson = {
    elements: [{
      name: "FirstName",
      title: "Enter your first name:",
      type: "text"
    }, {
      name: "LastName",
      title: "Enter your last name:",
      type: "text"
    }]
  }


  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{
          title: `Questionnaire ${questionnaireType === 'initial' ? 'Initial' : 
                 questionnaireType === 'suivi' ? 'de Suivi' : 'de Prévention'}`,
          headerBackTitle: "Retour"
        }} 
      />
      <StatusBar style="auto" />
      
      {/* Composant SurveyScreen qui affiche le questionnaire */}
      <SurveyScreenDom surveyJson={surveyJson} handleSurveyComplete={(data) => {
        console.log('Survey data:', data);
      }} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#333',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'red',
    textAlign: 'center',
    marginBottom: 10,
  },
  errorSubText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
});
