import DiabetesTypeBadge from "@/src/Components/DiabetesTypeBadge";
import FicheDoesntExist from "@/src/Components/FicheDoesntExist";
import { AlertModal, ConfirmModal } from "@/src/Components/Modal";
import SurveyScreenDom from "@/src/Components/Survey/SurveyScreenDom";
import { parseSurveyData } from "@/src/functions/helpers";
import useConsultation from "@/src/Hooks/useConsultation";
import { useFiche } from "@/src/Hooks/useFiche";
import { usePatient } from "@/src/Hooks/usePatient";
import { Consultation } from "@/src/models/Consultation";
import Fiche from "@/src/models/Fiche";
import Patient from "@/src/models/Patient";
import { Feather, FontAwesome, FontAwesome6, Ionicons, MaterialIcons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, StatusBar, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ShowConsultationScreen() {
  const params = useLocalSearchParams<{ patientId?: string; consultationId?: string }>();
  const patientId = params.patientId || '';
  const consultationId = params.consultationId || '';

  const [consultation, setConsultation] = useState<Consultation | null>(null);
  const [patient, setPatient] = useState<Patient | null>(null);
  const [fiche, setFiche] = useState<Fiche | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteSuccessModal, setShowDeleteSuccessModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const { getConsultationById,deleteConsultationOnTheLocalDb } = useConsultation();
  const { getPatientByIdOnTheLocalDb } = usePatient();
  const { getFicheById ,getFicheByName} = useFiche();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const consultationFetched = await getConsultationById(consultationId);
        const patientFetched = await getPatientByIdOnTheLocalDb(patientId);

        setConsultation(consultationFetched);
        setPatient(patientFetched);

        if (consultationFetched?.ficheName) {
          const ficheFetched = await getFicheByName(consultationFetched.ficheName);
          setFiche(ficheFetched);
        }

      } catch (e) {
        console.error("Erreur lors du chargement des données :", e);
        setError("Une erreur est survenue lors du chargement des données");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [consultationId, patientId]);


  const handleEditConsultation = (consultationId: string) => {
    router.push(`/patient/${patientId}/consultations/edit?consultationId=${consultationId}`);
  };

  const handleDeleteConsultation = async (consultationId: string) => {
    const result = await deleteConsultationOnTheLocalDb(consultationId); 
    if(!result){
      console.error("Erreur lors de la suppression de la consultation");
      setError("Une erreur est survenue lors de la suppression de la consultation");
      return;
    }
    setShowDeleteSuccessModal(true);
    
    
  };

  const handleDeleteModalOpen = () => {
    setShowDeleteModal(true);
  };

  const handleSuccessModalClose = () => {
    setShowDeleteSuccessModal(false);
    router.replace(`/patient/${patientId}`);
  };



  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color="#FF0000" />
        <Text>Chargement...</Text>
      </View>
    );
  }

  
  if (!consultation) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <StatusBar barStyle="light-content" />
        <FontAwesome6 name="user-doctor" size={150} color="gray" />
        <Text style={styles.errorText}>La consultation n'a pas été trouvée</Text>
        <TouchableOpacity onPress={() => router.back()} style={styles.btnBack}>
          <Text style={styles.btnBackText}>Retour</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!patient) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <StatusBar barStyle="light-content" />
        <FontAwesome name="user-times" size={150} color="gray" />
        <Text style={styles.errorText}>Le patient {patientId} n'a pas été trouvé</Text>
        <TouchableOpacity onPress={() => router.back()} style={styles.btnBack}>
          <Text style={styles.btnBackText}>Retour</Text>
        </TouchableOpacity>

      </View>
    );
  }

  if (!fiche) {
    return (
      <FicheDoesntExist ficheName={consultation?.ficheName} gotBack={() => router.back()}/>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{patient.first_name} {patient.last_name}</Text>
        <View style={styles.headerActions}>
            <TouchableOpacity onPress={() => handleEditConsultation(consultationId)} style={styles.headerButton}>
              <Feather name="edit-2" size={24} color="white" />
            </TouchableOpacity>
            <TouchableOpacity onPress={handleDeleteModalOpen} style={styles.headerButton}>
              <MaterialIcons name="delete" size={24} color="white" />
            </TouchableOpacity>
          </View>
      </View>

      <DiabetesTypeBadge />

      <SurveyScreenDom
        surveyJson={fiche?.data}
        data={parseSurveyData(consultation?.data)}
        isReadOnly={true}
        handleSurveyComplete={() => {}}
      />

      {
        error && (
          <AlertModal type="error" message={error} isVisible={true} onClose={() => setError(null)} title="Erreur"/>
        )
      }
      {
        showDeleteModal && (
          <ConfirmModal type="danger" message="Voulez-vous vraiment supprimer cette consultation ?" isVisible={true} onClose={() => setShowDeleteModal(false)} title="Supprimer la consultation" onConfirm={() => handleDeleteConsultation(consultationId)}/>
        )
      }
      {
        showDeleteSuccessModal && (
          <AlertModal type="success" message="Consultation supprimée avec succès" isVisible={true} onClose={handleSuccessModalClose} title="Suppression reussie"/>
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
        textAlign: 'center',
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
    headerActions: {
        flexDirection: 'row',
        alignItems: 'center',
      },
      headerButton: {
        padding: 5,
        marginLeft: 15,
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
    },
    errorTextFicheName: {
        marginTop: 16,
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        fontWeight: 'bold',
    },
    btnBack: {
        marginTop: 16,
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
        marginRight: 8,
        paddingHorizontal: 20,
        backgroundColor: 'red',
        borderRadius: 12,
        elevation: 2,
        fontSize: 16,
        color: '#fff',
        fontWeight: 'bold',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4
    },
    btnBackText: {
        fontSize: 16,
        color: '#fff',
        fontWeight: 'bold',
    }
});
