import { useState } from "react";
import TraficAssistantService from "../Services/traficAssistantService";

interface UseTraficAssistantType {
    isLoading: boolean;
    handleSendData: () => void;
}

export default function useTraficAssistant() : UseTraficAssistantType {
    const [isLoading, setIsLoading] = useState(false);

    const handleSendData = () => {
        setIsLoading(true);
        TraficAssistantService.zipPatientDirectory().then((zipUri) => {
            setIsLoading(false);
            console.log("✅ Fichiers patients zippés :", zipUri);
        });
    }

    return {
        isLoading,
        handleSendData
    }
}
