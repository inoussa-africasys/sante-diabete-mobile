import React, { createContext, useCallback, useContext, useState } from 'react';
import { Toast } from './Toast';

type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastContextType {
    showToast: (message: string, type?: ToastType, duration?: number) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
};

interface ToastProviderProps {
    children: React.ReactNode;
}

export const ToastProvider: React.FC<ToastProviderProps> = ({ children }) => {
    const [visible, setVisible] = useState(false);
    const [message, setMessage] = useState('');
    const [type, setType] = useState<ToastType>('info');
    const [duration, setDuration] = useState(3000);

    const showToast = useCallback((message: string, type: ToastType = 'info', duration: number = 3000) => {
        setMessage(message);
        setType(type);
        setDuration(duration);
        setVisible(true);
    }, []);

    const hideToast = useCallback(() => {
        setVisible(false);
    }, []);

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            <Toast
                visible={visible}
                message={message}
                type={type}
                duration={duration}
                onHide={hideToast}
            />
        </ToastContext.Provider>
    );
};
