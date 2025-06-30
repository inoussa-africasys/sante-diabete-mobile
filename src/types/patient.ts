
export interface PatientFormData {
  nom: string;
  prenom: string;
  dateNaissance: Date | null;
  genre: string;
  profession: string;
  telephone: string;
  email: string;
  commentaire: string;
  photo: string | null;
}


export interface ConsultationFormData {
    data: string;
    id_fiche: string;
}


export interface PatientSyncData {
  identifier: string;
  firstName: string;
  lastName: string;
  dateBirthday: Date; 
  gender: string;
  bloodGroup: string;
  electrophoresis: string;
  job: string;
  contact: string;
  email: string;
  comments: string;
  emergencyPeople: string;
  emergencyContact: string;
  isModified: boolean; 
  end_date: Date; 
  traficUser: string;
}


export interface PatientDeletedSyncError {
  patientId: string;
  error: string;
}

export interface PatientUpdatedSyncError extends PatientDeletedSyncError {
}

export interface ConsultationSyncError {
  consultationId: string;
  error: string;
}

export interface ConsultationCreatedSyncData {
  form_name: string,
  consultation_name: string,
  uuid: string,
  content: string
}