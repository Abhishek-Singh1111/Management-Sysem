import { useCallback } from 'react';

const notificationEvent = 'party-fund-notification';

export const useNotification = () => {
    const showNotification = useCallback((message, severity = 'success') => {
        window.dispatchEvent(new CustomEvent(notificationEvent, {
            detail: { message, severity },
        }));
    }, []);

    return { showNotification };
};

export { notificationEvent };
