import { Images } from '@/src/Constants';
import useTraficAssistant from '@/src/Hooks/useTraficAssistant';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { ActivityIndicator, Dimensions, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

type TraficAssistantPageProps = {
    goBack: () => void
}

const { width: screenWidth } = Dimensions.get('window')


const TraficAssistantPage = ({ goBack }: TraficAssistantPageProps) => {
  
  const { handleSendData : handleSendDataTraficAssistant, isLoading } = useTraficAssistant();

    const handleSendData = async () => {
      const zipUri = await handleSendDataTraficAssistant();
      console.log('✅ page Trafic Assistant :', zipUri);
    }
  
  return (
    <View style={styles.container}>
     <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={goBack}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Trafic Assistant</Text>
        <View style={{ width: 24 }} /> 
      </View>
      <Image source={Images.traficAssistant} style={styles.image} resizeMode="cover" />
      <View style={styles.textContainer}>
        <Text style={styles.text}>En appuyant sur ce bouton, les données de votre application Trafic seront envoyées à l'equipe support pour vous debloquer.</Text>
      </View>
      <TouchableOpacity style={styles.button} onPress={handleSendData} disabled={isLoading}>
        {isLoading ? (
          <>
          <ActivityIndicator size="small" color="white" style={{ marginRight: 10 }} />
          <Text style={styles.buttonText}>Envoi en cours...</Text>
          </>
        ) : (
          <Text style={styles.buttonText}>Envoyer les données</Text>
        )}
      </TouchableOpacity>
      
    </View>
  )
}

export default TraficAssistantPage

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
      backgroundColor: 'red',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 15,
      paddingHorizontal: 20,
      elevation: 3,
    },
    backButton: {
      padding: 5,
    },
    headerTitle: {
      color: 'white',
      fontSize: 24,
      fontWeight: 'bold',
    },
    image: {
      marginBottom: 20,
      marginTop: 50,
      width: screenWidth,
      height: 250,
    },
    textContainer: {
      marginHorizontal: 20,
      alignItems: 'center',
      justifyContent: 'center',
    },
    text: {
      textAlign: 'center',
      fontSize: 16,
      fontWeight: 'bold',
      color: 'black',
    },
    button: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: 30,
      backgroundColor: 'red',
      padding: 10,
      borderRadius: 10,
      marginHorizontal: 20,
    },
    buttonText: {
      textAlign: 'center',
      color: 'white',
      fontSize: 16,
      fontWeight: 'bold',
    },
    loadingText: {
      marginTop: 20,
      textAlign: 'center',
      color: 'black',
      fontSize: 16,
      fontWeight: 'bold',
    },
})
