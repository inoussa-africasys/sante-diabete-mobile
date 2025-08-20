import { useState } from 'react';
import DpiService from '../Services/dpiService';
import { DpiResponse } from '../types/dpi';

type UseDpiType = {
    isLoading: boolean;
    error: string | null;
    getAllDpis: (patientId: string, ficheName: string) => Promise<DpiResponse>
}
export const useDPI = (): UseDpiType => {
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const getAllDpis = async (patientId: string, ficheName: string): Promise<DpiResponse> => {
        setIsLoading(true);
        try {
            const dpiService = await DpiService.create();
            const dpisArrayString = await dpiService.fetchAllDpisOnServer({ patientId, ficheName })
            return dpisArrayString;
        } catch (error) {
            console.error('Erreur réseau :', error);
            setError(error as string);
            return [];
        } finally {
            setIsLoading(false);
        }
    };




    return {
        isLoading,
        error,
        getAllDpis
    };
};
