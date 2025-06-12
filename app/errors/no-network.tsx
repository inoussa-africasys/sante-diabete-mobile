import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const NoNetwork = () => {
    const router = useRouter();
  return (
    <View style={styles.container}>
      <Ionicons style={styles.icon} name="wifi" size={150} color="#D50000" />
      <Text style={styles.title}>Pas d'Internet</Text>
      <Text style={styles.text}>Veuillez vérifier votre connexion et réessayez</Text>
      <TouchableOpacity style={styles.button} onPress={() => router.back()}>
        <Text style={styles.buttonText}>Retour</Text>
      </TouchableOpacity>
    </View>
  )
}

export default NoNetwork

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    icon: {
        marginBottom: 20
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#D50000'
    },
    text: {
        marginHorizontal: 20,
        marginVertical: 10,
        textAlign: 'center',
        fontSize: 18,
        fontWeight: 'normal',
        color: '#212121'
    },
    button: {
        backgroundColor: '#D50000',
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 25,
        marginTop: 20
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold'
    }
})