import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as SecureStore from 'expo-secure-store';
import React, { createContext, useContext } from 'react';
import { ACTIVE_DIABETE_TYPE_KEY, AUTH_BASE_URL_KEY, VERSION_NAME } from '../Constants/App';
import { getAuthTokenKey } from '../functions';
import { getUserNameKey } from '../functions/qrcodeFunctions';
import { DiabeteType } from '../types/enums';
import { AuthContextType, AuthProviderProps, LoginParams, LogoutParams } from './AuthTypes';



const AUTH_QUERY_KEY = ['auth'];

const AuthContext = createContext<AuthContextType | undefined>(undefined);

async function validateTokenOnLine(baseUrl: string, token: string): Promise<boolean> {

    
    const response = await fetch(`${baseUrl}/api/json/mobile/authenticate?app_version=${VERSION_NAME}&token=${token}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
    });
    return response.status === 200;
}

async function validateToken(activeDiabetesType :DiabeteType ): Promise<boolean> {

    
    const AUTH_TOKEN_KEY = getAuthTokenKey(activeDiabetesType as DiabeteType);
            
    const token = await SecureStore.getItemAsync(AUTH_TOKEN_KEY);
    const baseUrl = await SecureStore.getItemAsync(AUTH_BASE_URL_KEY);
    if( token && baseUrl){
        return true
    }
    
    return false;
}





export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const queryClient = useQueryClient();

    // Requête pour vérifier l'état d'authentification
    const { data: isAuthenticated = false } = useQuery({
        queryKey: AUTH_QUERY_KEY,
        queryFn: async () => {
            const activeDiabetesType = await SecureStore.getItemAsync(ACTIVE_DIABETE_TYPE_KEY);
            if (!activeDiabetesType) {
                console.error('No active diabetes type found');
                return false;
            }

            return validateToken(activeDiabetesType as DiabeteType);
        },
    });

    // Mutation pour la connexion
    const { mutateAsync: login } = useMutation({
        mutationFn: async ({ baseUrl, token,diabetesType,userName }: LoginParams) => {
            const isValid = await validateTokenOnLine(baseUrl, token);
            if (isValid) {
                console.log('Token valide');
                await SecureStore.setItemAsync(getAuthTokenKey(diabetesType), token);
                await SecureStore.setItemAsync(AUTH_BASE_URL_KEY, baseUrl);
                await SecureStore.setItemAsync(getUserNameKey(diabetesType), userName);
                console.log('Token et URL stockés');
                return true;
            }
            console.log('Token invalide');
            return false;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: AUTH_QUERY_KEY });
        },
    });
    // Mutation pour la déconnexion
    const { mutateAsync: logout } = useMutation({
        mutationFn: async ({diabetesType}: LogoutParams) => {
            await SecureStore.deleteItemAsync(getAuthTokenKey(diabetesType));
            await SecureStore.deleteItemAsync(AUTH_BASE_URL_KEY);
            console.log('Token et URL supprimés');
            return true;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: AUTH_QUERY_KEY });
        },
    });

    // Fonction pour récupérer le token
    const getToken = async (): Promise<string | null> => {
        try {
            console.log("BEGIN getToken");
            // Get active diabetes type from secure storage
            const activeDiabetesType = await SecureStore.getItemAsync(ACTIVE_DIABETE_TYPE_KEY);
            console.log("Active diabetes type:", activeDiabetesType);
            
            if (!activeDiabetesType) {
                console.error('No active diabetes type found');
                return null;
            }

            const token = await SecureStore.getItemAsync(getAuthTokenKey(activeDiabetesType as DiabeteType));
            console.log("token:", token);

            if (!token) {
                console.error('No token found for diabetes type:', activeDiabetesType);
                return null;
            }

            return token;
        } catch (error) {
            console.error('Erreur lors de la récupération du token:', error);
            return null;
        }
    };

    const userName = async (): Promise<string | null> => {
        try {
           
            const activeDiabetesType = await SecureStore.getItemAsync(ACTIVE_DIABETE_TYPE_KEY);
            
            if (!activeDiabetesType) {
                console.error('No active diabetes type found');
                return null;
            }


            const userName = await SecureStore.getItemAsync(getUserNameKey(activeDiabetesType as DiabeteType));
            console.log("userName:", userName);

            if (!userName) {
                console.error('No userName found for diabetes type:', activeDiabetesType);
                return null;
            }

            return userName;
        } catch (error) {
            console.error('Erreur lors de la récupération du userName:', error);
            return null;
        }
    };

    const value = {
        isAuthenticated,
        login,
        logout,
        getToken,
        userName,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth doit être utilisé à l\'intérieur d\'un AuthProvider');
    }
    return context;
};
