import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, View } from 'react-native';

import useSurveyJson from '@/src/Hooks/useSurveyJson';
import SurveyScreen from '../../../src/Components/Survey/SurveyScreen';


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
  
  // Utiliser notre hook personnalisé pour générer le JSON du questionnaire
  const { surveyJson, loading, error } = useSurveyJson({
    title: `Questionnaire ${questionnaireType === 'initial' ? 'Initial' : 
           questionnaireType === 'suivi' ? 'de Suivi' : 'de Prévention'}`,
    description: "Veuillez répondre à toutes les questions",
    patientId,
    consultationId,
    questionnaireType,
    locale: 'fr'
  });

  // Gérer la soumission du questionnaire - simplement logger les résultats
  const handleSurveyComplete = (data: any) => {
    try {
      setIsSubmitting(true);
      
      // Créer un objet avec les métadonnées et les données
      const resultData = {
        patientId,
        consultationId,
        questionnaireType,
        timestamp: new Date().toISOString(),
        data
      };
      
      // Logger les résultats dans la console
      console.log('Résultats du questionnaire:', JSON.stringify(resultData, null, 2));
      
      // Afficher un message de confirmation
      Alert.alert(
        "Questionnaire complété",
        "Les réponses ont été enregistrées avec succès.",
        [
          { 
            text: "OK", 
            onPress: () => {
              // Rediriger vers la page appropriée selon le contexte
              if (consultationId) {
                router.push(`/consultation/${consultationId}`);
              } else if (patientId) {
                router.push(`/patient/${patientId}`);
              } else {
                router.back();
              }
            }
          }
        ]
      );
    } catch (error) {
      console.error('Erreur lors du traitement des résultats:', error);
      Alert.alert(
        "Erreur",
        "Une erreur est survenue lors du traitement des résultats."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Afficher un indicateur de chargement pendant la génération du JSON
  if (loading || isSubmitting) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text style={styles.loadingText}>
          {loading ? "Chargement du questionnaire..." : "Traitement des réponses..."}
        </Text>
      </View>
    );
  }

  // Afficher un message d'erreur si la génération du JSON a échoué
  if (error || !surveyJson) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>
          {error || "Impossible de charger le questionnaire"}
        </Text>
        <Text style={styles.errorSubText}>
          Veuillez réessayer ultérieurement ou contacter le support technique.
        </Text>
      </View>
    );
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
      <SurveyScreen 
        surveyJson={surveyJson}
        onComplete={handleSurveyComplete}
      />
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
