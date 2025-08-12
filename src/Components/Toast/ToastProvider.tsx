import React, { createContext, useCallback, useContext, useState } from 'react';
import { Toast } from './Toast';

type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastContextType {
    showToast: (message: string, type?: ToastType, duration?: number) => void;
    showConfirm: (
        message: string,
        options?: {
            type?: ToastType;
            confirmLabel?: string;
            cancelLabel?: string;
            duration?: number;
            persistent?: boolean;
            showClose?: boolean;
            onConfirm?: () => void;
            onCancel?: () => void;
        }
    ) => void;
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
    const [confirmLabel, setConfirmLabel] = useState<string | undefined>();
    const [cancelLabel, setCancelLabel] = useState<string | undefined>();
    const [onConfirm, setOnConfirm] = useState<(() => void) | undefined>();
    const [onCancel, setOnCancel] = useState<(() => void) | undefined>();
    const [persistent, setPersistent] = useState<boolean>(false);
    const [showClose, setShowClose] = useState<boolean>(false);

    const showToast = useCallback((message: string, type: ToastType = 'info', duration: number = 3000) => {
        setMessage(message);
        setType(type);
        setDuration(duration);
        // reset actions
        setConfirmLabel(undefined);
        setCancelLabel(undefined);
        setOnConfirm(undefined);
        setOnCancel(undefined);
        setPersistent(false);
        setShowClose(false);
        setVisible(true);
    }, []);

    const hideToast = useCallback(() => {
        setVisible(false);
    }, []);

    const showConfirm: ToastContextType['showConfirm'] = useCallback((message, options) => {
        const {
            type = 'warning',
            confirmLabel = 'Oui',
            cancelLabel = 'Non',
            duration = 3000,
            persistent = true,
            showClose = true,
            onConfirm,
            onCancel,
        } = options || {};

        setMessage(message);
        setType(type);
        setDuration(duration);
        setConfirmLabel(confirmLabel);
        setCancelLabel(cancelLabel);
        setPersistent(persistent);
        setShowClose(showClose);
        setOnConfirm(() => onConfirm);
        setOnCancel(() => onCancel);
        setVisible(true);
    }, []);

    return (
        <ToastContext.Provider value={{ showToast, showConfirm }}>
            {children}
            <Toast
                visible={visible}
                message={message}
                type={type}
                duration={duration}
                onHide={hideToast}
                onConfirm={onConfirm}
                onCancel={onCancel}
                confirmLabel={confirmLabel}
                cancelLabel={cancelLabel}
                persistent={persistent}
                showClose={showClose}
                onClose={hideToast}
            />
        </ToastContext.Provider>
    );
};
