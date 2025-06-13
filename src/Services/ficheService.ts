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

        const response = await fetch(this.getFullUrl('/api/json/mobile/forms'), {
            method: 'GET',
            headers: API_HEADER
        });
    
        if (!response.ok) {
            throw new Error(`Erreur HTTP: ${response.status}`);
        }
    
        const data: string[] = await response.json();
        console.log("data-------------------------------------- ");
        console.log("data : ", data);
        console.log("data-------------------------------------- ");
        return data;
    }
    

    async insertAllFichesOnTheLocalDb(fiches: String[]): Promise<void> {

        await this.ficheRepository.clean();
        await this.ficheRepository.insertAllOptimizedBatch(fiches.map((fiche) => new Fiche({ name: fiche, type_diabete: this.getTypeDiabete() })));
        console.log("fiches insertées : Ok");
    }

    makeFiche(name: string): Fiche {
        return new Fiche({ name: name, type_diabete: this.getTypeDiabete() });
    }


}
