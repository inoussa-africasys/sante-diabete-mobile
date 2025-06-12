import { AntDesign, Feather, MaterialIcons } from '@expo/vector-icons';
import React, { useEffect } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';

type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastProps {
    visible: boolean;
    message: string;
    type?: ToastType;
    duration?: number;
    onHide?: () => void;
}

export const Toast: React.FC<ToastProps> = ({
    visible,
    message,
    type = 'info',
    duration = 3000,
    onHide,
}) => {
    const translateY = new Animated.Value(-100);
    const opacity = new Animated.Value(0);

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
                    if (onHide) {
                        onHide();
                    }
                });
            }, duration);

            return () => clearTimeout(timer);
        }
    }, [visible, duration, onHide]);

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
            <View style={styles.content}>
                <View style={styles.iconContainer}>{typeConfig.icon}</View>
                <Text style={styles.message}>{message}</Text>
            </View>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        top: 0,
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
        zIndex: 1000,
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
        fontSize: 16,
        flex: 1,
    },
});
