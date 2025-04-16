
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useSupabaseStatus = () => {
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [version, setVersion] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkConnection = async () => {
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
        const { data: versionData } = await supabase.rpc('version');
        if (versionData) {
          setVersion(versionData);
        }
        
      } catch (err: any) {
        console.error('Supabase connection error:', err);
        setIsConnected(false);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    checkConnection();
  }, []);

  return { isConnected, version, loading, error };
};
