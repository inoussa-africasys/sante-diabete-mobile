import * as Network from 'expo-network';
import { useEffect, useState } from 'react';

export const useIsOnline = (): boolean => {
  const [isOnline, setIsOnline] = useState<boolean>(false);

  const checkConnection = async (): Promise<void> => {
    try {
      const status: Network.NetworkState = await Network.getNetworkStateAsync();

      // Certaines plateformes peuvent retourner `null`, on s'assure que ce n'est pas explicitement faux
      const isConnected = status.isConnected ?? false;
      const isInternetReachable = status.isInternetReachable !== false;

      setIsOnline(isConnected && isInternetReachable);
    } catch (error) {
      console.error('Erreur réseau :', error);
      setIsOnline(false);
    }
  };

  useEffect(() => {
    checkConnection(); // Initial check

    const interval = setInterval(checkConnection, 5000); // Check every 5s
    return () => clearInterval(interval);
  }, []);

  return isOnline;
};
