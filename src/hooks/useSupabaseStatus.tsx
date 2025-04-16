
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useSupabaseStatus = () => {
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [version, setVersion] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const checkConnection = useCallback(async () => {
    try {
      setLoading(true);
      
      // Perform a simple query to check if Supabase is connected
      const { data, error } = await supabase.from('profiles').select('count').limit(1);
      
      if (error) {
        throw new Error(error.message);
      }
      
      // If we get here, we're connected
      setIsConnected(true);
      
      // Get Supabase version info (not available in JS client directly, this is a workaround)
      try {
        // Using a different approach to get version info
        const response = await supabase.rpc('version');
        if (response.error) {
          console.log('Version info not available:', response.error);
          setVersion('Unknown');
        } else {
          // Safely convert to string
          setVersion(response.data ? String(response.data) : 'Unknown');
        }
      } catch (versionErr: any) {
        console.log('Version info not available:', versionErr);
        setVersion('Unknown');
      }
      
    } catch (err: any) {
      console.error('Supabase connection error:', err);
      setIsConnected(false);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial check
  useEffect(() => {
    checkConnection();
  }, [checkConnection]);

  // Provide a way to refresh the status
  const refetch = useCallback(() => {
    return checkConnection();
  }, [checkConnection]);

  return { isConnected, version, loading, error, refetch };
};
