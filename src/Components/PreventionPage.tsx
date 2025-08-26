import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Images } from '../Constants/Images';

interface PreventionPageProps {
  onStartPress: () => void;
  onBackPress: () => void;
}

const PreventionPage: React.FC<PreventionPageProps> = ({ onStartPress, onBackPress }) => {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" backgroundColor="#FF0000" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={onBackPress}
        >
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        
        <View style={styles.headerCenter}>
          <Image
            source={Images.goutteSangBlanc}
            style={styles.logo}
            contentFit="contain"
          />
          <Text style={styles.headerTitle}>Santé Diabète</Text>
        </View>
        
        <View style={styles.headerRight} />
      </View>
      
      {/* Main Content */}
      <View style={styles.content}>
        <Text style={styles.title}>Prévention</Text>
        <Text style={styles.subtitle}>Faites un test pour connaître les risques pour votre santé et celle de votre famille</Text>
        
        <View style={styles.iconContainer}>
          <Ionicons name="document-text-outline" size={200} color="#4CAF50" />
          <Text style={styles.iconText}>Checklist</Text>
        </View>
        
        <TouchableOpacity 
          style={styles.button}
          onPress={onStartPress}
          activeOpacity={0.8}
        >
          <Text style={styles.buttonText}>Commencer</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 50,
    paddingHorizontal: 15,
    backgroundColor: '#FF0000',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerRight: {
    width: 40,
  },
  logo: {
    width: 30,
    height: 30,
    tintColor: '#FFFFFF',
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    marginLeft: 10,
    color: '#FFFFFF',
  },
  content: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 40,
  },
  title: {
    fontSize: 46,
    fontWeight: 'bold',
    color: '#212121',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 20,
    color: '#757575',
    marginBottom: 20,
    textAlign: 'center',
  },
  iconContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  iconText: {
    fontSize: 34,
    color: '#4CAF50',
    marginTop: 10,
  },
  button: {
    backgroundColor: '#FF0000',
    borderRadius: 25,
    paddingVertical: 12,
    paddingHorizontal: 40,
    alignItems: 'center',
    justifyContent: 'center',
    width: '80%',
    marginTop: 20,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
});

export default PreventionPage;
