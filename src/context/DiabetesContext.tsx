import React, { createContext, ReactNode, useContext, useState } from 'react';

type DiabetesType = 'DT1' | 'DT2';

interface DiabetesContextType {
  diabetesType: DiabetesType;
  setDiabetesType: (type: DiabetesType) => void;
}

const DiabetesContext = createContext<DiabetesContextType | undefined>(undefined);

export const DiabetesProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [diabetesType, setDiabetesType] = useState<DiabetesType>('DT1');

  return (
    <DiabetesContext.Provider value={{ diabetesType, setDiabetesType }}>
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
