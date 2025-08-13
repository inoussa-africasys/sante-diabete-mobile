import { LienUtileType } from '@/app/lien-utile'
import { Image } from 'expo-image'
import React from 'react'
import { Linking, StyleSheet, Text, TouchableOpacity, View } from 'react-native'

const LienUtileItem = ({ lienUtile }: { lienUtile: LienUtileType }) => {
    return (
        <TouchableOpacity
            style={styles.card}
            onPress={() => Linking.openURL(lienUtile.url)}
            activeOpacity={0.7}
        >
            <View style={styles.iconContainer}>
                <Image
                    source={lienUtile.icon as any}
                    style={styles.image}
                    contentFit="contain"
                />
            </View>
            <View style={styles.cardTextContainer}>
                <Text style={styles.cardTitle}>{lienUtile.title}</Text>
                <Text style={styles.cardSubtitle}>{lienUtile.url}</Text>
            </View>
        </TouchableOpacity>
    )
}

export default LienUtileItem

const styles = StyleSheet.create({
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderRadius: 8,
        padding: 16,
        marginBottom: 12,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 1.41,
        borderWidth: 1,
        borderColor: '#E0E0E0',
        marginVertical: 12,
        paddingVertical: 30,
    },
    iconContainer: {
        width: 60,
        height: 60,
        justifyContent: 'center',
        alignItems: 'center',
    },
    cardTextContainer: {
        flex: 1,
        marginLeft: 12,
        justifyContent: 'center',
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#212121',
    },
    cardSubtitle: {
        fontSize: 14,
        color: '#757575',
        marginTop: 4,
        fontStyle: 'italic',
        textDecorationLine: 'underline',
    },
    image: {
        width: 60,
        height: 60,
    },
})