/**
 * Supabase Configuration
 * Ganti URL dan ANON_KEY dengan yang ada di Project Settings > API di dashboard Supabase-mu.
 */
const SUPABASE_URL = 'https://dppqqundggnieolusvtx.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRwcHFxdW5kZ2duaWVvbHVzdnR4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgxMzQ2MzgsImV4cCI6MjA5MzcxMDYzOH0.PXrtRmylaa-saGmxl7LxORCohwNXc6kReiJCBsizBVw';

// Inisialisasi client Supabase
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
