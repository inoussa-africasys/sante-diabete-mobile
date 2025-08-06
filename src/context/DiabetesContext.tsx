import * as SecureStore from 'expo-secure-store';
import { createContext, ReactNode, useContext, useState } from 'react';
import { ACTIVE_DIABETE_TYPE_KEY } from '../Constants/App';
type DiabetesType = 'DT1' | 'DT2';

interface DiabetesContextType {
  diabetesType: DiabetesType;
  setDiabetesType: (type: DiabetesType) => void;
  setActiveDiabetesType: (type: DiabetesType) => Promise<void>;
  loading: boolean;
}

const DiabetesContext = createContext<DiabetesContextType | undefined>(undefined);

export const DiabetesProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [diabetesType, setDiabetesType] = useState<DiabetesType>('DT1');
  const [loading, setLoading] = useState(true);
  
  const setActiveDiabetesType = async (type: DiabetesType) => {
    setLoading(true);
    await SecureStore.setItemAsync(ACTIVE_DIABETE_TYPE_KEY, type);
    setDiabetesType(type);
    setLoading(false);
  };
  

  return (
    <DiabetesContext.Provider value={{ diabetesType, setDiabetesType, setActiveDiabetesType, loading }}>
      {children}
    </DiabetesContext.Provider>
  );
};

export const useDiabetes = () => {
  const context = useContext(DiabetesContext);
  if (context === undefined) {
    throw new Error('useDiabetes must be used within a DiabetesProvider');
  }
  return context;
};
