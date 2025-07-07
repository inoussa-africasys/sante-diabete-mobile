import Fiche from '@/src/models/Fiche';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useToast } from '../../src/Components/Toast';
import { useFiche } from '../../src/Hooks/useFiche';


enum Action {
  None = '',
  Edit = 'edit',
  Fill = 'fill',
  Empty = 'empty',
  EditFormFill = 'editFormFill'
}

export default function ListeFichesScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { showToast } = useToast();
  const { getAllFicheDownloaded, isLoading, error } = useFiche();
  const [fiches, setFiches] = React.useState<Fiche[]>([]);

  const mode = (typeof params.mode === 'string' && ['editer', 'remplir', 'vierge', 'editFormFill'].includes(params.mode)) ? params.mode : 'remplir';
  const patientId = params.patientId as string;

 useEffect(() => {
  getAllFicheDownloaded().then((fiches) => {
    setFiches(fiches);
  });
 }, []);



  if (error) {
    showToast('Erreur lors de la récupération des fiches', 'error', 3000);
  }


  const getHeaderTitle = () => {
    switch (mode) {
      case 'editer':
        return `Éditer une fiche `;
      case 'remplir':{
        if(patientId){
          return `Consultation pour le patient ${patientId}`;
        }
        return `Remplir une fiche `;
      }
      case 'vierge':
        return `Téléchargement de fiche `;
      case 'editFormFill':
        return `Éditer une fiche `;
      default:
        return `Liste des fiches `;
    }
  };


  const handleMakeAction = (action: Action, fiche: Fiche) => {
    console.log('action', action);
    switch (action) {
      case Action.Edit:
        router.push(`/patient/${patientId}/consultations/edit?mode=edit&ficheId=${fiche.id}`);
        break;
      case Action.Fill:
        router.push(`/remplire-fiche?mode=fill&ficheId=${fiche.id}`);
        break;
      case Action.Empty:
        router.push(`/patient/${patientId}/consultations/create?mode=empty&ficheId=${fiche.id}`);
        break;
      case Action.EditFormFill:
        router.push(`/edit-fiche?mode=editFormFill&ficheId=${fiche.id}`);
        break;
    }
  };

  const renderItemFiche = ({ item }: { item: Fiche }) => (
    <TouchableOpacity 
      style={styles.item}
      onPress={() => {
        let action: Action = Action.None;
        switch (mode) {
          case 'editer':
            action = Action.Edit;
            break;
          case 'remplir':
            action = Action.Fill;
            break;
          case 'vierge':
            action = Action.Empty;
            break;
          case 'editFormFill':
            action = Action.EditFormFill;
            break;
        }
        handleMakeAction(action, item);
      }}
    >
      <View style={styles.itemContent}>
        <MaterialIcons name="description" size={24} color="#2196F3" />
        <Text style={styles.itemText}>{item.name}</Text>
      </View>
      {mode === 'vierge' ? (
        <MaterialIcons name="file-download" size={24} color="#4CAF50" />
      ) : (
        <Ionicons name="chevron-forward" size={24} color="#666" />
      )}
    </TouchableOpacity>
  );

  if (isLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{getHeaderTitle()}</Text>
        </View>
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color="#2196F3" />
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{getHeaderTitle()}</Text>
        </View>
        <View style={styles.centerContent}>
          <MaterialIcons name="error-outline" size={48} color="#f44336" />
          <Text style={styles.errorText}>Une erreur est survenue</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{getHeaderTitle()}</Text>
      </View>
      <FlatList
        data={fiches}
        renderItem={renderItemFiche}
        keyExtractor={(item) => item.name?.toString() || Math.random().toString()}
        contentContainerStyle={styles.list}
        ListEmptyComponent={<EmptyList />}
      />
    </View>
  );
}

const EmptyList = () => {
  return (
    <View style={styles.emptyList}>
    <MaterialIcons name="edit-document" size={124} color="#666" />
      <Text style={styles.errorText}>Aucune fiche disponible</Text>
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
  emptyList: {
    flex: 1,
    textAlign: 'center',
    
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
  },
  errorText: {
    marginTop: 32,
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    textTransform: 'uppercase',
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
