import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://sfyoovpaonzffddijrmt.supabase.co"; // your Supabase URL here
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNmeW9vdnBhb256ZmZkZGlqcm10Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc0MjAyMDQsImV4cCI6MjA2Mjk5NjIwNH0.mI8GQPFnK2vLOm1aRg-PP4jOHCLn5Z7Q-eKO_5bYyuU"; // your anon public key here

const supabase = createClient(supabaseUrl, supabaseKey);

async function testUsers() {
  // Try to fetch all users
  const { data, error } = await supabase.from("users").select("*");

  if (error) {
    console.error("Error fetching users:", error.message);
  } else {
    console.log("Users fetched successfully:", data);
  }
}

testUsers();
