import { AntDesign, Feather, MaterialIcons } from '@expo/vector-icons';
import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastProps {
    visible: boolean;
    message: string;
    type?: ToastType;
    duration?: number;
    onHide?: () => void;
    // Actions optionnelles pour confirmation
    onConfirm?: () => void;
    onCancel?: () => void;
    confirmLabel?: string;
    cancelLabel?: string;
    // Bouton de fermeture manuel (croix)
    showClose?: boolean;
    onClose?: () => void;
    // Si true, désactive l'auto-hide jusqu'à action utilisateur
    persistent?: boolean;
}

export const Toast: React.FC<ToastProps> = ({
    visible,
    message,
    type = 'info',
    duration = 3000,
    onHide,
    onConfirm,
    onCancel,
    confirmLabel = 'Oui',
    cancelLabel = 'Non',
    showClose = false,
    onClose,
    persistent = false,
}) => {
    const translateY = useRef(new Animated.Value(-100)).current;
    const opacity = useRef(new Animated.Value(0)).current;

    const getTypeConfig = () => {
        switch (type) {
            case 'success':
                return {
                    color: '#4CAF50',
                    icon: <AntDesign name="checkcircle" size={24} color="white" />,
                };
            case 'error':
                return {
                    color: '#F44336',
                    icon: <MaterialIcons name="error" size={24} color="white" />,
                };
            case 'warning':
                return {
                    color: '#FF9800',
                    icon: <Feather name="alert-triangle" size={24} color="white" />,
                };
            default:
                return {
                    color: '#2196F3',
                    icon: <Feather name="info" size={24} color="white" />,
                };
        }
    };

    useEffect(() => {
        if (visible) {
            // Animate in
            Animated.parallel([
                Animated.timing(translateY, {
                    toValue: 0,
                    duration: 300,
                    useNativeDriver: true,
                }),
                Animated.timing(opacity, {
                    toValue: 1,
                    duration: 300,
                    useNativeDriver: true,
                }),
            ]).start();

            // Auto-hide uniquement si non persistant
            if (!persistent) {
                const timer = setTimeout(() => {
                    Animated.parallel([
                        Animated.timing(translateY, {
                            toValue: -100,
                            duration: 300,
                            useNativeDriver: true,
                        }),
                        Animated.timing(opacity, {
                            toValue: 0,
                            duration: 300,
                            useNativeDriver: true,
                        }),
                    ]).start(() => {
                        onHide?.();
                    });
                }, duration);
                return () => clearTimeout(timer);
            }
        }
    }, [visible, duration, onHide, persistent, translateY, opacity]);

    const typeConfig = getTypeConfig();

    if (!visible) return null;

    return (
        <Animated.View
            style={[
                styles.container,
                {
                    backgroundColor: typeConfig.color,
                    transform: [{ translateY }],
                    opacity,
                },
            ]}
        >
            {showClose && (
                <TouchableOpacity
                    onPress={() => {
                        // animate out puis callbacks
                        Animated.parallel([
                            Animated.timing(translateY, {
                                toValue: -100,
                                duration: 300,
                                useNativeDriver: true,
                            }),
                            Animated.timing(opacity, {
                                toValue: 0,
                                duration: 300,
                                useNativeDriver: true,
                            }),
                        ]).start(() => {
                            onClose?.();
                            onHide?.();
                        });
                    }}
                    style={styles.closeButton}
                    accessibilityRole="button"
                    accessibilityLabel="Fermer"
                >
                    <AntDesign name="close" size={18} color="white" />
                </TouchableOpacity>
            )}

            <View style={styles.content}>
                <View style={styles.iconContainer}>{typeConfig.icon}</View>
                <Text style={styles.message}>{message}</Text>
            </View>

            {(onConfirm || onCancel) && (
                <View style={styles.actions}>
                    {onCancel && (
                        <TouchableOpacity
                            style={[
                                styles.actionBtn,
                                type === 'warning' ? styles.cancelBtnWarning : styles.cancelBtn,
                            ]}
                            onPress={() => {
                                Animated.parallel([
                                    Animated.timing(translateY, {
                                        toValue: -100,
                                        duration: 300,
                                        useNativeDriver: true,
                                    }),
                                    Animated.timing(opacity, {
                                        toValue: 0,
                                        duration: 300,
                                        useNativeDriver: true,
                                    }),
                                ]).start(() => {
                                    onCancel?.();
                                    onHide?.();
                                });
                            }}
                            accessibilityRole="button"
                            accessibilityLabel={cancelLabel}
                        >
                            <Text style={styles.actionText}>{cancelLabel}</Text>
                        </TouchableOpacity>
                    )}
                    {onConfirm && (
                        <TouchableOpacity
                            style={[
                                styles.actionBtn,
                                type === 'warning' ? styles.confirmBtnWarning : styles.confirmBtn,
                            ]}
                            onPress={() => {
                                Animated.parallel([
                                    Animated.timing(translateY, {
                                        toValue: -100,
                                        duration: 300,
                                        useNativeDriver: true,
                                    }),
                                    Animated.timing(opacity, {
                                        toValue: 0,
                                        duration: 300,
                                        useNativeDriver: true,
                                    }),
                                ]).start(() => {
                                    onConfirm?.();
                                    onHide?.();
                                });
                            }}
                            accessibilityRole="button"
                            accessibilityLabel={confirmLabel}
                        >
                            <Text style={styles.actionText}>{confirmLabel}</Text>
                        </TouchableOpacity>
                    )}
                </View>
            )}
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        top: 50,
        left: 0,
        right: 0,
        margin: 16,
        padding: 16,
        borderRadius: 8,
        elevation: 6,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 3,
        },
        shadowOpacity: 0.27,
        shadowRadius: 4.65,
        zIndex: 100000,
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconContainer: {
        marginRight: 12,
    },
    message: {
        color: 'white',
        fontSize: 14,
        flex: 1,
    },
    actions: {
        marginTop: 12,
        flexDirection: 'row',
        justifyContent: 'flex-end',
        gap: 8,
    },
    actionBtn: {
        paddingVertical: 8,
        paddingHorizontal: 14,
        borderRadius: 6,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.7)',
        marginLeft: 8,
    },
    confirmBtn: {
        backgroundColor: 'rgba(255,255,255,0.15)',
    },
    cancelBtn: {
        backgroundColor: 'transparent',
    },
    // Styles spécifiques pour le type 'warning'
    confirmBtnWarning: {
        backgroundColor: '#4CAF50', // vert
        borderColor: 'transparent',
    },
    cancelBtnWarning: {
        backgroundColor: '#9E9E9E', // gris
        borderColor: 'transparent',
    },
    actionText: {
        color: 'white',
        fontSize: 14,
        fontWeight: '600',
    },
    closeButton: {
        position: 'absolute',
        top: 8,
        right: 8,
        padding: 4,
    },
});
