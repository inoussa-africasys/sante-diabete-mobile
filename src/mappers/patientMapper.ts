import Patient from "../models/Patient";
import { PatientFormData } from "../types";

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
}
