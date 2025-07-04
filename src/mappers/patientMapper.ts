import Patient from "../models/Patient";
import { PatientFormData, PatientSyncData, PatientSyncDataResponseOfGetAllServer } from "../types";

export class PatientMapper {
    static toPatientFormData(patient: Patient): PatientFormData {
        return {
            nom: patient.last_name,
            prenom: patient.first_name,
            dateNaissance: patient.date_of_birth ? new Date(patient.date_of_birth) : null,
            genre: patient.genre,
            profession: patient.profession,
            telephone: patient.phone,
            email: patient.email,
            commentaire: patient.comment,
            photo: patient.photo || null,
        };
    }

    static toPatient(patientFormData: PatientFormData): Patient {
        const patient = new Patient();
        patient.last_name = patientFormData.nom;
        patient.first_name = patientFormData.prenom;
        patient.date_of_birth = patientFormData.dateNaissance?.toISOString() || '';
        patient.genre = patientFormData.genre;
        patient.profession = patientFormData.profession;
        patient.phone = patientFormData.telephone;
        patient.email = patientFormData.email;
        patient.comment = patientFormData.commentaire;
        patient.photo = patientFormData.photo || undefined;
        return patient;
    }

    static toPatientSyncData(patient: Patient): PatientSyncData {
        return {
            identifier: patient.id_patient,
            firstName: patient.first_name,
            lastName: patient.last_name,
            dateBirthday: new Date(patient.date_of_birth),
            gender: patient.genre,
            bloodGroup: "",
            electrophoresis: "",
            job: patient.profession,
            contact: patient.phone,
            email: patient.email,
            comments: patient.comment,
            emergencyPeople: "",
            emergencyContact: "",
            isModified: patient.isModified ? 'true' : 'false',
            end_date: new Date(),
            traficUser: patient.createdBy,
        };
    }


    static syncResponseToPatient(patientSyncData: PatientSyncDataResponseOfGetAllServer): Patient {
        const patient = new Patient();
        patient.id_patient = patientSyncData.identifier;
        patient.first_name = patientSyncData.firstName;
        patient.last_name = patientSyncData.lastName;
        patient.date_of_birth = patientSyncData.dateBirthday;
        patient.genre = patientSyncData.gender;
        patient.profession = "";
        patient.phone = patientSyncData.contact;
        patient.email = patientSyncData.email;
        patient.comment = patientSyncData.comments;
        patient.createdBy = patientSyncData.traficUser;
        patient.isModified = patientSyncData.isModified === 'true';
        return patient;
    }
}


