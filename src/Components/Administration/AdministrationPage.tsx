import { Feather, FontAwesome5, Ionicons, MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { Modal, ScrollView, StyleSheet, Switch, Text, TextInput, TouchableOpacity, View } from 'react-native';
import useConfigStore from '../../core/zustand/configStore';

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
  rightText = '',
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
      {rightText ?
        <Text style={styles.menuItemRightText}>{rightText}</Text>
        : null}

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

  const [showCodePinModal, setShowCodePinModal] = useState(false);
  const [showCodePinModalChangeSuccess, setShowCodePinModalChangeSuccess] = useState(false);

  const [currentPin, setCurrentPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmNewPin, setConfirmNewPin] = useState('');


  const configStore = useConfigStore();

  // Fonction pour naviguer vers la page de modification du code PIN
  const handleModifyPin = () => {
    console.log('Modifier le code PIN');
    setShowCodePinModal(true);
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
    switch (option) {
      case 'timer1':
        console.log('Timer synchro step 1 (en seconde)');
        break;
      case 'timer2':
        console.log('Timer synchro step 2 (en seconde)');
        break;
      case 'timer3':
        console.log('Timer synchro step 3 (en seconde)');
        break;
      case 'shortcuts':
        console.log('Gestion des raccourcis');
        break;
      default:
        console.log(`Option sélectionnée: ${option}`);
    }
    // Implémentation à venir
  };

  // Fonction pour ouvrir le sélecteur de période de synchronisation
  const handleSyncPeriod = () => {
    console.log('Ouvrir sélecteur de période');
    // Implémentation du modal à venir
  };

  function handleValidateModifyPin(): void {
    if (currentPin === '1234' && newPin === confirmNewPin) {
      setShowCodePinModalChangeSuccess(true);
      setShowCodePinModal(false);
    }

  }

  return (
    <ScrollView style={styles.container}>
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
      <View style={styles.content}>
        {/* Section Gestion des interfaces */}
        <SectionHeader title="Gestions des interfaces" />

        <View style={styles.menuSection}>

          {/* <MenuItem
            icon={<MaterialIcons name="groups" size={24} color="white" />}
            title="ONG/Associations"
            onPress={handleOngAssociations}
          /> */}

          <MenuOngAssociationsItem
            icon={<MaterialIcons name="sync" size={24} color="white" />}
            title="Synchronisation"
            onPress={() => configStore.toggle('showSyncButton')}
            isActive={configStore.getValue('showSyncButton')}
          />

          <MenuOngAssociationsItem
            icon={<MaterialIcons name="cloud-download" size={24} color="white" />}
            title={`Télécharger nouvelle \n fiche vierge`}
            onPress={() => configStore.toggle('showDownload')}
            isActive={configStore.getValue('showDownload')}
          />

          <MenuOngAssociationsItem
            icon={<MaterialIcons name="delete" size={24} color="white" />}
            title={`Supprimer une fiche \n enregistrée`}
            onPress={() => configStore.toggle('showDelete')}
            isActive={configStore.getValue('showDelete')}
          />

          <MenuOngAssociationsItem
            icon={<FontAwesome5 name="edit" size={24} color="white" />}
            title="Editer une fiche"
            onPress={() => configStore.toggle('showFicheEditerButton')}
            isActive={configStore.getValue('showFicheEditerButton')}
          />

          <MenuOngAssociationsItem
            icon={<MaterialIcons name="inventory" size={24} color="white" />}
            title="Remplir une fiche"
            onPress={() => configStore.toggle('showFicheRemplieButton')}
            isActive={configStore.getValue('showFicheRemplieButton')}
          />

          <MenuOngAssociationsItem
            icon={<MaterialIcons name="search" size={24} color="white" />}
            title="Recherche"
            onPress={() => configStore.toggle('showSearch')}
            isActive={configStore.getValue('showSearch')}
          />

          <MenuOngAssociationsItem
            icon={<MaterialCommunityIcons name="pill" size={24} color="white" />}
            title="Stock médicaments"
            onPress={() => configStore.toggle('showMedication')}
            isActive={configStore.getValue('showMedication')}
          />

        </View>

        {/* Section Autres */}
        <SectionHeader title="Autres" />

        <View style={styles.menuSection}>
          <MenuItem
            icon={<MaterialIcons name="sync" size={24} color="#4CAF50" />}
            title="Auto Synchronisation"
            onPress={() => configStore.toggle('autoSync')}
            hasToggle={true}
            isActive={configStore.getValue('autoSync')}
            rightText={configStore.getValue('autoSync') ? 'Activé' : 'Désactivé'}
          />

          <MenuItem
            icon={<MaterialCommunityIcons name="bug" size={24} color="#673AB7" />}
            title="Mode debug"
            onPress={() => configStore.toggle('debugMode')}
            hasToggle={true}
            isActive={configStore.getValue('debugMode')}
            rightText={configStore.getValue('debugMode') ? 'Activé' : 'Désactivé'}
          />

          <MenuItem
            icon={<MaterialIcons name="photo-library" size={24} color="#9C27B0" />}
            title={`Synchroniser les Photos \n Patients`}
            onPress={() => configStore.toggle('syncPhotos')}
            hasToggle={true}
            isActive={configStore.getValue('syncPhotos')}
            rightText={configStore.getValue('syncPhotos') ? 'Activé' : 'Désactivé'}
          />

          <MenuItem
            icon={<MaterialIcons name="fingerprint" size={24} color="#00BCD4" />}
            title="Empreinte Digitale"
            onPress={() => configStore.toggle('fingerprint')}
            hasToggle={true}
            isActive={configStore.getValue('fingerprint')}
            rightText={configStore.getValue('fingerprint') ? 'Activé' : 'Désactivé'}
          />

          <MenuItem
            icon={<MaterialIcons name="screen-lock-portrait" size={24} color="#4CAF50" />}
            title={`Demander code PIN à \nl'ouverture de l'application`}
            onPress={() => configStore.toggle('pinAtStartup')}
            hasToggle={true}
            isActive={configStore.getValue('pinAtStartup')}
            rightText={configStore.getValue('pinAtStartup') ? 'Activé' : 'Désactivé'}
          />

          <MenuItem
            icon={<MaterialIcons name="event" size={24} color="#9C27B0" />}
            title={`Période de Synchronisation: \nles NON SYNCHRONISÉ`}
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
            icon={<MaterialIcons name="link" size={24} color="#2196F3" />}
            title="Gestion des raccourcis"
            onPress={() => handleMenuOption('shortcuts')}
          />

          <MenuItem
            icon={<Feather name="globe" size={24} color="#2196F3" />}
            title="Mode Inclusif"
            onPress={() => configStore.toggle('inclusiveMode')}
            hasToggle={true}
            isActive={configStore.getValue('inclusiveMode')}
            rightText={configStore.getValue('inclusiveMode') ? 'Activé' : 'Désactivé'}
          />
        </View>
      </View>

      <Modal
        visible={showCodePinModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowCodePinModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Modifier le code PIN</Text>

            <View style={styles.modalIconContainer}>
              <Ionicons name="lock-closed" size={100} color="black" />
            </View>
            <TextInput
              style={styles.modalInput}
              placeholder="Code PIN actuel"
              value={currentPin}
              onChangeText={setCurrentPin}
              secureTextEntry
            />
            <TextInput
              style={styles.modalInput}
              placeholder="Nouveau code PIN"
              value={newPin}
              onChangeText={setNewPin}
              secureTextEntry
            />
            <TextInput
              style={styles.modalInput}
              placeholder="Confirmer le nouveau code PIN"
              value={confirmNewPin}
              onChangeText={setConfirmNewPin}
              secureTextEntry
            />
            <TouchableOpacity style={styles.modalButton} onPress={handleValidateModifyPin}>
              <Text style={styles.modalButtonText}>Valider</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal
        visible={showCodePinModalChangeSuccess}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowCodePinModalChangeSuccess(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Code PIN modifié avec succès</Text>
            <TouchableOpacity style={styles.modalButton} onPress={() => setShowCodePinModalChangeSuccess(false)}>
              <Text style={styles.modalButtonText}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};


const MenuOngAssociationsItem = ({
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
    fontSize: 14,
    fontWeight: 'bold',
  },
  menuItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuItemRightText: {
    color: '#888',
    marginRight: 1,
    fontSize: 10,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    width: '80%',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  modalInput: {
    width: '100%',
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 10,
    paddingHorizontal: 10,
  },
  modalButton: {
    backgroundColor: '#4CAF50',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  modalButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  modalIconContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  switchLabel: {
    color: '#888',
    marginLeft: 5,
    fontSize: 10,
    marginTop: -10,
    marginBottom: 5,

  }
});

export default AdministrationPage;
