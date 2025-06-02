import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { FlatList, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

// Liste temporaire des fiches (à remplacer par les vraies données)
const fiches = {
  'DT1': [
    { id: '1', name: 'dt1_donnees_administratives_v3' },
    { id: '2', name: 'dt1_consultation_v3' }
  ],
  'DT2': [
    { id: '3', name: 'dt2_donnees_administratives_v3' },
    { id: '4', name: 'dt2_consultation_v3' }
  ]
};

export default function ListeFichesScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const dtType = (typeof params.dt === 'string' && (params.dt === 'DT1' || params.dt === 'DT2')) ? params.dt : 'DT1';
  const mode = (typeof params.mode === 'string' && ['editer', 'remplir', 'vierge'].includes(params.mode)) ? params.mode : 'remplir';

  const getHeaderTitle = () => {
    switch (mode) {
      case 'editer':
        return `Éditer une fiche - ${dtType}`;
      case 'remplir':
        return `Remplir une fiche - ${dtType}`;
      case 'vierge':
        return `Téléchargement de fiche - ${dtType}`;
      default:
        return `Liste des fiches - ${dtType}`;
    }
  };

  const fichesForType = fiches[dtType as keyof typeof fiches];

  const renderItem = ({ item }: { item: { id: string; name: string } }) => (
    <TouchableOpacity 
      style={styles.item}
      onPress={() => {
        // Ici on naviguerait vers le formulaire avec la fiche sélectionnée
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
        console.log(`${action} de la fiche:`, item.name);
        // TODO: Ajouter la navigation vers le formulaire
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

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#3a7bd5" />
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
        data={fichesForType}
        renderItem={renderItem}
        keyExtractor={item => item.id}
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#3a7bd5',
    paddingTop: 48,
    paddingBottom: 16
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
