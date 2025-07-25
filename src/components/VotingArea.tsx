import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  AlertCircle,
  CheckCircle2,
  Crown,
  Church,
  Bell,
  Award,
  Zap,
  Lock,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ResultsDashboard from "./ResultsDashboard";
import {
  supabase,
  type Participant,
  type Vote,
  type VotingSession,
  type Sanction,
} from "@/lib/supabase";
import { Textarea } from "@/components/ui/textarea";
import { AlertTriangle } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface Candidate {
  id: string;
  name: string;
  votes: number;
  eliminated: boolean;
  hasVoted?: boolean;
  image?: string;
}

interface VotingAreaProps {
  realName?: string;
  nickname?: string;
  isAdmin?: boolean;
  isTvMode?: boolean;
  currentRound?: number;
  roundActive?: boolean;
  onVote?: (candidateId: string) => void;
  onStartRound?: () => void;
  onEndRound?: () => void;
  onEliminateCandidate?: (candidateId: string) => void;
}

const VotingArea = ({
  realName = "Participante",
  nickname = "Cardeal Participante",
  isAdmin = false,
  isTvMode = false,
  currentRound = 1,
  roundActive = false,
  onVote = () => {},
  onStartRound = () => {},
  onEndRound = () => {},
  onEliminateCandidate = () => {},
}: VotingAreaProps) => {
  const [selectedCandidate, setSelectedCandidate] = useState<string | null>(
    null,
  );
  const [showResults, setShowResults] = useState<boolean>(false);
  const [hasVoted, setHasVoted] = useState<boolean>(false);
  const [showBellAnimation, setShowBellAnimation] = useState<boolean>(false);
  const [showWinnerAnimation, setShowWinnerAnimation] =
    useState<boolean>(false);
  const [showNewRoundMessage, setShowNewRoundMessage] =
    useState<boolean>(false);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [showParticipantsList, setShowParticipantsList] =
    useState<boolean>(true);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [votingSession, setVotingSession] = useState<VotingSession | null>(
    null,
  );
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [sanctions, setSanctions] = useState<Sanction[]>([]);
  const [sanctionMessages, setSanctionMessages] = useState<
    Record<string, string>
  >({});
  const [showSanctionInputs, setShowSanctionInputs] = useState<
    Record<string, boolean>
  >({});
  const [isAdminAuthenticated, setIsAdminAuthenticated] =
    useState<boolean>(false);
  const [showPasswordDialog, setShowPasswordDialog] = useState<boolean>(false);
  const [passwordInput, setPasswordInput] = useState<string>("");
  const [passwordError, setPasswordError] = useState<string>("");

  // Load initial data
  useEffect(() => {
    loadData();
  }, []);

  // Check admin authentication on mount
  useEffect(() => {
    if (isAdmin && !isAdminAuthenticated) {
      setShowPasswordDialog(true);
    }
  }, [isAdmin, isAdminAuthenticated]);

  // Real-time synchronization with Supabase
  useEffect(() => {
    if (supabase) {
      const votingChannel = supabase
        .channel("voting_updates")
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "votes" },
          () => {
            console.log("Votes updated, reloading data...");
            loadData();
          },
        )
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "voting_sessions" },
          () => {
            console.log("Voting session updated, reloading data...");
            loadData();
          },
        )
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "participants" },
          () => {
            console.log("Participants updated, reloading data...");
            loadData();
          },
        )
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "sanctions" },
          () => {
            console.log("Sanctions updated, reloading data...");
            loadData();
          },
        )
        .subscribe();

      return () => {
        supabase.removeChannel(votingChannel);
      };
    }
  }, []);

  // Auto-refresh for TV mode
  useEffect(() => {
    if (isTvMode) {
      const interval = setInterval(() => {
        console.log("TV mode auto-refresh...");
        loadData();
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [isTvMode]);

  // Auto-end round when all participants have voted
  useEffect(() => {
    // Calculate vote statistics inside useEffect to avoid initialization issues
    const totalVotes = candidates.reduce(
      (sum, candidate) => sum + candidate.votes,
      0,
    );
    const activeParticipants = participants.length;
    const votedCount = totalVotes; // Total votes cast

    if (
      roundActive &&
      votedCount === activeParticipants &&
      activeParticipants > 0 &&
      isAdmin
    ) {
      console.log("All participants voted, auto-ending round...");
      handleEndRound();
    }
  }, [candidates, participants, roundActive, isAdmin]);

  // Calculate vote statistics for rendering
  const totalVotes = candidates.reduce(
    (sum, candidate) => sum + candidate.votes,
    0,
  );
  const activeParticipants = participants.length;
  const votedCount = totalVotes; // Total votes cast
  const winner = candidates.find(
    (c) => !c.eliminated && totalVotes > 0 && c.votes / totalVotes > 0.5,
  );

  // Check if voting session has ended
  const sessionEnded = votingSession?.session_ended || winner !== undefined;

  // Bell sound effect simulation
  useEffect(() => {
    if (roundActive && !showBellAnimation) {
      setShowBellAnimation(true);
      setTimeout(() => setShowBellAnimation(false), 3000);
    }
  }, [roundActive]);

  // Load data from Supabase or fallback to localStorage
  const loadData = async () => {
    try {
      if (supabase) {
        // Load voting session
        const { data: sessionData, error: sessionError } = await supabase
          .from("voting_sessions")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(1)
          .single();

        if (sessionData) {
          setVotingSession(sessionData);
        } else if (sessionError?.code === "PGRST116") {
          // No session exists, create initial session
          const { data: newSession, error: createError } = await supabase
            .from("voting_sessions")
            .insert({
              current_round: 1,
              round_active: false,
              max_rounds: 4,
            })
            .select()
            .single();

          if (createError) {
            console.error("Error creating voting session:", createError);
          } else {
            setVotingSession(newSession);
          }
        } else {
          console.error("Error loading voting session:", sessionError);
        }

        // Load sanctions for current round
        if (sessionData) {
          const { data: sanctionsData } = await supabase
            .from("sanctions")
            .select("*")
            .eq("round", sessionData.current_round)
            .order("created_at", { ascending: false });

          if (sanctionsData) {
            setSanctions(sanctionsData);
          }
        }

        // Load participants
        const { data: participantsData } = await supabase
          .from("participants")
          .select("*")
          .order("created_at", { ascending: true });

        if (participantsData) {
          setParticipants(participantsData);

          // Convert to candidates format
          const candidatesData = participantsData.map((p) => ({
            id: p.id,
            name: p.cardinal_name,
            votes: 0,
            eliminated: false,
            hasVoted: false,
            image: `https://api.dicebear.com/7.x/avataaars/svg?seed=${p.cardinal_name.replace(/\s+/g, "")}`,
          }));
          setCandidates(candidatesData);

          // Load vote counts for current round
          if (sessionData) {
            const { data: votesData } = await supabase
              .from("votes")
              .select("candidate_id")
              .eq("round", sessionData.current_round);

            if (votesData) {
              const voteCounts = votesData.reduce(
                (acc: Record<string, number>, vote) => {
                  acc[vote.candidate_id] = (acc[vote.candidate_id] || 0) + 1;
                  return acc;
                },
                {},
              );

              setCandidates((prev) =>
                prev.map((c) => ({
                  ...c,
                  votes: voteCounts[c.id] || 0,
                })),
              );
            }
          }
        }
      } else {
        // Fallback to localStorage if Supabase is not configured
        const storedParticipants = localStorage.getItem("participants");
        const storedSession = localStorage.getItem("votingSession");
        const storedVotes = localStorage.getItem("votes");

        if (storedParticipants) {
          const participantsData = JSON.parse(storedParticipants);
          setParticipants(participantsData);

          const candidatesData = participantsData.map((p: any) => ({
            id: p.id,
            name: p.cardinal_name,
            votes: 0,
            eliminated: false,
            hasVoted: false,
            image: `https://api.dicebear.com/7.x/avataaars/svg?seed=${p.cardinal_name.replace(/\s+/g, "")}`,
          }));
          setCandidates(candidatesData);
        }

        if (storedSession) {
          setVotingSession(JSON.parse(storedSession));
        } else {
          const defaultSession = {
            id: "default",
            current_round: 1,
            round_active: false,
            max_rounds: 4,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };
          setVotingSession(defaultSession);
          localStorage.setItem("votingSession", JSON.stringify(defaultSession));
        }

        if (storedVotes) {
          const votesData = JSON.parse(storedVotes);
          const voteCounts = votesData.reduce(
            (acc: Record<string, number>, vote: any) => {
              acc[vote.candidate_id] = (acc[vote.candidate_id] || 0) + 1;
              return acc;
            },
            {},
          );

          setCandidates((prev) =>
            prev.map((c) => ({
              ...c,
              votes: voteCounts[c.id] || 0,
            })),
          );
        }

        // Load sanctions from localStorage
        const storedSanctions = localStorage.getItem("sanctions");
        if (storedSanctions) {
          const sanctionsData = JSON.parse(storedSanctions);
          const currentRoundSanctions = sanctionsData.filter(
            (s: any) => s.round === (votingSession?.current_round || 1),
          );
          setSanctions(currentRoundSanctions);
        }
      }

      setLoading(false);
    } catch (error) {
      console.error("Error loading data:", error);
      setLoading(false);
    }
  };

  // Register new participant in Supabase or localStorage
  const registerParticipant = async (
    realName: string,
    cardinalName: string,
  ) => {
    try {
      if (supabase) {
        const { data, error } = await supabase
          .from("participants")
          .insert({
            real_name: realName,
            cardinal_name: cardinalName,
          })
          .select()
          .single();

        if (error) throw error;

        // Reload data to get updated participants
        await loadData();

        return data;
      } else {
        // Fallback to localStorage
        const newParticipant = {
          id: Date.now().toString(),
          real_name: realName,
          cardinal_name: cardinalName,
          created_at: new Date().toISOString(),
        };

        const storedParticipants = localStorage.getItem("participants");
        const participants = storedParticipants
          ? JSON.parse(storedParticipants)
          : [];
        participants.push(newParticipant);
        localStorage.setItem("participants", JSON.stringify(participants));

        await loadData();
        return newParticipant;
      }
    } catch (error) {
      console.error("Error registering participant:", error);
      return null;
    }
  };

  // Submit vote to Supabase or localStorage
  const submitVote = async (candidateId: string) => {
    if (!currentUserId || !votingSession) return false;

    try {
      if (supabase) {
        const { error } = await supabase.from("votes").insert({
          participant_id: currentUserId,
          candidate_id: candidateId,
          round: votingSession.current_round,
        });

        if (error) throw error;

        // Reload data to get updated vote counts
        await loadData();

        return true;
      } else {
        // Fallback to localStorage
        const newVote = {
          id: Date.now().toString(),
          participant_id: currentUserId,
          candidate_id: candidateId,
          round: votingSession.current_round,
          created_at: new Date().toISOString(),
        };

        const storedVotes = localStorage.getItem("votes");
        const votes = storedVotes ? JSON.parse(storedVotes) : [];
        votes.push(newVote);
        localStorage.setItem("votes", JSON.stringify(votes));

        await loadData();
        return true;
      }
    } catch (error) {
      console.error("Error submitting vote:", error);
      return false;
    }
  };

  // Check for winner (>50% votes)
  useEffect(() => {
    const totalVotes = candidates.reduce((sum, c) => sum + c.votes, 0);
    const winner = candidates.find(
      (c) => !c.eliminated && c.votes / totalVotes > 0.5,
    );
    if (winner && !showWinnerAnimation) {
      setShowWinnerAnimation(true);
    }
  }, [candidates]);

  // Update current round and round active status from voting session
  const actualCurrentRound = votingSession?.current_round || currentRound;
  const actualRoundActive = votingSession?.round_active || roundActive;

  const handleVote = async () => {
    if (selectedCandidate && !hasVoted) {
      const success = await submitVote(selectedCandidate);
      if (success) {
        onVote(selectedCandidate);
        setHasVoted(true);
        setShowResults(true);
      }
    }
  };

  const handleStartNewRound = async () => {
    try {
      if (supabase && votingSession) {
        // Update voting session to start the round
        const { error } = await supabase
          .from("voting_sessions")
          .update({
            round_active: true,
            updated_at: new Date().toISOString(),
          })
          .eq("id", votingSession.id);

        if (error) throw error;

        // Clear any existing votes for this round
        await supabase
          .from("votes")
          .delete()
          .eq("round", votingSession.current_round);

        console.log(
          `Round ${votingSession.current_round} started successfully`,
        );
      } else {
        // Fallback to localStorage
        if (votingSession) {
          const updatedSession = {
            ...votingSession,
            round_active: true,
            updated_at: new Date().toISOString(),
          };
          setVotingSession(updatedSession);
          localStorage.setItem("votingSession", JSON.stringify(updatedSession));

          // Clear votes for current round
          const storedVotes = localStorage.getItem("votes");
          const votes = storedVotes ? JSON.parse(storedVotes) : [];
          const filteredVotes = votes.filter(
            (vote: any) => vote.round !== votingSession.current_round,
          );
          localStorage.setItem("votes", JSON.stringify(filteredVotes));
        }
      }

      // Reload data to reflect changes
      await loadData();

      onStartRound();
      setHasVoted(false);
      setSelectedCandidate(null);
      setShowParticipantsList(false);
      setShowBellAnimation(true);
      setTimeout(() => setShowBellAnimation(false), 3000);
    } catch (error) {
      console.error("Error starting round:", error);
    }
  };

  const handleEndRound = async () => {
    try {
      if (supabase && votingSession) {
        // Check if there's a winner (>50% votes)
        const totalVotes = candidates.reduce((sum, c) => sum + c.votes, 0);
        const winner = candidates.find(
          (c) => !c.eliminated && totalVotes > 0 && c.votes / totalVotes > 0.5,
        );

        let nextRound = votingSession.current_round;
        let roundActive = false;
        let sessionEnded = false;

        if (winner) {
          // Winner found with >50% votes - end the entire voting session
          console.log(
            `Winner found: ${winner.name} with ${Math.round((winner.votes / totalVotes) * 100)}% votes (${winner.votes}/${totalVotes})`,
          );
          sessionEnded = true;
          setShowWinnerAnimation(true);
        } else if (votingSession.current_round < votingSession.max_rounds) {
          // No winner yet, prepare for next round
          nextRound = votingSession.current_round + 1;
          console.log(`No winner found. Preparing for round ${nextRound}`);
          setShowNewRoundMessage(true);
          setTimeout(() => setShowNewRoundMessage(false), 5000);
        } else {
          // Maximum rounds reached, force end session
          console.log("Maximum rounds reached. Ending voting session.");
          sessionEnded = true;
          // Find candidate with most votes as winner
          const topCandidate = candidates
            .filter((c) => !c.eliminated)
            .sort((a, b) => b.votes - a.votes)[0];
          if (topCandidate) {
            console.log(`Forced winner: ${topCandidate.name} with most votes`);
            setShowWinnerAnimation(true);
          }
        }

        // Update voting session
        const updateData: any = {
          current_round: nextRound,
          round_active: roundActive,
          updated_at: new Date().toISOString(),
        };

        if (sessionEnded) {
          updateData.session_ended = true;
          updateData.ended_at = new Date().toISOString();
          if (winner) {
            updateData.winner_id = winner.id;
            updateData.winner_name = winner.name;
          }
        }

        const { error } = await supabase
          .from("voting_sessions")
          .update(updateData)
          .eq("id", votingSession.id);

        if (error) throw error;

        console.log(`Round ${votingSession.current_round} ended successfully`);
      } else {
        // Fallback to localStorage
        if (votingSession) {
          const totalVotes = candidates.reduce((sum, c) => sum + c.votes, 0);
          const winner = candidates.find(
            (c) =>
              !c.eliminated && totalVotes > 0 && c.votes / totalVotes > 0.5,
          );

          let nextRound = votingSession.current_round;
          let roundActive = false;
          let sessionEnded = false;

          if (winner) {
            console.log(
              `Winner found: ${winner.name} with ${Math.round((winner.votes / totalVotes) * 100)}% votes`,
            );
            sessionEnded = true;
            setShowWinnerAnimation(true);
          } else if (votingSession.current_round < votingSession.max_rounds) {
            nextRound = votingSession.current_round + 1;
            setShowNewRoundMessage(true);
            setTimeout(() => setShowNewRoundMessage(false), 5000);
          } else {
            sessionEnded = true;
            const topCandidate = candidates
              .filter((c) => !c.eliminated)
              .sort((a, b) => b.votes - a.votes)[0];
            if (topCandidate) {
              setShowWinnerAnimation(true);
            }
          }

          const updatedSession = {
            ...votingSession,
            current_round: nextRound,
            round_active: roundActive,
            session_ended: sessionEnded,
            updated_at: new Date().toISOString(),
            ...(sessionEnded && { ended_at: new Date().toISOString() }),
            ...(winner && { winner_id: winner.id, winner_name: winner.name }),
          };
          setVotingSession(updatedSession);
          localStorage.setItem("votingSession", JSON.stringify(updatedSession));
        }
      }

      // Reload data to reflect changes
      await loadData();

      onEndRound();
    } catch (error) {
      console.error("Error ending round:", error);
    }
  };

  const handleApplySanction = async (candidateId: string, message: string) => {
    if (!message.trim()) {
      alert("Por favor, insira uma mensagem para a sanção.");
      return;
    }

    try {
      const candidate = candidates.find((c) => c.id === candidateId);
      if (!candidate || !votingSession) return;

      const sanctionData = {
        candidate_id: candidateId,
        candidate_name: candidate.name,
        message: message.trim(),
        round: votingSession.current_round,
        applied_by: "Admin",
      };

      if (supabase) {
        const { error } = await supabase.from("sanctions").insert(sanctionData);

        if (error) throw error;
      } else {
        // Fallback to localStorage
        const newSanction = {
          ...sanctionData,
          id: Date.now().toString(),
          created_at: new Date().toISOString(),
        };

        const storedSanctions = localStorage.getItem("sanctions");
        const sanctions = storedSanctions ? JSON.parse(storedSanctions) : [];
        sanctions.push(newSanction);
        localStorage.setItem("sanctions", JSON.stringify(sanctions));
      }

      // Update local state
      const updatedCandidates = candidates.map((c) =>
        c.id === candidateId ? { ...c, eliminated: true } : c,
      );
      setCandidates(updatedCandidates);

      // Clear the input and hide it
      setSanctionMessages((prev) => ({ ...prev, [candidateId]: "" }));
      setShowSanctionInputs((prev) => ({ ...prev, [candidateId]: false }));

      // Reload data to get updated sanctions
      await loadData();

      onEliminateCandidate(candidateId);
    } catch (error) {
      console.error("Error applying sanction:", error);
      alert("Erro ao aplicar sanção. Tente novamente.");
    }
  };

  const toggleSanctionInput = (candidateId: string) => {
    setShowSanctionInputs((prev) => ({
      ...prev,
      [candidateId]: !prev[candidateId],
    }));
  };

  const updateSanctionMessage = (candidateId: string, message: string) => {
    setSanctionMessages((prev) => ({
      ...prev,
      [candidateId]: message,
    }));
  };

  const handlePasswordSubmit = () => {
    if (passwordInput === "loverson") {
      setIsAdminAuthenticated(true);
      setShowPasswordDialog(false);
      setPasswordInput("");
      setPasswordError("");
    } else {
      setPasswordError("Senha incorreta. Tente novamente.");
      setPasswordInput("");
    }
  };

  const handlePasswordCancel = () => {
    setShowPasswordDialog(false);
    setPasswordInput("");
    setPasswordError("");
    // Redirect to home if not authenticated
    window.location.href = "/";
  };

  const handleRemoveParticipant = async (participantId: string) => {
    if (!confirm("Tem certeza que deseja remover este participante?")) {
      return;
    }

    try {
      if (supabase) {
        // Remove participant from database
        const { error } = await supabase
          .from("participants")
          .delete()
          .eq("id", participantId);

        if (error) throw error;

        // Also remove any votes from this participant
        await supabase
          .from("votes")
          .delete()
          .eq("participant_id", participantId);

        console.log("Participant removed successfully");
      } else {
        // Fallback to localStorage
        const storedParticipants = localStorage.getItem("participants");
        if (storedParticipants) {
          const participants = JSON.parse(storedParticipants);
          const filteredParticipants = participants.filter(
            (p: any) => p.id !== participantId,
          );
          localStorage.setItem(
            "participants",
            JSON.stringify(filteredParticipants),
          );
        }

        // Remove votes from this participant
        const storedVotes = localStorage.getItem("votes");
        if (storedVotes) {
          const votes = JSON.parse(storedVotes);
          const filteredVotes = votes.filter(
            (v: any) => v.participant_id !== participantId,
          );
          localStorage.setItem("votes", JSON.stringify(filteredVotes));
        }
      }

      // Reload data to reflect changes
      await loadData();
    } catch (error) {
      console.error("Error removing participant:", error);
      alert("Erro ao remover participante. Tente novamente.");
    }
  };

  const toggleResults = () => {
    setShowResults(!showResults);
  };

  // TV Mode - Full screen results display
  if (isTvMode) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-orange-600 to-red-700 p-8">
        <ResultsDashboard
          candidates={candidates.map((c) => ({
            ...c,
            percentage:
              totalVotes > 0 ? Math.round((c.votes / totalVotes) * 100) : 0,
          }))}
          currentRound={currentRound}
          totalRounds={4}
          totalVotes={totalVotes}
          roundActive={roundActive}
          winner={winner}
          isTvMode={true}
          participationStatus={{ total: activeParticipants, voted: votedCount }}
        />
      </div>
    );
  }

  // Auto-register current user if they have names
  useEffect(() => {
    const autoRegister = async () => {
      if (
        realName &&
        nickname &&
        realName !== "Participante" &&
        nickname !== "Cardeal Participante"
      ) {
        // Check if user already exists
        const existingParticipant = participants.find(
          (p) => p.cardinal_name === nickname,
        );

        if (!existingParticipant) {
          const newParticipant = await registerParticipant(realName, nickname);
          if (newParticipant) {
            setCurrentUserId(newParticipant.id);
            // Force show participants list after registration
            setShowParticipantsList(true);
          }
        } else {
          setCurrentUserId(existingParticipant.id);
          // Show participants list if user already exists
          setShowParticipantsList(true);
        }
      }
    };

    // Always try to auto-register, even if participants list is empty initially
    autoRegister();
  }, [realName, nickname, participants]);

  if (loading) {
    return (
      <div className="w-full max-w-md mx-auto p-4 bg-white min-h-screen flex items-center justify-center">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          >
            <Church className="h-12 w-12 text-orange-500 mx-auto" />
          </motion.div>
          <p className="text-orange-800 mt-4">Carregando dados...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto p-4 bg-white min-h-screen">
      {/* Password Dialog */}
      <Dialog open={showPasswordDialog} onOpenChange={() => {}}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5 text-red-600" />
              Acesso Administrativo
            </DialogTitle>
            <DialogDescription>
              Digite a senha para acessar o painel administrativo.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                placeholder="Digite a senha..."
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    handlePasswordSubmit();
                  }
                }}
                className="h-12"
              />
            </div>
            {passwordError && (
              <div className="text-sm text-red-600 bg-red-50 p-2 rounded border border-red-200">
                {passwordError}
              </div>
            )}
          </div>
          <DialogFooter className="flex gap-2">
            <Button
              variant="outline"
              onClick={handlePasswordCancel}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              onClick={handlePasswordSubmit}
              className="flex-1 bg-red-600 hover:bg-red-700"
            >
              Entrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Bell Animation */}
      <AnimatePresence>
        {showBellAnimation && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
          >
            <div className="bg-white p-8 rounded-2xl shadow-2xl text-center">
              <motion.div
                animate={{ rotate: [0, -15, 15, -15, 15, 0] }}
                transition={{ duration: 1, repeat: 2 }}
              >
                <Bell className="h-16 w-16 text-orange-600 mx-auto mb-4" />
              </motion.div>
              <h3 className="text-2xl font-bold text-orange-800">
                Nova Rodada Iniciada!
              </h3>
              <p className="text-orange-600">
                Rodada {currentRound} do Conclave
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Winner Animation */}
      <AnimatePresence>
        {showWinnerAnimation && winner && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-b from-white/90 to-orange-100/90"
          >
            <div className="text-center p-8">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.5, type: "spring" }}
              >
                <div className="text-8xl mb-4">☁️</div>
                <h1 className="text-6xl font-bold text-orange-800 mb-4">
                  HABEMUS PAPA DO ARRAIÁ!
                </h1>
                <h2 className="text-4xl text-orange-600 mb-8">{winner.name}</h2>
                <div className="flex justify-center gap-4 text-6xl">
                  🏆 🥃 ☁️
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* New Round Message */}
      <AnimatePresence>
        {showNewRoundMessage && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
          >
            <div className="bg-white p-8 rounded-2xl shadow-2xl text-center max-w-md mx-4">
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 0.5, repeat: 3 }}
              >
                <Award className="h-16 w-16 text-orange-600 mx-auto mb-4" />
              </motion.div>
              <h3 className="text-2xl font-bold text-orange-800 mb-2">
                Nenhum Vencedor!
              </h3>
              <p className="text-orange-600 mb-4">
                Nenhum candidato obteve mais de 50% dos votos.
              </p>
              <div className="bg-orange-50 p-4 rounded-lg border border-orange-200 mb-4">
                <p className="text-sm text-orange-800 font-semibold">
                  🔔 Nova Rodada será iniciada em breve!
                </p>
                <p className="text-xs text-orange-600 mt-1">
                  Aguarde as sanções serem aplicadas pelo administrador.
                </p>
              </div>
              <div className="flex items-center justify-center gap-2 text-2xl">
                ⚖️ 🗳️ 🔄
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="text-center mb-6">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Church className="h-5 w-5 text-orange-600" />
          <Crown className="h-6 w-6 text-orange-600" />
        </div>
        <h2 className="text-xl font-bold text-orange-800">Conclave Junino</h2>
        <p className="text-sm text-gray-600 mt-1">{realName}</p>
        <p className="text-xs text-gray-500">{nickname}</p>
        <div className="flex items-center justify-center gap-2 mt-3">
          <Badge variant="outline" className="text-xs px-2 py-1">
            Rodada {actualCurrentRound}/4
          </Badge>
          {actualRoundActive ? (
            <Badge className="bg-green-500 text-xs px-2 py-1 animate-pulse">
              Votação Aberta
            </Badge>
          ) : (
            <Badge className="bg-gray-500 text-xs px-2 py-1">
              Votação Fechada
            </Badge>
          )}
        </div>
        {winner && (
          <Badge className="bg-yellow-500 text-white text-sm px-3 py-1 mt-2">
            <Crown className="h-3 w-3 mr-1" />
            Papa Eleito!
          </Badge>
        )}
      </div>

      {isAdmin && isAdminAuthenticated && (
        <Card className="mb-6 border border-red-300 shadow-sm">
          <CardHeader className="pb-3 bg-red-600 text-white">
            <CardTitle className="text-lg flex items-center gap-2">
              <Church className="h-4 w-4" />
              Painel Admin
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="space-y-4">
              <div className="space-y-3">
                <h3 className="font-semibold text-sm text-red-800">
                  Controle de Rodadas
                </h3>
                {sessionEnded ? (
                  <div className="bg-yellow-50 p-3 rounded border border-yellow-300">
                    <p className="text-sm text-yellow-800 font-semibold text-center">
                      🏆 Votação Encerrada
                    </p>
                    {winner && (
                      <p className="text-xs text-yellow-700 text-center mt-1">
                        Vencedor: {winner.name}
                      </p>
                    )}
                  </div>
                ) : !actualRoundActive ? (
                  <Button
                    onClick={handleStartNewRound}
                    className="w-full bg-green-600 hover:bg-green-700 h-10"
                  >
                    <Bell className="mr-2 h-4 w-4" />
                    Iniciar Rodada {actualCurrentRound}
                  </Button>
                ) : (
                  <Button
                    onClick={handleEndRound}
                    className="w-full bg-red-600 hover:bg-red-700 h-10"
                  >
                    <Zap className="mr-2 h-4 w-4" />
                    Encerrar Rodada {actualCurrentRound}
                  </Button>
                )}

                <div className="bg-blue-50 p-3 rounded border">
                  <p className="text-xs text-blue-800">
                    Status: {votedCount}/{activeParticipants} cardeais votaram
                  </p>
                  <Progress
                    value={(votedCount / activeParticipants) * 100}
                    className="mt-2 h-2"
                  />
                </div>
              </div>

              {!actualRoundActive &&
                actualCurrentRound < 4 &&
                !sessionEnded && (
                  <div className="space-y-3">
                    <h3 className="font-semibold text-sm text-red-800">
                      Aplicar Sanções
                    </h3>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {candidates
                        .filter((candidate) => !candidate.eliminated)
                        .map((candidate) => (
                          <div
                            key={candidate.id}
                            className="flex items-center justify-between p-2 bg-white rounded border"
                          >
                            <div className="flex items-center gap-2">
                              <img
                                src={candidate.image}
                                alt={candidate.name}
                                className="w-6 h-6 rounded-full"
                              />
                              <div>
                                <span className="text-xs font-medium">
                                  {candidate.name
                                    .split(" ")
                                    .slice(0, 2)
                                    .join(" ")}
                                </span>
                                <p className="text-xs text-gray-500">
                                  {candidate.votes} votos
                                </p>
                              </div>
                            </div>
                            <div className="flex flex-col gap-1">
                              <Button
                                size="sm"
                                variant={
                                  showSanctionInputs[candidate.id]
                                    ? "outline"
                                    : "destructive"
                                }
                                onClick={() =>
                                  toggleSanctionInput(candidate.id)
                                }
                                className="text-xs h-6 px-2"
                              >
                                {showSanctionInputs[candidate.id]
                                  ? "Cancelar"
                                  : "Sancionar"}
                              </Button>
                              {showSanctionInputs[candidate.id] && (
                                <div className="mt-2 space-y-2">
                                  <Textarea
                                    placeholder="Motivo da sanção..."
                                    value={sanctionMessages[candidate.id] || ""}
                                    onChange={(e) =>
                                      updateSanctionMessage(
                                        candidate.id,
                                        e.target.value,
                                      )
                                    }
                                    className="text-xs h-16 resize-none"
                                  />
                                  <Button
                                    size="sm"
                                    variant="destructive"
                                    onClick={() =>
                                      handleApplySanction(
                                        candidate.id,
                                        sanctionMessages[candidate.id] || "",
                                      )
                                    }
                                    className="text-xs h-6 px-2 w-full"
                                  >
                                    Confirmar Sanção
                                  </Button>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                )}
            </div>

            {/* Participant Management Section */}
            <div className="space-y-3">
              <h3 className="font-semibold text-sm text-red-800">
                Gerenciar Participantes ({participants.length})
              </h3>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {participants.length === 0 ? (
                  <div className="text-center py-4">
                    <p className="text-xs text-gray-500">
                      Nenhum participante registrado
                    </p>
                  </div>
                ) : (
                  participants.map((participant) => (
                    <div
                      key={participant.id}
                      className="flex items-center justify-between p-2 bg-white rounded border"
                    >
                      <div className="flex items-center gap-2">
                        <img
                          src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${participant.cardinal_name.replace(/\s+/g, "")}`}
                          alt={participant.cardinal_name}
                          className="w-6 h-6 rounded-full"
                        />
                        <div>
                          <span className="text-xs font-medium">
                            {participant.cardinal_name
                              .split(" ")
                              .slice(0, 2)
                              .join(" ")}
                          </span>
                          <p className="text-xs text-gray-500">
                            {participant.real_name}
                          </p>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleRemoveParticipant(participant.id)}
                        className="text-xs h-6 px-2"
                      >
                        Remover
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Sanctions Display */}
      {sanctions.length > 0 && (
        <Card className="mb-6 border border-red-300 bg-red-50 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2 text-red-800">
              <AlertTriangle className="h-4 w-4" />
              Sanções Aplicadas - Rodada {actualCurrentRound}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="space-y-3 max-h-48 overflow-y-auto">
              {sanctions.map((sanction) => (
                <motion.div
                  key={sanction.id}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-start gap-3 p-3 bg-white rounded-lg border border-red-200"
                >
                  <AlertTriangle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-semibold text-red-800">
                        {sanction.candidate_name}
                      </span>
                      <Badge variant="destructive" className="text-xs">
                        Sancionado
                      </Badge>
                    </div>
                    <p className="text-sm text-red-700 mb-1">
                      {sanction.message}
                    </p>
                    <p className="text-xs text-red-500">
                      Aplicado por {sanction.applied_by} •{" "}
                      {new Date(sanction.created_at).toLocaleString("pt-BR")}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {showResults ? (
        <ResultsDashboard
          candidates={candidates.map((c) => ({
            ...c,
            percentage:
              totalVotes > 0 ? Math.round((c.votes / totalVotes) * 100) : 0,
          }))}
          currentRound={currentRound}
          totalRounds={4}
          totalVotes={totalVotes}
          roundActive={roundActive}
          winner={winner}
          participationStatus={{ total: activeParticipants, voted: votedCount }}
        />
      ) : showParticipantsList && !actualRoundActive ? (
        <Card className="border border-orange-300 bg-white shadow-sm">
          <CardHeader className="pb-3 text-center">
            <CardTitle className="text-lg text-orange-800 flex items-center justify-center gap-2">
              <Church className="text-orange-600 h-5 w-5" />
              Cardeais Participantes ({participants.length})
            </CardTitle>
            <CardDescription className="text-sm text-gray-600">
              Conheça os participantes desta rodada do Conclave
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {participants.length === 0 ? (
                <div className="text-center py-8">
                  <Church className="h-12 w-12 text-orange-300 mx-auto mb-4" />
                  <p className="text-orange-600">
                    Nenhum participante registrado ainda
                  </p>
                  <p className="text-sm text-orange-500 mt-2">
                    Compartilhe o link para que as pessoas se registrem!
                  </p>
                </div>
              ) : (
                participants.map((participant, index) => {
                  const isCurrentUser = currentUserId === participant.id;
                  return (
                    <motion.div
                      key={participant.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className={`flex items-center gap-3 p-3 rounded-lg border ${
                        isCurrentUser
                          ? "border-orange-400 bg-orange-100"
                          : "border-orange-200 bg-orange-50"
                      }`}
                    >
                      <img
                        src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${participant.cardinal_name.replace(/\s+/g, "")}`}
                        alt={participant.cardinal_name}
                        className="w-10 h-10 rounded-full border-2 border-orange-300"
                      />
                      <div className="flex-1">
                        <span className="text-sm font-semibold text-orange-800 block">
                          {participant.cardinal_name}
                          {isCurrentUser && " (Você)"}
                        </span>
                        <span className="text-xs text-orange-600">
                          {participant.real_name}
                        </span>
                      </div>
                      <Badge
                        className={`text-white text-xs ${
                          isCurrentUser ? "bg-orange-600" : "bg-orange-500"
                        }`}
                      >
                        #{index + 1}
                      </Badge>
                    </motion.div>
                  );
                })
              )}
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-3 pt-4">
            <Button
              onClick={() => setShowParticipantsList(false)}
              className="w-full bg-orange-600 hover:bg-orange-700 h-12"
            >
              <Crown className="mr-2 h-4 w-4" />
              Aguardar Início da Votação
            </Button>
            <Button
              variant="outline"
              onClick={toggleResults}
              className="w-full h-10"
            >
              📊 Ver Resultados
            </Button>
          </CardFooter>
        </Card>
      ) : actualRoundActive && !hasVoted ? (
        <Card className="border border-orange-300 bg-white shadow-sm">
          <CardHeader className="pb-3 text-center">
            <CardTitle className="text-lg text-orange-800 flex items-center justify-center gap-2">
              <Crown className="text-yellow-600 h-5 w-5" />
              Vote para Papa do Arraiá
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <RadioGroup
              value={selectedCandidate || ""}
              onValueChange={setSelectedCandidate}
              className="space-y-3"
            >
              {candidates
                .filter((candidate) => !candidate.eliminated)
                .map((candidate) => (
                  <motion.div
                    key={candidate.id}
                    whileTap={{ scale: 0.98 }}
                    className={`flex items-center space-x-3 p-3 rounded-lg border transition-all cursor-pointer ${
                      selectedCandidate === candidate.id
                        ? "border-orange-500 bg-orange-50"
                        : "border-gray-200 hover:border-orange-300 bg-white"
                    }`}
                  >
                    <RadioGroupItem
                      value={candidate.id}
                      id={`candidate-${candidate.id}`}
                      className="w-4 h-4"
                    />
                    <Label
                      htmlFor={`candidate-${candidate.id}`}
                      className="flex items-center gap-3 cursor-pointer w-full"
                    >
                      <div className="relative">
                        <img
                          src={candidate.image}
                          alt={candidate.name}
                          className="w-10 h-10 rounded-full border-2 border-orange-300"
                        />
                      </div>
                      <div className="flex-1">
                        <span className="text-sm font-semibold text-gray-800 block">
                          {candidate.name}
                        </span>
                        <span className="text-xs text-gray-600">
                          Candidato • Rodada {actualCurrentRound}
                        </span>
                      </div>
                    </Label>
                  </motion.div>
                ))}
            </RadioGroup>
          </CardContent>
          <CardFooter className="flex flex-col gap-3 pt-4">
            <Button
              onClick={handleVote}
              disabled={!selectedCandidate}
              className="w-full bg-orange-600 hover:bg-orange-700 h-12"
            >
              <CheckCircle2 className="mr-2 h-4 w-4" />
              Confirmar Voto
            </Button>
            <Button
              variant="outline"
              onClick={toggleResults}
              className="w-full h-10"
            >
              📊 Ver Resultados
            </Button>
          </CardFooter>
        </Card>
      ) : hasVoted ? (
        <Card className="border border-green-300 bg-green-50 text-center shadow-sm">
          <CardContent className="pt-6 pb-6 flex flex-col items-center gap-4">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", delay: 0.2 }}
            >
              <CheckCircle2 className="h-12 w-12 text-green-600" />
            </motion.div>
            <h3 className="text-lg font-bold text-green-800">
              Voto Registrado!
            </h3>
            <p className="text-sm text-green-700">
              Seu voto foi computado de forma anônima e segura.
            </p>
            <Button
              variant="outline"
              onClick={toggleResults}
              className="w-full h-10"
            >
              📊 Ver Resultados
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card className="border border-orange-300 bg-white text-center shadow-sm">
          <CardContent className="pt-6 pb-6 flex flex-col items-center gap-4">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            >
              <Church className="h-12 w-12 text-orange-500" />
            </motion.div>
            <h3 className="text-lg font-bold text-orange-800">
              Aguardando Rodada
            </h3>
            <p className="text-sm text-gray-600">
              O organizador ainda não iniciou a rodada {actualCurrentRound}.
            </p>
            <div className="flex flex-col gap-2 w-full">
              <Button
                onClick={() => setShowParticipantsList(true)}
                className="w-full bg-orange-600 hover:bg-orange-700 h-10"
              >
                👥 Ver Participantes ({participants.length})
              </Button>
              <Button
                variant="outline"
                onClick={toggleResults}
                className="w-full h-10"
              >
                📊 Ver Resultados
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default VotingArea;
