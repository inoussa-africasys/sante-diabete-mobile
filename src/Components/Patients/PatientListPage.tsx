import { FontAwesome5, Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import { FlatList, SafeAreaView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
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

interface Patient {
  id: string;
  name: string;
  date: string;
  patientId: string;
}

// Données de test pour les patients
const patients: Patient[] = [
  { id: '1', name: 'DIARRA Moussa', date: '2025-03-16', patientId: 'P-E428AA1C' },
  { id: '2', name: 'KEITA Ramata', date: '2025-03-16', patientId: 'P-638799C5' },
  { id: '3', name: 'TRAORE Hawa', date: '2025-03-16', patientId: 'P-72455E0F' },
  { id: '4', name: 'Test Test', date: '2025-02-25', patientId: 'P-88DFD856' },
  { id: '5', name: 'Traore Lanssina', date: '2025-02-24', patientId: 'P-CC46CBF6' },
  { id: '6', name: 'Traore Lanssina', date: '2025-02-24', patientId: 'P-CC46CBF6' },
  { id: '7', name: 'Traore Lanssina', date: '2025-02-24', patientId: 'P-CC46CBF6' },
  { id: '8', name: 'Traore Lanssina', date: '2025-02-24', patientId: 'P-CC46CBF6' },
  { id: '9', name: 'Traore Lanssina', date: '2025-02-24', patientId: 'P-CC46CBF6' },
  { id: '10', name: 'Traore Lanssina', date: '2025-02-24', patientId: 'P-CC46CBF6' },
];




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

  const [filteredPatients, setFilteredPatients] = useState<Patient[]>(patients);


  const gotoPatientScanner = () => {
    router.push('/patient/scanner');
  };

  const handleSearch = (text: string) => {
    // Logique de recherche
    console.log('Recherche:', text);
    if (text === '') {
      setFilteredPatients(patients)
      setSearchQuery('')
      return;
    }
    const filteredPs = patients.filter((patient) => patient.patientId.toLowerCase().includes(text.toLowerCase()));
    console.log('Patients filtrés:', filteredPs);
    setSearchQuery(text);
    setFilteredPatients(filteredPs);
  };


  const handleSync = async () => {
    setIsSyncing(true);
    // Simulate sync process
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsSyncing(false);
    setSyncSuccess(true);
  };




  const renderPatientItem = ({ item }: { item: Patient }) => (
    <TouchableOpacity
      style={styles.patientItem}
      onPress={() => onPatientPress(item.id)}
    >
      <View style={styles.patientInfo}>
        <Text style={styles.patientName}>{item.name}</Text>
        <View style={styles.patientDetails}>
          <View style={styles.dateContainer}>
            <Text style={styles.dateText}>Date: {item.date}</Text>
          </View>
          <View style={styles.idContainer}>
            <Text style={styles.idText}>ID: {item.patientId}</Text>
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
      <FlatList
        data={filteredPatients}
        renderItem={renderPatientItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={<Empty message="Aucun patient trouvé" icon={<Ionicons name="archive" size={76} color="#BDBDBD" />} />}

      />


      {/* Success Modal */}
      <SyncLoader isSyncing={isSyncing} />
      <SynchSucces isSyncingSuccess={syncSuccess} setIsSyncingSuccess={setSyncSuccess} />

      {/* Add Button */}
      <TouchableOpacity
        style={styles.addButton}
        onPress={onAddPress}
      >
        <Ionicons name="add" size={30} color="#FFFFFF" />
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
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
