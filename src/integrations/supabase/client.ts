
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://irkjfhzmubbcghadgffe.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlya2pmaHptdWJiY2doYWRnZmZlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ3MDk5NTUsImV4cCI6MjA2MDI4NTk1NX0.BDHA8u6UwsMGIYAbpqj_3dzQegdek0qNKz5Q8_b9c8M";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  }
});
