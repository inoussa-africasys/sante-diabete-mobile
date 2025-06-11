import * as FileSystem from 'expo-file-system';
import { SurveyForm } from '../types/SurveyForm'; // ton fichier d'interface

const SURVEY_FOLDER = `${FileSystem.documentDirectory}surveys/`;

// Assure que le dossier existe
export const ensureSurveyFolder = async () => {
  const dirInfo = await FileSystem.getInfoAsync(SURVEY_FOLDER);
  if (!dirInfo.exists) {
    await FileSystem.makeDirectoryAsync(SURVEY_FOLDER, { intermediates: true });
  }
};

// Sauvegarder un formulaire
export const saveSurveyForm = async (form: SurveyForm): Promise<void> => {
  await ensureSurveyFolder();
  const fileUri = `${SURVEY_FOLDER}${form.id}.json`;
  await FileSystem.writeAsStringAsync(fileUri, JSON.stringify(form));
};

// Charger un formulaire
export const loadSurveyForm = async (formId: string): Promise<SurveyForm | null> => {
  const fileUri = `${SURVEY_FOLDER}${formId}.json`;
  const fileInfo = await FileSystem.getInfoAsync(fileUri);
  if (!fileInfo.exists) return null;
  
  const content = await FileSystem.readAsStringAsync(fileUri);
  return JSON.parse(content) as SurveyForm;
};

// Lister les formulaires disponibles
export const listSurveyForms = async (): Promise<string[]> => {
  await ensureSurveyFolder();
  const files = await FileSystem.readDirectoryAsync(SURVEY_FOLDER);
  return files.filter(file => file.endsWith('.json'));
};

// Supprimer un formulaire si besoin
export const deleteSurveyForm = async (formId: string): Promise<void> => {
  const fileUri = `${SURVEY_FOLDER}${formId}.json`;
  await FileSystem.deleteAsync(fileUri);
};
