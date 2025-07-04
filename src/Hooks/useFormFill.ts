import { useState } from 'react';
import FormFillService from '../Services/formFillService';
import { FormFill } from '../models/FormFill';
import FormFillForm from '../types/formFill';
type useFormFillType = {
    getFicheListWithFormFill: () => Promise<Map<string, FormFill>>;
    createFormFillOnLocalDB: (formFill: FormFillForm) => Promise<boolean>;
    isLoading: boolean;
    error: string | null;
}
export const useFormFill = (): useFormFillType => {
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);


    const getFicheListWithFormFill = async (): Promise<Map<string, FormFill>> => {
        try {
            setIsLoading(true);
            const formFillService = await FormFillService.create();
            const fiches = await formFillService.getAllFicheWhereFormFillIsNotNull();
            return fiches;
        } catch (error) {
            console.error('Erreur réseau :', error);
            setError(error as string);
            setIsLoading(false);
            return new Map<string, FormFill>();
        } finally {
            setIsLoading(false);
        }
    };

    const createFormFillOnLocalDB = async (formFill: FormFillForm) => {
        try {
            setIsLoading(true);
            const formFillService = await FormFillService.create();
            const result = await formFillService.createFormFill(formFill);
            console.info('formFill créée :', result);
            console.info('formFill créée :', await formFillService.getAllFormFill());
            return result;
        } catch (error) {
            console.error('Erreur réseau :', error);
            setError(error as string);
            setIsLoading(false);
            return false;
        } finally {
            setIsLoading(false);
        }
    };


    return {
        getFicheListWithFormFill,
        createFormFillOnLocalDB,
        isLoading,
        error,

    };
};
