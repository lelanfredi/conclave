import { createClient } from "@supabase/supabase-js";

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

// Database types
export interface Participant {
  id: string;
  real_name: string;
  cardinal_name: string;
  created_at: string;
}

export interface Vote {
  id: string;
  participant_id: string;
  candidate_id: string;
  round: number;
  created_at: string;
}

export interface VotingSession {
  id: string;
  current_round: number;
  round_active: boolean;
  max_rounds: number;
  created_at: string;
  updated_at: string;
}

export interface Sanction {
  id: string;
  candidate_id: string;
  candidate_name: string;
  message: string;
  round: number;
  applied_by: string;
  created_at: string;
}
