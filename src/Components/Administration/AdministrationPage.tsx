import { Feather, FontAwesome5, Ionicons, MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';

// Composant pour l'en-tête de section
const SectionHeader = ({ title }: { title: string }) => (
  <View style={styles.sectionHeader}>
    <Text style={styles.sectionHeaderText}>{title}</Text>
  </View>
);

// Composant pour les éléments de menu avec icône
const MenuItem = ({ 
  icon, 
  title, 
  onPress, 
  hasToggle = false, 
  isActive = false,
  rightText = ''
}: { 
  icon: React.ReactNode, 
  title: string, 
  onPress: () => void, 
  hasToggle?: boolean,
  isActive?: boolean,
  rightText?: string
}) => (
  <TouchableOpacity style={styles.menuItem} onPress={onPress}>
    <View style={styles.menuItemContent}>
      <View style={styles.menuItemIcon}>
        {icon}
      </View>
      <Text style={styles.menuItemText}>{title}</Text>
    </View>
    <View style={styles.menuItemRight}>
      {rightText ? <Text style={styles.menuItemRightText}>{rightText}</Text> : null}
      {hasToggle ? (
        <Switch
          trackColor={{ false: '#767577', true: '#81b0ff' }}
          thumbColor={isActive ? '#f5dd4b' : '#f4f3f4'}
          ios_backgroundColor="#3e3e3e"
          onValueChange={onPress}
          value={isActive}
        />
      ) : (
        <Ionicons name="chevron-forward" size={24} color="#888" />
      )}
    </View>
  </TouchableOpacity>
);

const AdministrationPage = () => {
  // États pour les toggles
  const [autoSync, setAutoSync] = useState(true);
  const [debugMode, setDebugMode] = useState(false);
  const [syncPhotos, setSyncPhotos] = useState(false);
  const [fingerprint, setFingerprint] = useState(true);
  const [pinAtStartup, setPinAtStartup] = useState(false);
  const [inclusiveMode, setInclusiveMode] = useState(false);

  // Fonction pour naviguer vers la page de modification du code PIN
  const handleModifyPin = () => {
    console.log('Modifier le code PIN');
    // router.push('/pin-modification');
  };

  // Fonction pour retourner au menu principal
  const handleMainMenu = () => {
    router.back();
  };

  // Fonction pour ouvrir la page ONG/Associations
  const handleOngAssociations = () => {
    router.push('/ong-associations');
  };

  // Fonction pour gérer les autres options de menu
  const handleMenuOption = (option: string) => {
    console.log(`Option sélectionnée: ${option}`);
    // Implémentation à venir
  };

  // Fonction pour ouvrir le sélecteur de période de synchronisation
  const handleSyncPeriod = () => {
    console.log('Ouvrir sélecteur de période');
    // Implémentation du modal à venir
  };

  return (
    <View style={styles.container}>
      {/* En-tête avec avatar et titre */}
      <View style={styles.header}>
        <View style={styles.profileContainer}>
          <View style={styles.avatarContainer}>
            <Ionicons name="person" size={50} color="white" />
          </View>
          <Text style={styles.profileTitle}>Administrateur</Text>
        </View>
        
        {/* Boutons d'action */}
        <TouchableOpacity style={styles.pinButton} onPress={handleModifyPin}>
          <Text style={styles.pinButtonText}>MODIFIER LE CODE PIN</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.mainMenuButton} onPress={handleMainMenu}>
          <Text style={styles.mainMenuButtonText}>MENU PRINCIPAL</Text>
        </TouchableOpacity>
      </View>

      {/* Contenu principal avec scroll */}
      <ScrollView style={styles.content}>
        {/* Section Gestion des interfaces */}
        <SectionHeader title="Gestions des interfaces" />
        
        <View style={styles.menuSection}>
          <MenuItem 
            icon={<FontAwesome5 name="user-shield" size={24} color="white" />}
            title="Police/Gendarmerie"
            onPress={() => handleMenuOption('police')}
          />
          
          <MenuItem 
            icon={<FontAwesome5 name="fire-extinguisher" size={24} color="white" />}
            title="Pompiers"
            onPress={() => handleMenuOption('pompiers')}
          />
          
          <MenuItem 
            icon={<FontAwesome5 name="hospital" size={24} color="white" />}
            title="Hopitaux"
            onPress={() => handleMenuOption('hopitaux')}
          />
          
          <MenuItem 
            icon={<MaterialIcons name="groups" size={24} color="white" />}
            title="ONG/Associations"
            onPress={handleOngAssociations}
          />
          
          <MenuItem 
            icon={<MaterialIcons name="search" size={24} color="white" />}
            title="Enquêtes/Recherche"
            onPress={() => handleMenuOption('enquetes')}
          />
        </View>

        {/* Section Autres */}
        <SectionHeader title="Autres" />
        
        <View style={styles.menuSection}>
          <MenuItem 
            icon={<MaterialIcons name="sync" size={24} color="#4CAF50" />}
            title="Auto Synchronisation"
            onPress={() => setAutoSync(!autoSync)}
            hasToggle={true}
            isActive={autoSync}
            rightText="(Activé)"
          />
          
          <MenuItem 
            icon={<MaterialCommunityIcons name="bug" size={24} color="#673AB7" />}
            title="Mode debug"
            onPress={() => setDebugMode(!debugMode)}
            hasToggle={true}
            isActive={debugMode}
            rightText="(Désactivé)"
          />
          
          <MenuItem 
            icon={<MaterialIcons name="photo-library" size={24} color="#9C27B0" />}
            title="Synchroniser les Photos Patients"
            onPress={() => setSyncPhotos(!syncPhotos)}
            hasToggle={true}
            isActive={syncPhotos}
            rightText="(Désactivé)"
          />
          
          <MenuItem 
            icon={<MaterialIcons name="fingerprint" size={24} color="#00BCD4" />}
            title="Empreinte Digitale"
            onPress={() => setFingerprint(!fingerprint)}
            hasToggle={true}
            isActive={fingerprint}
            rightText="(Activé)"
          />
          
          <MenuItem 
            icon={<MaterialIcons name="screen-lock-portrait" size={24} color="#4CAF50" />}
            title="Demander code PIN à l'ouverture de l'application"
            onPress={() => setPinAtStartup(!pinAtStartup)}
            hasToggle={true}
            isActive={pinAtStartup}
            rightText="(Désactivé)"
          />
          
          <MenuItem 
            icon={<MaterialIcons name="event" size={24} color="#9C27B0" />}
            title="Période de Synchronisation: les NON SYNCHRONISÉ"
            onPress={handleSyncPeriod}
          />
          
          <MenuItem 
            icon={<MaterialIcons name="timer" size={24} color="#4CAF50" />}
            title="Timer synchro step 1 (en seconde)"
            onPress={() => handleMenuOption('timer1')}
            rightText="30"
          />
          
          <MenuItem 
            icon={<MaterialIcons name="timer" size={24} color="#4CAF50" />}
            title="Timer synchro step 2 (en seconde)"
            onPress={() => handleMenuOption('timer2')}
            rightText="60"
          />
          
          <MenuItem 
            icon={<MaterialIcons name="timer" size={24} color="#4CAF50" />}
            title="Timer synchro step 3 (en seconde)"
            onPress={() => handleMenuOption('timer3')}
            rightText="90"
          />
          
          <MenuItem 
            icon={<MaterialIcons name="link" size={24} color="#E91E63" />}
            title="Gestion des raccourcis"
            onPress={() => handleMenuOption('shortcuts')}
          />
          
          <MenuItem 
            icon={<Feather name="globe" size={24} color="#2196F3" />}
            title="Mode Inclusif"
            onPress={() => setInclusiveMode(!inclusiveMode)}
            hasToggle={true}
            isActive={inclusiveMode}
            rightText="(Désactivé)"
          />
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  header: {
    backgroundColor: '#121212',
    padding: 20,
    alignItems: 'center',
  },
  profileContainer: {
    alignItems: 'center',
    marginBottom: 15,
  },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#1565C0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  profileTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  pinButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    marginBottom: 10,
    width: '80%',
    alignItems: 'center',
  },
  pinButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  mainMenuButton: {
    backgroundColor: '#121212',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: '#333',
    width: '80%',
    alignItems: 'center',
  },
  mainMenuButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  content: {
    flex: 1,
  },
  sectionHeader: {
    backgroundColor: '#333',
    paddingVertical: 8,
    paddingHorizontal: 15,
  },
  sectionHeaderText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  menuSection: {
    backgroundColor: '#1E1E1E',
    marginBottom: 15,
    borderRadius: 5,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 15,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  menuItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuItemIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  menuItemText: {
    color: 'white',
    fontSize: 16,
  },
  menuItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuItemRightText: {
    color: '#888',
    marginRight: 10,
  },
});

export default AdministrationPage;
