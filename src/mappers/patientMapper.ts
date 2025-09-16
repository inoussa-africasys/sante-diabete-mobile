import Patient from "../models/Patient";
import { FicheAdministrativeFormData, PatientFormData, PatientSyncData, PatientSyncDataResponseOfGetAllMedicalDataServer, PatientSyncPicture } from "../types";

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
      fiche_administrative_name: patient.fiche_administrative_name || null
    };
  }

  static toPatient(patientFormData: PatientFormData): Patient {
    const patient = new Patient();
    patient.last_name = patientFormData.prenom;
    patient.first_name = patientFormData.nom;
    patient.date_of_birth = patientFormData.dateNaissance?.toISOString() || '';
    patient.genre = patientFormData.genre;
    patient.profession = patientFormData.profession;
    patient.phone = patientFormData.telephone;
    patient.email = patientFormData.email;
    patient.comment = patientFormData.commentaire;

    // Store photo directly as base64 string in the database
    // This handles both the new base64 format and maintains compatibility with URI format
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


  static syncResponseToPatient(patientSyncData: PatientSyncDataResponseOfGetAllMedicalDataServer): Patient {
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
    patient.isModified = patientSyncData.isModified === true;
    return patient;
  }

  static toPatientSyncPicture(patient: Patient): PatientSyncPicture {
    return {
      identifier: patient.id_patient,
      photo: patient.photo,
    };
  }


  static ficheAdminToFormPatient(data: FicheAdministrativeFormData, ficheAdministrativeName: string): PatientFormData {

    return {
      nom: data["Donnees_administratives.nom"] || "",
      prenom: data["Donnees_administratives.prenom"] || "",
      dateNaissance: data["Donnees_administratives.date_de_naissance"] ? new Date(data["Donnees_administratives.date_de_naissance"]) : new Date(),
      genre: data["Donnees_administratives.genre"] || "",
      profession: data["Donnees_administratives.profession"] || "",
      telephone: data["Donnees_administratives.telephone"] || "",
      email: data["Donnees_administratives.mail"] || "",
      commentaire: data["Donnees_administratives.commentaire"] || "",
      photo: data["Donnees_administratives.photo"] || "",
      fiche_administrative_name: ficheAdministrativeName || null
    };
  }
}


