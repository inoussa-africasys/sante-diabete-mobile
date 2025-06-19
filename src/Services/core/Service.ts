import { Coordinates } from "@/src/types";
import * as Location from 'expo-location';
import BaseService from "./BaseService";

class Service extends BaseService {
    constructor() {
        super();
    }

    getToken(): string {
        return this.token;
    }

    getBaseUrl(): string {
        return this.baseUrl;
    }

    getTypeDiabete(): string {
        return this.type_diabete;
    }

    getFullUrl(path: string): string {
        return `${this.baseUrl}${path}${this.endUrl}`;
    }

    getConnectedUsername(): string {
        return this.connectedUsername;
    }


async getCurrentLocation(): Promise<Coordinates | null> {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      console.warn('Permission de localisation refusée');
      return null;
    }

    const location = await Location.getCurrentPositionAsync({});
    const { latitude, longitude } = location.coords;

    return { latitude, longitude };
  } catch (error) {
    console.error('Erreur lors de la récupération de la position :', error);
    return null;
  }
}

}

export default Service;
