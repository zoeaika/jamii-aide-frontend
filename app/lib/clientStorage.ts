import { getRoleValue } from '@/app/lib/api';

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

    const parsedUser = JSON.parse(rawUser) as Record<string, unknown>;
    const role = getRoleValue(parsedUser);

    if (role) {
      return role;
    }

    const nestedUser = parsedUser.user;
    if (nestedUser && typeof nestedUser === 'object') {
      const nestedRole = getRoleValue(nestedUser as Record<string, unknown>);
      if (nestedRole) {
        return nestedRole;
      }
    }

    if (
      parsedUser.organization_name ||
      parsedUser.organization ||
      parsedUser.organization_admin ||
      parsedUser.organization_profile ||
      parsedUser.is_organization_admin ||
      parsedUser.is_org_admin
    ) {
      return 'ORGANIZATION_ADMIN';
    }

    return null;
  } catch {
    return null;
  }
};
