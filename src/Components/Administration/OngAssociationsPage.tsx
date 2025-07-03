import { FontAwesome5, Ionicons, MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import useConfigStore from '../../core/zustand/configStore';

// Composant pour les éléments de menu avec icône et switch
const MenuItem = ({ 
  icon, 
  title, 
  onPress, 
  isActive = false
}: { 
  icon: React.ReactNode, 
  title: string, 
  onPress: () => void, 
  isActive?: boolean
}) => (
  <TouchableOpacity style={styles.menuItem} onPress={onPress}>
    <View style={styles.menuItemContent}>
      <View style={styles.menuItemIcon}>
        {icon}
      </View>
      <Text style={styles.menuItemText}>{title}</Text>
    </View>
    <View style={styles.menuItemRight}>
      <Switch
        trackColor={{ false: '#767577', true: '#81b0ff' }}
        thumbColor={isActive ? '#f5dd4b' : '#f4f3f4'}
        ios_backgroundColor="#3e3e3e"
        onValueChange={onPress}
        value={isActive}
      />
      <Text style={styles.switchLabel}>{isActive ? "Afficher" : "Cacher"}</Text>
    </View>
  </TouchableOpacity>
);

const OngAssociationsPage = () => {
  
  const configStore = useConfigStore();

  // Fonction pour retourner à la page précédente
  const handleBack = () => {
    router.back();
  };

  return (
    <View style={styles.container}>
      {/* En-tête avec titre et bouton retour */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>ONG/Associations</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Contenu principal avec scroll */}
      <ScrollView style={styles.content}>
        <View style={styles.menuSection}>
          <MenuItem 
            icon={<MaterialIcons name="location-on" size={24} color="white" />}
            title="Marquer cette Position"
            onPress={() => configStore.toggle('showPosition')}
            isActive={configStore.getValue('showPosition')}
          />
          
          <MenuItem 
            icon={<MaterialIcons name="cloud-download" size={24} color="white" />}
            title="Télécharger nouvelle fiche vierge"
            onPress={() => configStore.toggle('showDownload')}
            isActive={configStore.getValue('showDownload')}
          />
          
          <MenuItem 
            icon={<MaterialIcons name="delete" size={24} color="white" />}
            title="Supprimer une fiche enregistrée"
            onPress={() => configStore.toggle('showDelete')}
            isActive={configStore.getValue('showDelete')}
          />
          
          <MenuItem 
            icon={<FontAwesome5 name="user-nurse" size={24} color="white" />}
            title="Patients"
            onPress={() => configStore.toggle('showPatients')}
            isActive={configStore.getValue('showPatients')}
          />
          
          <MenuItem 
            icon={<MaterialIcons name="inventory" size={24} color="white" />}
            title="Gestion de Stock"
            onPress={() => configStore.toggle('showStock')}
            isActive={configStore.getValue('showStock')}
          />
          
          <MenuItem 
            icon={<MaterialIcons name="search" size={24} color="white" />}
            title="Recherche"
            onPress={() => configStore.toggle('showSearch')}
            isActive={configStore.getValue('showSearch')}
          />
          
          <MenuItem 
            icon={<MaterialCommunityIcons name="pill" size={24} color="white" />}
            title="Stock médicaments"
            onPress={() => configStore.toggle('showMedication')}
            isActive={configStore.getValue('showMedication')}
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
    backgroundColor: 'red',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 15,
    paddingHorizontal: 15,
    elevation: 3,
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
  },
  menuSection: {
    backgroundColor: '#1E1E1E',
    marginTop: 15,
    marginHorizontal: 10,
    borderRadius: 5,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    paddingVertical: 5,
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
    fontSize: 14,
    fontWeight: 'bold',
  },
  menuItemRight: {
    flexDirection: 'column',
    alignItems: 'center',
  },
  switchLabel: {
    color: '#888',
    marginLeft: 5,
    fontSize: 10,
    marginTop: -10,
    marginBottom: 5,

  }
});

export default OngAssociationsPage;
