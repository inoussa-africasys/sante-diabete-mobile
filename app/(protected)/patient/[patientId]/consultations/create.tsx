import SurveyScreenDom from "@/src/Components/Survey/SurveyScreenDom";
import useConsultation from "@/src/Hooks/useConsultation";
import { useFiche } from "@/src/Hooks/useFiche";
import { usePatient } from "@/src/Hooks/usePatient";
import Fiche from "@/src/models/Fiche";
import Patient from "@/src/models/Patient";
import { ConsultationFormData } from "@/src/types";
import { Ionicons } from "@expo/vector-icons";
import * as Location from "expo-location";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from "react-native";
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

  const { getFicheById, error: getFicheError } = useFiche();
  const { getPatientOnTheLocalDb, error: getPatientError } = usePatient();
  const { createConsultationOnLocalDB } = useConsultation();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);

      try {
        const ficheFetched = await getFicheById(ficheId);
        const patientFetched = await getPatientOnTheLocalDb(patientId);

        setFiche(ficheFetched);
        setPatient(patientFetched);

        if (ficheFetched?.data) {
          setSurveyJson(ficheFetched.data);
        }
      } catch (e) {
        console.error('Erreur lors du chargement des données :', e);
      }

      setLoading(false);
    };

    async function getCurrentLocation() {
      
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      setLocation(location);
    }

    getCurrentLocation();

    fetchData();
  }, []);


  const handleCompletSurveyForm = async (data: any) => {
    if (!location) {
      return;
    }
    const consultation : ConsultationFormData = {
      data : JSON.stringify(data),  
      id_fiche : ficheId,
    }
    await createConsultationOnLocalDB(consultation,patientId,location.coords);
    router.push(`/patient/${patientId}`);
  };


  if (!patientId) {
    return (
      <View>
        <Text>Erreur : ID du patient manquant</Text>
      </View>
    );
  }

  if (getFicheError || getPatientError) {
    return (
      <View>
        <Text>Erreur : {getFicheError}</Text>
        <Text>Erreur : {getPatientError}</Text>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent,{justifyContent: 'center', alignItems: 'center',marginTop: 100}]}>
        <ActivityIndicator size="large" color="#000" />
        <Text>Chargement en cours...</Text>
      </View>
    );
  }


  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {patient?.last_name} {patient?.first_name} Consultation
        </Text>
      </View>

      <SurveyScreenDom surveyJson={surveyJson} handleSurveyComplete={handleCompletSurveyForm} />
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


