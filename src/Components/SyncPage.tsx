import { Entypo, MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSyncData } from '../Hooks/useSyncData';

// Utilisation de l'interface SyncFolderData du hook useSyncData

const SyncPage = () => {
  const router = useRouter();
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  
  // Utilisation du hook personnalisé pour gérer les données de synchronisation
  const { 
    folders, 
    loading, 
    error, 
    isSyncing, 
    syncSuccess, 
    loadData, 
    syncData, 
    resetSyncSuccess 
  } = useSyncData();

  // Charger les données au montage du composant uniquement
  useEffect(() => {
    // Utiliser un flag pour éviter les chargements multiples
    let isMounted = true;
    if (isMounted) {
      loadData();
      console.log('Data loaded : ', JSON.stringify(folders));
    }
    return () => { isMounted = false; };
  }, []);

  // Gérer la synchronisation
  const handleSync = () => {
    syncData();
  };

  const handleFolderPress = (folderName: string) => {
    setSelectedFolder(folderName);
  };

  const handleBack = () => {
    if (selectedFolder) {
      setSelectedFolder(null);
    } else {
      router.back();
    }
  };
  
  // Trouver le dossier sélectionné
  const selectedFolderData = selectedFolder 
    ? folders.find(f => f.name === selectedFolder) 
    : null;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Entypo name="chevron-left" size={28} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {selectedFolder ? selectedFolder : 'Synchronisation de fiche'}
        </Text>
      </View>

      {/* Content */}
      <View style={styles.content}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#FF1744" />
            <Text style={styles.loadingText}>Chargement des données...</Text>
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={loadData}>
              <Text style={styles.retryButtonText}>Réessayer</Text>
            </TouchableOpacity>
          </View>
        ) : !selectedFolder ? (
          // Folder List View
          folders.length > 0 ? (
            <FlatList
              data={folders}
              keyExtractor={(item, index) => `folder-${index}`}
              renderItem={({ item: folder }) => (
                <TouchableOpacity
                  style={styles.folderItem}
                  onPress={() => handleFolderPress(folder.name)}
                >
                  <MaterialIcons name="folder" size={24} color="#666" />
                  <Text style={styles.folderName}>{folder.name}</Text>
                  <View style={styles.badgeContainer}>
                    <Text style={styles.badgeText}>{folder.files?.length || 0}</Text>
                  </View>
                  <Entypo name="chevron-right" size={24} color="#666" />
                </TouchableOpacity>
              )}
            />
          ) : (
            <View style={styles.emptyContainer}>
              <MaterialIcons name="folder-off" size={100} color="#ccc" />
              <Text style={styles.emptyText}>Aucune fiche à synchroniser</Text>
            </View>
          )
        ) : (
          // File List View
          <>
            <Text style={styles.sectionTitle}>Fiches remplis</Text>
            {selectedFolderData && selectedFolderData.files && selectedFolderData.files.length > 0 ? (
              <FlatList
                data={selectedFolderData.files}
                keyExtractor={(item) => item.id}
                renderItem={({ item: file }) => (
                  <View style={styles.fileItem}>
                    <View style={styles.fileInfo}>
                      <Entypo name="paper-plane" size={24} color="#2196F3" />
                      {/* {file.consultation.isLocalCreated && (
                         <View style={styles.localBadge}>
                          <Text style={styles.localBadgeText}>Local</Text>
                        </View> 
                      )} */}
                      <View style={styles.fileDetails}>
                        <Text style={styles.fileName}>{file.name}</Text>
                        <View style={styles.fileMetadata}>
                          <View style={styles.dateContainer}>
                            <Text style={styles.dateText}>Date: {file.date}</Text>
                          </View>
                          <View style={styles.idContainer}>
                            <Text style={styles.idText}>{file.id}</Text>
                          </View>
                        </View>
                      </View>
                    </View>
                  </View>
                )}
              />
            ) : (
              <View style={styles.emptyContainer}>
                <MaterialIcons name="description" size={64} color="#ccc" />
                <Text style={styles.emptyText}>Aucune fiche remplie</Text>
              </View>
            )}
          </>
        )}
      </View>

      {/* Sync Button */}
      <TouchableOpacity
        style={styles.syncButton}
        onPress={handleSync}
      >
        <Entypo name="cycle" size={24} color="#fff" />
      </TouchableOpacity>

      {/* Sync Loading Modal */}
      <Modal visible={isSyncing} transparent>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalText}>Synchronisation en cours</Text>
            <ActivityIndicator color="#6200ee" style={styles.loader} />
          </View>
        </View>
      </Modal>

      {/* Success Modal */}
      <Modal visible={syncSuccess} transparent>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Message</Text>
            <Text style={styles.modalText}>Synchronisation effectuée avec succès !</Text>
            <TouchableOpacity
              style={styles.okButton}
              onPress={resetSyncSuccess}
            >
              <Text style={styles.okButtonText}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

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

export default SyncPage;
