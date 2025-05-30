import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";

// Load environment variables from .env file
dotenv.config();

// Get Supabase credentials, use defaults for development if not available
const supabaseUrl = process.env.SUPABASE_URL || "https://sfyoovpaonzffddijrmt.supabase.co";
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNmeW9vdnBhb256ZmZkZGlqcm10Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc0MjAyMDQsImV4cCI6MjA2Mjk5NjIwNH0.mI8GQPFnK2vLOm1aRg-PP4jOHCLn5Z7Q-eKO_5bYyuU";

console.log("Initializing Supabase client with:", { 
  url: supabaseUrl.substring(0, 30) + "...",
  key: supabaseAnonKey.substring(0, 20) + "..." 
});

// Create a single supabase client for interacting with your database
export const supabase = createClient(supabaseUrl, supabaseAnonKey);