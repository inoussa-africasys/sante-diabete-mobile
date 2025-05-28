import { FontAwesome5, Ionicons, MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Images } from '../Constants/Images';

interface HomePageProps {
  onOptionPress: (option: string) => void;
}

const HomePage: React.FC<HomePageProps> = ({ onOptionPress }) => {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      
      {/* Header */}
      <View style={styles.header}>
        <Image
          source={Images.goutteSangBlanc}
          style={styles.logo}
          contentFit="contain"
        />
        <Text style={styles.headerTitle}>Santé Diabète</Text>
      </View>
      
      {/* Main Content */}
      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        {/* Prevention Card */}
        <TouchableOpacity 
          style={styles.card}
          onPress={() => onOptionPress('prevention')}
          activeOpacity={0.7}
        >
          <View style={styles.iconContainer}>
            <Ionicons name="document-text-outline" size={24} color="#4CAF50" />
          </View>
          <View style={styles.cardTextContainer}>
            <Text style={styles.cardTitle}>Prévention</Text>
            <Text style={styles.cardSubtitle}>Faire un test de risque</Text>
          </View>
        </TouchableOpacity>
        
        {/* Monitoring Card */}
        <TouchableOpacity 
          style={styles.card}
          onPress={() => onOptionPress('monitoring')}
          activeOpacity={0.7}
        >
          <View style={styles.iconContainer}>
            <MaterialCommunityIcons name="chart-line" size={24} color="#4CAF50" />
          </View>
          <View style={styles.cardTextContainer}>
            <Text style={styles.cardTitle}>Monitoring</Text>
            <Text style={styles.cardSubtitle}>Synthèse des données</Text>
          </View>
        </TouchableOpacity>
        
        {/* Consultations Card */}
        <TouchableOpacity 
          style={styles.card}
          onPress={() => onOptionPress('consultations')}
          activeOpacity={0.7}
        >
          <View style={styles.iconContainer}>
            <FontAwesome5 name="stethoscope" size={24} color="#4CAF50" />
          </View>
          <View style={styles.cardTextContainer}>
            <Text style={styles.cardTitle}>Consultations</Text>
            <Text style={styles.cardSubtitle}></Text>
          </View>
        </TouchableOpacity>
        
        {/* Community Card */}
        <TouchableOpacity 
          style={styles.card}
          onPress={() => onOptionPress('community')}
          activeOpacity={0.7}
        >
          <View style={styles.iconContainer}>
            <MaterialIcons name="chat-bubble-outline" size={24} color="#4CAF50" />
          </View>
          <View style={styles.cardTextContainer}>
            <Text style={styles.cardTitle}>Communauté de pratiques</Text>
            <Text style={styles.cardSubtitle}></Text>
          </View>
        </TouchableOpacity>
        
        {/* Useful Links Card */}
        <TouchableOpacity 
          style={styles.card}
          onPress={() => onOptionPress('links')}
          activeOpacity={0.7}
        >
          <View style={styles.iconContainer}>
            <MaterialIcons name="link" size={24} color="#4CAF50" />
          </View>
          <View style={styles.cardTextContainer}>
            <Text style={styles.cardTitle}>Liens utiles</Text>
            <Text style={styles.cardSubtitle}></Text>
          </View>
        </TouchableOpacity>
      </ScrollView>
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
    justifyContent: 'center',
    paddingVertical: 50,
    backgroundColor: '#D50000',
    
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
  },
  contentContainer: {
    padding: 16,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  iconContainer: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardTextContainer: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#212121',
  },
  cardSubtitle: {
    fontSize: 16,
    color: '#757575',
    marginTop: 4,
  },
});

export default HomePage;
