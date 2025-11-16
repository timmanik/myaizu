import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';

interface Organization {
  id: string;
  name: string;
  logoUrl?: string;
}

interface OrganizationContextType {
  organization: Organization;
  setOrganization: (org: Organization) => void;
}

const defaultOrganization: Organization = {
  id: '1',
  name: import.meta.env.VITE_ORGANIZATION_NAME || 'Personal Library',
  logoUrl: undefined,
};

const OrganizationContext = createContext<OrganizationContextType | undefined>(undefined);

interface OrganizationProviderProps {
  children: ReactNode;
}

export function OrganizationProvider({ children }: OrganizationProviderProps) {
  const [organization, setOrganization] = useState<Organization>(defaultOrganization);

  const value = {
    organization,
    setOrganization,
  };

  return <OrganizationContext.Provider value={value}>{children}</OrganizationContext.Provider>;
}

export function useOrganization() {
  const context = useContext(OrganizationContext);
  if (context === undefined) {
    throw new Error('useOrganization must be used within an OrganizationProvider');
  }
  return context;
}

