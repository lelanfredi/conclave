import { createClient } from "@supabase/supabase-js";
import type { Participant, Vote, VotingSession, Sanction } from "@/types/supabase";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    "Supabase environment variables not found. Using fallback mode.",
  );
  console.warn(
    "To enable Supabase integration, set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your environment variables.",
  );
}

export const supabase =
  supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey, {
        realtime: {
          params: {
            eventsPerSecond: 10,
          },
        },
      })
    : null;

// Test Supabase connection
if (supabase) {
  supabase
    .from("participants")
    .select("count", { count: "exact", head: true })
    .then(({ error }) => {
      if (error) {
        console.error("Supabase connection test failed:", error.message);
        console.warn(
          "Make sure your Supabase database has the required tables and RLS policies.",
        );
      } else {
        console.log("✅ Supabase connection successful");
      }
    });
}

// Re-export types for convenience
export type { Participant, Vote, VotingSession, Sanction };
