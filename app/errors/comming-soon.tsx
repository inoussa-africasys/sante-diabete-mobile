import { Images } from '@/src/Constants/Images'
import { Ionicons } from '@expo/vector-icons'
import { Image } from 'expo-image'
import { router } from 'expo-router'
import React from 'react'
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'

type CommingSoonProps = {
    onBack: () => void
}
const CommingSoon = ({ onBack }: CommingSoonProps) => {
    return (
        <View style={styles.container}>
            <TouchableOpacity style={styles.headerBackButton} onPress={onBack || (() => { router.back() })}>
                <Ionicons name="arrow-back" size={24} color="#000" />
            </TouchableOpacity>
            <Image style={styles.image} source={Images.commingSoon} />
            <Text style={styles.text}>Cette fonctionnalité est en cours de développement</Text>
            <TouchableOpacity style={styles.backButton} onPress={onBack || (() => { router.back() })}>
                <Text style={styles.backText}>Retour</Text>
            </TouchableOpacity>
        </View>
    )
}

export default CommingSoon

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    image: {
        width: 200,
        height: 200
    },
    text: {
        fontSize: 20,
        fontWeight: 'bold',
        marginHorizontal : 20,
        textAlign : 'center'
    },
    backButton: {
        marginTop: 20,
        paddingVertical: 10,
        paddingHorizontal: 20,
        backgroundColor: '#FF0000',
        borderRadius: 5,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        
    },
    backText: {
        fontSize: 20,
        fontWeight: 'bold',
        textAlign: 'center',
        color: 'white'
    },
    headerBackButton : {
        position : 'absolute',
        top : 30,
        left : 30,
        width : 50,
        height : 50,
        borderRadius : 100,
        justifyContent : 'center',
        alignItems : 'center',
        backgroundColor : '#00000022',

    }
})