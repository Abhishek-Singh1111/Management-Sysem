import { useEffect, useState } from 'react';
import { Alert, Snackbar } from '@mui/material';
import { notificationEvent } from './useNotification';

const NotificationHost = () => {
    const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });

    useEffect(() => {
        const handleNotification = (event) => {
            setNotification({
                open: true,
                message: event.detail.message,
                severity: event.detail.severity,
            });
        };

        window.addEventListener(notificationEvent, handleNotification);
        return () => window.removeEventListener(notificationEvent, handleNotification);
    }, []);

    return (
        <Snackbar
            open={notification.open}
            autoHideDuration={4000}
            onClose={() => setNotification(prev => ({ ...prev, open: false }))}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
            <Alert
                severity={notification.severity}
                variant="filled"
                onClose={() => setNotification(prev => ({ ...prev, open: false }))}
            >
                {notification.message}
            </Alert>
        </Snackbar>
    );
};

export default NotificationHost;
