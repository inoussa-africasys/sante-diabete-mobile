import FicheDoesntExist from '@/src/Components/FicheDoesntExist';
import { AlertModal, LoadingModal } from '@/src/Components/Modal';
import SurveyScreenDom from '@/src/Components/Survey/SurveyScreenDom';
import useConsultation from '@/src/Hooks/useConsultation';
import { usePatient } from '@/src/Hooks/usePatient';
import { PatientMapper } from '@/src/mappers/patientMapper';
import { ConsultationFormData, FicheAdministrativeFormData } from '@/src/types/patient';
import Logger from '@/src/utils/Logger';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';


export default function NouveauPatientScreen() {
  const router = useRouter();
  const { patientId } = useLocalSearchParams();
  const isEditMode = Boolean(patientId);
  const [formData, setFormData] = useState<FicheAdministrativeFormData>();
  const [isOpenSuccessModal, setIsOpenSuccessModal] = useState(false);
  const [isCreatingPatient, setIsCreatingPatient] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const {
    isLoading: isLoadingPatient,
    getPatientByIdOnTheLocalDb,
    error: errorPatient,
    getFicheAdministrative,
    ficheAdministrative,
    ficheAdministrativeName,
    insertPatientOnTheLocalDb,
    associateFicheAdministrativeToPatient,
    updatePatientOnTheLocalDb,
  } = usePatient();

  const { isLoading: isLoadingConsultation, createConsultationOnLocalDB, updateConsultationByIdOnLocalDB, getConsultationById } = useConsultation();
  const [noAnyFicheAdministrative, setNoAnyFicheAdministrative] = useState(false);

  useEffect(() => {
    (async () => {

      setIsLoading(true);

      const ficheAdministrative = await getFicheAdministrative();
      if (!ficheAdministrative) {
        setNoAnyFicheAdministrative(true);
      }
      // Charger les données du patient si on est en mode édition
      if (isEditMode && patientId) {
        try {
          const patient = await getPatientByIdOnTheLocalDb(patientId.toString());
          if (patient) {
            if (!patient.fiche_administrative_name) {
              throw new Error('Patient avec l\'ID ' + patientId + ' n\'a pas de données administratives');
            }
            const consultation = await patient.donneesAdministratives();
            if (!consultation) {
              throw new Error('Les données de la fiche administrative du patient avec l\'ID ' + patientId + ' sont introuvables');
            }
            setFormData(consultation.parseDataToJson());
          } else {
            Alert.alert('Erreur', `Patient avec l'ID ${patientId} non trouvé`);
            router.back();
          }
        } catch (error ) {
          console.error('Erreur lors du chargement du patient:', error);
          Alert.alert('Erreur', 'Impossible de charger les données du patient');
        } finally {
          setIsLoading(false);
        }
      }
      setIsLoading(false);
    })();
  }, [patientId, isEditMode]);

  


  async function getCurrentLocation(): Promise<Location.LocationObject> {

    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      return {} as Location.LocationObject;
    }

    let location = await Location.getCurrentPositionAsync({});
    return location;
  }


  const handleSaveDataFicheAdministrative = async (data: FicheAdministrativeFormData) => {
    if (isEditMode && patientId) {
      try {
        setIsCreatingPatient(true);
        const patient = await getPatientByIdOnTheLocalDb(patientId.toString());
        if (!patient) {
          throw new Error('Patient avec l\'ID ' + patientId + ' est introuvable ');
        }
        const consultationFormData: ConsultationFormData = {
          data: JSON.stringify(data),
          id_fiche: ficheAdministrative?.id?.toString() || ''
        }
        const consultation = await patient.ficheAdministrative();
        if (!consultation || !consultation.id) {
          throw new Error('Le patient avec l\'ID ' + patientId + ' n\'a pas de fiche administrative');
        }
        const patientFormData = PatientMapper.ficheAdminToFormPatient(data,consultation.ficheName);
        const patientUpdatedResult = await updatePatientOnTheLocalDb(patient.id_patient, patientFormData);
        if (!patientUpdatedResult) {
          throw new Error('Le patient avec l\'ID ' + patientId + ' n\'a pas pu etre mis à jour ');
        }
        const consultationUpdatedResult = await updateConsultationByIdOnLocalDB(consultation.id.toString(), consultationFormData);
        if (!consultationUpdatedResult) {
          throw new Error('La consultation avec l\'ID ' + consultation.id.toString() + ' n\'a pas pu etre mise à jour');
        }
        if (consultationUpdatedResult) {
          const consultationUpdated = await getConsultationById(consultation.id.toString());
          if (!consultationUpdated) {
            throw new Error('Consultation avec l\'ID ' + consultation.id.toString() + ' n\'a pas pu etre mise à jour');
          }
          const result = await associateFicheAdministrativeToPatient(patient.id_patient, consultationUpdated);
          if (!result) {
            throw new Error('Impossible d\'associer la fiche administrative au patient');
          }
          setIsOpenSuccessModal(true);
        } else {
          throw new Error('Impossible d\'enregistrer la fiche administrative');
        }
        setIsCreatingPatient(false);
      } catch (error) {
        console.error('Erreur lors de l\'enregistrement du patient:', error);
        Alert.alert('Erreur', 'Impossible d\'enregistrer le patient');
        Logger.log('error', 'Error inserting patient on the local db', { error });
      } finally {
        setIsCreatingPatient(false);
      }
    } else {
      try {
        setIsCreatingPatient(true);
        const patientFormData = PatientMapper.ficheAdminToFormPatient(data,ficheAdministrative?.name || '');
        const patientCreated = await insertPatientOnTheLocalDb(patientFormData);
        if (!patientCreated) {
          throw new Error('Impossible d\'enregistrer le patient');
        }

        const consultationFormData: ConsultationFormData = {
          data: JSON.stringify(data),
          id_fiche: ficheAdministrative?.id?.toString() || ''
        }
        const coordinates = await getCurrentLocation();
        const consultation = await createConsultationOnLocalDB(consultationFormData, patientCreated.id_patient, coordinates.coords);
        if (consultation) {
          const result = await associateFicheAdministrativeToPatient(patientCreated.id_patient, consultation);
          if (!result) {
            throw new Error('Impossible d\'associer la fiche administrative au patient');
          }
          setIsOpenSuccessModal(true);
        } else {
          throw new Error('Impossible d\'enregistrer la fiche administrative');
        }
        setIsCreatingPatient(false);

      } catch (error) {
        console.error('Erreur lors de l\'enregistrement du patient:', error);
        Alert.alert('Erreur', 'Impossible d\'enregistrer le patient');
        Logger.log('error', 'Error inserting patient on the local db', { error });
      } finally {
        setIsCreatingPatient(false);
      }
    }

  }

  if (errorPatient || noAnyFicheAdministrative) {
    return (
      <View style={styles.container}>
       <FicheDoesntExist
        ficheName={ficheAdministrativeName ?? ""}
        gotBack={() => router.back()}
        text="La creation d'un patient nécessite que vous téléchargez au moins une fiche administrative"
       />
      </View>
    );
  }


  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="red" />
      </View>
    )
  }


  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{isEditMode ? 'Modifier Patient' : 'Nouveau Patient'}</Text>
        <View style={styles.headerRight} />
      </View>

      {
        ficheAdministrative && ficheAdministrative.data ? (
          <SurveyScreenDom
            surveyJson={ficheAdministrative.parseDataToJson()}
            handleSurveyComplete={async (data) => {
              console.log('Survey data:', data);
              await handleSaveDataFicheAdministrative(data);
            }}
            data={formData}
          />
        ) : (
          <FicheDoesntExist
            ficheName={ficheAdministrativeName ?? ""}
            gotBack={() => router.back()}
            text="La creation du patient nécessite que vous téléchargez une fiche administrative : "
          />
        )
      }
      {/* Indicateur de chargement global */}
      {isLoading || isLoadingPatient || isLoadingConsultation && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="red" />
        </View>
      )}
      {isOpenSuccessModal && (
        <AlertModal
          title="Patient enregistré"
          type="success"
          message="Patient enregistré avec succès"
          onClose={() => {
            setIsOpenSuccessModal(false);
            router.replace('/liste-patient');
          }}
          isVisible={isOpenSuccessModal}
        />
      )}
      {isCreatingPatient && (
        <LoadingModal
          message="Patient en cours d'enregistrement..."
          isVisible={isCreatingPatient}
        />
      )}
    </SafeAreaView>
  );
}



const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
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
    color: 'white',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  headerRight: {
    width: 34, // Pour équilibrer avec le bouton retour
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  containerFicheDoesntExist: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  FicheDoesntExistText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'red',
  },
  errorText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'black',
  },
});
