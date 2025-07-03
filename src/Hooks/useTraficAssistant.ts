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
        setTimeout(() => {
            TraficAssistantService.zipPatientDirectory();
            setIsLoading(false);
        }, 2000);
    }

    return {
        isLoading,
        handleSendData
    }
}
