// src/integrations/supabase/supabase.ts

import { Database } from './types.generated'; // or wherever your types are

export type Tables = Database['public']['Tables'];
export type Enums = Database['public']['Enums'];
export type InsertTable<T extends keyof Tables> = Tables[T]['Insert'];
export type UpdateTable<T extends keyof Tables> = Tables[T]['Update'];
export type RowTable<T extends keyof Tables> = Tables[T]['Row'];
