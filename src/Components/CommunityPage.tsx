import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { Dimensions, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Images } from '../Constants';

const { width } = Dimensions.get('window');

interface CommunityPageProps {
  onOpenPress: () => void;
  onBackPress: () => void;
}

const CommunityPage: React.FC<CommunityPageProps> = ({ onOpenPress, onBackPress }) => {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />

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
        <Text style={styles.title}>Communauté{'\n'}de pratiques</Text>

        <Text style={styles.description}>
          Accéder au portail{'\n'}de la communauté{'\n'}de pratiques
        </Text>

        <TouchableOpacity
          style={styles.button}
          onPress={onOpenPress}
          activeOpacity={0.8}
        >
          <Text style={styles.buttonText}>OUVRIR</Text>
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
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#D50000',
    marginBottom: 30,
    textAlign: 'center',
    marginTop: 60,
  },
  description: {
    fontSize: 20,
    color: '#333333',
    marginBottom: 40,
    textAlign: 'center',
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
});

export default CommunityPage;
