import BaseService from "./BaseService";

class Service extends BaseService {
    // ⬇️ Constructeur sans paramètre (comme tu veux)
    constructor() {
        super();
    }

    // Tu peux ajouter ici des méthodes métier spécifiques
    getToken(): string {
        return this.token;
    }

    getBaseUrl(): string {
        return this.baseUrl;
    }

    getTypeDiabete(): string {
        return this.type_diabete;
    }

    getFullUrl(path: string): string {
        return `${this.baseUrl}${path}${this.endUrl}`;
    }
}

export default Service;
