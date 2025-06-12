import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { Modal } from './Modal';

interface LoadingModalProps {
    isVisible: boolean;
    message?: string;
    color?: string;
    size?: 'small' | 'large';
}

export const LoadingModal: React.FC<LoadingModalProps> = ({
    isVisible,
    message = 'Veuillez patienter...',
    color = '#2196F3',
    size = 'large'
}) => {
    return (
        <Modal 
            isVisible={isVisible}
            onClose={() => {}}
            blurIntensity={30}
        >
            <View style={styles.container}>
                <ActivityIndicator size={size} color={color} />
                <Text style={[styles.message, { color }]}>{message}</Text>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: 'white',
        padding: 20,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: 200,
    },
    message: {
        marginTop: 15,
        fontSize: 16,
        textAlign: 'center',
        fontWeight: '500',
    },
});
