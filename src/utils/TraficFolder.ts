import { PATH_OF_TRAFIC_DIR_ON_THE_LOCAL } from "../Constants";


export class TraficFolder {

    static getTraficFolderPath() : string {
        return PATH_OF_TRAFIC_DIR_ON_THE_LOCAL
    }

    static getPatientsFolderPath(dt: string) : string {
        return `${PATH_OF_TRAFIC_DIR_ON_THE_LOCAL}${dt}/patients/instances`
    }

    static getConsultationsFolderPath(dt: string,patientId: string) : string {
        return `${PATH_OF_TRAFIC_DIR_ON_THE_LOCAL}${dt}/patients/dmp/${patientId}`
    }

    static getFormsDefinitionsFolderPath(dt: string) : string {
        return `${PATH_OF_TRAFIC_DIR_ON_THE_LOCAL}${dt}/forms/definitions`
    }

    static getFormsInstancesFolderPath(dt: string,fileName: string) : string {
        return `${PATH_OF_TRAFIC_DIR_ON_THE_LOCAL}${dt}/forms/instances/${fileName}`
    }


}
