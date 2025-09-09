import { useState } from "react";
import TraficAssistantService from "../Services/traficAssistantService";
import Logger from "../utils/Logger";
import useDeviceInfo from "./useDeviceInfo";
interface UseTraficAssistantType {
    isLoading: boolean;
    error: string | null;
    handleSendData: () => Promise<string>;
}

export default function useTraficAssistant(): UseTraficAssistantType {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const {
        brand,
        modelName,
        osVersion,
    } = useDeviceInfo();

    const handleSendData = async (): Promise<string> => {
        setIsLoading(true);
        try {
            const zipUri = await TraficAssistantService.zipPatientDirectory();
            //const zipUri = await zipDirectoryNativeRNZA();
            if (!zipUri) {
                Logger.log('error', '❌ Erreur lors de la compression des fichiers patients', { error: '❌ Erreur lors de la compression des fichiers patients' });
                throw new Error('❌ Erreur lors de la compression des fichiers patients');
            }
            await TraficAssistantService.sendZipFileToTheBackend({
                brand: brand ?? "",
                modelName: modelName ?? "",
                osVersion: osVersion ?? "",
                zipUri: zipUri ?? ""
            });
            Logger.log('info', '✅ Fichiers patients zippés :', { zipUri });
            console.log('✅ Fichiers patients zippés :', zipUri);
            return zipUri;
        } catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            Logger.log('error', '❌ Erreur lors de l\'envoi des fichiers patients', { error: message });
            setError(message);
            throw error;
        } finally {
            setIsLoading(false);
        }

    }

    return {
        isLoading,
        error,
        handleSendData
    }
}
