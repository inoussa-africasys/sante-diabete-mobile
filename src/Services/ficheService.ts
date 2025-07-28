import * as FileSystem from 'expo-file-system';
import { API_HEADER } from "../Constants/App";
import { FicheRepository } from "../Repositories/FicheRepository";
import Fiche from "../models/Fiche";
import Logger from "../utils/Logger";
import { TraficFolder } from '../utils/TraficFolder';
import { getFicheAdministrativeName } from "../utils/ficheAdmin";
import Service from "./core/Service";

export default class FicheService extends Service {
    private ficheRepository: FicheRepository;


    constructor() {
        super();
        this.ficheRepository = new FicheRepository();
    }

    async getAll(): Promise<Fiche[]> {
        return await this.ficheRepository.findAll();
    }

    async fetchAllFichesOnServerQuery(): Promise<string[]> {
        if (!this.getTypeDiabete()) {
            throw new Error('No typediabete found');
        }

        try {
            const response = await fetch(this.getFullUrl('/api/json/mobile/forms'), {
                method: 'GET',
                headers: API_HEADER
            });

            if (!response.ok) {
                throw new Error(`Erreur HTTP: ${response.status}`);
            }

            const data: string[] = await response.json();
            return data;
        } catch (error) {
            console.error('Erreur réseau :', error);
            throw error;
        }

    }


    async insertAllFichesOnTheLocalDb(fiches: string[]): Promise<void> {
        await this.ficheRepository.insertIfNotExistsByName(this.getTypeDiabete()!, fiches);
        console.log("fiches insertées : Ok");
    }

    makeFiche(name: string): Fiche {
        return new Fiche({ name: name, type_diabete: this.getTypeDiabete() });
    }


    async downloadFiche(ficheName: string): Promise<Fiche> {

        if (!this.getTypeDiabete()) {
            throw new Error('No typediabete found');
        }
        try {
            const response = await fetch(this.getFullUrl(`/api/json/mobile/forms/${ficheName}/content`), {
                method: 'GET',
                headers: API_HEADER
            });

            if (!response.ok) {
                Logger.log('error', 'Error downloading fiche', { response });
                throw new Error(`Erreur HTTP: ${response.status}`);
            }

            const data: any = await response.json();
            const fiche = await this.ficheRepository.findByName(ficheName);
            if (!fiche) { Logger.log('error', 'Error downloading fiche', { fiche }); throw new Error('Fiche not found'); }
            fiche.data = JSON.stringify(data);
            fiche.is_downloaded = true;
            await this.ficheRepository.update(fiche.id!, fiche);

            const ficheUpdated = await this.ficheRepository.findByName(ficheName);
            if (!ficheUpdated) { Logger.log('error', 'Error downloading fiche', { ficheUpdated }); throw new Error('Fiche not found'); }
            await this.createFicheAsJsonFile(ficheUpdated);
            return ficheUpdated;
        } catch (error) {
            console.error('Erreur réseau :', error);
            throw error;
        }
    }


    async getAllFicheDownloaded(): Promise<Fiche[]> {
        return await this.ficheRepository.findAllDownloadedAndNotEmptyFiche(this.getTypeDiabete()!);
    }

    async getByIdInLocalDB(ficheId: string): Promise<Fiche | null> {
        const id = parseInt(ficheId)
        return await this.ficheRepository.findById(id);
    }

    async getByNameInLocalDB(ficheName: string): Promise<Fiche | null> {
        return await this.ficheRepository.findByName(ficheName);
    }

    async getFicheAdministrativeOnTheLocalDb(): Promise<Fiche | null> {
        const ficheAdministrativeName = await getFicheAdministrativeName();
        return await this.ficheRepository.findByName(ficheAdministrativeName);
    }

    async createFicheAsJsonFile(fiche: Fiche): Promise<Fiche | null> {

        try {
            const folderUri = `${FileSystem.documentDirectory}${TraficFolder.getFormsDefinitionsFolderPath(this.getTypeDiabete())}`;
            const fileUri = `${folderUri}/${fiche.name}`;

            const dirInfo = await FileSystem.getInfoAsync(folderUri);
            if (!dirInfo.exists) {
                await FileSystem.makeDirectoryAsync(folderUri, { intermediates: true });
            }

            await FileSystem.writeAsStringAsync(fileUri, fiche.data, {
                encoding: FileSystem.EncodingType.UTF8,
            });

            console.log( `✅ Fiche enregistrée dans le fichier : ${fileUri}`);
        } catch (error) {
            console.error("❌ Erreur d'enregistrement du fichier JSON :", error);
        }

        return fiche;
    }

    getAllFicheNames(): string[] {
        return this.ficheRepository.findAllNames(this.getTypeDiabete()!);
    }

}
