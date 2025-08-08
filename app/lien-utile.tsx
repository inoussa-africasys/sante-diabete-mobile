import LienUtilePage from '@/src/Components/LienUtilePage';
import { Images } from '@/src/Constants';
import { FontAwesome5 } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export interface LienUtileType {
    id: number;
    title: string;
    icon: typeof Images;
    url: string;
}

const LienUtile = () => {
    const lienUtile: LienUtileType[] = [
        {
            id: 1,
            title: 'Site Santé Diabète',
            icon: Images.SiteSanteDiabeteLogo,
            url: 'https://santediabete.org/',
        },
        {
            id: 2,
            title: 'Venus Sante Diabete',
            icon: Images.VenusSanteDiabeteLogo,
            url: 'https://venus-santediabete.cloudlyyours.com:8443/',
        },
        {
            id: 3,
            title: 'SD Planner',
            icon: Images.SDPlannerLogo,
            url: 'https://sdplanner.africasys.com/',
        },
        {
            id: 4,
            title: 'Centre de Ressources',
            icon: Images.CentreDeRessourcesLogo,
            url: 'https://santediabete-centre-de-ressources.cloudlyyours.com',
        },
    ]
    
    return (
        <SafeAreaView style={styles.container}>
            <StatusBar style="light" backgroundColor="red" />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => router.back()}
                >
                    <FontAwesome5 name="arrow-left" size={20} color="white" />
                </TouchableOpacity>
                <View style={styles.headerCenter}>
                    <Image
                        source={Images.goutteSangBlanc}
                        style={styles.logo}
                        contentFit="contain"
                    />
                    <Text style={styles.headerTitle}>Liens Utiles</Text>
                </View>
            </View>
            <LienUtilePage lienUtiles={lienUtile} />
        </SafeAreaView>
    )
}

export default LienUtile

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingTop: 60,
        paddingBottom: 20,
        paddingHorizontal: 20,
        backgroundColor: 'red',
        color: 'white',
        borderBottomWidth: 1,
        borderBottomColor: '#E0E0E0',
    },
    backButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10,
        color: 'white',
    },
    headerTitle: {
        fontSize: 32,
        fontWeight: 'bold',
        color: 'white',
    },
    headerCenter: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerRight: {
        width: 40,
    },
    logo: {
        width: 30,
        height: 30,
        tintColor: '#FFFFFF',
    },
    content: {
        flex: 1,
        padding: 20,
        justifyContent: 'center',
    },
})