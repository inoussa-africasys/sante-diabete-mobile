import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { Text } from 'react-native';

export default function SplashScreen() {
  return (
    <View style={styles.container}>
      <Image
        source={require('./images/splash-icon.png')}
        style={styles.logo}
        contentFit="contain"
      />
      <Text style={styles.text}>Santé Diabète</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FF0000',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 200,
    height: 200,
  },
  text: {
    marginTop: 20,
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
  }
});
