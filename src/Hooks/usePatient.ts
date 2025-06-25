import { useState } from "react";
import { useDiabetes } from "../context/DiabetesContext";
import Patient from "../models/Patient";
import PatientService from "../Services/patientService";
import { PatientFormData } from "../types";

type usePatientReturnType = {
    getAllOnTheLocalDbPatients : () => Promise<Patient[]>;
    getAllOnTheServerPatients : () => Promise<Patient[]>;
    insertPatientOnTheLocalDb : (patient : PatientFormData) => Promise<boolean>;
    updatePatientOnTheLocalDb : (patientId: string, patient: PatientFormData) => Promise<boolean>;
    deletePatientOnTheLocalDb : (patientId: string) => Promise<boolean>;
    getPatientOnTheLocalDb : (patientId: string) => Promise<Patient | null>;
    getPatientByIdOnTheLocalDb : (patientId: string) => Promise<Patient | null>;
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


    const updatePatientOnTheLocalDb = async (patientId : string,patient : PatientFormData) => {
        try {
            setIsLoading(true);
            const patientsService = await PatientService.create();
            await patientsService.updateOnTheLocalDb(patientId,patient);
            return true;
        } catch (error) {
            console.error('Erreur réseau :', error);
            setError(error as string);
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    const deletePatientOnTheLocalDb = async (patientId : string) => {
        try {
            setIsLoading(true);
            const patientsService = await PatientService.create();
            await patientsService.deleteOnTheLocalDb(patientId);
            return true;
        } catch (error) {
            console.error('Erreur réseau :', error);
            setError(error as string);
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    const getPatientOnTheLocalDb = async (patientId : string) => {
        try {
            setIsLoading(true);
            const patientsService = await PatientService.create();
            const patient = await patientsService.getPatient(patientId);
            console.log("patient : ",patient);
            return patient;
        } catch (error) {
            console.error('Erreur réseau :', error);
            setError(error as string);
            return null;
        } finally {
            setIsLoading(false);
        }
    };

    const getPatientByIdOnTheLocalDb = async (patientId : string) => {
        try {
            setIsLoading(true);
            const patientsService = await PatientService.create();
            const patient = await patientsService.getPatient(patientId);
            console.log("patient : ",patient);
            return patient;
        } catch (error) {
            console.error('Erreur réseau :', error);
            setError(error as string);
            return null;
        } finally {
            setIsLoading(false);
        }
    };

    return {
        getAllOnTheLocalDbPatients,
        getAllOnTheServerPatients,
        insertPatientOnTheLocalDb,
        updatePatientOnTheLocalDb,
        deletePatientOnTheLocalDb,
        getPatientOnTheLocalDb,
        getPatientByIdOnTheLocalDb,
        isLoading,
        error
    };
}
