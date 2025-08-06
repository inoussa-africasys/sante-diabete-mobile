import Patient from "../models/Patient";

export default class FicheAdminMapper {
    static parsePatientToFicheAdminData(data: Patient):any {
        return {
            "Donnees_administratives.nom": data.last_name,
            "Donnees_administratives.prenom": data.first_name,
            "Donnees_administratives.date_de_naissance": data.date_of_birth,
            "Donnees_administratives.genre": data.genre,
            "Donnees_administratives.profession": data.profession,
            "Donnees_administratives.telephone": data.phone,
            "Donnees_administratives.mail": data.email,
            "Donnees_administratives.commentaire": data.comment,
            "Donnees_administratives.photo": data.photo
        };
    }
}
