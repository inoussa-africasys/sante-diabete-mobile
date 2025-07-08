import * as FileSystem from 'expo-file-system';
import PatientService from '../Services/patientService';

const convertImageToBase64 = async (uri: string): Promise<string | null> => {
  try {
    const base64 = await FileSystem.readAsStringAsync(uri, {
      encoding: FileSystem.EncodingType.Base64,
    });
    return `data:image/jpeg;base64,${base64}`;
  } catch (error) {
    console.error('Erreur lors de la conversion en base64:', error);
    return null;
  }
};


export const getBase64ImageOfPatient = async (patientId: string): Promise<string | null> => {
  try {
    const patient = await (await PatientService.create()).getPatient(patientId);
    console.info(`Patient : ${patient}`);
    if (patient && patient.photo && patient.photo.startsWith('file://')) {
      const base64Image = await convertImageToBase64(patient.photo);
      if (base64Image) {
        return base64Image;
      }
    }
    return null;
  } catch (error) {
    console.error('Erreur lors de la conversion en base64:', error);
    return null;
  }
};