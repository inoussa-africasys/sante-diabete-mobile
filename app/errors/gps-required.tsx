import { Ionicons } from '@expo/vector-icons'
import * as Location from 'expo-location'
import { router } from 'expo-router'
import React, { useState } from 'react'
import { Linking, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

const GpsRequiredScreen = () => {
  const [checking, setChecking] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  const openSettings = () => {
    Linking.openSettings()
  }

  const retry = async () => {
    try {
      setChecking(true)
      const servicesEnabled = await Location.hasServicesEnabledAsync()
      if (!servicesEnabled) {
        setMessage('GPS toujours désactivé. Veuillez l\'activer dans les paramètres.')
        return
      }
      const { status } = await Location.requestForegroundPermissionsAsync()
      if (status !== 'granted') {
        setMessage('Permission de localisation toujours refusée. Veuillez l\'accorder dans les paramètres.')
        return
      }
      // OK => revenir à la zone protégée précédente
      if (router.canGoBack()) router.back()
      else router.replace('/');
    } catch (e) {
      setMessage('Erreur lors de la vérification du GPS. Réessayez.')
    } finally {
      setChecking(false)
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Ionicons name="arrow-back" size={24} color="#000" />
      </TouchableOpacity>

      <Ionicons name="alert-circle-outline" size={100} color="#FFA000" />
      <Text style={styles.title}>GPS requis</Text>
      <Text style={styles.text}>
       {`L'application nécessite que la localisation (GPS) soit activée et autorisée
        pour créer un patient ou une consultation.`}
      </Text>
      {message && <Text style={[styles.text, { color: '#d32f2f' }]}>{message}</Text>}

      <View style={styles.actions}>
        <TouchableOpacity style={[styles.button, styles.primary]} onPress={openSettings}>
          <Text style={styles.buttonText}>Ouvrir les paramètres</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.button, styles.secondary]} onPress={retry} disabled={checking}>
          <Text style={styles.buttonText}>{checking ? 'Vérification…' : 'Réessayer'}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  )
}

export default GpsRequiredScreen

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    backgroundColor: '#fff'
  },
  backButton: {
    position: 'absolute',
    top: 30,
    left: 30,
    backgroundColor: '#0002',
    padding: 10,
    borderRadius: 100,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFA000',
    marginVertical: 10,
    textAlign: 'center'
  },
  text: {
    fontSize: 16,
    marginVertical: 8,
    color: '#555',
    textAlign: 'center'
  },
  actions: {
    marginTop: 24,
    gap: 12,
    width: '100%'
  },
  button: {
    borderRadius: 25,
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    width: '100%'
  },
  primary: {
    backgroundColor: '#1976D2'
  },
  secondary: {
    backgroundColor: '#2196F3'
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
})
