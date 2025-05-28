import { Stack } from "expo-router";
import { useEffect, useState } from "react";
import { StatusBar } from "expo-status-bar";
import { View } from "react-native";
import FullScreenSplash from "../src/Components/FullScreenSplash";

export default function RootLayout() {
  const [isAppReady, setAppReady] = useState(false);
  const [showSplash, setShowSplash] = useState(true);

  // Fonction appelée quand l'animation du splash est terminée
  const handleSplashComplete = () => {
    setShowSplash(false);
  };

  useEffect(() => {
    async function prepare() {
      // Simuler un chargement, ex: chargement de polices, données, etc.
      await new Promise(resolve => setTimeout(resolve, 2000));
      setAppReady(true);
    }

    prepare();
  }, []);

  return (
    <View style={{ flex: 1 }}>
      <StatusBar style="light" />
      {showSplash && <FullScreenSplash onAnimationComplete={handleSplashComplete} />}
      {isAppReady &&
          <Stack screenOptions={{
            headerShown : false
          }} />
      }
    </View>
  );
}
