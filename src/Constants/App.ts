import * as FileSystem from 'expo-file-system';

export const APP_NAME = process.env.APP_NAME

export const VERSION_NAME = "1.2.24"
export const APP_VERSION = "1.2.24"
export const SURVEY_FOLDER = `${FileSystem.documentDirectory}surveys/`
export const AUTH_BASE_URL_KEY = 'auth_base_url'
export const ACTIVE_DIABETE_TYPE_KEY = 'active_diabete_type'
export const USER_NAME_KEY = 'user_name'
export const USER_PREFERENCES_KEY = 'userPreferences'
export const LANGUAGE_KEY = 'language'
export const BATCH_SIZE = 200
export const API_HEADER = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
};

export const PATH_OF_PATIENTS_DIR_ON_THE_LOCAL = "Trafic/patients/instances";
export const PATH_OF_CONSULTATIONS_DIR_ON_THE_LOCAL = "Trafic/consultations/instances";
export const PATH_OF_FICHE_DIR_ON_THE_LOCAL = "Trafic/forms";
export const LOG_FILE_PATH = `Trafic/`;
export const PATH_OF_TRAFIC_DIR_ON_THE_LOCAL = `Trafic/`;
export const NAME_OF_TRAFIC_ZIP_FILE = `trafic_archive.zip`;
export const LAST_SYNC_DATE_KEY = 'last_sync_date';



