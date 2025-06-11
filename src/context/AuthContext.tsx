import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as SecureStore from 'expo-secure-store';
import React, { createContext, useContext } from 'react';
import { useDiabetes } from '../context/DiabetesContext';
import { getAuthTokenKey, getBaseUrl } from '../functions/qrcodeFunctions';
import { DiabeteType } from '../types/enums';
import { AuthContextType, AuthProviderProps } from './AuthTypes';

const AUTH_QUERY_KEY = ['auth'];

const AuthContext = createContext<AuthContextType | undefined>(undefined);

async function validateToken(token: string, diabetesType: DiabeteType): Promise<boolean> {
    console.log('token test:', token);
    console.log('diabetesType test:', diabetesType);
    const baseUrl = await getBaseUrl(diabetesType);
    console.log('baseUrl test:', baseUrl);
    if (!baseUrl) return false;

    console.log('baseUrl test:', baseUrl);
    console.log('token:', token);
    const response = await fetch(`${baseUrl}/validate-token`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token }),
    });
    console.log('Response test:', response);
    return response.status === 200;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const queryClient = useQueryClient();
    const { diabetesType } = useDiabetes();

    // Requête pour vérifier l'état d'authentification
    const { data: isAuthenticated = false } = useQuery({
        queryKey: AUTH_QUERY_KEY,
        queryFn: async () => {
            const token = await SecureStore.getItemAsync(getAuthTokenKey(diabetesType as DiabeteType));
            if (!token) return false;
            return validateToken(token, diabetesType as DiabeteType);
        },
    });

    // Mutation pour la connexion
    const { mutateAsync: login } = useMutation({
        mutationFn: async (token: string) => {
            const isValid = await validateToken(token, diabetesType as DiabeteType);
            if (isValid) {
                await SecureStore.setItemAsync(getAuthTokenKey(diabetesType as DiabeteType), token);
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
        mutationFn: async () => {
            await SecureStore.deleteItemAsync(getAuthTokenKey(diabetesType as DiabeteType));
            return true;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: AUTH_QUERY_KEY });
        },
    });

    // Fonction pour récupérer le token
    const getToken = async (): Promise<string | null> => {
        try {
            return await SecureStore.getItemAsync(getAuthTokenKey(diabetesType as DiabeteType));
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
