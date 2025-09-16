import useConfigStore from '@/src/core/zustand/configStore';
import { useFiche } from '@/src/Hooks/useFiche';
import { AntDesign, Ionicons } from '@expo/vector-icons';
import { useNetworkState } from 'expo-network';
import { router, useLocalSearchParams, usePathname } from 'expo-router';
import React, { useState } from 'react';
import { StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { APP_GREEN } from '../Constants/Colors';
import Logger from '../utils/Logger';
import { AlertModal, ConfirmModal, LoadingModal } from './Modal';

interface FicheDoesntExistProps {
    ficheName: string;
    text?: string;
    noBackButton?: boolean;
}

const BtnBack = ({onPress}: {onPress: () => void}) => {
    return (
        <TouchableOpacity onPress={onPress} style={styles.btnBack}>
            <Ionicons name="arrow-back" size={32} color="white" />
        </TouchableOpacity>
    )
}

const FicheDoesntExist = ({ ficheName, text, noBackButton = false }: FicheDoesntExistProps) => {
    const [showConfirmationModal, setShowConfirmationModal] = useState(false);
    const [showErrorModal, setShowErrorModal] = useState(false);
    const [errorDetail, setErrorDetail] = useState<string | null>(null);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const {downloadFiche, isLoading} = useFiche();
    const pathname = usePathname();
    const localParams = useLocalSearchParams();
    const params = Object.fromEntries(
        Object.entries(localParams).map(([k, v]) => [k, Array.isArray(v) ? v[0] : (v ?? '')])
    );
    const debugMode = useConfigStore((s) => s.debugMode);
    const networkState = useNetworkState();

    const handleGoToTelechargerFichePage = () => {
        router.replace('/download-fiche');
    }

    const handleTelechargerFicheExistant = () => {
        setShowConfirmationModal(true);
    }

    const handleDownloadFicheExistant = async () => {
        setShowConfirmationModal(false);
        try {
            await downloadFiche(ficheName);
            setShowSuccessModal(true);
        } catch (error) {
            console.error('Erreur lors du téléchargement de la fiche:', error);
            setShowErrorModal(true);
            try {
                // Extraire un message utile
                const err: any = error;
                const msg = err?.message ?? (typeof err === 'string' ? err : JSON.stringify(err));
                Logger.error('Erreur lors du téléchargement de la fiche:', msg);
                setErrorDetail(msg);
            } catch {
                setErrorDetail(null);
            }
        }
    }

    if (ficheName === "") {
        return (
            <View style={[styles.container, styles.centerContent]}>
                <StatusBar barStyle="light-content" />
                <Ionicons name="document-text-outline" size={150} color="gray" />
                <Text style={styles.errorText}>{text || "La lecture de cette consultation nécessite que vous téléchargez la fiche vierge correspondante"}</Text>
                <TouchableOpacity onPress={handleGoToTelechargerFichePage} style={styles.btnDownload}>
                    <Text style={styles.btnDownloadText}>Telecharger</Text>
                </TouchableOpacity>
            </View>
        );
    }
    return (
        <>
            <View style={[styles.container, styles.centerContent]}>
                <StatusBar barStyle="light-content" />
                {noBackButton ? null : <BtnBack onPress={() => router.back()} />}
                <Ionicons name="document-text-outline" size={150} color="gray" />
                <Text style={styles.errorText}>{text || "La lecture de cette consultation nécessite que vous téléchargez la fiche vierge"}</Text>
                <Text style={styles.errorTextFicheName}>{ficheName}</Text>
                <TouchableOpacity onPress={handleTelechargerFicheExistant} style={styles.btnDownload}>
                    <Text style={styles.btnDownloadText}>Telecharger</Text>
                </TouchableOpacity>
            </View>
            <ConfirmModal
                isVisible={showConfirmationModal}
                customIcon={<Ionicons name="document-text-outline" size={100} color="#2196F3" />}
                onClose={() => setShowConfirmationModal(false)}
                title="Confirmation"
                message={` Voulez-vous vraiment télécharger la fiche 
                ${ficheName} ?  `}
                confirmText="Telecharger"
                cancelText="Annuler"
                onConfirm={handleDownloadFicheExistant}
            />
            <LoadingModal
                isVisible={isLoading}
                message="Telechargement en cours ..."
            />
            <AlertModal
                isVisible={showErrorModal}
                title="Erreur"
                type="error"
                message={
                    debugMode && errorDetail
                        ? `Échec du téléchargement de la fiche '${ficheName}'.\nDétail: ${errorDetail}`
                        : `Une erreur est survenue lors du téléchargement de la fiche '${ficheName}'. Veuillez réessayer.`
                }
                onClose={() => {
                    setShowErrorModal(false);
                    setErrorDetail(null);
                }}
            />
            <AlertModal
                isVisible={showSuccessModal}
                title="Téléchargement terminé"
                type="success"
                customIcon={<AntDesign name="checkcircleo" size={76} color="#4CAF50" />}
                message={`Fiche '${ficheName}' téléchargée avec succès`}
                onClose={() => {
                    setShowSuccessModal(false);
                    // Rafraîchir l'écran courant
                    if (pathname) {
                        const query = Object.entries(params)
                            .filter(([k, v]) => k !== 'patientId' && v !== undefined && v !== null && `${v}`.length > 0)
                            .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`)
                            .join('&');
                        const target = query ? `${pathname}?${query}` : pathname;
                        console.log(target);
                        
                        // @ts-expect-error: typed routes n'acceptent pas une URL dynamique, mais ici on remplace la route courante avec ses params
                        router.replace(target);
                    }
                }}
            />
        </>
    )
}

export default FicheDoesntExist

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
        textAlign: 'center',
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
    headerActions: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    headerButton: {
        padding: 5,
        marginLeft: 15,
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
    },
    errorTextFicheName: {
        marginTop: 16,
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        fontWeight: 'bold',
    },
    btnDownload: {
        marginTop: 16,
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
        marginRight: 8,
        paddingHorizontal: 20,
        backgroundColor: APP_GREEN,
        borderRadius: 12,
        elevation: 2,
        fontSize: 16,
        color: '#fff',
        fontWeight: 'bold',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4
    },
    btnBack: {
        position: 'absolute',
        top: 60,
        left: 20,
        zIndex: 10,
        backgroundColor: "#00000066",
        padding: 10,
        borderRadius: 66666,
    },
    btnDownloadText: {
        fontSize: 16,
        color: '#fff',
        fontWeight: 'bold',
    }
})