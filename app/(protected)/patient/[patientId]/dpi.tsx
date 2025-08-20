import DiabetesTypeBadge from '@/src/Components/DiabetesTypeBadge';
import { Images } from '@/src/Constants/Images';
import { useDPI } from '@/src/Hooks/useDPI';
import { useFiche } from '@/src/Hooks/useFiche';
import { usePatient } from '@/src/Hooks/usePatient';
import Fiche from '@/src/models/Fiche';
import { DpiResponse } from '@/src/types/dpi';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const Dpi = () => {
    const { ficheId, patientId } = useLocalSearchParams();
    const [fiche, setFiche] = useState<Fiche | null>(null);
    const title = "Dossier: " + (patientId || "") + "\n" + (fiche?.name || "");
    const { isLoading: isLoadingFiche, error: errorFiche, getFicheById } = useFiche();
    const { isLoading: isLoadingPatient, error: errorPatient } = usePatient();
    const { isLoading: isLoadingDpi, error: errorDpi, getAllDpis } = useDPI();
    const [dpisResponse, setDpisResponse] = useState<DpiResponse>([]);

    const parseContent = (content?: string): Record<string, unknown> => {
        if (!content) return {};
        try {
            return JSON.parse(content);
        } catch {
            return {};
        }
    };

    useEffect(() => {
        const loadData = async () => {
            const fiche = await getFicheById(ficheId as string);
            setFiche(fiche);
        }
        loadData();
    }, [patientId, ficheId])

    useEffect(() => {
        const loadData = async () => {
            if (!patientId || !fiche?.name) {
                return;
            }
            const getAllDpisResponse = await getAllDpis(patientId as string, fiche?.name as string);
            setDpisResponse(getAllDpisResponse);
        }
        loadData();
    }, [patientId, ficheId])


    if (isLoadingFiche || isLoadingPatient || isLoadingDpi) {
        return (
            <View style={styles.container}>
                <ActivityIndicator size="large" color="red" />
                <Text style={styles.headerTitle}>Chargement des données...</Text>
            </View>
        )
    }

    if (errorFiche || errorPatient || errorDpi) {
        return (
            <View style={styles.container}>
                <Text style={styles.headerTitle}>Une erreur est survenue</Text>
            </View>
        )
    }



    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => router.back()}
                >
                    <Ionicons name="arrow-back" size={24} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{title}</Text>
            </View>
            <DiabetesTypeBadge />
            <View style={styles.imageContainer}>
                <Image source={Images.rotate} style={styles.image} />
                <View style={styles.imageTextContainer}>
                    <Text style={styles.imageText}>{"Tourner l'écran en paysage"} </Text>
                </View>
            </View>
            <Text style={styles.sectionTitle}>Dossier: {patientId}</Text>
            <Text style={styles.sectionTitle}>Fiche: {fiche?.name}</Text>

            {dpisResponse.map((dpi, index) => {
                const data = parseContent(dpi.content);
                const entries = Object.entries(data);
                return (
                    <View key={dpi.uuid || index} style={styles.section}>
                        <Text style={styles.sectionSubtitle}>Consultation du {new Date(dpi.date_consultation).toLocaleString()}</Text>
                        <View style={styles.tableContainer}>
                            {entries.length === 0 ? (
                                <Text style={styles.emptyText}>Aucune donnée</Text>
                            ) : (
                                entries.map(([key, value]) => (
                                    <View style={styles.tableRow} key={key}>
                                        <View style={styles.tableCellKey}>
                                            <Text style={styles.keyText}>{key}</Text>
                                        </View>
                                        <View style={styles.tableCellValue}>
                                            <Text style={styles.valueText}>{String(value ?? '')}</Text>
                                        </View>
                                    </View>
                                ))
                            )}
                        </View>
                    </View>
                );
            })}
        </SafeAreaView>
    )
}

export default Dpi

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F5F5',
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#fff',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        paddingBottom: 10,
        justifyContent: 'space-between',
        backgroundColor: 'red',
    },
    backButton: {
        padding: 8,
        marginRight: 8
    },
    imageContainer: {
        flexDirection: 'row',
        justifyContent: 'center',

    },
    image: {
        width: 48,
        height: 44
    },
    imageTextContainer: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    imageText: {
        fontSize: 16,
        marginHorizontal: 18,
        fontStyle: 'italic',
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#111',
        paddingHorizontal: 16,
        marginTop: 12,
    },
    sectionSubtitle: {
        fontSize: 14,
        color: '#333',
        paddingHorizontal: 16,
        marginBottom: 8,
        marginTop: 8,
    },
    section: {
        marginTop: 8,
    },
    tableContainer: {
        marginHorizontal: 16,
        borderWidth: 1,
        borderColor: '#e5e7eb',
        borderRadius: 8,
        overflow: 'hidden',
        backgroundColor: '#fff',
    },
    tableRow: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: '#e5e7eb',
    },
    tableCellKey: {
        width: '40%',
        paddingVertical: 10,
        paddingHorizontal: 12,
        backgroundColor: '#f9fafb',
        borderRightWidth: 1,
        borderRightColor: '#e5e7eb',
    },
    tableCellValue: {
        flex: 1,
        paddingVertical: 10,
        paddingHorizontal: 12,
    },
    keyText: {
        color: '#111827',
        fontWeight: '600',
        fontSize: 14,
    },
    valueText: {
        color: '#111827',
        fontSize: 14,
    },
    emptyText: {
        padding: 12,
        color: '#6b7280',
        fontStyle: 'italic',
    }
})