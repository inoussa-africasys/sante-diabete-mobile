import SurveyScreenDom from "@/src/Components/Survey/SurveyScreenDom";
import { parseSurveyData } from "@/src/functions/helpers";
import { useFormFill } from "@/src/Hooks/useFormFill";
import { FormFill } from "@/src/models/FormFill";
import FormFillForm from "@/src/types/formFill";
import { Ionicons } from "@expo/vector-icons";
import * as Location from "expo-location";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";


export default function RemplireFiche() {
  const params = useLocalSearchParams<{ id?: string }>();
  const id = params.id || '';
  console.log('id', params);
  const [surveyJson, setSurveyJson] = useState({});
  const [loading, setLoading] = useState<boolean>(false);
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [formFill, setFormFill] = useState<FormFill | null>(null);
  const [ficheName, setFicheName] = useState<string>('');
  const [data, setData] = useState<any>({});

  const { createFormFillOnLocalDB,getFormFillById } = useFormFill();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const formFillFetched = await getFormFillById(id);
        setFormFill(formFillFetched);
        const ficheFetched = formFillFetched?.getFiche();
        setData(formFillFetched?.data);
        if (ficheFetched?.data) {
          setSurveyJson(ficheFetched.data);
          setFicheName(ficheFetched.name);
        }

        console.log('formFillFetched', formFillFetched);
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
    const formFill : FormFillForm = {
      data : JSON.stringify(data),  
      ficheName : ficheName,
      coordinates : location?.coords || {latitude: 0, longitude: 0},
    }
    const result = await createFormFillOnLocalDB(formFill);
    if (!result) {
      console.error('Erreur lors de la création de la formFill');
      setErrorMsg('Erreur lors de la création de la formFill');
      return;
    }
    router.push(`/liste-fiches`);
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
          Remplir une fiche
        </Text>
      </View>

      <SurveyScreenDom 
        surveyJson={surveyJson} 
        handleSurveyComplete={handleCompletSurveyForm} 
        data={parseSurveyData(data)}
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


