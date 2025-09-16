import DiabetesTypeBadge from '@/src/Components/DiabetesTypeBadge';
import { AlertModal, ConfirmDualModal } from "@/src/Components/Modal";
import SurveyScreenDom from "@/src/Components/Survey/SurveyScreenDom";
import { useDiabetes } from '@/src/context/DiabetesContext';
import { getUserName } from '@/src/functions/qrcodeFunctions';
import useConsultation from "@/src/Hooks/useConsultation";
import { useFiche } from "@/src/Hooks/useFiche";
import { usePatient } from "@/src/Hooks/usePatient";
import { ConsultationMapper } from '@/src/mappers/consultationMapper';
import { PatientMapper } from '@/src/mappers/patientMapper';
import Fiche from "@/src/models/Fiche";
import Patient from "@/src/models/Patient";
import { ConsultationFormData, DiabeteType } from "@/src/types";
import { generateUUID } from '@/src/utils/consultation';
import { checkIfFicheIsAFicheAdministrativeByFicheName } from '@/src/utils/ficheAdmin';
import { Ionicons } from "@expo/vector-icons";
import * as Location from "expo-location";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, StatusBar, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";


export default function CreateConsultationScreen() {
  const params = useLocalSearchParams<{ patientId?: string; ficheId?: string }>();
  const patientId = params.patientId || '';
  const ficheId = params.ficheId || '';

  const [fiche, setFiche] = useState<Fiche | null>(null);
  const [patient, setPatient] = useState<Patient | null>(null);
  const [surveyJson, setSurveyJson] = useState({});
  const [loading, setLoading] = useState<boolean>(false);
  
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showGpsErrorModal, setShowGpsErrorModal] = useState<boolean>(false);

  // Garde-fou UI/UX contre les doublons de fiche administrative
  const [adminFicheExists, setAdminFicheExists] = useState<boolean>(false);
  const [existingAdminConsultationId, setExistingAdminConsultationId] = useState<string | null>(null);
  const [showAdminExistsModal, setShowAdminExistsModal] = useState<boolean>(false);

  const { getFicheById, error: getFicheError } = useFiche();
  const { getPatientOnTheLocalDb, error: getPatientError, updatePatientOnTheLocalDb, associateFicheAdministrativeToPatient } = usePatient();

  const [showSuccessModal, setShowSuccessModal] = useState<boolean>(false);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const {diabetesType} = useDiabetes();
  const { createConsultationOnLocalDB, getConsultationById } = useConsultation();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setStartDate(new Date());

      try {
        const ficheFetched = await getFicheById(ficheId);
        const patientFetched = await getPatientOnTheLocalDb(patientId);

        setFiche(ficheFetched);
        setPatient(patientFetched);

        if (ficheFetched?.data) {
          setSurveyJson(ficheFetched.data);
        }

        // Si la fiche est administrative, vérifier si une fiche admin active existe déjà pour ce patient
        const isAdministrative = (ficheFetched as any)?.is_administrative === 1
          || await checkIfFicheIsAFicheAdministrativeByFicheName(ficheFetched?.name || '');
        if (isAdministrative && patientFetched) {
          try {
            const adminConsultation = await patientFetched.donneesAdministratives();
            console.log(' 📝 adminConsultation : ', adminConsultation);
            if (adminConsultation && !adminConsultation.deletedAt) {
              setAdminFicheExists(true);
              setExistingAdminConsultationId(adminConsultation.id?.toString() || null);
              setShowAdminExistsModal(true);
            }
          } catch (error) {
            // Pas bloquant: si la méthode n'existe pas ou renvoie une erreur, on laisse le garde-fou applicatif gérer
            console.debug('Erreur non bloquante lors de la vérification de la fiche administrative:', error);
          }
        }
      } catch (e) {
        console.error('Erreur lors du chargement des données :', e);
      }

      setLoading(false);
    };

    async function getCurrentLocation() {
      const servicesEnabled = await Location.hasServicesEnabledAsync();
      if (!servicesEnabled) {
        setErrorMsg('GPS désactivé. Activez la localisation pour créer une consultation.');
        setShowGpsErrorModal(true);
        return;
      }

      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission de localisation refusée. Accordez-la pour créer une consultation.');
        setShowGpsErrorModal(true);
        return;
      }

      const loc = await Location.getCurrentPositionAsync({});
      setLocation(loc);
    }

    getCurrentLocation();

    fetchData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ficheId, patientId]);


  const handleCompletSurveyForm = async (data: any) => {
    if (!location) {
      setErrorMsg('Localisation indisponible. Veuillez activer le GPS et réessayer.');
      setShowGpsErrorModal(true);
      return;
    }
    const endDate = new Date();
    const uuid = generateUUID();
    const dataWithMetaData = ConsultationMapper.addMetaData({
      data,
      startDate : startDate || new Date(),
      endDate,
      lon : location.coords.longitude.toString(),
      uuid : uuid,
      instanceID : uuid,
      formName : fiche?.name || "",
      traficIdentifiant : patient?.id_patient || "",
      traficUtilisateur : await getUserName(diabetesType as DiabeteType) || "",
      form_name : fiche?.name || "",
      lat : location.coords.latitude.toString(),
      id_patient : patientId
    })

    const consultation : ConsultationFormData = {
      data : dataWithMetaData,  
      id_fiche : ficheId,
    }
    
    try {
      // Créer la consultation
      const consultationCreated = await createConsultationOnLocalDB(consultation, patientId, location.coords);
      const isFicheAdministrative = (fiche as any)?.is_administrative === 1 || await checkIfFicheIsAFicheAdministrativeByFicheName(fiche?.name || '');
      
      if (isFicheAdministrative) {
        if (consultationCreated && consultationCreated.id) {
          const consultationUpdated = await getConsultationById(consultationCreated.id.toString());
          if (!consultationUpdated) {
            throw new Error('Consultation avec l\'ID ' + consultationCreated.id.toString() + ' n\'a pas pu etre mise à jour');
          }
          
          // Associer la fiche administrative au patient
          const result = await associateFicheAdministrativeToPatient(patient?.id_patient || '', consultationUpdated);
          if (!result) {
            throw new Error('Impossible d\'associer la fiche administrative au patient');
          }
          
          // Mettre à jour les informations du patient avec les données de la fiche administrative
          if (patient) {
            try {
              // Convertir les données de la fiche administrative en données de patient
              const patientFormData = PatientMapper.ficheAdminToFormPatient(data, consultationUpdated.ficheName);
              
              // Mettre à jour le patient avec les nouvelles données
              await updatePatientOnTheLocalDb(patient.id_patient, patientFormData);
              console.log(`✅ Patient ${patient.id_patient} mis à jour avec les données de la fiche administrative`);
            } catch (error) {
              console.error('Erreur lors de la mise à jour des informations du patient:', error);
              // Ne pas bloquer la création de la consultation si la mise à jour du patient échoue
            }
          }
        } else {
          throw new Error('Impossible d\'enregistrer la fiche administrative');
        }
      }
      
      setShowSuccessModal(true);
    } catch (error) {
      console.error('Erreur lors de la création de la consultation:', error);
      setErrorMsg(`Erreur: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
      setShowGpsErrorModal(true); // Réutilisation de la modal pour afficher l'erreur
    }
  };


  if (!patientId) {
    return (
      <View style={styles.container}>
        <StatusBar backgroundColor="#f00" barStyle="light-content" />
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Erreur</Text>
        </View>
        <DiabetesTypeBadge />
        <Text>Erreur : ID du patient manquant</Text>
      </View>
    );
  }

  if (getFicheError || getPatientError) {
    return (
      <View style={styles.container}>
        <StatusBar backgroundColor="#f00" barStyle="light-content" />
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Erreur</Text>
        </View>
        <DiabetesTypeBadge />
        <Text>Erreur : {getFicheError}</Text>
        <Text>Erreur : {getPatientError}</Text>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={[styles.container]}>
        <StatusBar backgroundColor="#f00" barStyle="light-content" />
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Chargement en cours</Text>
        </View>
        <DiabetesTypeBadge />
        <View style={[styles.centerContent ,{alignItems: 'center', justifyContent: 'center'}]}>
        <ActivityIndicator size="large" color="#f00" />
        <Text style={{marginTop: 10, fontSize: 16}}>Chargement en cours...</Text>
        </View>
      </View>
    );
  }


  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#f00" barStyle="light-content" />
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {fiche?.name}
        </Text>
      </View>
      <DiabetesTypeBadge />

      {adminFicheExists ? (
        <></>
      ) : (
        <SurveyScreenDom surveyJson={surveyJson} handleSurveyComplete={handleCompletSurveyForm} />
      )}

      <AlertModal
        isVisible={showSuccessModal}
        type="success"
        customIcon={<Ionicons name="checkmark-circle-outline" size={76} color="#4CAF50" />}
        title="Consultation créée avec succès"
        message="La consultation a été créée avec succès."
        onClose={() => {
          setShowSuccessModal(false);
          router.replace(`/patient/${patientId}`);
        }}
      />
      <ConfirmDualModal
        isVisible={showAdminExistsModal}
        type="warning"
        customIcon={<Ionicons name="alert-circle-outline" size={76} color="#FFC107" />}
        title="Fiche administrative existante"
        message={"Ce patient possède déjà une fiche administrative. Voulez-vous ouvrir la fiche existante ?"}
        onClose={() => setShowAdminExistsModal(false)}
        onPrimary={() => {
          setShowAdminExistsModal(false);
          if (existingAdminConsultationId) {
            router.replace(`/patient/${patientId}/consultations/edit?consultationId=${existingAdminConsultationId}`);
          } else {
            router.back();
          }
        }}
        onSecondary={() => {
          setShowAdminExistsModal(false);
          router.back();
        }}
        primaryText="Ouvrir la fiche"
        secondaryText="Retour"
        showCancel={false}
      />
      <AlertModal
        isVisible={showGpsErrorModal}
        type="warning"
        customIcon={<Ionicons name="alert-circle-outline" size={76} color="#FFC107" />}
        title="GPS requis"
        message={errorMsg || 'Activez la localisation pour continuer.'}
        onClose={() => setShowGpsErrorModal(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'red',
    paddingBottom: 10,
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    flex: 1,
    textAlign: 'center',
    marginRight: 40,
  },
});


