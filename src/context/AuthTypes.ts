import { DiabeteType } from '../types/enums';

export interface LoginParams {
    baseUrl: string;
    token: string;
    diabetesType: DiabeteType;
    userName: string;
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
    // Récupérer l'état d'authentification en forçant une nouvelle vérification
    getIsAuthenticated: () => Promise<boolean>;
    
    // Mutations pour login/logout avec leurs états
    login: (params: LoginParams) => Promise<boolean>;
    logout: (params: LogoutParams) => Promise<boolean>;
    userName: () => Promise<string | null>;
    
    // Récupération du token
    getToken: () => Promise<string | null>;
    refreshDiabetesType: () => void;
}

export interface AuthProviderProps {
    children: React.ReactNode;
}


export interface User {
    name: string | null;
    type: DiabeteType;
}
    