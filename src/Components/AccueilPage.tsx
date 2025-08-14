import { Entypo, Feather, FontAwesome5, Ionicons, MaterialIcons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import React, { useEffect, useCallback } from 'react';
import { Animated, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { DAY_OF_SYNC_ALERT_TO_DECLANCHE } from '../Constants/App';
import { useAuth } from '../context/AuthContext';
import { useDiabetes } from '../context/DiabetesContext';
import useConfigStore from '../core/zustand/configStore';
import { getLastSyncDate } from '../functions/syncHelpers';
import { useSyncPatientsUI } from '../Hooks/useSyncPatientsUI';
import { QRCodeRepository } from '../Repositories/QRCodeRepository';
import { DiabeteType } from '../types/enums';
import Logger from '../utils/Logger';
import { ConfirmModal } from './Modal';
import SyncLoader from './SyncLoader';
import SyncStatsModal from './SyncStatsModal';
import { useToast } from './Toast/ToastProvider';


interface AccueilPageProps {
  onBackPress?: () => void;
}


const AccueilPage: React.FC<AccueilPageProps> = ({ onBackPress }) => {
  const router = useRouter();
  const { diabetesType } = useDiabetes();
  const [menuOpen, setMenuOpen] = React.useState(false);
  const slideAnim = React.useRef(new Animated.Value(-300)).current;
  const { logout } = useAuth();
  const [logoutModalVisible, setLogoutModalVisible] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const { showToast, showConfirm } = useToast();
  const { userName } = useAuth();
  const [userNameValue, setUserNameValue] = React.useState<string | null>(null);

  const { isAuthenticated,checkAuthOffline } = useAuth();

  // les donnees de config
  const showDownload = useConfigStore((state) => state.showDownload);
  const showDelete = useConfigStore((state) => state.showDelete);
  const showFicheRemplieButton = useConfigStore((state) => state.showFicheRemplieButton);
  const showSyncButton = useConfigStore((state) => state.showSyncButton);
  const showFicheEditerButton = useConfigStore((state) => state.showFicheEditerButton);


  const toggleMenu = () => {
    const toValue = menuOpen ? - 300 : 0;
    Animated.timing(slideAnim, {
      toValue,
      duration: 300,
      useNativeDriver: true,
    }).start();
    setMenuOpen(!menuOpen);
  };

  const handlePatientPress = () => {
    router.push(`/liste-patient?dt=${diabetesType}`);
  };

  const handleScannerPress = () => {
    router.push('/scanner');
  };

  useEffect(() => {
    const repo = new QRCodeRepository();
    const qrCode = repo.findAll();
    console.log('QR Code:', qrCode);
    userName().then((name) => setUserNameValue(name));
  }, []);



  const showSyncAlertToast = useCallback((message: string) => {
    showConfirm(message, {
      type: 'warning',
      confirmLabel: 'Oui',
      cancelLabel: 'Non',
      persistent: true,
      showClose: true,
      onConfirm: async () => {
        await handleSync();
      },
      onCancel: () => {
        Logger.info('Sync cancelled by user ');
        console.log('Sync cancelled by user ');
      },
    });
  }, [showConfirm, handleSync]);



  const handleLogout = () => {
    setIsLoading(true);
    logout({ diabetesType: diabetesType as DiabeteType });
    setIsLoading(false);
    router.replace('/' + diabetesType.toLowerCase());
    showToast('Deconnexion reussie', 'success', 3000);
  };


  const handleCloseLogoutModal = () => {
    setLogoutModalVisible(false);
  };


  useEffect(() => {
    const checkLastSync = async () => {
      let toastMessage = `Vous n’avez pas synchronisé depuis au moins ${DAY_OF_SYNC_ALERT_TO_DECLANCHE} jours !\nCela permet de ne pas perdre les données et récupérer les nouvelles.`

      const last = await getLastSyncDate();
      if (!last ) {
        // jamais synchronisé => afficher (auth déjà validée en amont)
        toastMessage = `Vous n'avez jamais synchronisé les données des patients. Voulez-vous synchroniser maintenant ?`
        showSyncAlertToast(toastMessage)
        return;
      }
      const lastDate = new Date(last);
      if (isNaN(lastDate.getTime())) {
        toastMessage = "La date de synchonisation n'est pas au bon format alors veuiller synchroniser"
        showSyncAlertToast(toastMessage)
        return;
      }
      const now = new Date();
      const diffMs = now.getTime() - lastDate.getTime();
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      if (diffDays >= DAY_OF_SYNC_ALERT_TO_DECLANCHE) {
        toastMessage = `Vous n'avez pas synchronisé depuis au moins ${DAY_OF_SYNC_ALERT_TO_DECLANCHE} jours !\nCela permet de ne pas perdre les données et récupérer les nouvelles.`
        showSyncAlertToast(toastMessage)
      }

    };
    (async () => {
      const ok = await checkAuthOffline();
      if (!ok) return; // ne pas afficher le toast si non authentifié
      await checkLastSync();
    })();
  }, [diabetesType, checkAuthOffline, showSyncAlertToast]);


  const {
    isSyncing,
    syncSuccess,
    isSyncError,
    syncStats,
    showSyncStats,
    handleSync,
    closeStats,
  } = useSyncPatientsUI({
    onAfterSuccess: async (stats) => {
      // Exemple: recharger la liste des patients après succès
    },
    onAfterError: (stats, err) => {
      // Optionnel: logger/alerter
      console.log('Sync error', err, stats);
    }
  });

  return (
    <>

      <StatusBar backgroundColor="red" barStyle="default" />
      <SafeAreaView style={styles.container} >

        {/* Slide-out Menu */}
        <Animated.View style={[styles.menu, { transform: [{ translateX: slideAnim }] }]}>
          <View style={styles.menuHeader}>
            <Text style={styles.menuTitle}> {isAuthenticated ? userNameValue : 'Menu'} - {diabetesType}</Text>
            <TouchableOpacity onPress={toggleMenu} style={styles.closeButton}>
              <Entypo name="cross" size={32} color="#fff" />
            </TouchableOpacity>
          </View>
          <View style={{
            width: '100%',
            height: '15%',
            backgroundColor: 'red',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <Image
              source={require('../../assets/images/splash-icon-v2.png')}
              style={{
                width: 150,
                height: 150,
              }}
              contentFit="contain"
            />

          </View>
          <TouchableOpacity style={styles.menuItem}
            onPress={() => router.push('/scanner')}>
            <Text style={styles.menuItemText}>CONFIG QR CODE</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem}
            onPress={() => router.push('/consultations')}
          >
            <Text style={styles.menuItemText}>CHANGER DE PROFIL</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem}
            onPress={() => router.push('/trafic-assistant')}
          >
            <Text style={styles.menuItemText}>TRAFIC ASSISTANT</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/administration')}>
            <Text style={styles.menuItemText}>ADMINISTRATION</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem} onPress={() => setLogoutModalVisible(true)}>
            <Text style={styles.menuItemText} >DECONNEXION</Text>
          </TouchableOpacity>
        </Animated.View>

        {/* Header avec dégradé */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.headerButton} onPress={toggleMenu}>
            <Entypo name="menu" size={28} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Accueil</Text>
          <TouchableOpacity style={styles.headerButton} onPress={handleScannerPress}>
            <FontAwesome5 name="qrcode" size={28} color="#fff" />
          </TouchableOpacity>
        </View>
        <View style={[styles.allContent, 
          // Si un seul bouton est visible (Patients) et pas de synchronisation
          (!showFicheRemplieButton && !showFicheEditerButton && !showDownload && !showDelete && !showSyncButton) ? 
            styles.singleButtonContainer : styles.multiButtonContainer
        ]}>


          <View style={styles.gridContainer}>
            {showFicheRemplieButton && showFicheEditerButton ? (
              <>
                <TouchableOpacity
                  style={[styles.mediumButton]}
                  onPress={() => router.push(`/liste-fiches?dt=${diabetesType}&mode=remplir`)}
                >
                  <Feather
                    name="edit"
                    size={32}
                    color="#2196F3"
                  />
                  <Text style={styles.buttonText}>Remplir{"\n"}une fiche</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.mediumButton}
                  onPress={() => router.push(`/liste-fiche-edition`)}
                >
                  <MaterialIcons
                    name="edit"
                    size={32}
                    color="#FFA000"
                  />
                  <Text style={[styles.buttonText, styles.amberText]}>Editer{"\n"}une fiche</Text>
                </TouchableOpacity>
              </>
            ) : showFicheRemplieButton ? (
              <TouchableOpacity
                style={[styles.fullWidthButton, styles.singleVisibleButton]}
                onPress={() => router.push(`/liste-fiches?dt=${diabetesType}&mode=remplir`)}
              >
                <Feather
                  name="edit"
                  size={48}
                  color="#2196F3"
                  style={styles.singleVisibleButtonIcon}
                />
                <Text style={[styles.buttonText, styles.singleVisibleButtonText]}>Remplir une fiche</Text>
              </TouchableOpacity>
            ) : showFicheEditerButton ? (
              <TouchableOpacity
                style={[styles.fullWidthButton, styles.singleVisibleButton]}
                onPress={() => router.push(`/liste-fiche-edition`)}
              >
                <MaterialIcons
                  name="edit"
                  size={48}
                  color="#FFA000"
                  style={styles.singleVisibleButtonIcon}
                />
                <Text style={[styles.buttonText, styles.amberText, styles.singleVisibleButtonText]}>Editer une fiche</Text>
              </TouchableOpacity>
            ) : null}
          </View>


          {/* Gros boutons */}
          <View style={[
            styles.bigButtonsContainer, 
            { flexDirection: showSyncButton ? 'column' : 'row' }
          ]}>
            <TouchableOpacity
              style={[
                styles.bigButton,
                { 
                  flex: showSyncButton ? undefined : 1, 
                  height: (!showFicheRemplieButton && !showFicheEditerButton && !showDownload && !showDelete && !showSyncButton) ? 220 : 
                          (showSyncButton ? undefined : 140)
                }
              ]}
              onPress={handlePatientPress}
            >
              <View style={styles.buttonContent}>
                <FontAwesome5 
                  name="user-injured" 
                  size={(!showFicheRemplieButton && !showFicheEditerButton && !showDownload && !showDelete && !showSyncButton) ? 80 : 
                        (showSyncButton ? 40 : 56)} 
                  color="#2196F3" 
                />
                <Text 
                  style={[
                    styles.bigButtonText, 
                    (!showFicheRemplieButton && !showFicheEditerButton && !showDownload && !showDelete && !showSyncButton) ? 
                      { fontSize: 32, marginTop: 24, fontWeight: 'bold' } : 
                      (!showSyncButton && { fontSize: 24, marginTop: 16 })
                  ]}
                >
                  Patients
                </Text>
              </View>
            </TouchableOpacity>

            {showSyncButton && (
              <TouchableOpacity
                style={styles.bigButton}
                onPress={() => router.push('/sync')}
              >
                <View style={styles.buttonContent}>
                  <Ionicons
                    name="sync"
                    size={40}
                    color="#2196F3"
                  />
                  <Text style={styles.bigButtonText}>Synchroniser</Text>
                </View>
              </TouchableOpacity>
            )}
          </View>
          {/* Grille de petits boutons */}
          <View style={styles.gridContainer}>
            {showDownload && showDelete ? (
              <>
                <TouchableOpacity
                  style={styles.mediumButton}
                  onPress={() => {
                    return router.push(`/download-fiche`)
                  }}
                >
                  <Entypo
                    name="download"
                    size={32}
                    color="#2196F3"
                  />
                  <Text style={styles.buttonText}>Fiche vierge</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.mediumButton, styles.deleteButton]}
                  onPress={() => router.push('/errors/comming-soon')}
                >
                  <MaterialIcons
                    name="delete"
                    size={32}
                    color="#D32F2F"
                  />
                  <Text style={[styles.buttonText, styles.redText]}>Supprimer{"\n"}une fiche</Text>
                </TouchableOpacity>
              </>
            ) : showDownload ? (
              <TouchableOpacity
                style={[styles.fullWidthButton, styles.singleVisibleButton]}
                onPress={() => {
                  return router.push(`/download-fiche`)
                }}
              >
                <Entypo
                  name="download"
                  size={48}
                  color="#2196F3"
                  style={styles.singleVisibleButtonIcon}
                />
                <Text style={[styles.buttonText, styles.singleVisibleButtonText]}>Télécharger une fiche vierge</Text>
              </TouchableOpacity>
            ) : showDelete ? (
              <TouchableOpacity
                style={[styles.fullWidthButton, styles.deleteButton, styles.singleVisibleButton, styles.singleVisibleDeleteButton]}
                onPress={() => router.push('/errors/comming-soon')}
              >
                <MaterialIcons
                  name="delete"
                  size={48}
                  color="#D32F2F"
                  style={styles.singleVisibleButtonIcon}
                />
                <Text style={[styles.buttonText, styles.redText, styles.singleVisibleButtonText]}>Supprimer une fiche</Text>
              </TouchableOpacity>
            ) : null}
          </View>

        </View>

      </SafeAreaView>

      <ConfirmModal
        type="danger"
        onConfirm={handleLogout}
        isVisible={logoutModalVisible}
        onClose={handleCloseLogoutModal}
        title="Deconnexion reussie"
        message="Vous avez été deconnecté"
        confirmText="OK"
      />


      <View style={{  position: 'absolute'}}>
        <SyncLoader isSyncing={isSyncing} />

        <SyncStatsModal
          visible={showSyncStats}
          stats={syncStats}
          onClose={closeStats}
        />
      </View>

    </>
  );
};

const styles = StyleSheet.create({
  menu: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 300,
    backgroundColor: '#fff',
    zIndex: 999,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  menuHeader: {
    backgroundColor: 'red',
    paddingTop: 50,
    paddingVertical: 10,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  menuTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 5,
  },
  menuItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  menuItemText: {
    fontSize: 16,
    color: '#333',
  },
  container: {
    flex: 1,
    backgroundColor: '#f9fafb'
  },
  header: {
    backgroundColor: 'red',
    paddingHorizontal: 16,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  headerButton: {
    padding: 8
  },
  headerTitle: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center'
  },
  allContent: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingBottom: 16,
    paddingTop: 16
  },
  singleButtonContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  multiButtonContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  bigButtonsContainer: {
    marginBottom: 24,
    gap: 16,
    flexDirection: 'column',
    width: '100%'
  },
  bigButton: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
    borderWidth: 2,
    borderColor: '#2196F3',
    marginHorizontal: 8,
    width: '90%',
    alignSelf: 'center'
  },
  buttonContent: {
    alignItems: 'center'
  },
  bigButtonText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 12,
    color: '#1f2937'
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between'
  },
  mediumButton: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    alignItems: 'center',
    marginBottom: 16,
    width: '48%'
  },
  smallButton: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    alignItems: 'center',
    marginBottom: 16,
    width: '31%'
  },
  fullWidthButton: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
    alignItems: 'center',
    marginBottom: 20,
    width: '100%'
  },
  singleVisibleButton: {
    height: 120,
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#2196F3',
  },
  singleVisibleDeleteButton: {
    borderColor: '#DC2626',
    borderWidth: 2,
  },
  singleVisibleButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 12,
  },
  singleVisibleButtonIcon: {
    marginBottom: 8,
  },
  deleteButton: {
    borderWidth: 1,
    borderColor: '#DC2626'
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 8,
    color: '#1f2937',
    textAlign: 'center'
  },
  amberText: {
    color: '#FB923C'
  },
  redText: {
    color: '#DC2626'
  },
  syncAlertContainer: {
    backgroundColor: '#FFC107',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    alignItems: 'center',
    flexDirection: 'row',
  },
  syncAlertText: {
    color: '#1f2937',
    textAlign: 'center',
    marginLeft: 16
  },
  syncAlertActions: {
    flexDirection: 'row',
    marginTop: 12,
    gap: 12,
  },
  syncAlertButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  syncAlertYes: {
    backgroundColor: '#2563EB',
  },
  syncAlertNo: {
    backgroundColor: '#E5E7EB',
  },
  syncAlertButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  syncAlertNoText: {
    color: '#111827',
    fontWeight: 'bold',
  },
});

export default AccueilPage;
function getAllOnTheLocalDbPatients() {
  throw new Error('Function not implemented.');
}

