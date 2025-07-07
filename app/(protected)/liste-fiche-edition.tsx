import { formatDate } from '@/src/functions/helpers';
import { useFormFill } from '@/src/Hooks/useFormFill';
import { Entypo, Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

// Utilisation de l'interface SyncFolderData du hook useSyncData

const ListeFicheEdition = () => {
    const router = useRouter();
    
const { isLoading, error, formFills ,loadFormFills} = useFormFill();
  
    useEffect(() => {
     loadFormFills().then(() => {
        console.log('formFills chargées :', formFills);
     });
    }, []);

    const handleBack = () => {
      router.back();
    };
    
   
    return (
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <Entypo name="chevron-left" size={28} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            Modifier les fiches remplis
          </Text>
        </View>
  
        {/* Content */}
        <View style={styles.content}>
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#FF1744" />
              <Text style={styles.loadingText}>Chargement des données...</Text>
            </View>
          ) : error ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
              <TouchableOpacity style={styles.retryButton} onPress={loadFormFills}>
                <Text style={styles.retryButtonText}>Réessayer</Text>
              </TouchableOpacity>
            </View>
          ) : 
          <>
          {formFills && formFills.length > 0 ? (
            <FlatList
            data={formFills}
            keyExtractor={(item) => item.uuid.toString()}
            renderItem={({ item: formFill }) => (
              <TouchableOpacity style={styles.fileItem} onPress={() => router.push(`/edit-fiche?id=${formFill.id}`)}>
                <View style={styles.fileInfo}>
                  <Entypo name="paper-plane" size={24} color="#2196F3" />
                  {formFill.synced && (
                    <Ionicons name="checkmark-done" size={20} color="#23a651" />
                  )} 
                  <View style={styles.fileDetails}>
                    <Text style={styles.fileName}>{formFill.ficheName}</Text>
                    <View style={styles.fileMetadata}>
                      <View style={styles.dateContainer}>
                        <Text style={styles.dateText}>Date: {formatDate(formFill.createdAt || '')}</Text>
                      </View>
                      <View style={styles.idContainer}>
                        <Text style={styles.idText}>{formFill.id_trafic}</Text>
                      </View>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            )}
          />
          ) : (
            <View style={styles.emptyContainer}>
              <MaterialIcons name="description" size={64} color="#ccc" />
              <Text style={styles.emptyText}>Aucune fiche remplie</Text>
            </View>
          )}
        </>
          }
        </View>
      </View>
    );
}


const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#FF1744',
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#FF1744',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 4,
  },
  retryButtonText: {
    color: '#fff',
    fontWeight: '500',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    textAlign: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 22,
    color: '#666',
    marginTop: 16,
    fontWeight: 'bold',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '500',
    marginBottom: 16,
    color: '#333',
  },
  badgeContainer: {
    backgroundColor: '#FF1744',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginRight: 8,
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
  },
  localBadge: {
    backgroundColor: '#FF9800',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginLeft: 8,
  },
  localBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '500',
  },
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'red',
    elevation: 4,
  },
  backButton: {
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  folderItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    marginBottom: 8,
    borderRadius: 8,
    elevation: 2,
  },
  folderName: {
    flex: 1,
    marginLeft: 16,
    fontSize: 16,
  },
  fileItem: {
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 8,
    borderRadius: 8,
    elevation: 2,
  },
  fileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  fileDetails: {
    flex: 1,
    marginLeft: 16,
  },
  fileName: {
    fontSize: 16,
    marginBottom: 4,
  },
  fileMetadata: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateContainer: {
    backgroundColor: '#2196F3',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginRight: 8,
  },
  dateText: {
    color: '#fff',
    fontSize: 10,
  },
  idContainer: {
    backgroundColor: '#4CAF50',
    borderRadius: 11,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  idText: {
    color: '#fff',
    fontSize: 10,
  },
  syncButton: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FF1744',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 24,
    borderRadius: 8,
    minWidth: 280,
    elevation: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '500',
    marginBottom: 8,
  },
  modalText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 16,
  },
  loader: {
    marginTop: 16,
  },
  okButton: {
    alignSelf: 'flex-end',
  },
  okButtonText: {
    color: '#FF1744',
    fontSize: 16,
    fontWeight: '500',
  },
});


export default ListeFicheEdition
