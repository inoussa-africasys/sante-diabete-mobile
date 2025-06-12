import { Feather, MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Modal } from './Modal';

interface ConfirmModalProps {
    isVisible: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    type?: 'danger' | 'warning' | 'info';
    confirmText?: string;
    cancelText?: string;
    customIcon?: React.ReactNode;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
    isVisible,
    onClose,
    onConfirm,
    title,
    message,
    type = 'info',
    confirmText = 'Confirmer',
    cancelText = 'Annuler',
    customIcon,
}) => {
    const getTypeConfig = () => {
        switch (type) {
            case 'danger':
                return {
                    color: '#F44336',
                    icon: <MaterialIcons name="warning" size={100} color="#333" />,
                    background: '#F44336',
                    button: '#D32F2F',
                };
            case 'warning':
                return {
                    color: '#FF9800',
                    icon: <Feather name="alert-triangle" size={100} color="#333" />,
                    background: '#FF9800',
                    button: '#F57C00',
                };
            default:
                return {
                    color: '#2196F3',
                    icon: <Feather name="help-circle" size={100} color="#333" />,
                    background: '#2196F3',
                    button: '#1976D2',
                };
        }
    };

    const colors = getTypeConfig();

    return (
        <Modal isVisible={isVisible} onClose={onClose}>
            <View style={styles.container}>
                <View style={[styles.header, { backgroundColor: colors.background }]}>
                    <Text style={styles.title}>{title}</Text>
                </View>
                <View style={styles.iconAndTextContainer}>
                    <View style={styles.iconContainer}>
                        {customIcon || colors.icon}
                    </View>
                    <Text style={styles.message}>{message}</Text>
                </View>
                <View style={styles.buttonContainer}>
                    <TouchableOpacity
                        style={[styles.button, styles.cancelButton]}
                        onPress={onClose}
                    >
                        <Text style={styles.cancelButtonText}>{cancelText}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.button, styles.confirmButton, { backgroundColor: colors.button }]}
                        onPress={() => {
                            onConfirm();
                            onClose();
                        }}
                    >
                        <Text style={styles.confirmButtonText}>{confirmText}</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: 'white',
        borderRadius: 10,
        overflow: 'hidden',
        width: '100%',
        maxWidth: '100%',
    },
    header: {
        padding: 15,
        alignItems: 'center',
    },
    iconContainer: {
        paddingTop: 20,
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
        padding: 10,
        fontSize: 16,
        textAlign: 'center',
        color: '#333',
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 15,
    },
    button: {
        flex: 1,
        padding: 10,
        borderRadius: 5,
        marginHorizontal: 5,
        alignItems: 'center',
    },
    cancelButton: {
        backgroundColor: '#E0E0E0',
    },
    confirmButton: {
        backgroundColor: '#4CAF50',
    },
    cancelButtonText: {
        color: '#333',
        fontSize: 16,
        fontWeight: 'bold',
    },
    confirmButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
});
