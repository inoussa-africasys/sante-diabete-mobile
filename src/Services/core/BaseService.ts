import { VERSION_NAME } from "../../Constants/App";
import { getBaseUrl, getDiabetesType, getToken } from "../../functions/auth";

abstract class BaseService {
    protected type_diabete!: string;
    protected baseUrl!: string;
    protected token!: string;
    protected endUrl!: string;

    // ⬇️ Méthode appelée après l'instanciation
    protected async initialize(): Promise<void> {
        this.baseUrl = await getBaseUrl();
        this.type_diabete = await getDiabetesType();
        this.token = await getToken();
        this.endUrl = `?token=${this.token}&app_version=${VERSION_NAME}`;
        
    }

    static async create<T extends BaseService>(this: new () => T): Promise<T> {
        const instance = new this();
        await instance.initialize();
        return instance;
    }
}

export default BaseService;
