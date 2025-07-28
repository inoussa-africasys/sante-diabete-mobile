import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface FicheDoesntExistProps {
    ficheName: string;
    gotBack: () => void;
    text?: string;
}

const FicheDoesntExist = ({ ficheName, gotBack, text }: FicheDoesntExistProps) => {
    if(ficheName===""){
        return (
            <View style={[styles.container, styles.centerContent]}>
                <StatusBar barStyle="light-content" />
                <Ionicons name="document-text-outline" size={150} color="gray" />
                <Text style={styles.errorText}>{"La lecture de cette consultation nécessite que vous téléchargez la fiche vierge correspondante"}</Text>
                <TouchableOpacity onPress={gotBack} style={styles.btnBack}>
                    <Text style={styles.btnBackText}>Retour</Text>
                </TouchableOpacity>
            </View>
        );
    }
    return (
        <View style={[styles.container, styles.centerContent]}>
            <StatusBar barStyle="light-content" />
            <Ionicons name="document-text-outline" size={150} color="gray" />
            <Text style={styles.errorText}>{text || "La lecture de cette consultation nécessite que vous téléchargez la fiche vierge"}</Text>
            <Text style={styles.errorTextFicheName}>{ficheName}</Text>
            <TouchableOpacity onPress={gotBack} style={styles.btnBack}>
                <Text style={styles.btnBackText}>Retour</Text>
            </TouchableOpacity>
        </View>
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
    btnBack: {
        marginTop: 16,
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
        marginRight: 8,
        paddingHorizontal: 20,
        backgroundColor: 'red',
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
    btnBackText: {
        fontSize: 16,
        color: '#fff',
        fontWeight: 'bold',
    }
})