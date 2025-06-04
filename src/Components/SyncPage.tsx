import { Entypo, MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface FolderData {
  name: string;
  files?: Array<{
    name: string;
    date: string;
    id: string;
  }>;
}

const SyncPage = () => {
  const router = useRouter();
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncSuccess, setSyncSuccess] = useState(false);

  const folders: FolderData[] = [
    {
      name: 'fiche_v1',
      files: [
        { name: 'fiche_v1', date: '03-06-2025_10h24min7', id: 'TF-73843994' },
        { name: 'fiche_v1', date: '03-06-2025_10h26min39', id: 'TF-81846ACB' },
      ]
    },
    {
      name: 'suivi_etude_v1',
      files: []
    }
  ];

  const handleSync = async () => {
    setIsSyncing(true);
    // Simulate sync process
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsSyncing(false);
    setSyncSuccess(true);
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
        {!selectedFolder ? (
          // Folder List View
          folders.map((folder, index) => (
            <TouchableOpacity
              key={index}
              style={styles.folderItem}
              onPress={() => handleFolderPress(folder.name)}
            >
              <MaterialIcons name="folder" size={24} color="#666" />
              <Text style={styles.folderName}>{folder.name}</Text>
              <Entypo name="chevron-right" size={24} color="#666" />
            </TouchableOpacity>
          ))
        ) : (
          // File List View
          folders
            .find(f => f.name === selectedFolder)
            ?.files?.map((file, index) => (
              <View key={index} style={styles.fileItem}>
                <View style={styles.fileInfo}>
                  <Entypo name="paper-plane" size={24} color="#2196F3" />
                  <Entypo name="check" size={16} color="#4CAF50" />
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
            ))
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
              onPress={() => setSyncSuccess(false)}
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
