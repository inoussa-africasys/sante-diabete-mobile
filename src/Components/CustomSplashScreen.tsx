import React from 'react';
import { View, StyleSheet, Dimensions, ImageBackground, Text } from 'react-native';
import { Image } from 'expo-image';

const { width, height } = Dimensions.get('window');

interface CustomSplashScreenProps {
  isVisible: boolean;
}

const CustomSplashScreen: React.FC<CustomSplashScreenProps> = ({ isVisible }) => {
  if (!isVisible) return null;
  
  return (
    <View style={styles.container}>
      <View style={styles.background}>
        {/* Fond rouge plein écran */}
        <View style={styles.redBackground} />
        
        {/* Logo et texte centrés */}
        <View style={styles.contentContainer}>
          <Image
            source={require('../../assets/images/splash-icon.png')}
            style={styles.image}
            contentFit="contain"
          />
          <Text style={styles.text}>Santé Diabète</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    zIndex: 999,
    width: '100%',
    height: '100%',
    flex: 1,
  },
  background: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  redBackground: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    backgroundColor: '#FF0000',
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: width * 0.7,
    height: height * 0.4,
  },
  text: {
    marginTop: 20,
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
  }
});

export default CustomSplashScreen;
