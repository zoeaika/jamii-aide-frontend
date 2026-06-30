export const readLocalStorageBoolean = (key: string, defaultValue: boolean) => {
  if (typeof window === 'undefined') {
    return defaultValue;
  }

  try {
    const value = localStorage.getItem(key);
    if (value === null) {
      return defaultValue;
    }
    return value === 'true';
  } catch {
    return defaultValue;
  }
};

export const readStoredAccountRole = (): string | null => {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    const rawUser = localStorage.getItem('authUser') || localStorage.getItem('user');
    if (!rawUser) {
      return null;
    }

    const parsedUser = JSON.parse(rawUser);
    return String(parsedUser?.role || '');
  } catch {
    return null;
  }
};
