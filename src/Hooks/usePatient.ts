import { useState } from "react";
import { useDiabetes } from "../context/DiabetesContext";
import Patient from "../models/Patient";
import PatientService from "../Services/patientService";
import { PatientFormData } from "../types";
import Logger from "../utils/Logger";

type usePatientReturnType = {
    getAllOnTheLocalDbPatients : () => Promise<Patient[]>;
    getAllOnTheServerPatients : () => Promise<Patient[]>;
    insertPatientOnTheLocalDb : (patient : PatientFormData) => Promise<boolean>;
    updatePatientOnTheLocalDb : (patientId: string, patient: PatientFormData) => Promise<boolean>;
    deletePatientOnTheLocalDb : (patientId: string) => Promise<boolean>;
    getPatientOnTheLocalDb : (patientId: string) => Promise<Patient | null>;
    getPatientByIdOnTheLocalDb : (patientId: string) => Promise<Patient | null>;
    syncPatients : () => Promise<boolean>;
    countPatientsCreatedOrUpdatedSince : (date: string,diabetesType: string) => Promise<any>;
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
            const count = await patientsService.countPatientsCreatedOrUpdatedSince(new Date().toISOString(),diabetesType);
            console.log("count : ",count);
            setIsLoading(false);
            return patients;
        } catch (error) {
            console.error('Erreur réseau :', error);
            Logger.log('error', 'Error fetching patients by type diabete', { error });
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
            Logger.log('error', 'Error fetching patients by type diabete', { error });
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
            Logger.log('error', 'Error inserting patient on the local db', { error });
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
            Logger.log('error', 'Error updating patient on the local db', { error });
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
            Logger.log('error', 'Error deleting patient on the local db', { error });
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
            Logger.log('error', 'Error getting patient on the local db', { error });
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
            Logger.log('error', 'Error getting patient by id on the local db', { error });
            setError(error as string);
            return null;    
        } finally {
            setIsLoading(false);
        }
    };

    const syncPatients = async (): Promise<boolean> => {
        try {
            setIsLoading(true);
            const patientsService = await PatientService.create();
            const isSynced = await patientsService.syncPatients();
            setIsLoading(false);
            return isSynced;
        } catch (error) {
            console.error('Erreur réseau :', error);
            Logger.log('error', 'Error syncing patient on the local db', { error });
            setError(error as string);
            setIsLoading(false);
            return false;
        }
    };

    const countPatientsCreatedOrUpdatedSince = async (date: string,diabetesType: string): Promise<any> => {
        try {
            setIsLoading(true);
            const patientsService = await PatientService.create();
            const count = await patientsService.countPatientsCreatedOrUpdatedSince(date,diabetesType);
            console.log("count : ",count);
            
            setIsLoading(false);
            return count;
        } catch (error) {
            console.error('Erreur réseau :', error);
            Logger.log('error', 'Error counting patients created or updated since', { error });
            setError(error as string);
            setIsLoading(false);
            return 0;
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
        syncPatients,
        countPatientsCreatedOrUpdatedSince,
        isLoading,
        error
    };
}
