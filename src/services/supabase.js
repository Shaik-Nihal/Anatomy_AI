import { createClient } from '@supabase/supabase-js';

let supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
let supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Clean up quotes if present
supabaseUrl = supabaseUrl.replace(/['"]/g, '').trim();
supabaseAnonKey = supabaseAnonKey.replace(/['"]/g, '').trim();

// Check if it's a placeholder or invalid
const isPlaceholder = !supabaseUrl || 
                      supabaseUrl.includes('YOUR_SUPABASE_URL') || 
                      !supabaseUrl.startsWith('http');

const finalUrl = isPlaceholder ? 'https://placeholder.supabase.co' : supabaseUrl;
const finalKey = isPlaceholder ? 'placeholder' : supabaseAnonKey;

export const supabase = createClient(finalUrl, finalKey);
