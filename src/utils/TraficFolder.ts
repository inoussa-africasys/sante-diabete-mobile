import { PATH_OF_TRAFIC_DIR_ON_THE_LOCAL } from "../Constants";

/**
 * Utility class to get paths to folders in the traffic folder.
 * The traffic folder is the folder where the application
 * stores its data when it is not connected to the server.
 * The paths returned by the methods of this class are
 * relative to the traffic folder.
 */
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


}
