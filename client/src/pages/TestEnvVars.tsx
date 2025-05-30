import React, { useEffect } from "react";

const TestEnvVars = () => {
  useEffect(() => {
    console.log("✅ Supabase URL:", import.meta.env.VITE_SUPABASE_URL);
    console.log("✅ Supabase Key:", import.meta.env.VITE_SUPABASE_ANON_KEY);
  }, []);

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Check your Replit Console</h1>
      <p>
        If the env vars are loaded properly, you'll see them logged in Replit's
        console.
      </p>
    </div>
  );
};

export default TestEnvVars;
