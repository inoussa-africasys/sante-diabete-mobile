import { AuthProvider } from '@/src/context/AuthContext';
import { Migration } from '@/src/core/database/migrations';
import { PatientRepository } from '@/src/Repositories/PatientRepository';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import { View } from "react-native";
import "../assets/css/global.css";
import FullScreenSplash from "../src/Components/FullScreenSplash";
import { ToastProvider } from '../src/Components/Toast/ToastProvider';
import { DiabetesProvider } from '../src/context/DiabetesContext';

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
      /* Migration.resetDatabase(); */
      // Simuler un chargement, ex: chargement de polices, données, etc.
      await new Promise(resolve => {
        setTimeout(resolve, 2000)
        initDB();
      });
      setAppReady(true);
    }
    
    prepare();
  }, []);



  return (
    <View style={{ flex: 1 }}>
      <StatusBar style="light" />
      {showSplash && <FullScreenSplash onAnimationComplete={handleSplashComplete} />}
      {isAppReady &&
          <QueryClientProvider client={queryClient}>
            <DiabetesProvider>
              <AuthProvider>
                <ToastProvider>
                  <Stack screenOptions={{
                    headerShown : false
                  }} />
                </ToastProvider>
              </AuthProvider>
            </DiabetesProvider>
          </QueryClientProvider>
      }
    </View>
  );
}



const initDB = () => {
  Migration.initialize();

    const repo = new PatientRepository();

    const allPatients = repo.findAll();
    console.log(allPatients);
}