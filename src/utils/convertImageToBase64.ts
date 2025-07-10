import * as FileSystem from 'expo-file-system';
import PatientService from '../Services/patientService';

const convertImageToBase64 = async (uri: string): Promise<string | null> => {
  try {
    // Check if the URI is already a base64 string
    if (uri.startsWith('data:image')) {
      return uri; // Already in base64 format
    }
    
    // Convert file URI to base64
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
    if (patient && patient.photo) {
      // If photo is already in base64 format, return it directly
      if (patient.photo.startsWith('data:image')) {
        return patient.photo;
      }
      // If photo is a file URI, convert it to base64
      else if (patient.photo.startsWith('file://')) {
        const base64Image = await convertImageToBase64(patient.photo);
        if (base64Image) {
          return base64Image;
        }
      }
    }
    return null;
  } catch (error) {
    console.error('Erreur lors de la conversion en base64:', error);
    return null;
  }
};