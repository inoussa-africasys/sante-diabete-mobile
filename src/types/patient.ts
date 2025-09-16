
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
  fiche_administrative_name: string | null;
}


export interface ConsultationFormData {
  data: any;
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
  isModified: string;
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
  content: string,
  date_consultation?: string
}


export interface PatientSyncDataResponseOfGetAllMedicalDataServer {
  dateBirthday: string
  identifier: string
  lastName: string
  comments: string
  gender: string
  generationDate: string
  firstName: string
  isModified: boolean
  contact: string
  dataConsultations: DataConsultationOfGetWithPatientGetAllServer[]
  email: string
  traficUser: string
  status: string
}

export interface DataConsultationOfGetWithPatientGetAllServer {
  date_consultation: string
  consultation_name: string
  formName: string
  uuid: string
  form_name: string
  content: string
}


export interface SyncPatientReturnType {
  success: boolean;
  message: string;
  errors?: string[];
  statistics: {
    syncDeletedPatients: SyncStatistics;
    sendCreatedOrUpdatedPatientsToServer: SyncStatistics;
    sendCreatedConsultationsToServer: SyncStatistics;
    getAllPatientOnServer: SyncStatistics;
    getAllDeletedPatientOnServer: SyncStatistics;
    // Nouveau: nombre de consultations récupérées depuis le serveur
    getAllConsultationsOnServer: SyncStatistics;
    syncPictures: SyncStatistics;
  };
}

export interface SyncOnlyOnTraitementReturnType {
  success: boolean;
  message: string;
  errors?: string[];
  statistics: SyncStatistics;
}

// Spécifique à la récupération des patients du serveur:
// inclut aussi des statistiques sur les consultations récupérées
export interface SyncPatientsAndConsultationsReturnType extends SyncOnlyOnTraitementReturnType {
  consultationsStatistics: SyncStatistics;
}

export interface SyncStatistics {
  total: number;
  success: number;
  failed: number;
}


export interface PatientSyncPicture {
  identifier: string;
  photo?: string;
}


export interface FicheAdministrativeFormData {
  nom: string,
  prenom: string,
  dateNaissance: string,
  genre: string,
  profession: string,
  telephone: string,
  email: string,
  commentaire: string,
  photo: string
  [key: string]: any;
}


export interface PatientToSaveOnJson {
  identifier: string;
  firstName: string;
  lastName: string;
  dateBirthday: string; // format YYYY-MM-DD
  gender: string;       // ex: 'H' pour homme, 'F' pour femme, etc.
  bloodGroup: string;
  electrophoresis: string;
  job: string;
  contact: string;
  email: string;
  comments: string;
  emergencyPeople: string;
  emergencyContact: string;
  isModified: string;   // valeur texte "false" ou "true", sinon changer en boolean
  end_date: string;     // format YYYY-MM-DD
  traficUser: string;
}
