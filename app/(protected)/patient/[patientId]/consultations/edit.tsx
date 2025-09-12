import DiabetesTypeBadge from '@/src/Components/DiabetesTypeBadge';
import { AlertModal } from "@/src/Components/Modal";
import SurveyScreenDom from "@/src/Components/Survey/SurveyScreenDom";
import { useDiabetes } from '@/src/context/DiabetesContext';
import { parseSurveyData } from "@/src/functions/helpers";
import { getUserName } from '@/src/functions/qrcodeFunctions';
import useConsultation from "@/src/Hooks/useConsultation";
import { useFiche } from "@/src/Hooks/useFiche";
import { usePatient } from "@/src/Hooks/usePatient";
import { ConsultationMapper } from '@/src/mappers/consultationMapper';
import { Consultation } from "@/src/models/Consultation";
import Fiche from "@/src/models/Fiche";
import Patient from "@/src/models/Patient";
import { ConsultationFormData, DiabeteType } from "@/src/types";
import { generateUUID, traficConstultationDateFormat } from '@/src/utils/consultation';
import Logger from '@/src/utils/Logger';
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, StatusBar, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";


export default function EditConsultationScreen() {
  const params = useLocalSearchParams<{ patientId?: string; consultationId?: string }>();
  const patientId = params.patientId || '';
  const consultationId = params.consultationId || '';

  const [consultation, setConsultation] = useState<Consultation | null>(null);
  const [patient, setPatient] = useState<Patient | null>(null);
  const [fiche, setFiche] = useState<Fiche | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState<boolean>(false);
  const { getConsultationById } = useConsultation();
  const { getPatientByIdOnTheLocalDb } = usePatient();
  const { getFicheByName } = useFiche();
  const { updateConsultationByIdOnLocalDB } = useConsultation();
  const [startDate, setStartDate] = useState<Date | null>(null);

  const {diabetesType} = useDiabetes();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setStartDate(new Date());

        const consultationFetched = await getConsultationById(consultationId);
        const patientFetched = await getPatientByIdOnTheLocalDb(patientId);

        setConsultation(consultationFetched);
        setPatient(patientFetched);

        if (consultationFetched?.ficheName) {
          console.log("consultation : ", consultationFetched);
          Logger.info("consultation to edit : ", consultationFetched);
          const ficheFetched = await getFicheByName(consultationFetched.ficheName);
          setFiche(ficheFetched);
        }

      } catch (e) {
        console.error("Erreur lors du chargement des données :", e);
        Logger.error("Erreur lors du chargement des données :", e as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [consultationId, patientId]);


  const handleSurveyComplete = async (data: any) => {
    try {
      setLoading(true);
      if (!consultation) {
        setError("La consultation n'a pas été trouvée");
        return;
      }
      
      // Utiliser les valeurs existantes ou des valeurs par défaut
      const endDate = new Date();
      data.date_consultation = traficConstultationDateFormat(endDate);
      const uuid = consultation.uuid || generateUUID();
      
      // Éviter de parser plusieurs fois les mêmes données JSON
      let parsedData;
      try {
        parsedData = JSON.parse(consultation.data);
      } catch (e) {
        console.error("Erreur lors du parsing des données de consultation:", e);
        parsedData = {};
      }
      
      const dataWithMetaData = ConsultationMapper.addMetaData({
        data,
        startDate: parsedData.startDate || startDate || new Date(),
        endDate: parsedData.endDate || endDate,
        lon: consultation.longitude?.toString() || "",
        uuid: uuid,
        instanceID: uuid,
        formName: fiche?.name || "",
        traficIdentifiant: patient?.id_patient || "",
        traficUtilisateur: consultation.createdBy || await getUserName(diabetesType as DiabeteType) || "",
        form_name: fiche?.name || "",
        lat: consultation.latitude?.toString() || "",
        id_patient: patientId
      });
      
      const consultationFormData: ConsultationFormData = { 
        data: JSON.stringify(dataWithMetaData), 
        id_fiche: consultation.id_fiche 
      };
      
      const result = await updateConsultationByIdOnLocalDB(consultationId, consultationFormData);
      
      if (result) {
        setShowSuccessModal(true);
      } else {
        setError("Une erreur est survenue lors de la mise à jour de la consultation");
      }
    } catch (error) {
      console.error("Erreur lors de la mise à jour de la consultation:", error);
      Logger.error("Erreur lors de la mise à jour de la consultation:", error as Error);
      setError("Une erreur inattendue est survenue: " + (error instanceof Error ? error.message : String(error)));
    } finally {
      setLoading(false);
    }
  };



  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color="#FF0000" />
        <Text>Chargement...</Text>
      </View>
    );
  }

  if (!consultation || !patient || !fiche) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Text style={styles.errorText}>Impossible de charger la consultation.</Text>
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
        <Text style={styles.headerTitle}>{patient.first_name} {patient.last_name}</Text>
      </View>
      <DiabetesTypeBadge />

      <SurveyScreenDom
        surveyJson={fiche?.data}
        data={parseSurveyData(consultation?.data)}
        handleSurveyComplete={handleSurveyComplete}
      />

      <AlertModal
        isVisible={showSuccessModal}
        type="success"
        customIcon={<Ionicons name="checkmark-circle-outline" size={76} color="#4CAF50" />}
        title="Consultation editée avec succès"
        message="La consultation a été mise à jour avec succès."
        onClose={() => {
          setShowSuccessModal(false);
          router.replace(`/patient/${patientId}/consultations/show?consultationId=${consultation.id}`);
        }}
      />

      {
        error && (
          <AlertModal type="error" message={error} isVisible={true} onClose={() => setError(null)} title="Erreur" />
        )
      }
    </SafeAreaView>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5'
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'red',
    paddingBottom: 10
  },
  backButton: {
    padding: 8,
    marginRight: 8
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    flex: 1,
    textAlign: 'center',
    marginRight: 40 // Pour compenser le bouton retour et centrer le titre
  },
  list: {
    padding: 16
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 12,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4
  },
  itemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1
  },
  itemText: {
    fontSize: 16,
    marginLeft: 12,
    color: '#333'
  }
});
