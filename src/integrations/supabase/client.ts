
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types.generated';  // Ensure this import is correct

const SUPABASE_URL = "https://ynnitxcmnhpitsdhnwdi.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlubml0eGNtbmhwaXRzZGhud2RpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM1MjI1ODUsImV4cCI6MjA1OTA5ODU4NX0.cm_u509Zf9OKzuX_U9sQGM0dMLiglr49CdfoQsaZrcY";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  }
});
