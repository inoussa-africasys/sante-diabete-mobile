import { DiabeteType } from '../types/enums';

export interface LoginParams {
    baseUrl: string;
    token: string;
    diabetesType: DiabeteType;
}

export interface LogoutParams {
    diabetesType: DiabeteType;
}

export interface GetTokenParams {
    diabetesType: DiabeteType;
}



export interface AuthContextType {
    // État d'authentification
    isAuthenticated: boolean;
    
    // Mutations pour login/logout avec leurs états
    login: (params: LoginParams) => Promise<boolean>;
    logout: (params: LogoutParams) => Promise<boolean>;
    
    // Récupération du token
    getToken: () => Promise<string | null>;
}

export interface AuthProviderProps {
    children: React.ReactNode;
}
