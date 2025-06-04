import { ActivityIndicator, Modal, StyleSheet, Text, View } from 'react-native';

interface SyncLoaderProps {
    isSyncing: boolean;
}

const SyncLoader: React.FC<SyncLoaderProps> = ({isSyncing}) => {


  return (
    <View style={styles.container}>

      {/* Sync Loading Modal */}
      <Modal visible={isSyncing} transparent>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalText}>Synchronisation en cours</Text>
            <ActivityIndicator color="#6200ee" style={styles.loader} />
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
});

export default SyncLoader;