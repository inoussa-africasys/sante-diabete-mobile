import { Entypo, Feather, FontAwesome5, Ionicons, MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface AccueilPageProps {
  onOptionPress: (option: string) => void;
  dtType: string;
  onBackPress?: () => void;
}


const AccueilPage: React.FC<AccueilPageProps> = ({ onOptionPress, dtType, onBackPress }) => {
  const router = useRouter();

  const handlePatientPress = () => {
    router.push(`/liste-patient?dt=${dtType}`);
  };

  const handleScannerPress = () => {
    router.push('/scanner');
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#3a7bd5" />
      
      {/* Header avec dégradé */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerButton}>
          <Entypo name="menu" size={28} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Accueil</Text>
        <TouchableOpacity style={styles.headerButton} onPress={handleScannerPress}>
          <MaterialCommunityIcons name="qrcode-scan" size={28} color="#fff" />
        </TouchableOpacity>
      </View>
      <View style={styles.allContent}>
        {/* Gros boutons */}
        <View style={styles.bigButtonsContainer}>
          <TouchableOpacity 
            style={styles.bigButton}
            onPress={handlePatientPress}
          >
            <View style={styles.buttonContent}>
              <FontAwesome5 name="user-injured" size={40} color="#2196F3" />
              <Text style={styles.bigButtonText}>Patients</Text>
            </View>
          </TouchableOpacity>
          
          {/* <TouchableOpacity 
            style={styles.bigButton}
            onPress={() => onOptionPress('stock')}
          >
            <View style={styles.buttonContent}>
              <MaterialCommunityIcons name="warehouse" size={40} color="#2196F3" />
              <Text style={styles.bigButtonText}>Gestion de Stock</Text>
            </View>
          </TouchableOpacity> */}
        </View>
        {/* Grille de petits boutons */}
        <View style={styles.gridContainer}>
          {/* <TouchableOpacity 
            style={styles.mediumButton}
            onPress={() => onOptionPress('recherche')}
          >
            <Ionicons 
              name="search" 
              size={32} 
              color="#2196F3" 
            />
            <Text style={styles.buttonText}>Recherche</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.mediumButton}
            onPress={() => onOptionPress('stock-medicaments')}
          >
            <MaterialIcons 
              name="medical-services" 
              size={32} 
              color="#2196F3" 
            />
            <Text style={styles.buttonText}>Stock{"\n"}médicaments</Text>
          </TouchableOpacity>
 */}
          <TouchableOpacity 
            style={styles.smallButton}
            onPress={() => router.push(`/liste-fiches?dt=${dtType}&mode=remplir`)}
          >
            <Feather 
              name="edit" 
              size={32} 
              color="#2196F3" 
            />
            <Text style={styles.buttonText}>Remplir{"\n"}une fiche</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.smallButton}
            onPress={() => router.push(`/liste-fiches?dt=${dtType}&mode=editer`)}
          >
            <MaterialIcons 
              name="edit" 
              size={32} 
              color="#FFA000" 
            />
            <Text style={[styles.buttonText, styles.amberText]}>Editer{"\n"}une fiche</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.smallButton}
            onPress={() => router.push(`/liste-fiches?dt=${dtType}&mode=vierge`)}
          >
            <Entypo 
              name="new-message" 
              size={32} 
              color="#2196F3" 
            />
            <Text style={styles.buttonText}>Fiche vierge</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.mediumButton, styles.deleteButton]}
            onPress={() => onOptionPress('supprimer-fiche')}
          >
            <MaterialIcons 
              name="delete" 
              size={32} 
              color="#D32F2F" 
            />
            <Text style={[styles.buttonText, styles.redText]}>Supprimer{"\n"}une fiche</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.mediumButton}
            onPress={() => onOptionPress('synchroniser')}
          >
            <Ionicons 
              name="sync" 
              size={32} 
              color="#2196F3" 
            />
            <Text style={styles.buttonText}>Synchroniser</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb'
  },
  header: {
    backgroundColor: '#3a7bd5',
    paddingHorizontal: 16,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  headerButton: {
    padding: 8
  },
  headerTitle: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center'
  },
  allContent: {
    flex: 1,
    justifyContent: 'center',
    marginTop: 32,
    padding: 16
  },
  bigButtonsContainer: {
    marginBottom: 24,
    gap: 16
  },
  bigButton: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
    borderWidth: 2,
    borderColor: '#2196F3',
    marginHorizontal: 8
  },
  buttonContent: {
    alignItems: 'center'
  },
  bigButtonText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 12,
    color: '#1f2937'
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between'
  },
  mediumButton: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    alignItems: 'center',
    marginBottom: 16,
    width: '48%'
  },
  smallButton: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    alignItems: 'center',
    marginBottom: 16,
    width: '31%'
  },
  deleteButton: {
    borderWidth: 1,
    borderColor: '#DC2626'
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 8,
    color: '#1f2937',
    textAlign: 'center'
  },
  amberText: {
    color: '#FB923C'
  },
  redText: {
    color: '#DC2626'
  }
});

export default AccueilPage;
