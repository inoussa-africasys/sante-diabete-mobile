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
import { ActivityIndicator, Image, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';


const Header = ({ title }: { title: string }) => {

    const insets = useSafeAreaInsets();
    return (
        <View style={[styles.header, { paddingTop: insets.top }]}>
            <TouchableOpacity
                style={styles.backButton}
                onPress={() => router.back()}
            >
                <Ionicons name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.headerTitle} numberOfLines={1} ellipsizeMode="tail">{title}</Text>
        </View>
    )
}

const Dpi = () => {
    const { ficheId, patientId } = useLocalSearchParams();
    const [fiche, setFiche] = useState<Fiche | null>(null);
    const title = "Dossier: " + (patientId || "") + " - " + (fiche?.name || "");
    const { isLoading: isLoadingFiche, error: errorFiche, getFicheById } = useFiche();
    const { isLoading: isLoadingPatient, error: errorPatient } = usePatient();
    const { isLoading: isLoadingDpi, error: errorDpi, getAllDpis } = useDPI();
    const [dpisResponse, setDpisResponse] = useState<DpiResponse>([]);
    const { width, height } = useWindowDimensions();
    const isLandscape = width > height;


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
            if (!ficheId) return;
            const fiche = await getFicheById(ficheId as string);
            setFiche(fiche);
        }
        loadData();
    }, [ficheId])

    useEffect(() => {
        const loadData = async () => {
            if (!patientId || !fiche?.name) {
                return;
            }
            // reset pour éviter des données périmées lors d’un changement de fiche
            setDpisResponse([]);
            const getAllDpisResponse = await getAllDpis(patientId as string, fiche.name as string);
            setDpisResponse(getAllDpisResponse);
            console.log("getAllDpisResponse", getAllDpisResponse);
        }
        loadData();
    }, [patientId, fiche?.name, getAllDpis])





    if (isLoadingFiche || isLoadingPatient || isLoadingDpi) {
        return (
            <View style={styles.container}>
                <Header title={title} />
                <ActivityIndicator size="large" color="red" />
                <Text style={styles.loadingText}>Chargement des données...</Text>
            </View>
        )
    }

    if (errorFiche || errorPatient || errorDpi) {
        return (
            <View style={styles.container}>
                <Header title={title} />
                <Text style={styles.errorText}>Une erreur est survenue</Text>
            </View>
        )
    }





    return (
        <View style={[styles.container]}>
            <Header title={title} />
            <DiabetesTypeBadge />
            {!isLandscape && (
                <View style={styles.imageContainer}>
                    <Image source={Images.rotate} style={styles.image} />
                    <View style={styles.imageTextContainer}>
                        <Text style={styles.imageText}>{"Tourner l'écran en paysage"} </Text>
                    </View>
                </View>
            )}


            {(() => {
                if (!dpisResponse || dpisResponse.length === 0) {
                    return <Text style={styles.emptyText}>Aucune donnée</Text>;
                }
                // Union des clés sur l'ensemble des items pour éviter de perdre des colonnes
                const keySet = new Set<string>();
                dpisResponse.forEach((dpi) => {
                    const obj = parseContent(dpi.content);
                    Object.keys(obj).forEach((k) => keySet.add(k));
                });
                const headers = Array.from(keySet);
                return (
                    <ScrollView horizontal style={styles.hScroll} contentContainerStyle={styles.hScrollContent}>
                        <StatusBar backgroundColor="#f00" barStyle="light-content" />
                        <ScrollView nestedScrollEnabled>
                            <View>
                                {/* Header */}
                                <View style={[styles.row, styles.headerRow]}>
                                    <View style={[styles.cell, styles.headerCell, styles.cellDate]}>
                                        <Text style={styles.headerCellText}>Date Consultation</Text>
                                    </View>
                                    {headers.map((key) => (
                                        <View key={key} style={[styles.cell, styles.headerCell]}>
                                            <Text style={styles.headerCellText}>{key}</Text>
                                        </View>
                                    ))}
                                </View>
                                {/* Body */}
                                {dpisResponse.map((dpi, index) => {
                                    const data = parseContent(dpi.content);
                                    return (
                                        <View key={`${dpi.uuid}-${index}`} style={styles.row}>
                                            <View style={[styles.cell, styles.cellDate]}>
                                                <Text style={styles.bodyCellText}>{new Date(dpi.date_consultation).toLocaleString()}</Text>
                                            </View>
                                            {headers.map((key) => (
                                                <View key={`${key}-${index}`} style={styles.cell}>
                                                    <Text style={styles.bodyCellText}>{String((data as any)[key] ?? '')}</Text>
                                                </View>
                                            ))}
                                        </View>
                                    );
                                })}
                            </View>
                        </ScrollView>
                    </ScrollView>
                );
            })()}
        </View>
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
        flex: 1,
        flexShrink: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        paddingBottom: 10,

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
    hScroll: {
        marginTop: 12,
    },
    hScrollContent: {
        paddingHorizontal: 16,
    },
    row: {
        flexDirection: 'row',
        borderWidth: 1,
        borderColor: '#e5e7eb',
        borderTopWidth: 0,
    },
    headerRow: {
        backgroundColor: '#000',
    },
    cell: {
        minWidth: 160,
        paddingVertical: 10,
        paddingHorizontal: 12,
        borderRightWidth: 1,
        borderRightColor: '#e5e7eb',
        backgroundColor: '#fff',
    },
    cellDate: {
        minWidth: 220,
    },
    headerCell: {
        backgroundColor: '#000',
    },
    headerCellText: {
        color: '#fff',
        fontWeight: '700',
        fontSize: 16,
        textAlign: 'center',
    },
    bodyCellText: {
        color: '#111827',
        fontSize: 14,
        textAlign: 'center',
    },
    tableHeaderRow: {
        backgroundColor: '#000',
    },
    tableHeaderCell: {
        backgroundColor: '#000',
    },
    tableHeaderText: {
        color: '#fff',
        fontWeight: '700',
        fontSize: 16,
        textAlign: 'center',
    },
    emptyText: {
        padding: 12,
        color: '#6b7280',
        fontStyle: 'italic',
    },
    loadingText: {
        padding: 12,
        color: '#6b7280',
        fontStyle: 'italic',
        textAlign: 'center',
    },
    errorText: {
        padding: 12,
        color: '#6b7280',
        fontStyle: 'italic',
        textAlign: 'center',
    }
})