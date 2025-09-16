import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/lib/logger";

export type UserSettings = {
  id?: string;
  user_id?: string;
  white_label_enabled: boolean;
  hide_branding: boolean;
  api_access_enabled: boolean;
  custom_domain?: string | null;
  brand_color?: string | null;
  company_name?: string | null;
  logo_url?: string | null;
  created_at?: string;
  updated_at?: string;
};

const defaultSettings: UserSettings = {
  white_label_enabled: false,
  hide_branding: false,
  api_access_enabled: false,
  custom_domain: null,
  brand_color: '#3b82f6',
  company_name: null,
  logo_url: null,
};

export function useUserSettings() {
  const [settings, setSettings] = useState<UserSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadUserSettings();
  }, []);

  const loadUserSettings = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setSettings(defaultSettings);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) {
        logger.error('Error loading user settings', error, { userId: user.id });
        throw new Error('Failed to load user settings');
      }

      if (data) {
        setSettings(data);
      } else {
        // Create default settings for new user
        const newSettings = { ...defaultSettings, user_id: user.id };
        const { data: createdSettings, error: createError } = await supabase
          .from('user_settings')
          .insert(newSettings)
          .select()
          .single();

        if (createError) {
          logger.error('Error creating user settings', createError, { userId: user.id });
          throw new Error('Failed to create user settings');
        }

        setSettings(createdSettings);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(errorMessage);
      logger.error('Unexpected error in loadUserSettings', err as Error);
    } finally {
      setLoading(false);
    }
  };

  const updateSettings = async (updates: Partial<UserSettings>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('You must be logged in to update settings');
      }

      const { data, error } = await supabase
        .from('user_settings')
        .upsert({
          user_id: user.id,
          ...settings,
          ...updates,
        })
        .select()
        .single();

      if (error) {
        logger.error('Error updating user settings', error, { userId: user.id });
        throw new Error('Failed to update user settings');
      }

      setSettings(data);
      logger.info('User settings updated successfully', { userId: user.id });
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(errorMessage);
      logger.error('Unexpected error in updateSettings', err as Error);
      throw err;
    }
  };

  return {
    settings,
    loading,
    error,
    updateSettings,
    refreshSettings: loadUserSettings,
  };
}

export async function getUserSettingsForWhiteLabel(userId?: string) {
  try {
    if (!userId) {
      return defaultSettings;
    }

    const { data, error } = await supabase
      .from('user_settings')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) {
      logger.error('Error loading white label settings', error, { userId });
      return defaultSettings;
    }

    return data || defaultSettings;
  } catch (error) {
    logger.error('Unexpected error in getUserSettingsForWhiteLabel', error as Error, { userId });
    return defaultSettings;
  }
}