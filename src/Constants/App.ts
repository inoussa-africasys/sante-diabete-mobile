import * as FileSystem from 'expo-file-system';

export const APP_NAME = process.env.APP_NAME

export const VERSION_NAME = "1.2.24"
export const SURVEY_FOLDER = `${FileSystem.documentDirectory}surveys/`
export const AUTH_BASE_URL_KEY = 'auth_base_url'
export const ACTIVE_DIABETE_TYPE_KEY = 'active_diabete_type'
export const USER_NAME_KEY = 'user_name'
export const BATCH_SIZE = 200
export const API_HEADER = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
};

export const PATH_OF_PATIENTS_DIR_ON_THE_LOCAL = "Trafic/patients/instances";
export const PATH_OF_CONSULTATIONS_DIR_ON_THE_LOCAL = "Trafic/consultations/instances";


