import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as SecureStore from 'expo-secure-store';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { ACTIVE_DIABETE_TYPE_KEY, AUTH_BASE_URL_KEY, VERSION_NAME } from '../Constants/App';
import { getAuthTokenKey } from '../functions';
import { getUserNameKey } from '../functions/qrcodeFunctions';
import { DiabeteType } from '../types/enums';
import Logger from '../utils/Logger';
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
    const USER_NAME_KEY = getUserNameKey(activeDiabetesType as DiabeteType);
    
    const token = await SecureStore.getItemAsync(AUTH_TOKEN_KEY);
    const userName = await SecureStore.getItemAsync(USER_NAME_KEY);
    const baseUrl = await SecureStore.getItemAsync(AUTH_BASE_URL_KEY);
    
    // Only return true if both token, username and baseUrl exist
    if (token && userName && baseUrl) {
        return true;
    }
    
    Logger.error('Authentication validation failed', { 
        hasToken: !!token, 
        hasUserName: !!userName, 
        hasBaseUrl: !!baseUrl,
        diabetesType: activeDiabetesType 
    });
    return false;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const queryClient = useQueryClient();
    const [activeDiabetesType, setActiveDiabetesType] = useState<DiabeteType | null>(null);

    const checkActiveDiabetesType = async () => {
        try {
            const storedType = await SecureStore.getItemAsync(ACTIVE_DIABETE_TYPE_KEY);
            if (storedType && storedType !== activeDiabetesType) {
                console.log('Diabetes type changed to:', storedType);
                setActiveDiabetesType(storedType as DiabeteType);
            } else if (!storedType && activeDiabetesType) {
                // Reset if diabetes type was removed
                setActiveDiabetesType(null);
            }
        } catch (error) {
            console.error('Error checking diabetes type:', error);
            Logger.error('Error checking diabetes type', { error });
        }
    };
    
    const refreshDiabetesType = () => {
        checkActiveDiabetesType();
    };

    // Requête pour vérifier l'état d'authentification
    const { data: isAuthenticated = false } = useQuery({
        queryKey: [AUTH_QUERY_KEY, activeDiabetesType],
        queryFn: async () => {
            if (!activeDiabetesType) {
                console.error('No active diabetes type found');
                Logger.error('No active diabetes type found');
                return false;
            }

            return validateToken(activeDiabetesType);
        },
        enabled: activeDiabetesType !== null,
    });

    // Mutation pour la connexion
    const { mutateAsync: login } = useMutation({
        mutationFn: async ({ baseUrl, token,diabetesType,userName }: LoginParams) => {
            const isValid = await validateTokenOnLine(baseUrl, token);
            if (isValid) {
                await SecureStore.setItemAsync(getAuthTokenKey(diabetesType), token);
                await SecureStore.setItemAsync(AUTH_BASE_URL_KEY, baseUrl);
                await SecureStore.setItemAsync(getUserNameKey(diabetesType), userName);
                return true;
            }            
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
            await SecureStore.deleteItemAsync(getUserNameKey(diabetesType));
            await SecureStore.deleteItemAsync(ACTIVE_DIABETE_TYPE_KEY); 
            return true;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: AUTH_QUERY_KEY });
        },
    });

    // Fonction pour récupérer le token
    const getToken = async (): Promise<string | null> => {
        try {
            // Get active diabetes type from secure storage
            const activeDiabetesType = await SecureStore.getItemAsync(ACTIVE_DIABETE_TYPE_KEY);            
            if (!activeDiabetesType) {
                console.error('No active diabetes type found');
                Logger.error('No active diabetes type found');
                return null;
            }

            const token = await SecureStore.getItemAsync(getAuthTokenKey(activeDiabetesType as DiabeteType));
            if (!token) {
                console.error('No token found for diabetes type:', activeDiabetesType);
                Logger.error('No token found for diabetes type:', {activeDiabetesType});
                return null;
            }

            return token;
        } catch (error) {
            console.error('Erreur lors de la récupération du token:', error);
            Logger.error('Erreur lors de la récupération du token:', {error});
            return null;
        }
    };

    // State for userName to be used in the context
    const [currentUserName, setCurrentUserName] = useState<string | null>(null);

    // Update userName when activeDiabetesType changes
    useEffect(() => {
        const fetchUserName = async () => {
            if (activeDiabetesType) {
                try {
                    const storedUserName = await SecureStore.getItemAsync(getUserNameKey(activeDiabetesType));
                    setCurrentUserName(storedUserName);
                    console.log('Username updated:', storedUserName);
                } catch (error) {
                    console.error('Error fetching username:', error);
                    Logger.error('Error fetching username', { error });
                }
            } else {
                setCurrentUserName(null);
            }
        };
        
        checkActiveDiabetesType();
        fetchUserName();
    }, [activeDiabetesType]);
    
    // Function to get username that matches the interface requirement
    const userName = async (): Promise<string | null> => {
        if (currentUserName) return currentUserName;
        
        try {
            const activeType = await SecureStore.getItemAsync(ACTIVE_DIABETE_TYPE_KEY);
            
            if (!activeType) {
                console.error('No active diabetes type found');
                Logger.error('No active diabetes type found');
                return null;
            }

            const storedUserName = await SecureStore.getItemAsync(getUserNameKey(activeType as DiabeteType));
            if (!storedUserName) {
                console.error('No userName found for diabetes type:', activeType);
                Logger.error('No userName found for diabetes type:', {activeDiabetesType: activeType});
                return null;
            }

            return storedUserName;
        } catch (error) {
            console.error('Erreur lors de la récupération du userName:', error);
            Logger.error('Erreur lors de la récupération du userName:', {error});
            return null;
        }
    };


    const value : AuthContextType = {
        isAuthenticated,
        login,
        logout,
        getToken,
        userName,
        refreshDiabetesType
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
