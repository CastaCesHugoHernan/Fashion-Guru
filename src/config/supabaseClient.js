// src/config/supabaseClient.js
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://entqaslgiqvpvvnioiju.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVudHFhc2xnaXF2cHZ2bmlvaWp1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mjg2NjQ4MTQsImV4cCI6MjA0NDI0MDgxNH0.II5kEBH0vHbtaERn3RjV1cu2qEQnkpmIk9RF-5si0_w'; // Reemplaza con tu anon key directamente aquí

// Crear el cliente Supabase y exportarlo
export const supabase = createClient(supabaseUrl, supabaseAnonKey);


