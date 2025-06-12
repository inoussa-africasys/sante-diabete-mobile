import { BlurView } from 'expo-blur';
import React from 'react';
import { Modal as RNModal, StyleSheet, TouchableWithoutFeedback, useWindowDimensions } from 'react-native';
import Animated, { FadeIn, FadeOut, SlideInDown, SlideOutDown } from 'react-native-reanimated';

interface ModalProps {
    isVisible: boolean;
    onClose: () => void;
    children: React.ReactNode;
    position?: 'center' | 'bottom';
    blurIntensity?: number;
    animationDuration?: number;
}

export const Modal: React.FC<ModalProps> = ({
    isVisible,
    onClose,
    children,
    position = 'center',
    blurIntensity = 20,
    animationDuration = 500,
}) => {
    const { height } = useWindowDimensions();

    if (!isVisible) return null;

    return (
        <RNModal
            transparent
            visible={isVisible}
            onRequestClose={onClose}
            animationType="fade"
        >
            <TouchableWithoutFeedback onPress={onClose}>
                <Animated.View 
                    entering={FadeIn.duration(animationDuration)}
                    exiting={FadeOut.duration(animationDuration)}
                    style={StyleSheet.absoluteFill}
                >
                    <BlurView
                        intensity={blurIntensity}
                        style={StyleSheet.absoluteFill}
                    />
                </Animated.View>
            </TouchableWithoutFeedback>

            <TouchableWithoutFeedback>
                <Animated.View
                    entering={position === 'bottom' 
                        ? SlideInDown.duration(animationDuration)
                        : FadeIn.duration(animationDuration)
                    }
                    exiting={position === 'bottom'
                        ? SlideOutDown.duration(animationDuration)
                        : FadeOut.duration(animationDuration)
                    }
                    style={[
                        styles.contentContainer,
                        position === 'center' 
                            ? styles.centerContent 
                            : [styles.bottomContent, { maxHeight: height * 0.9 }]
                    ]}
                >
                    {children}
                </Animated.View>
            </TouchableWithoutFeedback>
        </RNModal>
    );
};

const styles = StyleSheet.create({
    contentContainer: {
        flex: 1,
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        padding: 20,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    centerContent: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    bottomContent: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        borderBottomLeftRadius: 0,
        borderBottomRightRadius: 0,
    },
});
