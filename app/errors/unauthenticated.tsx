import { Ionicons } from '@expo/vector-icons'
import { router } from 'expo-router'
import React from 'react'
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'

const Unauthenticated = () => {
  return (
    <View style={styles.container}>
      <Ionicons name="shield-outline" size={100} color="#D50000" />
      <Text style={styles.title}>Non authentifié</Text>
      <Text style={styles.text}>Vous devez vous authentifier pour accéder à cette page</Text>
      <TouchableOpacity style={styles.button} onPress={() => router.push('/scanner')}>
        <Text style={styles.buttonText}>Se connecter</Text>
      </TouchableOpacity>
    </View>
  )
}

export default Unauthenticated

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontSize: 18,
    marginVertical: 10,
    color: '#555',
    textAlign: 'center',
    marginHorizontal: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#D50000',
    marginVertical: 10,
  },
  button: {
    backgroundColor: '#D50000',
    borderRadius: 25,
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginTop: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
})

