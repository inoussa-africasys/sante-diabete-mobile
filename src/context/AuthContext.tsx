import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as SecureStore from 'expo-secure-store';
import React, { createContext, useContext } from 'react';
import { VERSION_NAME } from '../Constants/App';
import { getAuthTokenKey } from '../functions';
import { DiabeteType } from '../types/enums';
import { AuthContextType, AuthProviderProps, GetTokenParams, LoginParams, LogoutParams } from './AuthTypes';

const AUTH_TOKEN_KEY = getAuthTokenKey(DiabeteType.DT1);
const AUTH_BASE_URL_KEY = 'auth_base_url';
const AUTH_QUERY_KEY = ['auth'];

const AuthContext = createContext<AuthContextType | undefined>(undefined);

async function validateToken(baseUrl: string, token: string): Promise<boolean> {
    console.log('Validation token en cours:', baseUrl, token);
    const response = await fetch(`${baseUrl}/api/json/mobile/authenticate?app_version=${VERSION_NAME}&token=${token}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
    });
    console.log('Validation token response:', response.status);
    return response.status === 200;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const queryClient = useQueryClient();

    // Requête pour vérifier l'état d'authentification
    const { data: isAuthenticated = false } = useQuery({
        queryKey: AUTH_QUERY_KEY,
        queryFn: async () => {
            const token = await SecureStore.getItemAsync(AUTH_TOKEN_KEY);
            const baseUrl = await SecureStore.getItemAsync(AUTH_BASE_URL_KEY);
            if (!token || !baseUrl) return false;
            return validateToken(baseUrl, token);
        },
    });

    // Mutation pour la connexion
    const { mutateAsync: login } = useMutation({
        mutationFn: async ({ baseUrl, token,diabetesType }: LoginParams) => {
            const isValid = await validateToken(baseUrl, token);
            if (isValid) {
                console.log('Token valide');
                await SecureStore.setItemAsync(getAuthTokenKey(diabetesType), token);
                await SecureStore.setItemAsync(AUTH_BASE_URL_KEY, baseUrl);
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
    const getToken = async ({diabetesType}: GetTokenParams): Promise<{token: string; baseUrl: string} | null> => {
        try {
            const [token, baseUrl] = await Promise.all([
                SecureStore.getItemAsync(getAuthTokenKey(diabetesType)),
                SecureStore.getItemAsync(AUTH_BASE_URL_KEY)
            ]);
            if (!token || !baseUrl) return null;
            return {token, baseUrl};
        } catch (error) {
            console.error('Erreur lors de la récupération du token:', error);
            return null;
        }
    };

    const value = {
        isAuthenticated,
        login,
        logout,
        getToken,
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
