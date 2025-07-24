import * as FileSystem from "expo-file-system";
import * as Sharing from 'expo-sharing';
import JSZip from 'jszip';
import { NAME_OF_TRAFIC_ZIP_FILE, PATH_OF_TRAFIC_DIR_ON_THE_LOCAL } from "../Constants/App";
import { DATABASE_NAME, DATABASE_PATH } from "../Constants/Database";


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
                const fileContent = await FileSystem.readAsStringAsync(fullPath, {
                    encoding: FileSystem.EncodingType.Base64,
                });
                console.log(`✅ Fichier ajouté: ${zipPath}`);
                zip.file(zipPath, fileContent, { base64: true });
            } catch (error) {
                console.error(`❌ Erreur lecture fichier ${zipPath}:`, error);
            }
        } else if (fileInfo.exists && fileInfo.isDirectory) {
            // C'est un dossier, on l'explore récursivement
            console.log(`📁 Exploration du sous-dossier: ${zipPath}`);
            await addDirectoryToZip(zip, fullPath, zipPath);
        }
    }
}

// Fonction simple pour copier la base de données dans le dossier de trafic
async function copyDatabaseToTrafficFolder() {
    try {
        const dbPath = `${DATABASE_PATH}${DATABASE_NAME}`;
        const tempDbPath = `${FileSystem.documentDirectory}/${PATH_OF_TRAFIC_DIR_ON_THE_LOCAL}/${DATABASE_NAME}`;
        
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
            
            console.log(`✅ Base de données copiée avec succès !`);
        } else {
            console.log(`⚠️ Base de données non trouvée à: ${dbPath}`);
        }
        
    } catch (error) {
        console.error('❌ Erreur lors de la copie de la base de données:', error);
        // Ne pas faire échouer le processus, continuer sans la DB
    }
}

// Fonction pour créer un fichier d'information sur la base de données
async function createDatabaseInfoFile(zip: JSZip, dbPath: string) {
    try {
        // Créer un fichier d'information détaillé sur la base de données
        console.log('📝 Création du fichier d\'information de la base de données...');
        
        // On peut créer un fichier texte avec les informations de la DB
        const dbInfo = await FileSystem.getInfoAsync(dbPath);
        const currentDate = new Date().toISOString();
        const infoText = `=== INFORMATIONS BASE DE DONNÉES SQLITE ===\n\nFichier: ${DATABASE_NAME}\nChemin: ${dbPath}\nDate d'export: ${currentDate}\nStatut: Non incluse (trop volumineuse)\n\n=== RAISON ===\nLa base de données est trop volumineuse pour être incluse\ndirectement dans l'archive ZIP sans causer des problèmes\nde mémoire sur l'appareil mobile.\n\n=== CONTENU DE CETTE ARCHIVE ===\n✓ Dossiers et fichiers de données\n✓ Fichiers de configuration\n✓ Logs et rapports\n✗ Base de données SQLite (voir instructions ci-dessous)\n\n=== POUR RÉCUPÉRER LA BASE DE DONNÉES ===\n\n1. LOCALISATION:\n   - Chemin: ${dbPath}\n   - Nom du fichier: ${DATABASE_NAME}\n\n2. MÉTHODES D'EXPORT:\n   a) Via l'application:\n      - Utilisez une fonction d'export dédiée\n      - Ou accédez aux paramètres de sauvegarde\n   \n   b) Accès direct (si possible):\n      - Naviguez vers le répertoire SQLite\n      - Copiez le fichier ${DATABASE_NAME}\n      - Sauvegardez-le séparément\n\n=== IMPORTANT ===\nCette base de données contient toutes les données\nimportantes de l'application. Assurez-vous de la\nsauvegarder régulièrement pour éviter toute perte.\n\n=== SUPPORT ===\nEn cas de problème, contactez l'équipe technique\navec ce fichier d'information.`;
        
        zip.file('database_info.txt', infoText);
        console.log('✅ Fichier d\'information de la base de données créé à la racine du ZIP');
        
    } catch (error) {
        console.error('❌ Erreur lors de la création du fichier d\'information:', error);
    }
}

// Fonction pour nettoyer le fichier temporaire de la base de données
async function cleanupTempDatabase() {
    try {
        const tempDbPath = `${FileSystem.documentDirectory}/${PATH_OF_TRAFIC_DIR_ON_THE_LOCAL}/${DATABASE_NAME}`;
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
    const dirUri = `${FileSystem.documentDirectory}/${PATH_OF_TRAFIC_DIR_ON_THE_LOCAL}`;
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
        await addDirectoryToZip(zip, dirUri);
        console.log('✅ Tous les fichiers et dossiers ont été ajoutés au ZIP');
        
        console.log('✅ Export terminé - fichiers et base de données inclus');
    } catch (error) {
        console.error('❌ Erreur lors de la lecture des fichiers:', error);
        throw error;
    }

    // Générer le fichier zip
    const zipContent = await zip.generateAsync({ type: 'base64' });
    console.log('✅ Fichier zip généré');

    // Sauvegarder le ZIP
    const zipUri = `${FileSystem.documentDirectory}/${PATH_OF_TRAFIC_DIR_ON_THE_LOCAL}/${NAME_OF_TRAFIC_ZIP_FILE}`;
    console.log('✅ Chemin du fichier zip :', zipUri);
    await FileSystem.writeAsStringAsync(zipUri, zipContent, {
        encoding: FileSystem.EncodingType.Base64,
    });

    console.log('✅ ZIP créé ici :', zipUri);
    
    // Nettoyer le fichier temporaire de la base de données s'il existe
    await cleanupTempDatabase();
    
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
  }
}


