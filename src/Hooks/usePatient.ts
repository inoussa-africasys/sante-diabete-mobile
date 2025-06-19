import { useState } from "react";
import { useDiabetes } from "../context/DiabetesContext";
import Patient from "../models/Patient";
import PatientService from "../Services/patientService";

type usePatientReturnType = {
    getAllOnTheLocalDbPatients : () => Promise<Patient[]>;
    getAllOnTheServerPatients : () => Promise<Patient[]>;
    isLoading : boolean;
    error : string | null;
}

export const usePatient = () : usePatientReturnType => {
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const {diabetesType} = useDiabetes();
    
    const getAllOnTheLocalDbPatients = async () => {
        try {
            setIsLoading(true);
            const patientsService = await PatientService.create();
            const patients = await patientsService.getAllOnTheLocalDb(diabetesType);
            setIsLoading(false);
            return patients;
        } catch (error) {
            console.error('Erreur réseau :', error);
            setError(error as string);
            setIsLoading(false);
            return [];
        }
    };

    const getAllOnTheServerPatients = async () => {
        try {
            setIsLoading(true);
            const patientsService = await PatientService.create();
            const patients = await patientsService.getAllOnTheServer();
            setIsLoading(false);
            return patients;
        } catch (error) {
            console.error('Erreur réseau :', error);
            setError(error as string);
            setIsLoading(false);
            return [];
        }
    };

    return {
        getAllOnTheLocalDbPatients,
        getAllOnTheServerPatients,
        isLoading,
        error
    };
}
