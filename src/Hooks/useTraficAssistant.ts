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

    const handleSendData = () => {
        setIsLoading(true);
        TraficAssistantService.zipPatientDirectory().then((zipUri) => {
            setIsLoading(false);
            /* TraficAssistantService.sendZipFileToTheBackend({
                brand : brand ?? "",
                modelName : modelName ?? "",
                osVersion : osVersion ?? "",
                zipUri: zipUri ?? ""
            }); */

            console.log("✅ Fichiers patients zippés :", zipUri);
        });
    }

    return {
        isLoading,
        handleSendData
    }
}
