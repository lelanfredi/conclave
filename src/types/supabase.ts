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
  session_ended?: boolean;
  ended_at?: string;
  winner_id?: string;
  winner_name?: string;
  created_at: string;
  updated_at: string;
}

export interface Sanction {
  id: string;
  message: string;
  round: number;
  applied_by: string;
  created_at: string;
}

export interface Candidate {
  id: string;
  name: string;
  votes: number;
  percentage: number;
  eliminated: boolean;
  hasVoted?: boolean;
  image?: string;
}
