import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Images } from '../Constants/Images';

interface MonitoringPageProps {
  onStartPress: () => void;
  onBackPress: () => void;
}

const MonitoringPage: React.FC<MonitoringPageProps> = ({ onStartPress, onBackPress }) => {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={onBackPress}
        >
          <MaterialCommunityIcons name="arrow-left" size={24} color="#FFFFFF" />
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
        <Text style={styles.title}>Monitoring</Text>
        
        <View style={styles.mapContainer}>
          <MaterialCommunityIcons name="map-marker" size={24} color="#4CAF50" style={styles.mapMarker} />
          <Image
            source={Images.MaliMap}
            style={styles.mapImage}
            contentFit="contain"
          />
        </View>
        
        <View style={styles.statsContainer}>
          <Text style={styles.statText}>78 Médecins</Text>
          <Text style={styles.statText}>123 Infirmiers</Text>
          <Text style={styles.statText}>17 Centres de santé</Text>
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
    marginBottom: 30,
  },
  mapContainer: {
    position: 'relative',
    width: '80%',
    height: 200,
    marginBottom: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mapImage: {
    width: '100%',
    height: '100%',
    backgroundColor: '#ffffff',
    borderRadius: 10,
  },
  mapMarker: {
    position: 'absolute',
    top: '30%',
    left: '40%',
    zIndex: 1,
  },
  statsContainer: {
    marginBottom: 40,
    alignItems: 'center',
  },
  statText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#212121',
    marginBottom: 5,
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

export default MonitoringPage;
