import SplashScreen from '@/src/Components/SplashScreen';
import { AuthProvider } from '@/src/context/AuthContext';
import { Migration } from '@/src/core/database/migrations';
import useConfigStore from '@/src/core/zustand/configStore';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import * as LocalAuthentication from 'expo-local-authentication';
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import { Button, Dimensions, StyleSheet, Text, View } from "react-native";
import "../assets/css/global.css";
import FullScreenSplash from "../src/Components/FullScreenSplash";
import { ToastProvider } from '../src/Components/Toast/ToastProvider';
import { initConfig } from '../src/Config';
import { DiabetesProvider } from '../src/context/DiabetesContext';
import { PreferencesProvider } from '../src/context/PreferencesContext';

const queryClient = new QueryClient();

export default function RootLayout() {
  const [isAppReady, setAppReady] = useState(false);
  const [showSplash, setShowSplash] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const fingerprintEnabled = useConfigStore((state) => state.fingerprint);
  const pinAtStartup = useConfigStore((state) => state.pinAtStartup);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');


  const handleSplashComplete = () => {
    setShowSplash(false);
  };

  useEffect(() => {
    async function prepare() {
      //Migration.resetDatabase();
      //await resetAllFilesOnTraficFolder();  
      // Simuler un chargement, ex: chargement de polices, données, etc.

      try {
        // Initialiser la configuration
        await initConfig();
        console.log('Configuration initialisée avec succès');
        
        await initDB();

        setAppReady(true);
      } catch (error) {
        console.error('Erreur lors de l\'initialisation de l\'application:', error);
      }
    }

    prepare();
  }, []);

  useEffect(() => {
    const authenticate = async () => {
      if (!fingerprintEnabled && !pinAtStartup) {
        setAuthenticated(true);
        await new Promise(resolve => setTimeout(resolve, 5000));
        setLoading(false);
        return;
      }

      try {
        const hasHardware = await LocalAuthentication.hasHardwareAsync();
        const isEnrolled = await LocalAuthentication.isEnrolledAsync();

        if (!hasHardware || !isEnrolled) {
          setError("Aucune méthode d'authentification n'est configurée sur cet appareil.");
          setLoading(false);
          return;
        }

        const result = await LocalAuthentication.authenticateAsync({
          promptMessage: 'Déverrouillez l’application',
          fallbackLabel: 'Utiliser le code de l’appareil',
          cancelLabel: 'Annuler',
          disableDeviceFallback: false,
        });

        if (result.success) {
          setAuthenticated(true);
        } else {
          setError('Échec ou annulation de l’authentification.');
        }
      } catch (err ) {
        setError('Erreur lors de l’authentification.');
      }

      await new Promise(resolve => setTimeout(resolve, 5000));
      setLoading(false);
    };

    authenticate();
  }, [fingerprintEnabled, pinAtStartup]);

  if (loading) {
    return (
      <SplashScreen />
     /*  <View style={styles.content}>
        <Image
          source={require('../assets/images/splash-icon-v2.png')}
          style={styles.image}
          contentFit="contain"
        />
        <View style={styles.versionContainer}>
          <ActivityIndicator size="large" color="#fff" />
          <Text style={styles.versionText}>Version : {version}</Text>
        </View>
      </View> */
    );
  }

  if (!authenticated) {
    return (
      <View style={styles.centered}>
        <Text>{error}</Text>
        <Button title="Réessayer" onPress={() => {
          setLoading(true);
          setError('');
          setAuthenticated(false); // redéclenche l'authent
        }} />
      </View>
    );
  }








  return (
    <View style={{ flex: 1 }}>
      <StatusBar style="light" />
      {showSplash && <FullScreenSplash onAnimationComplete={handleSplashComplete} />}
      {isAppReady &&
        <QueryClientProvider client={queryClient}>
          <PreferencesProvider>
            <DiabetesProvider>
              <AuthProvider>
                <ToastProvider>
                  <Stack screenOptions={{
                    headerShown: false
                  }} />
                </ToastProvider>
              </AuthProvider>
            </DiabetesProvider>
          </PreferencesProvider>
        </QueryClientProvider>
      }
    </View>
  );
}



const initDB = () => {
  Migration.initialize();
}


const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
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
  versionText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  versionContainer: {
    bottom: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
});