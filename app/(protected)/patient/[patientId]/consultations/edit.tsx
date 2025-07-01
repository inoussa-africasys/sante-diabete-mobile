import { AlertModal } from "@/src/Components/Modal";
import SurveyScreenDom from "@/src/Components/Survey/SurveyScreenDom";
import { parseSurveyData } from "@/src/functions/helpers";
import useConsultation from "@/src/Hooks/useConsultation";
import { useFiche } from "@/src/Hooks/useFiche";
import { usePatient } from "@/src/Hooks/usePatient";
import { Consultation } from "@/src/models/Consultation";
import Fiche from "@/src/models/Fiche";
import Patient from "@/src/models/Patient";
import { ConsultationFormData } from "@/src/types";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function EditConsultationScreen() {
  const params = useLocalSearchParams<{ patientId?: string; consultationId?: string }>();
  const patientId = params.patientId || '';
  const consultationId = params.consultationId || '';

  const [consultation, setConsultation] = useState<Consultation | null>(null);
  const [patient, setPatient] = useState<Patient | null>(null);
  const [fiche, setFiche] = useState<Fiche | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { getConsultationById } = useConsultation();
  const { getPatientByIdOnTheLocalDb } = usePatient();
  const { getFicheByName } = useFiche();
  const { updateConsultationByIdOnLocalDB } = useConsultation();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const consultationFetched = await getConsultationById(consultationId);
        const patientFetched = await getPatientByIdOnTheLocalDb(patientId);

        setConsultation(consultationFetched);
        setPatient(patientFetched);

        if (consultationFetched?.ficheName) {
            console.log("consultation : ",consultationFetched);
          const ficheFetched = await getFicheByName(consultationFetched.ficheName);
          setFiche(ficheFetched);
        }

      } catch (e) {
        console.error("Erreur lors du chargement des données :", e);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [consultationId, patientId]);


  const handleSurveyComplete = async (data: any) => {
    setLoading(true); 
    if(!consultation){
      setLoading(false);
      setError("Une erreur est survenue lors de la mise à jour de la consultation");
      return;
    }
    const consultationFormData : ConsultationFormData = {data:data,id_fiche:consultation.id_fiche};
    const result = await updateConsultationByIdOnLocalDB(consultationId,consultationFormData);
    console.log("result : ",result);
    if(result){
      setLoading(false);
      router.replace(`/patient/${patientId}/consultations/show?consultationId=${consultation.id}`);
    }
    setLoading(false);
    setError("Une erreur est survenue lors de la mise à jour de la consultation");
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
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{patient.first_name} {patient.last_name}</Text>
      </View>

      <SurveyScreenDom
        surveyJson={fiche?.data}
        data={parseSurveyData(consultation?.data)}
        handleSurveyComplete={handleSurveyComplete}
      />

      {
        error && (
          <AlertModal type="error" message={error} isVisible={true} onClose={() => setError(null)} title="Erreur" />
        )
      }
      
    </View>
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
