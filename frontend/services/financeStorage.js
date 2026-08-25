const getStorageKey = (userId) => `party-finance-${userId || 'guest'}`;

export const getFinanceData = (userId) => {
    try {
        const stored = localStorage.getItem(getStorageKey(userId));
        const data = stored ? JSON.parse(stored) : {};
        return {
            budget: Number(data.budget || 0),
            income: Number(data.income || 0),
        };
    } catch {
        return { budget: 0, income: 0 };
    }
};

export const saveFinanceData = (userId, data) => {
    const financeData = {
        budget: Math.max(0, Number(data.budget || 0)),
        income: Math.max(0, Number(data.income || 0)),
    };
    localStorage.setItem(getStorageKey(userId), JSON.stringify(financeData));
    window.dispatchEvent(new CustomEvent('finance-data-updated'));
    return financeData;
};

export const subscribeToFinanceData = (callback) => {
    window.addEventListener('finance-data-updated', callback);
    window.addEventListener('storage', callback);
    return () => {
        window.removeEventListener('finance-data-updated', callback);
        window.removeEventListener('storage', callback);
    };
};
