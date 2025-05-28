import { Image } from 'expo-image';
import React, { useState, useEffect } from 'react';
import { Animated, Dimensions, StyleSheet, View } from 'react-native';

const { width, height } = Dimensions.get('window');

interface FullScreenSplashProps {
  onAnimationComplete?: () => void;
}

const FullScreenSplash: React.FC<FullScreenSplashProps> = ({ onAnimationComplete }) => {
  // Créer la valeur d'animation en dehors du rendu
  const fadeAnim = useState(() => new Animated.Value(0))[0];
  
  useEffect(() => {
    // Animation d'entrée
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
    
    // Animation de sortie après un délai
    const timer = setTimeout(() => {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }).start(() => {
        if (onAnimationComplete) {
          onAnimationComplete();
        }
      });
    }, 2000);
    
    return () => clearTimeout(timer);
  }, [onAnimationComplete, fadeAnim]);

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <View style={styles.content}>
        <Image
          source={require('../../assets/images/splash-icon-v2.png')}
          style={styles.image}
          contentFit="contain"
        />
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
    bottom: 0,
    width: width,
    height: height,
    backgroundColor: '#FF0000',
    zIndex: 999,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: width,
    height: height,
  },
});

export default FullScreenSplash;
