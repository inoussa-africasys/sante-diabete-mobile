import { AntDesign, Feather, MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Modal } from './Modal';

interface AlertModalProps {
    isVisible: boolean;
    onClose: () => void;
    title: string;
    message: string;
    type?: 'success' | 'error' | 'info' | 'warning';
    confirmText?: string;
    customIcon?: React.ReactNode;
}

export const AlertModal: React.FC<AlertModalProps> = ({
    isVisible,
    onClose,
    title,
    message,
    type = 'info',
    confirmText = 'OK',
    customIcon,
}) => {
    const getTypeConfig = () => {
        switch (type) {
            case 'success':
                return {
                    color: '#4CAF50',
                    icon: <AntDesign name="checkcircle" size={32} color="white" />
                };
            case 'error':
                return {
                    color: '#F44336',
                    icon: <MaterialIcons name="error" size={32} color="white" />
                };
            case 'warning':
                return {
                    color: '#FF9800',
                    icon: <Feather name="alert-triangle" size={32} color="white" />
                };
            default:
                return {
                    color: '#2196F3',
                    icon: <Feather name="info" size={32} color="white" />
                };
        }
    };

    const typeConfig = getTypeConfig();

    return (
        <Modal isVisible={isVisible} onClose={onClose}>
            <View style={styles.container}>
                <View style={[styles.header, { backgroundColor: typeConfig.color }]}>
                    <Text style={styles.title}>{title}</Text>
                </View>
                <View style={styles.iconContainer}>
                    <View style={styles.iconAndTextContainer}>
                        {customIcon || typeConfig.icon}
                        <Text style={styles.message}>{message}</Text>
                    </View>
                </View>
                <TouchableOpacity
                    style={[styles.button, { backgroundColor: typeConfig.color }]}
                    onPress={onClose}
                >
                    <Text style={styles.buttonText}>{confirmText}</Text>
                </TouchableOpacity>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: 'white',
        borderRadius: 10,
        width: '100%',
        maxWidth: 500,
        overflow: 'hidden',
    },
    header: {
        padding: 15,
        alignItems: 'center',
    },
    iconContainer: {
        marginBottom: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    iconAndTextContainer: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    title: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
    },
    message: {
        padding: 20,
        fontSize: 16,
        textAlign: 'center',
    },
    button: {
        padding: 10,
        alignItems: 'center',
        marginHorizontal: 20,
        marginBottom: 20,
        borderRadius: 5,
    },
    buttonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
});
