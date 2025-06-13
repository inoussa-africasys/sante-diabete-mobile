import * as FileSystem from 'expo-file-system';

export const APP_NAME = process.env.APP_NAME

export const VERSION_NAME = "1.2.24"
export const SURVEY_FOLDER = `${FileSystem.documentDirectory}surveys/`
export const AUTH_BASE_URL_KEY = 'auth_base_url'
export const ACTIVE_DIABETE_TYPE_KEY = 'active_diabete_type'
export const BATCH_SIZE = 200
export const API_HEADER = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
};

