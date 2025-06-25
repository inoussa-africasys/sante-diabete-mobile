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
