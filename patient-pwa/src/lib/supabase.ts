import { createClient } from '@supabase/supabase-js';

const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL || 'https://sjsghxacjgrxiboeygek.supabase.co';
const supabaseKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNqc2doeGFjamdyeGlib2V5Z2VrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY1OTUzMzgsImV4cCI6MjEwMjE3MTMzOH0.N90Fq2rss34ZvOFC55k_I3DeoU5zr4BQUaWG3rSYuJI';

export const supabase = createClient(supabaseUrl, supabaseKey);
