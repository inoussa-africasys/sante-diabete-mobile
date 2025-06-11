export interface AuthContextType {
    // État d'authentification
    isAuthenticated: boolean;
    
    // Mutations pour login/logout avec leurs états
    login: (token: string) => Promise<boolean>;
    logout: () => Promise<boolean>;
    
    // Récupération du token
    getToken: () => Promise<string | null>;
}

export interface AuthProviderProps {
    children: React.ReactNode;
}
