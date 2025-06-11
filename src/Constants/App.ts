import * as FileSystem from 'expo-file-system';

export const API_URL = "http://localhost:3000/";
export const APP_NAME = process.env.APP_NAME;

export const SURVEY_FOLDER = `${FileSystem.documentDirectory}surveys/`;