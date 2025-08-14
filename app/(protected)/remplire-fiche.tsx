import { AlertModal } from "@/src/Components/Modal";
import DiabetesTypeBadge from '@/src/Components/DiabetesTypeBadge';
import SurveyScreenDom from "@/src/Components/Survey/SurveyScreenDom";
import { useFiche } from "@/src/Hooks/useFiche";
import { useFormFill } from "@/src/Hooks/useFormFill";
import FormFillForm from "@/src/types/formFill";
import { Ionicons } from "@expo/vector-icons";
import * as Location from "expo-location";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";


export default function RemplireFiche() {
  const params = useLocalSearchParams<{ ficheId?: string }>();
  const ficheId = params.ficheId || '';
  const [surveyJson, setSurveyJson] = useState({});
  const [loading, setLoading] = useState<boolean>(false);
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [ficheName, setFicheName] = useState<string>('');
  const [showSuccessModal, setShowSuccessModal] = useState<boolean>(false);


  const { getFicheById } = useFiche();
  const { createFormFillOnLocalDB } = useFormFill();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const ficheFetched = await getFicheById(ficheId);
        if (ficheFetched?.data) {
          setSurveyJson(ficheFetched.data);
          setFicheName(ficheFetched.name);
        }
      } catch (e) {
        console.error('Erreur lors du chargement des données :', e);
        setErrorMsg('Erreur lors du chargement des données');
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
    const formFill: FormFillForm = {
      data: data,
      ficheName: ficheName,
      coordinates: location?.coords || { latitude: 0, longitude: 0 },
    }
    const result = await createFormFillOnLocalDB(formFill);
    if (!result) {
      console.error('Erreur lors de la création de la formFill');
      setErrorMsg('Erreur lors de la création de la formFill');
      return;
    }
    setShowSuccessModal(true);
  };


  if (errorMsg) {
    return (
      <View>
        <Text>Erreur : {errorMsg}</Text>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent, { justifyContent: 'center', alignItems: 'center', marginTop: 100 }]}>
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
          Remplir une fiche
        </Text>
      </View>
      <DiabetesTypeBadge />

      <SurveyScreenDom surveyJson={surveyJson} handleSurveyComplete={handleCompletSurveyForm} />
      <AlertModal
        isVisible={showSuccessModal}
        title="Fiche Remplie avec succès"
        type="success"
        message={`La fiche '${ficheName}' a été remplie avec succès`}
        customIcon={<Ionicons name="checkmark-circle-outline" size={76} color="#4CAF50"/>}
        onClose={() => {
          setShowSuccessModal(false);
          router.back();
        }}
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


