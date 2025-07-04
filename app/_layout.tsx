import { AuthProvider } from '@/src/context/AuthContext';
import { Migration } from '@/src/core/database/migrations';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import { View } from "react-native";
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

  // Fonction appelée quand l'animation du splash est terminée
  const handleSplashComplete = () => {
    setShowSplash(false);
  };

  useEffect(() => {
    async function prepare() {
      // Migration.resetDatabase();  
      // Simuler un chargement, ex: chargement de polices, données, etc.
      
      try {
        // Initialiser la configuration
        await initConfig();
        console.log('Configuration initialisée avec succès');
        
        await new Promise(resolve => {
          setTimeout(resolve, 2000);
          initDB();
        });
        
        setAppReady(true);
      } catch (error) {
        console.error('Erreur lors de l\'initialisation de l\'application:', error);
      }
    }
    
    prepare();
  }, []);



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
                      headerShown : false
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