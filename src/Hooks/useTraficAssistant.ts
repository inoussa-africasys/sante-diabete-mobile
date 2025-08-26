import { useState } from "react";
import TraficAssistantService from "../Services/traficAssistantService";
import useDeviceInfo from "./useDeviceInfo";

interface UseTraficAssistantType {
    isLoading: boolean;
    handleSendData: () => void;
}

export default function useTraficAssistant(): UseTraficAssistantType {
    const [isLoading, setIsLoading] = useState(false);
    const {
        brand,
        modelName,
        osVersion,
      } = useDeviceInfo();

    const handleSendData = async () => {
        setIsLoading(true);
        const zipUri = await TraficAssistantService.zipPatientDirectory();
        await TraficAssistantService.sendZipFileToTheBackend({
            brand : brand ?? "",
            modelName : modelName ?? "",
            osVersion : osVersion ?? "",
            zipUri: zipUri ?? ""
        });
        setIsLoading(false);
        console.log("✅ Fichiers patients zippés :", zipUri);
    }

    return {
        isLoading,
        handleSendData
    }
}
