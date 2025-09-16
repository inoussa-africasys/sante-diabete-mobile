import React, { createContext, useContext, useState, ReactNode } from 'react';

// Interface pour le contexte
interface PatientSearchContextType {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  showSearchbar: boolean;
  setShowSearchbar: (show: boolean) => void;
}

// Création du contexte avec des valeurs par défaut
const PatientSearchContext = createContext<PatientSearchContextType>({
  searchQuery: '',
  setSearchQuery: () => {},
  showSearchbar: false,
  setShowSearchbar: () => {},
});

// Props pour le provider
interface PatientSearchProviderProps {
  children: ReactNode;
}

// Provider component
export const PatientSearchProvider: React.FC<PatientSearchProviderProps> = ({ children }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchbar, setShowSearchbar] = useState(false);

  return (
    <PatientSearchContext.Provider
      value={{
        searchQuery,
        setSearchQuery,
        showSearchbar,
        setShowSearchbar
      }}
    >
      {children}
    </PatientSearchContext.Provider>
  );
};

// Hook personnalisé pour utiliser ce contexte
export const usePatientSearch = () => useContext(PatientSearchContext);
