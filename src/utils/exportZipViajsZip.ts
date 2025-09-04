import * as FileSystem from "expo-file-system";
import * as Sharing from 'expo-sharing';
import JSZip from 'jszip';
import { NAME_OF_TRAFIC_ZIP_FILE, PATH_OF_TRAFIC_DIR_ON_THE_LOCAL } from "../Constants/App";
import { DATABASE_NAME, DATABASE_PATH } from "../Constants/Database";
import Logger from "./Logger";


// Fonction récursive pour lire tous les fichiers et dossiers
async function addDirectoryToZip(zip: JSZip, dirPath: string, relativePath: string = '') {
    const files = await FileSystem.readDirectoryAsync(dirPath);
    console.log(`✅ Lecture du dossier: ${dirPath}`);

    for (const fileName of files) {
        
        const fullPath = `${dirPath}/${fileName}`;
        const zipPath = relativePath ? `${relativePath}/${fileName}` : fileName;
        
        const fileInfo = await FileSystem.getInfoAsync(fullPath);
        
        if (fileInfo.exists && !fileInfo.isDirectory) {
            // C'est un fichier - mais on ignore les fichiers ZIP pour éviter la récursivité
            if (fileName.toLowerCase().endsWith('.zip')) {
                console.log(`⚠️ Fichier ZIP ignoré pour éviter la récursivité: ${zipPath}`);
                return; // Ignorer les fichiers ZIP
            }
            
            try {
                // Vérifier si c'est un fichier volumineux (comme la base de données)
                const isLargeFile = fileName === DATABASE_NAME || fileInfo.size > 10 * 1024 * 1024; // 10 MB
                
                if (isLargeFile) {
                    console.log(`⚠️ Traitement de fichier volumineux: ${zipPath} (${fileInfo.size} octets)`);
                    // Pour les fichiers volumineux, utiliser une approche par morceaux
                    await addLargeFileToZip(zip, fullPath, zipPath);
                } else {
                    // Pour les fichiers normaux, utiliser l'approche standard
                    const fileContent = await FileSystem.readAsStringAsync(fullPath, {
                        encoding: FileSystem.EncodingType.Base64,
                    });
                    console.log(`✅ Fichier ajouté: ${zipPath}`);
                    zip.file(zipPath, fileContent, { base64: true });
                }
            } catch (error) {
                console.error(`❌ Erreur lecture fichier ${zipPath}:`, error);
                Logger.log('error', `Erreur lecture fichier ${zipPath}:`, {error});
            }
        } else if (fileInfo.exists && fileInfo.isDirectory) {
            // C'est un dossier, on l'explore récursivement
            console.log(`📁 Exploration du sous-dossier: ${zipPath}`);
            await addDirectoryToZip(zip, fullPath, zipPath);
        }
    }
}

// Fonction pour ajouter un fichier volumineux au ZIP par morceaux
async function addLargeFileToZip(zip: JSZip, filePath: string, zipPath: string) {
    try {
        // Vérifier que le fichier existe
        const fileInfo = await FileSystem.getInfoAsync(filePath);
        if (!fileInfo.exists) {
            throw new Error(`Le fichier ${filePath} n'existe pas`);
        }

        // Taille du morceau en octets (1 MB)
        const chunkSize = 1 * 1024 * 1024;
        const totalSize = fileInfo.size;
        const totalChunks = Math.ceil(totalSize / chunkSize);

        console.log(`📦 Traitement du fichier ${zipPath} en ${totalChunks} morceaux`);

        // Lire le fichier complet en base64 (malheureusement JSZip ne supporte pas le streaming)
        // Pour les fichiers très volumineux, cette approche peut encore causer des problèmes de mémoire
        // mais c'est la meilleure solution disponible avec les contraintes actuelles
        try {
            // Lire le fichier complet
            const fileContent = await FileSystem.readAsStringAsync(filePath, {
                encoding: FileSystem.EncodingType.Base64
            });
            
            // Ajouter au ZIP
            zip.file(zipPath, fileContent, { base64: true });
            console.log(`✅ Fichier volumineux ajouté avec succès: ${zipPath}`);
        } catch (outOfMemoryError) {
            // Si on a une erreur de mémoire, essayer une approche alternative
            console.error(`❌ Erreur de mémoire lors de la lecture du fichier ${zipPath}:`, outOfMemoryError);
            Logger.log('error', `Erreur de mémoire lors de la lecture du fichier ${zipPath}:`, {outOfMemoryError});
            
            // Ajouter un fichier texte explicatif à la place
            const errorMessage = `Le fichier ${zipPath} n'a pas pu être inclus dans le ZIP car il est trop volumineux.\n` +
                               `Taille: ${fileInfo.size} octets.\n` +
                               `Veuillez le copier manuellement.`;
            
            zip.file(`${zipPath}.error.txt`, errorMessage);
            console.log(`⚠️ Fichier d'erreur ajouté pour ${zipPath}`);
        }
    } catch (error) {
        console.error(`❌ Erreur lors de l'ajout du fichier volumineux ${zipPath}:`, error);
        Logger.log('error', `Erreur lors de l'ajout du fichier volumineux ${zipPath}:`, {error});
    }
}

// Fonction simple pour copier la base de données dans le dossier de trafic
async function copyDatabaseToTrafficFolder() {
    try {
        const dbPath = `${DATABASE_PATH}${DATABASE_NAME}`;
        const tempDbPath = `${FileSystem.documentDirectory}${PATH_OF_TRAFIC_DIR_ON_THE_LOCAL}${DATABASE_NAME}`;
        
        console.log(`📋 Copie de la base de données...`);
        console.log(`📄 Source: ${dbPath}`);
        console.log(`🎯 Destination: ${tempDbPath}`);
        
        // Vérifier si la base de données source existe
        const dbInfo = await FileSystem.getInfoAsync(dbPath);
        
        if (dbInfo.exists && !dbInfo.isDirectory) {
            // Copier la base de données
            await FileSystem.copyAsync({
                from: dbPath,
                to: tempDbPath
            });
            
            const dbInfo2 = await FileSystem.getInfoAsync(tempDbPath);
            
            if (dbInfo2.exists && !dbInfo2.isDirectory) {
                console.log(`✅ Base de données copiée avec succès ! Taille : ${dbInfo2.size} octets, Date : ${dbInfo2.modificationTime}, MD5 : ${dbInfo2.md5} `);
            } else {
                console.log(`⚠️ Base de données non trouvée à destination temporaire : ${tempDbPath}`);
            }    
            console.log(`✅ Base de données copiée avec succès !`);
        } else {
            console.log(`⚠️ Base de données non trouvée à: ${dbPath}`);
        }
        
    } catch (error) {
        console.error('❌ Erreur lors de la copie de la base de données:', error);
        // Ne pas faire échouer le processus, continuer sans la DB
    }
}


// Fonction pour nettoyer le fichier temporaire de la base de données
async function cleanupTempDatabase() {
    try {
        const tempDbPath = `${FileSystem.documentDirectory}${PATH_OF_TRAFIC_DIR_ON_THE_LOCAL}${DATABASE_NAME}`;
        const tempDbInfo = await FileSystem.getInfoAsync(tempDbPath);
        
        if (tempDbInfo.exists) {
            await FileSystem.deleteAsync(tempDbPath);
            console.log(`🧹 Fichier temporaire de la base de données supprimé: ${DATABASE_NAME}`);
        }
    } catch (error) {
        console.log('⚠️ Impossible de supprimer le fichier temporaire de la base de données:', error);
        // Ce n'est pas critique, on continue
    }
}

export async function zipDirectory() {
    const dirUri = `${FileSystem.documentDirectory}${PATH_OF_TRAFIC_DIR_ON_THE_LOCAL}`;
    const zip = new JSZip();

    try {
        // Vérifier que le dossier principal existe
        const dirInfo = await FileSystem.getInfoAsync(dirUri);
        if (!dirInfo.exists) {
            throw new Error(`Le dossier ${dirUri} n'existe pas`);
        }

        // COPIER LA BASE DE DONNÉES DANS LE DOSSIER AVANT LE SCAN
        await copyDatabaseToTrafficFolder();
        
        // Ajouter récursivement tous les fichiers et dossiers (y compris la DB copiée)
        // Utiliser un traitement par morceaux pour éviter les problèmes de mémoire
        await addDirectoryToZip(zip, dirUri);
    } catch (error) {
        console.error('❌ Erreur lors de la lecture des fichiers:', error);
        Logger.log('error', 'Erreur lors de la lecture des fichiers:', {error});
        throw error;
    }

    // Générer le fichier zip
    const zipContent = await zip.generateAsync({ type: 'base64' });
    console.log('✅ Fichier zip généré');

    // Sauvegarder le ZIP
    const zipUri = `${FileSystem.documentDirectory}${NAME_OF_TRAFIC_ZIP_FILE}`;
    console.log('✅ Chemin du fichier zip :', zipUri);
    await FileSystem.writeAsStringAsync(zipUri, zipContent, {
        encoding: FileSystem.EncodingType.Base64,
    });

    console.log('✅ ZIP créé ici :', zipUri);
    
    // Nettoyer le fichier temporaire de la base de données s'il existe
    // await cleanupTempDatabase();

    return zipUri;
}



export async function shareViaWhatsApp(zipUri: string) {
    const isAvailable = await Sharing.isAvailableAsync();
    if (!isAvailable) {
        alert("Le partage n'est pas disponible sur cet appareil.");
        return;
    }

    try {
        await Sharing.shareAsync(zipUri, {
            mimeType: 'application/zip',
            dialogTitle: 'Partager via...',
        });
    } catch (error) {
        console.error('Erreur de partage :', error);
        Logger.log('error', 'Erreur de partage :', {error});
    }
}


export async function uploadZipToTheWebService(zipUri: string) {
    const apiUrl = 'https://ton-backend.com/upload';

  // Lire le fichier en base64
  const base64 = await FileSystem.readAsStringAsync(zipUri, {
    encoding: FileSystem.EncodingType.Base64,
  });

    const filename = 'archive.zip';

  const formData = new FormData();
  formData.append('file', {
    uri: zipUri,
    name: filename,
    type: 'application/zip',
  } as any); // "as any" à cause des types RN

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      body: formData,
    });

    const result = await response.json();
    console.log('Réponse du serveur :', result);
  } catch (error) {
    console.error('Erreur d’envoi du fichier :', error);
    Logger.log('error', 'Erreur d’envoi du fichier :', {error});
  }
}



const deleteSQLiteDatabase = async (dbName = DATABASE_NAME) => {
  const dbPath = FileSystem.documentDirectory + 'SQLite/' + dbName;

  try {
    const fileInfo = await FileSystem.getInfoAsync(dbPath);
    if (fileInfo.exists) {
      await FileSystem.deleteAsync(dbPath, { idempotent: true });
      console.log(`🗑️ Base de données "${dbName}" supprimée avec succès.`);
    } else {
      console.log(`⚠️ Base de données "${dbName}" introuvable.`);
    }
  } catch (error) {
    console.error('❌ Erreur lors de la suppression de la base de données :', error);
    Logger.log('error', 'Erreur lors de la suppression de la base de données :', {error});
  }
};
