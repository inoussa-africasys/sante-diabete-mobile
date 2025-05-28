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
      <StatusBar style="light" />
      
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
        <Text style={styles.subtitle}>Faire un test de risque</Text>
        
        <View style={styles.iconContainer}>
          <Ionicons name="document-text-outline" size={80} color="#4CAF50" />
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
    backgroundColor: '#D50000',
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
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#212121',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 18,
    color: '#757575',
    marginBottom: 40,
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 50,
  },
  iconText: {
    fontSize: 20,
    color: '#4CAF50',
    marginTop: 10,
  },
  button: {
    backgroundColor: '#D50000',
    borderRadius: 25,
    paddingVertical: 12,
    paddingHorizontal: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default PreventionPage;
