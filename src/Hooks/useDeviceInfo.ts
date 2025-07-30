import * as Device from 'expo-device';
import { useEffect, useState } from 'react';

interface DeviceInfo {
  brand: string | null;
  modelName: string | null;
  osVersion: string | null;
  manufacturer: Device.DeviceType | null;
  deviceName: string | null;
  osName: string | null;
  totalMemory: number | null;
  isDevice: boolean | null;
}

const useDeviceInfo = (): DeviceInfo => {
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo>({
    brand: null,
    modelName: null,
    osVersion: null,
    manufacturer: null,
    deviceName: null,
    osName: null,
    totalMemory: null,
    isDevice: null,
  });

  useEffect(() => {
    const fetchDeviceInfo = async () => {
      try {
        const manufacturer = await Device.getDeviceTypeAsync();

        setDeviceInfo({
          brand: Device.brand ?? null,
          modelName: Device.modelName ?? null,
          osVersion: Device.osVersion ?? null,
          manufacturer: manufacturer ?? null,
          deviceName: Device.deviceName ?? null,
          osName: Device.osName ?? null,
          totalMemory: Device.totalMemory ?? null,
          isDevice: Device.isDevice ?? null,
        });
      } catch (error) {
        console.error('Erreur lors de la récupération des infos appareil :', error);
      }
    };

    fetchDeviceInfo();
  }, []);

  return deviceInfo;
};

export default useDeviceInfo;
