
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types.generated';

const SUPABASE_URL = "https://ynnitxcmnhpitsdhnwdi.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlubml0eGNtbmhwaXRzZGhud2RpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM1MjI1ODUsImV4cCI6MjA1OTA5ODU4NX0.cm_u509Zf9OKzuX_U9sQGM0dMLiglr49CdfoQsaZrcY";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  }
});

// Helper function to check connection
export const checkSupabaseConnection = async () => {
  try {
    // Simple test query to check if the connection works
    const { data, error } = await supabase.from('staff').select('id').limit(1);
    
    if (error) {
      console.error("Supabase connection test failed:", error);
      return false;
    }
    
    console.log("Supabase connection successful:", data);
    return true;
  } catch (e) {
    console.error("Supabase connection test failed:", e);
    return false;
  }
};

// Get database tables info - useful for debugging schema issues
export const getDatabaseTablesInfo = async () => {
  try {
    const { data, error } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public');
      
    if (error) {
      console.error("Error fetching tables:", error);
      return null;
    }
    
    return data;
  } catch (e) {
    console.error("Error in getDatabaseTablesInfo:", e);
    return null;
  }
};

// Get columns for a specific table - useful for debugging schema issues
export const getTableColumns = async (tableName: string) => {
  try {
    const { data, error } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type, is_nullable')
      .eq('table_schema', 'public')
      .eq('table_name', tableName);
      
    if (error) {
      console.error(`Error fetching columns for ${tableName}:`, error);
      return null;
    }
    
    return data;
  } catch (e) {
    console.error(`Error in getTableColumns for ${tableName}:`, e);
    return null;
  }
};
