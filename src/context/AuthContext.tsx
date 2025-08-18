import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { ACTIVE_DIABETE_TYPE_KEY, AUTH_BASE_URL_KEY, VERSION_NAME } from '../Constants/App';
import { getAuthTokenKey } from '../functions';
import { getUserNameKey } from '../functions/qrcodeFunctions';
import { DiabeteType } from '../types/enums';
import Logger from '../utils/Logger';
import { AuthContextType, AuthProviderProps, LoginParams, LogoutParams } from './AuthTypes';
import { useDiabetes } from './DiabetesContext';

// plus d'utilisation de TanStack React Query

const AuthContext = createContext<AuthContextType | undefined>(undefined);

async function validateTokenOnLine(baseUrl: string, token: string): Promise<boolean> {
    try {
        const url = `${baseUrl}/api/json/mobile/authenticate?app_version=${VERSION_NAME}&token=${token}`;
        const response = await axios.post(url, undefined, { headers: { 'Content-Type': 'application/json' } });
        Logger.info('↔️ Token validated on line', {status: response.status, statusText: response.statusText,data: response.data});
        console.log('↔️ Token validated on line', {status: response.status, statusText: response.statusText,data: response.data});
        return response.status === 200;

    } catch (e) {
        Logger.error('Erreur lors de la validation en ligne du token', { error: e });
        return false;
    }
}

async function validateTokenOffline(activeDiabetesType :DiabeteType ): Promise<boolean> {    
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
    const { diabetesType } = useDiabetes();
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
    const [isAuthenticatedState, setIsAuthenticatedState] = useState(false);
    
    // Plus de lecture directe du type depuis SecureStore ici: on s'aligne sur DiabetesContext

    // Vérifie l'état d'authentification (offline)
    const checkAuth = useCallback(async (): Promise<boolean> => {
        if (!diabetesType) {
            console.error('No active diabetes type found');
            Logger.error('No active diabetes type found');
            setIsAuthenticated(false);
            setIsAuthenticatedState(false);
            return false;
        }
        const ok = await validateTokenOffline(diabetesType as DiabeteType);
        setIsAuthenticated(ok);
        setIsAuthenticatedState(ok);
        return ok;
    }, [diabetesType]);

    // Permet de rafraîchir explicitement l'état en fonction du type courant
    const refreshDiabetesType = useCallback(() => {
        checkAuth();
    }, [checkAuth]);

    // Permet de forcer la vérification à la demande
    const getIsAuthenticated = async (): Promise<boolean> => {
        try {
            return await checkAuth();
        } catch (e) {
            Logger.error('Erreur lors de la vérification d\'authentification', { error: e });
            return false;
        }
    };

    // Vérifier/recharger l'auth hors-ligne à la demande (alias pratique)
    const checkAuthOffline = useCallback(async (): Promise<boolean> => {
        return await checkAuth();
    }, [checkAuth]);

    // Connexion (validation en ligne via Axios, puis stockage local)
    const login = async ({ baseUrl, token, diabetesType, userName }: LoginParams): Promise<boolean> => {
        const isValid = await validateTokenOnLine(baseUrl, token);
        if (isValid) {
            await SecureStore.setItemAsync(getAuthTokenKey(diabetesType), token);
            await SecureStore.setItemAsync(AUTH_BASE_URL_KEY, baseUrl);
            await SecureStore.setItemAsync(getUserNameKey(diabetesType), userName);
            setIsAuthenticated(true);
            setIsAuthenticatedState(true);
            return true;
        }
        return false;
    };
    // Mutation pour la déconnexion
    // Déconnexion
    const logout = async ({ diabetesType }: LogoutParams): Promise<boolean> => {
        await SecureStore.deleteItemAsync(getAuthTokenKey(diabetesType));
        await SecureStore.deleteItemAsync(AUTH_BASE_URL_KEY);
        await SecureStore.deleteItemAsync(getUserNameKey(diabetesType));
        await SecureStore.deleteItemAsync(ACTIVE_DIABETE_TYPE_KEY);
        setIsAuthenticated(false);
        setIsAuthenticatedState(false);
        return true;
    };

    // Fonction pour récupérer le token
    const getToken = async (): Promise<string | null> => {
        try {
            // Use diabetesType from context
            const activeType = diabetesType;            
            if (!activeType) {
                console.error('No active diabetes type found');
                Logger.error('No active diabetes type found');
                return null;
            }

            const token = await SecureStore.getItemAsync(getAuthTokenKey(activeType as DiabeteType));
            if (!token) {
                console.error('No token found for diabetes type:', activeType);
                Logger.error('No token found for diabetes type:', {activeDiabetesType: activeType});
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
            if (diabetesType) {
                try {
                    const storedUserName = await SecureStore.getItemAsync(getUserNameKey(diabetesType as DiabeteType));
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
        
        fetchUserName();
        // Vérifier auth à chaque changement de type
        checkAuth();
    }, [diabetesType, checkAuth]);

    // Vérification initiale au montage
    useEffect(() => {
        (async () => {
            await checkAuth();
        })();
    }, [checkAuth]);
    
    // Function to get username that matches the interface requirement
    const userName = async (): Promise<string | null> => {
        if (currentUserName) return currentUserName;
        
        try {
            const activeType = diabetesType;
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


    const splashScreenCheckOnlineAuth = useCallback(async (): Promise<boolean> => {
        console.log(' ↔️ Splash screen check online auth');
        if (!diabetesType) {
            console.error('No active diabetes type found');
            Logger.error('No active diabetes type found');
            return false;
        }

        const baseUrl = await SecureStore.getItemAsync(AUTH_BASE_URL_KEY);
        const token = await SecureStore.getItemAsync(getAuthTokenKey(diabetesType as DiabeteType));

        if (!baseUrl || !token) {
            console.error('No baseUrl or token found');
            Logger.error('No baseUrl or token found');
            return false;
        }
        const ok = await validateTokenOnLine(baseUrl, token);
        setIsAuthenticated(ok);
        setIsAuthenticatedState(ok);
        return ok;
    }, [diabetesType]);

    


    const value : AuthContextType = {
        isAuthenticated,
        checkAuthOffline,
        getIsAuthenticated,
        login,
        logout,
        getToken,
        userName,
        refreshDiabetesType,
        isAuthenticatedState,
        splashScreenCheckOnlineAuth,
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
