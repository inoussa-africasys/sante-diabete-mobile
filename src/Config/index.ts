import { config, loadConfig } from "./globalConfig";

// Fonction pour initialiser la configuration
export const initConfig = async () => {
    await loadConfig();
    return config;
};

export default config;