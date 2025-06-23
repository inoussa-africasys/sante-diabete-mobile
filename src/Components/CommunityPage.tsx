import { Image } from 'expo-image';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { Dimensions, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const { width } = Dimensions.get('window');

interface CommunityPageProps {
  onOpenPress: () => void;
}

const CommunityPage: React.FC<CommunityPageProps> = ({ onOpenPress }) => {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      
      {/* Header */}
      <View style={styles.header}>
        <Image
          source={require('../../assets/images/splash-icon-v2.png')}
          style={styles.logo}
          contentFit="contain"
        />
        <Text style={styles.headerTitle}>Santé Diabète</Text>
      </View>
      
      {/* Main Content */}
      <View style={styles.content}>
        <Text style={styles.title}>Communauté{'\n'}de pratiques</Text>
        
        <Text style={styles.description}>
          Accéder au portail{'\n'}de la communauuté
        </Text>


        
        <TouchableOpacity 
          style={styles.button}
          onPress={() => router.push('/dt/test')}
          activeOpacity={0.8}
        >
          <Text style={styles.buttonText}>got to test</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.button}
          onPress={() => router.push('/dt/test2')}
          activeOpacity={0.8}
        >
          <Text style={styles.buttonText}>got to test2</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.button}
          onPress={() => router.push('/questionnaire')}
          activeOpacity={0.8}
        >
          <Text style={styles.buttonText}>got to questionnaire</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.button}
          onPress={onOpenPress}
          activeOpacity={0.8}
        >
          <Text style={styles.buttonText}>OUVRIR</Text>
        </TouchableOpacity>
      </View>
      
      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <View style={styles.navItem}>
          <Text style={styles.navText}>Prévention</Text>
        </View>
        <View style={styles.navItem}>
          <Text style={styles.navText}>Monitoring</Text>
        </View>
        <View style={styles.navItem}>
          <Text style={styles.navText}>Consultations</Text>
        </View>
        <View style={[styles.navItem, styles.activeNavItem]}>
          <Text style={styles.navText}>Commu-{'\n'}nauté de{'\n'}pratiques</Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop : 30,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  logo: {
    width: 40,
    height: 40,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginLeft: 10,
    color: '#3E2723',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 40,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#D50000',
    marginBottom: 30,
  },
  description: {
    fontSize: 20,
    color: '#333333',
    marginBottom: 40,
  },
  button: {
    borderWidth: 2,
    borderColor: '#1B5E20',
    borderRadius: 30,
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    maxWidth: 400,
  },
  buttonText: {
    color: '#1B5E20',
    fontSize: 18,
    fontWeight: 'bold',
  },
  bottomNav: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    height: 80,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
  },
  activeNavItem: {
    borderTopWidth: 3,
    borderTopColor: '#5D4037',
  },
  navText: {
    fontSize: 12,
    textAlign: 'center',
    color: '#333333',
  },
});

export default CommunityPage;
