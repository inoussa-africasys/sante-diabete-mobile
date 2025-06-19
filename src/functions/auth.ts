import { getItemAsync } from "expo-secure-store";
import { ACTIVE_DIABETE_TYPE_KEY, AUTH_BASE_URL_KEY } from "../Constants/App";
import { DiabeteType } from "../types/enums";
import { getAuthTokenKey, getUserNameKey } from "./qrcodeFunctions";

export const getToken = async (): Promise<string> => {
    const token = await getItemAsync(getAuthTokenKey(await getDiabetesType()));
    if (!token) {
        throw new Error('No token found');
    }
    return token ;
};


export const getBaseUrl = async (): Promise<string> => {
    const baseUrl = await getItemAsync(AUTH_BASE_URL_KEY);
    if (!baseUrl) {
        throw new Error('No baseUrl found');
    }
    return baseUrl ;
};


export const getDiabetesType = async (): Promise<DiabeteType> => {
    const type_diabete = await getItemAsync(ACTIVE_DIABETE_TYPE_KEY);
    if (!type_diabete) {
        throw new Error('No type_diabete found');
    }
    return type_diabete as DiabeteType ;
};

export const getConnectedUsername = async (): Promise<string> => {
    const connectedUsername = await getItemAsync(getUserNameKey(await getDiabetesType()));
    if (!connectedUsername) {
        throw new Error('No connectedUsername found');
    }
    return connectedUsername ;
};

