import { AlertModal, ConfirmModal, LoadingModal } from '@/src/Components/Modal';
import useConsultation from '@/src/Hooks/useConsultation';
import { usePatient } from '@/src/Hooks/usePatient';
import { Consultation } from '@/src/models/Consultation';
import Patient from '@/src/models/Patient';
import { generateConsultationName, parseConsultationDate } from '@/src/utils/consultation';
import { Feather, FontAwesome5, Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function PatientDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({});
  const [showOptions, setShowOptions] = useState(false);
  const { deletePatientOnTheLocalDb, isLoading: isLoadingPatient, error: errorPatient, getPatientOnTheLocalDb } = usePatient();
  const { getConsultations, isLoading: isLoadingConsultations, error: errorConsultations } = useConsultation();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [consultations, setConsultations] = useState<Record<string, Consultation[]> | null>(null);
  const patientId = params.id as string;


  useFocusEffect(
    useCallback(() => {
      const fetchPatient = async () => {
        const patient = await getPatientOnTheLocalDb(patientId);
        setPatient(patient);
        const consultationsData = await getConsultations(patientId);

        if (consultationsData) {
          Object.entries(consultationsData).forEach(([date, dateConsultations]) => {
            console.log("consultation : ", date);
          });
          setConsultations(consultationsData);
        }
      };
      fetchPatient();
    }, [patientId])
  );

  // États pour les modales
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showLoadingModal, setShowLoadingModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const toggleFolder = (date: string) => {
    setExpandedFolders(prev => ({
      ...prev,
      [date]: !prev[date]
    }));
  };

  const handleConsultationPress = (consultation: Consultation) => {
    router.push(`/patient/${patientId}/consultations/show?consultationId=${consultation.id}`);
  };

  const handleAddPress = () => {
    setShowOptions(!showOptions);
  };

  const handleEditPatient = (patientId: string) => {
    router.push(`/nouveau-patient?patientId=${patientId}`);
  };

  const handleDeletePatient = () => {
    setShowConfirmModal(true);
  };

  const handleNewConsultation = () => {
    router.push(`/liste-fiches?patientId=${patientId}&mode=remplir`);
    setShowOptions(false);
  };

  const handleNewRecord = () => {
    /* router.push(`/nouveau-dossier?patientId=${patientId}`); */
    setShowOptions(false);
  };

  const confirmDeletePatient = async () => {
    try {
      setShowConfirmModal(false);
      setShowLoadingModal(true);

      const result = await deletePatientOnTheLocalDb(patientId);

      setShowLoadingModal(false);

      if (result) {
        setShowSuccessModal(true);
      } else {
        setErrorMessage('La suppression du patient a échoué');
        setShowErrorModal(true);
      }
    } catch (error) {
      console.error('Erreur lors de la suppression du patient:', error);
      setShowLoadingModal(false);
      setErrorMessage('Erreur lors de la suppression: ' + (error instanceof Error ? error.message : 'Erreur inconnue'));
      setShowErrorModal(true);
    }
  };

  const handleSuccessModalClose = () => {
    setShowSuccessModal(false);
    router.replace('/liste-patient');
  };

  const formatDate = (dateString: string) => {
    console.log("dateString : ",dateString);
    if (!dateString) return 'Date inconnue';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  return (
    <>
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{patient?.first_name} {patient?.last_name}</Text>
          <View style={styles.headerActions}>
            <TouchableOpacity onPress={() => handleEditPatient(patientId)} style={styles.headerButton}>
              <Feather name="edit-2" size={24} color="white" />
            </TouchableOpacity>
            <TouchableOpacity onPress={handleDeletePatient} style={styles.headerButton}>
              <MaterialIcons name="delete" size={24} color="white" />
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView style={styles.scrollContainer}>
          {isLoadingConsultations ? (
            <View style={styles.centerMessage}>
              <Text>Chargement des consultations...</Text>
            </View>
          ) : errorConsultations ? (
            <View style={styles.centerMessage}>
              <Text style={styles.errorText}>Erreur: {errorConsultations}</Text>
            </View>
          ) : consultations && Object.entries(consultations).length > 0 ? (
            Object.entries(consultations).map(([date, dateConsultations]) => (
              <View key={date} style={styles.folderSection}>
                <TouchableOpacity
                  style={styles.folderContainer}
                  onPress={() => toggleFolder(date)}
                >
                  <View style={styles.folderHeader}>
                    <FontAwesome5
                      name="folder"
                      size={24}
                      color="#9E9E9E"
                    />
                    <Text style={styles.folderDate}>{formatDate(date)}</Text>
                    <FontAwesome5
                      name={expandedFolders[date] ? 'chevron-down' : 'chevron-right'}
                      size={16}
                      color="#9E9E9E"
                    />
                  </View>
                </TouchableOpacity>

                {expandedFolders[date] && (
                  <View style={styles.consultationsContainer}>
                    {dateConsultations.map((consultation, index) => (
                      <TouchableOpacity
                        key={consultation.id || index}
                        style={styles.consultationItem}
                        onPress={() => handleConsultationPress(consultation)}
                      >
                        <FontAwesome5 name="file-alt" size={20} color="#9E9E9E" />
                        <Text style={styles.consultationText}>
                          {consultation.fileName || generateConsultationName(parseConsultationDate(consultation.date || '') || new Date())}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>
            ))
          ) : (
            <View style={styles.centerMessage}>
              <Text style={styles.noConsultationsText}>Aucune consultation disponible</Text>
            </View>
          )}
        </ScrollView>

        <View style={styles.fabContainer}>
          {showOptions && (
            <View style={styles.optionsContainer}>
              <TouchableOpacity style={styles.optionButton} onPress={handleNewConsultation}>
                <View style={styles.optionContent}>
                  <View style={styles.optionTextContainer}>
                    <Text style={styles.optionText}>Nouvelle</Text>
                    <Text style={styles.optionText}>Consultation</Text>
                  </View>
                  <View style={styles.optionIconContainer}>
                    <FontAwesome5 name="stethoscope" size={20} color="#fff" />
                  </View>
                </View>
              </TouchableOpacity>
              <TouchableOpacity style={styles.optionButton} onPress={handleNewRecord}>
                <View style={styles.optionContent}>
                  <View style={styles.optionTextContainer}>
                    <Text style={styles.optionText}>Dossier</Text>
                    <Text style={styles.optionText}>informatisé</Text>
                  </View>
                  <View style={styles.optionIconContainer}>
                    <FontAwesome5 name="folder-plus" size={20} color="#fff" />
                  </View>
                </View>
              </TouchableOpacity>
            </View>
          )}
          <TouchableOpacity
            style={[styles.addButton, showOptions && styles.addButtonActive]}
            onPress={handleAddPress}
          >
            {showOptions ? (
              <Ionicons name="close" size={30} color="#FFFFFF" />
            ) : (
              <Ionicons name="information" size={30} color="#FFFFFF" />
            )}
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      <ConfirmModal
        isVisible={showConfirmModal}
        title="Confirmation"
        message="Êtes-vous sûr de vouloir supprimer ce patient ? Cette action est irréversible."
        onConfirm={confirmDeletePatient}
        onClose={() => setShowConfirmModal(false)}
        type="danger"
        confirmText="Supprimer"
        cancelText="Annuler"
      />

      <LoadingModal
        isVisible={showLoadingModal}
        message="Suppression du patient en cours..."
      />

      <AlertModal
        isVisible={showSuccessModal}
        title="Succès"
        message="Le patient a été supprimé avec succès"
        onClose={handleSuccessModalClose}
      />

      <AlertModal
        isVisible={showErrorModal}
        title="Erreur"
        message={errorMessage}
        onClose={() => setShowErrorModal(false)}
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContainer: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 10,
    paddingBottom: 15,
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
    color: 'white',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  headerButton: {
    padding: 5,
  },
  folderSection: {
    marginBottom: 1,
  },
  folderContainer: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
    backgroundColor: '#f9f9f9',
  },
  folderHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  folderDate: {
    fontSize: 16,
    color: '#616161',
    flex: 1,
  },
  consultationsContainer: {
    backgroundColor: '#fff',
  },
  consultationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    paddingLeft: 54,
    gap: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  consultationText: {
    fontSize: 14,
    color: '#616161',
  },
  noConsultationsText: {
    padding: 20,
    textAlign: 'center',
    color: '#9E9E9E',
    fontStyle: 'italic',
  },
  centerMessage: {
    padding: 20,
    alignItems: 'center',
  },
  errorText: {
    color: 'red',
  },
  fabContainer: {
    position: 'absolute',
    bottom: 20,
    alignSelf: 'center',
    alignItems: 'center',
  },
  optionsContainer: {
    marginBottom: 10,
  },
  optionButton: {
    borderRadius: 8,
    paddingVertical: 6,
    marginBottom: 10,
    marginEnd: 64,
    minWidth: 200,
  },
  optionIconContainer: {
    backgroundColor: '#E91E63',
    borderRadius: 8,
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 10,
  },
  optionTextContainer: {
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
    justifyContent: 'center',
    alignItems: 'center',
    borderColor: '#e0e0e0',
    borderWidth: 1,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,

  },
  optionText: {
    color: '#000',
    fontSize: 14,
  },
  addButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#E91E63',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  addButtonActive: {
    backgroundColor: '#C2185B',
  },
});
