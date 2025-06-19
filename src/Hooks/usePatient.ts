import { useState } from "react";
import { useDiabetes } from "../context/DiabetesContext";
import Patient from "../models/Patient";
import PatientService from "../Services/patientService";
import { PatientFormData } from "../types";

type usePatientReturnType = {
    getAllOnTheLocalDbPatients : () => Promise<Patient[]>;
    getAllOnTheServerPatients : () => Promise<Patient[]>;
    insertPatientOnTheLocalDb : (patient : PatientFormData) => Promise<boolean>;
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


    const insertPatientOnTheLocalDb = async (patient : PatientFormData) => {
        try {
            setIsLoading(true);
            const patientsService = await PatientService.create();
            const patients = await patientsService.insertOnTheLocalDb(patient);
            setIsLoading(false);
            return true;
        } catch (error) {
            console.error('Erreur réseau :', error);
            setError(error as string);
            setIsLoading(false);
            return false;
        }
    };

    return {
        getAllOnTheLocalDbPatients,
        getAllOnTheServerPatients,
        insertPatientOnTheLocalDb,
        isLoading,
        error
    };
}
