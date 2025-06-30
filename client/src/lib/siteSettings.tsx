import React, { createContext, useContext, useEffect, useState } from "react";

export type FeatureFlags = Record<string, boolean>;

export interface SiteSettings {
  site_name?: string;
  site_description?: string;
  site_icon?: string;
  feature_flags?: FeatureFlags;
}

const SiteSettingsContext = createContext<SiteSettings>({});

export const useSiteSettings = () => useContext(SiteSettingsContext);

export const SiteSettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<SiteSettings>({});

  useEffect(() => {
    async function fetchSettings() {
      const keys = ["site_name", "site_description", "site_icon", "feature_flags"];
      const results = await Promise.all(
        keys.map(async (key) => {
          const res = await fetch(`/api/settings/${key}`);
          if (!res.ok) return [key, undefined];
          const data = await res.json();
          return [key, data.value];
        })
      );
      const obj: SiteSettings = {};
      for (const [key, value] of results) {
        if (key && value !== undefined) obj[key as keyof SiteSettings] = value;
      }
      setSettings(obj);
    }
    fetchSettings();
  }, []);

  return (
    <SiteSettingsContext.Provider value={settings}>
      {children}
    </SiteSettingsContext.Provider>
  );
};
