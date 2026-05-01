import {Alert, Snackbar} from '@mui/material';
import {createContext, ReactNode, useCallback, useContext, useState} from 'react';

type ToastSeverity = 'success' | 'error' | 'warning' | 'info';
type ShowToast = (message: string, severity?: ToastSeverity) => void;

const ToastContext = createContext<ShowToast>(() => {});

export function useToast(): ShowToast {
    return useContext(ToastContext);
}

type ToastState = {
    open: boolean;
    message: string;
    severity: ToastSeverity;
};

export function ToastProvider({children}: {readonly children: ReactNode}) {
    const [toast, setToast] = useState<ToastState>({open: false, message: '', severity: 'success'});

    const showToast = useCallback<ShowToast>((message, severity = 'success') => {
        setToast({open: true, message, severity});
    }, []);

    const handleClose = () => setToast((prev) => ({...prev, open: false}));

    return (
        <ToastContext.Provider value={showToast}>
            {children}
            <Snackbar open={toast.open} autoHideDuration={4000} onClose={handleClose} anchorOrigin={{vertical: 'bottom', horizontal: 'center'}}>
                <Alert onClose={handleClose} severity={toast.severity} variant="filled" sx={{width: '100%'}}>
                    {toast.message}
                </Alert>
            </Snackbar>
        </ToastContext.Provider>
    );
}
