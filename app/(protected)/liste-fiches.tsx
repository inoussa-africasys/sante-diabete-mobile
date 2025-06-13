import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { useNetworkState } from 'expo-network';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useToast } from '../../src/Components/Toast';
import { useDiabetes } from '../../src/context/DiabetesContext';
import FicheService from '../../src/Services/ficheService';



export default function ListeFichesScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const networkState = useNetworkState();
  const { diabetesType } = useDiabetes();
  const { showToast } = useToast();

  const mode = (typeof params.mode === 'string' && ['editer', 'remplir', 'vierge'].includes(params.mode)) ? params.mode : 'remplir';

  const { data: fiches, isLoading, error } = useQuery({
    queryKey: ['fiches'],
    queryFn: async () => {
      const fichesService = await FicheService.create();
      const fichesArrayString = await fichesService.fetchAllFichesOnServerQuery();
      await fichesService.insertAllFichesOnTheLocalDb(fichesArrayString);
      return fichesArrayString;
    },
    enabled: networkState.isConnected === true,
    retry: 2,

  });

  if (error) {
    showToast('Erreur lors de la récupération des fiches', 'error', 3000);
  }

  useEffect(() => {
    if (networkState.isConnected === false) {
      router.replace('/errors/no-network');
      showToast('Aucune connexion internet', 'error', 3000);
    }
  }, [networkState.isConnected]);


  const getHeaderTitle = () => {
    switch (mode) {
      case 'editer':
        return `Éditer une fiche `;
      case 'remplir':
        return `${mode === 'remplir' ? 'Remplir' : 'Éditer'} une fiche `;
      case 'vierge':
        return `Téléchargement de fiche `;
      default:
        return `Liste des fiches `;
    }
  };


  const renderItem = ({ item }: { item: string }) => (
    <TouchableOpacity 
      style={styles.item}
      onPress={() => {
        let action = '';
        switch (mode) {
          case 'editer':
            action = 'Édition';
            break;
          case 'remplir':
            action = 'Remplissage';
            break;
          case 'vierge':
            action = 'Téléchargement';
            break;
        }
        console.log("action : ", action);
        console.log("item : ", item);
      }}
    >
      <View style={styles.itemContent}>
        <MaterialIcons name="description" size={24} color="#2196F3" />
        <Text style={styles.itemText}>{item}</Text>
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
        data={fiches || []}
        renderItem={renderItem}
        keyExtractor={(item) => item?.toString() || Math.random().toString()}
        contentContainerStyle={styles.list}
      />
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
