import React from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface SynchSuccesProps {
    isSyncingSuccess: boolean;
    setIsSyncingSuccess: (value: boolean) => void;
}

const SynchSucces: React.FC<SynchSuccesProps> = ({isSyncingSuccess, setIsSyncingSuccess}) => {
  return (
    <View>
            <Modal visible={isSyncingSuccess} transparent>
              <View style={styles.modalContainer}>
                <View style={styles.modalContent}>
                  <Text style={styles.modalTitle}>Message</Text>
                  <Text style={styles.modalText}>Synchronisation effectuée avec succès !</Text>
                  <TouchableOpacity
                    style={styles.okButton}
                    onPress={() => setIsSyncingSuccess(false)}
                  >
                    <Text style={styles.okButtonText}>OK</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Modal>
    </View>
  )
}

export default SynchSucces

const styles = StyleSheet.create({
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
})