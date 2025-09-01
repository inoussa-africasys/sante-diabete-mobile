import { APP_GREEN } from '@/src/Constants/Colors';
import { getHasPin, setPin, verifyPin } from '@/src/core/security/pinStore';
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
  <TouchableOpacity
    style={styles.menuItem}
    onPress={onPress}
    accessible={true}
    accessibilityLabel={title}
  >
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
          accessibilityLabel={`${title} - interrupteur`}
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
  const [pinError, setPinError] = useState<string>('');
  const [hasExistingPin, setHasExistingPin] = useState<boolean>(false);

  // Modals pour période et timers
  const [showSyncPeriodModal, setShowSyncPeriodModal] = useState(false);
  const [localSyncPeriod, setLocalSyncPeriod] = useState<string>('');
  const [syncPeriodError, setSyncPeriodError] = useState<string>('');

  // Ancien modal groupé supprimé; on gère désormais chaque timer individuellement
  // Edition individuelle des timers
  const [showSingleTimerModal, setShowSingleTimerModal] = useState(false);
  const [currentTimerKey, setCurrentTimerKey] = useState<'timer1' | 'timer2' | 'timer3' | null>(null);
  const [localSingleTimer, setLocalSingleTimer] = useState<string>('');
  const [timerError, setTimerError] = useState<string>('');


  const configStore = useConfigStore();

  // Fonction pour naviguer vers la page de modification du code PIN
  const handleModifyPin = async () => {
    const exists = await getHasPin();
    setHasExistingPin(exists);
    setPinError('');
    setCurrentPin('');
    setNewPin('');
    setConfirmNewPin('');
    setShowCodePinModal(true);
  };

  // Fonction pour retourner au menu principal
  const handleMainMenu = () => {
    router.back();
  };

  // Fonction pour ouvrir le sélecteur de période de synchronisation
  const handleSyncPeriod = () => {
    // Init valeur locale depuis le store
    setLocalSyncPeriod(String(configStore.getValue('syncPeriodDays') ?? 30));
    setSyncPeriodError('');
    setShowSyncPeriodModal(true);
  };

  async function handleValidateModifyPin(): Promise<void> {
    setPinError('');
    // validations basiques
    const pinRegex = /^\d{4}$/;
    if (!pinRegex.test(newPin)) {
      setPinError('Le nouveau code PIN doit contenir exactement 4 chiffres.');
      return;
    }
    if (newPin !== confirmNewPin) {
      setPinError('Les deux nouveaux codes PIN ne correspondent pas.');
      return;
    }

    try {
      if (hasExistingPin) {
        const ok = await verifyPin(currentPin);
        if (!ok) {
          setPinError('Le code PIN actuel est incorrect.');
          return;
        }
      }
      await setPin(newPin);
      setShowCodePinModal(false);
      setShowCodePinModalChangeSuccess(true);
    } catch {
      setPinError("Une erreur est survenue lors de l'enregistrement du PIN.");
    }
  }

  // handlers pour timers
  // Ouverture du modal pour un timer individuel
  const openSingleTimerModal = (key: 'timer1' | 'timer2' | 'timer3') => {
    setCurrentTimerKey(key);
    setTimerError('');
    setLocalSingleTimer(String(configStore.getValue(key)));
    setShowSingleTimerModal(true);
  };

  const saveSyncPeriod = () => {
    const n = Number(localSyncPeriod);
    if (Number.isNaN(n) || !Number.isInteger(n)) {
      setSyncPeriodError('Veuillez saisir un nombre entier.');
      return;
    }
    const minDays = 1, maxDays = 365;
    if (n < minDays || n > maxDays) {
      setSyncPeriodError(`Veuillez saisir une valeur entre ${minDays} et ${maxDays} jours.`);
      return;
    }
    setSyncPeriodError('');
    configStore.setValue('syncPeriodDays', Math.floor(n));
    setShowSyncPeriodModal(false);
  };

  // Sauvegarde d'un timer individuel
  const saveSingleTimer = () => {
    if (!currentTimerKey) return;
    const n = Number(localSingleTimer);
    if (Number.isNaN(n) || !Number.isInteger(n)) {
      setTimerError('Veuillez saisir un nombre entier.');
      return;
    }
    const minS = 5, maxS = 3600;
    if (n < minS || n > maxS) {
      setTimerError(`Veuillez saisir une valeur entre ${minS} et ${maxS} secondes.`);
      return;
    }
    configStore.setValue(currentTimerKey, Math.floor(n));
    setShowSingleTimerModal(false);
  };

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
        <TouchableOpacity style={styles.pinButton} onPress={handleModifyPin} accessibilityLabel="Modifier le code PIN">
          <Text style={styles.pinButtonText}>MODIFIER LE CODE PIN</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.mainMenuButton} onPress={handleMainMenu} accessibilityLabel="Menu principal">
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
            icon={<MaterialIcons name="sync" size={24} color={APP_GREEN} />}
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
            icon={<MaterialIcons name="screen-lock-portrait" size={24} color={APP_GREEN} />}
            title={`Demander code PIN à \nl'ouverture de l'application`}
            onPress={() => configStore.toggle('pinAtStartup')}
            hasToggle={true}
            isActive={configStore.getValue('pinAtStartup')}
            rightText={configStore.getValue('pinAtStartup') ? 'Activé' : 'Désactivé'}
          />

          <MenuItem
            icon={<MaterialIcons name="event" size={24} color="#9C27B0" />}
            title={`Période de Synchronisation: \nles NON SYNCHRONISÉ (${configStore.getValue('syncPeriodDays')} j)`}
            onPress={handleSyncPeriod}
          />

          <MenuItem
            icon={<MaterialIcons name="timer" size={24} color={APP_GREEN} />}
            title={`Timer synchro étape 1 (sec): ${configStore.getValue('timer1')}`}
            onPress={() => openSingleTimerModal('timer1')}
          />

          <MenuItem
            icon={<MaterialIcons name="timer" size={24} color={APP_GREEN} />}
            title={`Timer synchro étape 2 (sec): ${configStore.getValue('timer2')}`}
            onPress={() => openSingleTimerModal('timer2')}
          />

          <MenuItem
            icon={<MaterialIcons name="timer" size={24} color={APP_GREEN} />}
            title={`Timer synchro étape 3 (sec): ${configStore.getValue('timer3')}`}
            onPress={() => openSingleTimerModal('timer3')}
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
            {hasExistingPin ? (
              <TextInput
                style={styles.modalInput}
                placeholder="Code PIN actuel"
                value={currentPin}
                onChangeText={setCurrentPin}
                secureTextEntry
                keyboardType="number-pad"
                maxLength={4}
                autoFocus={hasExistingPin}
                accessibilityLabel="Saisir le code PIN actuel"
              />
            ) : null}
            <TextInput
              style={styles.modalInput}
              placeholder="Nouveau code PIN"
              value={newPin}
              onChangeText={setNewPin}
              secureTextEntry
              keyboardType="number-pad"
              maxLength={4}
              autoFocus={!hasExistingPin}
              accessibilityLabel="Saisir le nouveau code PIN"
            />
            <TextInput
              style={styles.modalInput}
              placeholder="Confirmer le nouveau code PIN"
              value={confirmNewPin}
              onChangeText={setConfirmNewPin}
              secureTextEntry
              keyboardType="number-pad"
              maxLength={4}
              accessibilityLabel="Confirmer le nouveau code PIN"
            />
            {!!pinError && <Text style={{ color: 'red', marginBottom: 10 }}>{pinError}</Text>}
            <TouchableOpacity style={styles.modalButton} onPress={handleValidateModifyPin} accessibilityLabel="Valider la modification du code PIN">
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

      {/* Modal période de synchronisation */}
      <Modal
        visible={showSyncPeriodModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowSyncPeriodModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Période de synchronisation (jours)</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Ex: 30"
              keyboardType="number-pad"
              value={localSyncPeriod}
              onChangeText={setLocalSyncPeriod}
              autoFocus
              accessibilityLabel="Saisir la période de synchronisation en jours"
            />
            {!!syncPeriodError && <Text style={{ color: 'red', marginBottom: 10 }}>{syncPeriodError}</Text>}
            <TouchableOpacity style={styles.modalButton} onPress={saveSyncPeriod} accessibilityLabel="Enregistrer la période de synchronisation">
              <Text style={styles.modalButtonText}>Enregistrer</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Modal timer individuel */}
      <Modal
        visible={showSingleTimerModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowSingleTimerModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {currentTimerKey === 'timer1' && 'Définir le timer étape 1 (secondes)'}
              {currentTimerKey === 'timer2' && 'Définir le timer étape 2 (secondes)'}
              {currentTimerKey === 'timer3' && 'Définir le timer étape 3 (secondes)'}
            </Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Ex: 60 (entre 5 et 3600)"
              keyboardType="number-pad"
              value={localSingleTimer}
              onChangeText={setLocalSingleTimer}
              autoFocus
              accessibilityLabel="Saisir la valeur du timer en secondes"
            />
            {!!timerError && <Text style={{ color: 'red', marginBottom: 10 }}>{timerError}</Text>}
            <TouchableOpacity style={styles.modalButton} onPress={saveSingleTimer} accessibilityLabel="Enregistrer la valeur du timer">
              <Text style={styles.modalButtonText}>Enregistrer</Text>
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
      <Text style={styles.switchLabel}>{isActive ? "Affiché" : "Caché"}</Text>
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
    backgroundColor: APP_GREEN,
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
    backgroundColor: APP_GREEN,
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
