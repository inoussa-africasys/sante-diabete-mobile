import { formatPatientDate } from '@/src/functions/helpers';
import Patient from '@/src/models/Patient';
import { SyncPatientReturnType } from '@/src/types/patient';
import { FontAwesome5, Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useCallback, useState } from 'react';
import { ActivityIndicator, FlatList, Modal, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { usePatient } from '../../Hooks/usePatient';
import { useDiabetes } from '../../context/DiabetesContext';
import Empty from '../Empty';
import SyncLoader from '../SyncLoader';
import SynchSucces from '../synchSucces';

interface PatientListPageProps {
  onPatientPress: (patientId: string) => void;
  onBackPress: () => void;
  onAddPress: () => void;
  onQRCodeScan?: (data: string) => void;
}





const PatientListPage: React.FC<PatientListPageProps> = ({
  onPatientPress,
  onBackPress,
  onAddPress,
  onQRCodeScan
}) => {
  const router = useRouter();
  const diabetesType = useDiabetes().diabetesType;
  const [showSearchbar, setShowSearchbar] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncSuccess, setSyncSuccess] = useState(false);
  const [isSyncError, setIsSyncError] = useState(false);
  const [isLoadingFetch, setIsLoadingFetch] = useState(false);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [syncStats, setSyncStats] = useState<SyncPatientReturnType | null>(null);
  const [showSyncStats, setShowSyncStats] = useState(false);

  const [filteredPatients, setFilteredPatients] = useState<Patient[]>([]);
  const { getAllOnTheLocalDbPatients, syncPatients } = usePatient();


  useFocusEffect(
    useCallback(() => {
      const fetchPatients = async () => {
        setIsLoadingFetch(true);
        try {
          const p = await getAllOnTheLocalDbPatients();
          setPatients(p);
          setFilteredPatients(p); // Mettre à jour filteredPatients avec les données récupérées
        } catch (error) {
          console.error('Erreur lors de la récupération des patients:', error);
        } finally {
          setIsLoadingFetch(false);
        }
      };
      
      fetchPatients();
    }, [])
  )
 


  const gotoPatientScanner = () => {
    router.push('/patient/scanner');
  };
  
  const gotoNewPatient = () => {
    router.push('/nouveau-patient');
  };

  const handleSearch = (text: string) => {
    // Logique de recherche
    if (text === '') {
      setFilteredPatients(patients)
      setSearchQuery('')
      return;
    }
    const filteredPs = patients.filter((patient) => patient.id_patient.toLowerCase().includes(text.toLowerCase()));
    setSearchQuery(text);
    setFilteredPatients(filteredPs);
  };


  const handleSync = async () => {
    setIsSyncing(true);
    try {
      const syncResult = await syncPatients();
      setIsSyncing(false);
      setSyncStats(syncResult);
      
      if (syncResult.success) {
        setSyncSuccess(true);
        setShowSyncStats(true);
        // Recharger la liste des patients après une synchronisation réussie
        const p = await getAllOnTheLocalDbPatients();
        setPatients(p);
        setFilteredPatients(p);
      } else {
        setIsSyncError(true);
        setShowSyncStats(true);
      }
    } catch (error) {
      setIsSyncing(false);
      setIsSyncError(true);
      console.error('Erreur lors de la synchronisation:', error);
    }
  };




  const renderPatientItem = ({ item }: { item: Patient }) => (
    <TouchableOpacity
      style={styles.patientItem}
      onPress={() => onPatientPress(item.id_patient)}
    >
      <View style={styles.patientInfo}>
        <Text style={styles.patientName}>{item.last_name.toUpperCase()} {item.first_name}</Text>
        <View style={styles.patientDetails}>
          <View style={styles.dateContainer}>
            <Text style={styles.dateText}>Date: {formatPatientDate(item.date_of_birth)}</Text>
          </View>
          <View style={styles.idContainer}>
            <Text style={styles.idText}>ID: {item.id_patient}</Text>
          </View>
        </View>
      </View>
      <MaterialIcons name="chevron-right" size={24} color="#BDBDBD" />
    </TouchableOpacity>
  );






  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" hidden={false} />


      {/* Header */}
      <View style={styles.header}>

        {showSearchbar ? (
          <View style={styles.searchContainer}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => setShowSearchbar(false)}
            >
              <Ionicons name="arrow-back" size={24} color="white" />
            </TouchableOpacity>
            <TextInput
              style={styles.searchInput}
              placeholder="Rechercher un patient..."
              placeholderTextColor="white"
              
              value={searchQuery}
              onChangeText={handleSearch}
            />

          </View>
        ) : (
          <>
            <TouchableOpacity
              style={styles.backButton}
              onPress={onBackPress}
            >
              <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Patients - Usagers</Text>
            <View style={styles.headerActions}>
              <TouchableOpacity
                style={styles.headerButton}
                onPress={gotoPatientScanner}
              >
                <FontAwesome5 name="qrcode" size={20} color="#CCC" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.headerButton} onPress={() => setShowSearchbar(true)}>
                <Ionicons name="search" size={24} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </>
        )}

      </View>

      {/* Type de diabète */}
      <View style={styles.diabetesTypeContainer}>
        <Text style={styles.diabetesTypeText}>Type: {diabetesType}</Text>
      </View>

      {/* Actions Bar */}
      <View style={styles.actionsBar}>
        <TouchableOpacity style={styles.actionButton} onPress={() => router.push(`/liste-fiches?mode=vierge&dt=${diabetesType}`)}>
          <FontAwesome5 name="download" size={20} color="#4CAF50" />
        </TouchableOpacity>
        <View style={styles.actionDivider} />
        <TouchableOpacity style={styles.actionButton} onPress={handleSync}>
          <FontAwesome5 name="sync-alt" size={20} color="#4CAF50" />
        </TouchableOpacity>
        <View style={styles.actionDivider} />
        <TouchableOpacity style={styles.actionButton}>
          <FontAwesome5 name="trash" size={20} color="#E91E63" />
        </TouchableOpacity>
      </View>

      {/* Patient List */}
      {isLoadingFetch ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#6200ee" />
          <Text style={styles.loadingText}>Chargement des patients...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredPatients}
          renderItem={renderPatientItem}
          keyExtractor={item => item.id_patient}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={<Empty message="Aucun patient trouvé" icon={<Ionicons name="archive" size={76} color="#BDBDBD" />} />}
        />
      )}


      {/* Modals */}
      <SyncLoader isSyncing={isSyncing} />
      <SynchSucces isSyncingSuccess={syncSuccess} setIsSyncingSuccess={setSyncSuccess} />
      
      {/* Sync Stats Modal */}
      <Modal
        visible={showSyncStats}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowSyncStats(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {syncStats?.success ? "Synchronisation réussie" : "Synchronisation terminée avec des erreurs"}
            </Text>
            
            <ScrollView style={styles.statsScrollView}>
              {/* Message global */}
              <Text style={styles.modalMessage}>{syncStats?.message}</Text>
              
              {/* Statistiques globales */}
              <View style={styles.statsSection}>
                <Text style={styles.statsSectionTitle}>Résumé de la synchronisation</Text>
                
                {syncStats?.statistics?.syncDeletedPatients && (
                  <View style={styles.statItem}>
                    <Text style={styles.statLabel}>Patients supprimés:</Text>
                    <Text style={styles.statValue}>
                      {syncStats.statistics.syncDeletedPatients.success}/{syncStats.statistics.syncDeletedPatients.total}
                    </Text>
                  </View>
                )}
                
                {syncStats?.statistics?.sendCreatedOrUpdatedPatientsToServer && (
                  <View style={styles.statItem}>
                    <Text style={styles.statLabel}>Patients créés/mis à jour:</Text>
                    <Text style={styles.statValue}>
                      {syncStats.statistics.sendCreatedOrUpdatedPatientsToServer.success}/{syncStats.statistics.sendCreatedOrUpdatedPatientsToServer.total}
                    </Text>
                  </View>
                )}
                
                {syncStats?.statistics?.sendCreatedConsultationsToServer && (
                  <View style={styles.statItem}>
                    <Text style={styles.statLabel}>Consultations synchronisées:</Text>
                    <Text style={styles.statValue}>
                      {syncStats.statistics.sendCreatedConsultationsToServer.success}/{syncStats.statistics.sendCreatedConsultationsToServer.total}
                    </Text>
                  </View>
                )}
                
                {syncStats?.statistics?.getAllPatientOnServer && (
                  <View style={styles.statItem}>
                    <Text style={styles.statLabel}>Patients récupérés du serveur:</Text>
                    <Text style={styles.statValue}>
                      {syncStats.statistics.getAllPatientOnServer.success}/{syncStats.statistics.getAllPatientOnServer.total}
                    </Text>
                  </View>
                )}
                
                {syncStats?.statistics?.getAllDeletedPatientOnServer && (
                  <View style={styles.statItem}>
                    <Text style={styles.statLabel}>Patients supprimés récupérés:</Text>
                    <Text style={styles.statValue}>
                      {syncStats.statistics.getAllDeletedPatientOnServer.success}/{syncStats.statistics.getAllDeletedPatientOnServer.total}
                    </Text>
                  </View>
                )}
                
                {syncStats?.statistics?.syncPictures && (
                  <View style={styles.statItem}>
                    <Text style={styles.statLabel}>Images synchronisées:</Text>
                    <Text style={styles.statValue}>
                      {syncStats.statistics.syncPictures.success}/{syncStats.statistics.syncPictures.total}
                    </Text>
                  </View>
                )}
              </View>
              
              {/* Erreurs */}
              {syncStats?.errors && syncStats.errors.length > 0 && (
                <View style={styles.errorsSection}>
                  <Text style={styles.errorsSectionTitle}>Erreurs rencontrées</Text>
                  {syncStats.errors.map((error, index) => (
                    <Text key={index} style={styles.errorItem}>• {error}</Text>
                  ))}
                </View>
              )}
            </ScrollView>
            
            <TouchableOpacity 
              style={styles.closeButton} 
              onPress={() => setShowSyncStats(false)}
            >
              <Text style={styles.closeButtonText}>Fermer</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Add Button */}
      <TouchableOpacity
        style={styles.addButton}
        onPress={gotoNewPatient}        
      >
        <Ionicons name="add" size={30} color="#FFFFFF" />
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#757575',
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    width: '90%',
    maxHeight: '80%',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 10,
    textAlign: 'center',
  },
  modalMessage: {
    fontSize: 16,
    color: '#333',
    marginBottom: 15,
    textAlign: 'center',
  },
  statsScrollView: {
    maxHeight: 400,
  },
  statsSection: {
    marginBottom: 20,
    backgroundColor: '#F5F5F5',
    padding: 15,
    borderRadius: 8,
  },
  statsSectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  statItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  statLabel: {
    fontSize: 14,
    color: '#555',
  },
  statValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  errorsSection: {
    marginTop: 10,
    backgroundColor: '#FFEBEE',
    padding: 15,
    borderRadius: 8,
  },
  errorsSectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#D32F2F',
    marginBottom: 10,
  },
  errorItem: {
    fontSize: 14,
    color: '#D32F2F',
    marginBottom: 5,
  },
  closeButton: {
    backgroundColor: '#4CAF50',
    padding: 12,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 15,
  },
  closeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',

  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 15,
    backgroundColor: 'red',
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerButton: {
    padding: 5,
    marginLeft: 15,
  },
  diabetesTypeContainer: {
    backgroundColor: '#E8F5E9',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#C8E6C9',
  },
  diabetesTypeText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2E7D32',
  },
  actionsBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: '#FFFFFF',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 1.5,
  },
  actionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  editButton: {
    padding: 8,
    marginRight: 5,
  },
  actionButton: {
    padding: 10,
  },
  actionDivider: {
    height: 30,
    width: 1,
    backgroundColor: '#EEEEEE',
  },
  listContent: {
    padding: 10,
  },
  patientItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 5,
    padding: 15,
    marginBottom: 10,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  patientInfo: {
    flex: 1,
  },
  patientName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#212121',
    marginBottom: 8,
  },
  patientDetails: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateContainer: {
    backgroundColor: '#2196F3',
    borderRadius: 15,
    paddingVertical: 4,
    paddingHorizontal: 10,
    marginRight: 8,
  },
  dateText: {
    fontSize: 12,
    color: '#FFFFFF',
  },
  idContainer: {
    backgroundColor: '#4CAF50',
    borderRadius: 15,
    paddingVertical: 4,
    paddingHorizontal: 10,
  },
  idText: {
    fontSize: 12,
    color: '#FFFFFF',
  },
  addButton: {
    position: 'absolute',
    bottom: 20,
    alignSelf: 'center',
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#E53935',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'red',
  },
  searchInput: {
    flex: 1,
    height: 40,
    borderColor: '#EEEEEE',
    backgroundColor: 'red',
    color: 'white',
    paddingHorizontal: 10,
    borderBottomWidth: 4,
    marginRight: 10,
  },
  searchButton: {
    padding: 10,
  },

});

export default PatientListPage;
