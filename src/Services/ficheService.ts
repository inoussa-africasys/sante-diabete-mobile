import { API_HEADER } from "../Constants/App";
import { FicheRepository } from "../Repositories/FicheRepository";
import Fiche from "../models/Fiche";
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
        console.log("baseUrl : ", this.baseUrl);
        console.log("token : ", this.token);
        console.log("type_diabete : ", this.getTypeDiabete());
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
                throw new Error(`Erreur HTTP: ${response.status}`);
            }

            const data: any = await response.json();
            const fiche = await this.ficheRepository.findByName(ficheName);
            if (!fiche) { throw new Error('Fiche not found'); }
            fiche.data = data;
            fiche.is_downloaded = true;
            await this.ficheRepository.update(fiche.id!, fiche);

            const ficheUpdated = await this.ficheRepository.findByName(ficheName);
            if (!ficheUpdated) { throw new Error('Fiche not found'); }
            console.log("fiche updated : Ok ", ficheUpdated);
            return ficheUpdated;
        } catch (error) {
            console.error('Erreur réseau :', error);
            throw error;
        }
    }


    async getAllFicheDownloaded(): Promise<Fiche[]> {
        return await this.ficheRepository.findAllDownloadedAndNotEmptyFiche(this.getTypeDiabete()!);
    }

}
