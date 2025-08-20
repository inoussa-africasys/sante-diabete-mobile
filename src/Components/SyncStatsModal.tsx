import React from 'react';
import { Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SyncPatientReturnType } from '../types/patient';

export interface SyncStatsModalProps {
    visible: boolean;
    stats: SyncPatientReturnType | null;
    onClose: () => void;
}

export const SyncStatsModal: React.FC<SyncStatsModalProps> = ({ visible, stats, onClose }) => {
    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="fade"
            onRequestClose={onClose}
        >
            <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                    <Text style={[styles.modalTitle,stats?.success ? styles.successTitle : styles.errorTitle]}>
                        {stats?.success ? 'Synchronisation réussie' : 'Synchronisation terminée avec des erreurs'}
                    </Text>

                    <ScrollView style={styles.statsScrollView}>
                        {/* Message global */}
                        {!!stats?.message && <Text style={styles.modalMessage}>{stats?.message}</Text>}

                        {/* Statistiques globales */}
                        <View style={styles.statsSection}>
                            <Text style={styles.statsSectionTitle}>Résumé de la synchronisation</Text>

                            {stats?.statistics?.syncDeletedPatients && (
                                <View style={styles.statItem}>
                                    <Text style={styles.statLabel}>Patients supprimés</Text>
                                    <Text style={styles.statValue}>
                                        {stats.statistics.syncDeletedPatients.success}/{stats.statistics.syncDeletedPatients.total}
                                    </Text>
                                </View>
                            )}

                            {stats?.statistics?.sendCreatedOrUpdatedPatientsToServer && (
                                <View style={styles.statItem}>
                                    <Text style={styles.statLabel}>Patients créés/mis à jour</Text>
                                    <Text style={styles.statValue}>
                                        {stats.statistics.sendCreatedOrUpdatedPatientsToServer.success}/{stats.statistics.sendCreatedOrUpdatedPatientsToServer.total}
                                    </Text>
                                </View>
                            )}

                            {stats?.statistics?.sendCreatedConsultationsToServer && (
                                <View style={styles.statItem}>
                                    <Text style={styles.statLabel}>Consultations synchronisées</Text>
                                    <Text style={styles.statValue}>
                                        {stats.statistics.sendCreatedConsultationsToServer.success}/{stats.statistics.sendCreatedConsultationsToServer.total}
                                    </Text>
                                </View>
                            )}

                            {stats?.statistics?.getAllPatientOnServer && (
                                <View style={styles.statItem}>
                                    <Text style={styles.statLabel}>Patients récupérés du serveur</Text>
                                    <Text style={styles.statValue}>
                                        {stats.statistics.getAllPatientOnServer.success}/{stats.statistics.getAllPatientOnServer.total}
                                    </Text>
                                </View>
                            )}

                            {stats?.statistics?.getAllDeletedPatientOnServer && (
                                <View style={styles.statItem}>
                                    <Text style={styles.statLabel}>Patients supprimés récupérés</Text>
                                    <Text style={styles.statValue}>
                                        {stats.statistics.getAllDeletedPatientOnServer.success}/{stats.statistics.getAllDeletedPatientOnServer.total}
                                    </Text>
                                </View>
                            )}

                            {stats?.statistics?.syncPictures && (
                                <View style={styles.statItem}>
                                    <Text style={styles.statLabel}>Images synchronisées</Text>
                                    <Text style={styles.statValue}>
                                        {stats.statistics.syncPictures.success}/{stats.statistics.syncPictures.total}
                                    </Text>
                                </View>
                            )}
                        </View>

                        {/* Erreurs */}
                        {!!stats?.errors?.length && stats.errors.length > 0 && (
                            <View style={styles.errorsSection}>
                                <Text style={styles.errorsSectionTitle}>Erreurs rencontrées</Text>
                                {stats.errors.map((error, index) => (
                                    <Text key={index} style={styles.errorItem}>• {error}</Text>
                                ))}
                            </View>
                        )}
                    </ScrollView>

                    <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                        <Text style={styles.closeButtonText}>Fermer</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    loaderContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 20,
    },
    loadingText: {
        marginTop: 10,
        fontSize: 16,
        color: '#757575',
        fontWeight: '500',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    modalContent: {
        backgroundColor: 'white',
        borderRadius: 10,
        padding: 20,
        width: '90%',
        maxHeight: '80%',
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#4CAF50',
        marginBottom: 10,
        textAlign: 'center',
    },
    modalMessage: {
        fontSize: 16,
        color: '#333',
        marginBottom: 15,
        textAlign: 'center',
    },
    statsScrollView: {
        maxHeight: 400,
    },
    statsSection: {
        marginBottom: 20,
        backgroundColor: '#F5F5F5',
        padding: 15,
        borderRadius: 8,
    },
    statsSectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 10,
    },
    statItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#E0E0E0',
    },
    statLabel: {
        fontSize: 14,
        color: '#555',
    },
    statValue: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#4CAF50',
    },
    errorsSection: {
        marginTop: 10,
        backgroundColor: '#FFEBEE',
        padding: 15,
        borderRadius: 8,
    },
    errorsSectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#D32F2F',
        marginBottom: 10,
    },
    errorItem: {
        fontSize: 14,
        color: '#D32F2F',
        marginBottom: 5,
    },
    closeButton: {
        backgroundColor: '#4CAF50',
        padding: 12,
        borderRadius: 5,
        alignItems: 'center',
        marginTop: 15,
    },
    closeButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
    container: {
        flex: 1,
        backgroundColor: '#F5F5F5',
    },
    successTitle: {
        color: '#4CAF50',
    },
    errorTitle: {
        color: '#D32F2F',
    },
});

export default SyncStatsModal;
