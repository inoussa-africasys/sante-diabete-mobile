import { useState } from "react";
import ConsultationService from "../Services/ConsulationService";
import { Consultation } from "../models/Consultation";
import Patient from "../models/Patient";
import { ConsultationFormData, Coordinates } from "../types";

type useConsultationReturnType = {
    isLoading: boolean;
    error: string | null;
    getConsultations: (patientId: string) => Promise<Record<string, Consultation[]> | null>;
    createConsultationOnLocalDB: (consultation: ConsultationFormData,patientId: string,coordinates:Coordinates) => Promise<Consultation | null>;
    getConsultationById: (consultationId: string) => Promise<Consultation | null>;
    getPatientByConsultationId: (patientId: string) => Promise<Patient | null>;
    deleteConsultationOnTheLocalDb: (consultationId: string) => Promise<boolean>;
}

export default function useConsultation(): useConsultationReturnType {
    const [consultations, setConsultations] = useState<Record<string, Consultation[]> | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const getConsultations = async (patientId: string): Promise<Record<string, Consultation[]> | null> => {
        try {
            setIsLoading(true);
            const consultationService = await ConsultationService.create();
            const consultations = await consultationService.getAllConsultationByPatientIdOnLocalDB(patientId);
            setConsultations(consultations);
            return consultations;
        } catch (error) {
            console.error('Erreur réseau :', error);
            setError(error as string);
            setIsLoading(false);
            return null;
        } finally {
            setIsLoading(false);
        }
    };

    const createConsultationOnLocalDB = async (consultation: ConsultationFormData,patientId: string,coordinates:Coordinates): Promise<Consultation | null> => {
        try {
            setIsLoading(true);
            console.log("consultation : ", consultation);
            const consultationService = await ConsultationService.create();
            const consultationCreated = await consultationService.createConsultationOnLocalDBAndCreateJson(consultation,patientId,coordinates);
            setConsultations((prevConsultations) => {
                if (prevConsultations) {
                    const consultationDate = consultation.date;
                    const existingConsultations = prevConsultations[consultationDate] || [];
                    return {
                        ...prevConsultations,
                        [consultationDate]: [...existingConsultations, consultationCreated]
                    };
                }
                return {
                    [consultation.date]: [consultationCreated]
                };
            });
            return consultationCreated;
        } catch (error) {
            console.error('Erreur réseau :', error);
            setError(error as string);
            setIsLoading(false);
            return null;
        } finally {
            setIsLoading(false);
        }
    };

    const getConsultationById = async (consultationId: string): Promise<Consultation | null> => {
        try {
            setIsLoading(true);
            const consultationService = await ConsultationService.create();
            const consultation = await consultationService.getConsultationByIdOnLocalDB(parseInt(consultationId));
            return consultation;
        } catch (error) {
            console.error('Erreur réseau :', error);
            setError(error as string);
            setIsLoading(false);
            return null;
        } finally {
            setIsLoading(false);
        }
    };

    const getPatientByConsultationId = async (consultationId: string): Promise<Patient | null> => {
        try {
            setIsLoading(true);
            const consultationService = await ConsultationService.create();
            const patient = await consultationService.getPatientByConsultationIdOnLocalDB(parseInt(consultationId));
            return patient;
        } catch (error) {
            console.error('Erreur de recherche du patient :', error);
            setError(error as string);
            setIsLoading(false);
            return null;
        } finally {
            setIsLoading(false);
        }
    };

    const deleteConsultationOnTheLocalDb = async (consultationId: string): Promise<boolean> => {
        try {
            setIsLoading(true);
            const consultationService = await ConsultationService.create();
            const result = await consultationService.deleteConsultationOnTheLocalDb(parseInt(consultationId));
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
        isLoading,
        error,
        getConsultations,
        createConsultationOnLocalDB,
        getConsultationById,
        getPatientByConsultationId,
        deleteConsultationOnTheLocalDb
    };
}
