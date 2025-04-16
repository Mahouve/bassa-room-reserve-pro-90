
import React from 'react';
import { useSupabaseStatus } from '@/hooks/useSupabaseStatus';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Loader2 } from 'lucide-react';

const SupabaseStatus: React.FC = () => {
  const { isConnected, loading, error } = useSupabaseStatus();

  if (loading) {
    return (
      <div className="flex items-center justify-center p-4 rounded-md bg-gray-50 border border-gray-200">
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        <span>Checking Supabase connection...</span>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Connection Error</AlertTitle>
        <AlertDescription>
          Could not connect to Supabase: {error}
        </AlertDescription>
      </Alert>
    );
  }

  if (isConnected) {
    return (
      <Alert variant="default" className="bg-green-50 border-green-200 text-green-800">
        <AlertTitle>Connected</AlertTitle>
        <AlertDescription>
          Successfully connected to Supabase project.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Alert variant="default" className="bg-amber-50 border-amber-200 text-amber-800">
      <AlertTitle>Connection Issue</AlertTitle>
      <AlertDescription>
        Unable to connect to Supabase. Please check your configuration.
      </AlertDescription>
    </Alert>
  );
};

export default SupabaseStatus;
