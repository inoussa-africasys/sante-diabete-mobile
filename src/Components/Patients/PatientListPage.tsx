import { FontAwesome5, Ionicons, MaterialIcons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import { Alert, FlatList, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import QRCodeScannerView from '../Scanner/QRCodeScannerView';


interface PatientListPageProps {
  diabetesType: 'DT1' | 'DT2';
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

const PatientListPage: React.FC<PatientListPageProps> = ({ 
  diabetesType, 
  onPatientPress, 
  onBackPress,
  onAddPress,
  onQRCodeScan 
}) => {
  // État pour contrôler l'affichage du scanner QR Code
  const [showQRScanner, setShowQRScanner] = useState(false);
  
  // Fonction pour gérer le scan d'un QR Code
  const handleQRCodeScan = (data: string) => {
    // Fermer le scanner
    setShowQRScanner(false);
    
    // Rechercher le patient par ID
    const patient = patients.find(p => p.patientId === data);
    
    if (patient) {
      // Si le patient est trouvé, appeler la fonction onPatientPress avec l'ID du patient
      onPatientPress(patient.id);
      Alert.alert('Patient trouvé', `Patient ${patient.name} identifié avec succès.`);
    } else {
      // Si le patient n'est pas trouvé, afficher une alerte
      Alert.alert('Patient non trouvé', `Aucun patient trouvé avec l'ID: ${data}`);
    }
    
    // Appeler la fonction de callback si elle existe
    if (onQRCodeScan) {
      onQRCodeScan(data);
    } else {
      // Sinon, afficher les données dans la console
      console.log('QR Code scanné:', data);
    }
  };
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
      
      {/* Afficher le scanner QR Code si showQRScanner est true */}
      {showQRScanner && (
        <QRCodeScannerView 
          onScan={handleQRCodeScan}
          onClose={() => setShowQRScanner(false)}
        />
      )}
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={onBackPress}
        >
          <Ionicons name="arrow-back" size={24} color="#212121" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Patients - Usagers</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity 
            style={styles.headerButton}
            onPress={() => setShowQRScanner(true)}
          >
            <FontAwesome5 name="qrcode" size={20} color="#E91E63" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerButton}>
            <Ionicons name="search" size={24} color="#212121" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Type de diabète */}
      <View style={styles.diabetesTypeContainer}>
        <Text style={styles.diabetesTypeText}>Type: {diabetesType}</Text>
      </View>
      
      {/* Actions Bar */}
      <View style={styles.actionsBar}>
        <TouchableOpacity style={styles.actionButton}>
          <FontAwesome5 name="download" size={20} color="#4CAF50" />
        </TouchableOpacity>
        <View style={styles.actionDivider} />
        <TouchableOpacity style={styles.actionButton}>
          <FontAwesome5 name="sync-alt" size={20} color="#4CAF50" />
        </TouchableOpacity>
        <View style={styles.actionDivider} />
        <TouchableOpacity style={styles.actionButton}>
          <FontAwesome5 name="trash" size={20} color="#E91E63" />
        </TouchableOpacity>
      </View>
      
      {/* Patient List */}
      <FlatList
        data={patients}
        renderItem={renderPatientItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
      />
      
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
    paddingVertical: 15,
    paddingHorizontal: 15,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#212121',
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

});

export default PatientListPage;
