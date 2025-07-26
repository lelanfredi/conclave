import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { Label } from "./ui/label";
import { Progress } from "./ui/progress";
import { Badge } from "./ui/badge";
import { Textarea } from "./ui/textarea";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "./ui/alert-dialog";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "./ui/dialog";
import { Input } from "./ui/input";
import { Bell, Church, CheckCircle2, Zap, AlertTriangle, Users, Vote, Trophy, X } from "lucide-react";
import ResultsDashboard from "./ResultsDashboard";
import { supabase } from "../lib/supabase";
import { Participant, Vote as VoteType, VotingSession, Sanction, Candidate } from "../types/supabase";

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
  // Estados principais
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [votingSession, setVotingSession] = useState<VotingSession | null>(null);
  const [sanctions, setSanctions] = useState<Sanction[]>([]);
  const [votes, setVotes] = useState<VoteType[]>([]);

  // Estados de UI
  const [hasVoted, setHasVoted] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState<string | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [showParticipantsList, setShowParticipantsList] = useState(true);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [adminPassword, setAdminPassword] = useState("");
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [showBellAnimation, setShowBellAnimation] = useState(false);
  const [showWinnerAnimation, setShowWinnerAnimation] = useState(false);
  const [showNewRoundMessage, setShowNewRoundMessage] = useState(false);
  const [showSanctionInput, setShowSanctionInput] = useState(false);
  const [sanctionMessage, setSanctionMessage] = useState("");

  // ID do usuário atual (simplificado)
  const currentUserId = participants.find(p => p.cardinal_name === nickname)?.id || null;

  // Carregar dados iniciais
  useEffect(() => {
    loadData();
  }, []);

  // Verificar autenticação admin
  useEffect(() => {
    if (isAdmin && !isAdminAuthenticated) {
      setShowPasswordDialog(true);
    }
  }, [isAdmin, isAdminAuthenticated]);

  // Função simplificada para carregar dados
  const loadData = async () => {
    try {
      // Carregar participantes do localStorage
      const storedParticipants = localStorage.getItem("participants");
      if (storedParticipants) {
        const participantsData = JSON.parse(storedParticipants);
        setParticipants(participantsData);
        
        // Converter para candidatos
        const candidatesData = participantsData.map((p: Participant) => ({
          id: p.id,
          name: p.cardinal_name,
          votes: 0,
          percentage: 0,
          eliminated: false,
          hasVoted: false,
          image: `https://api.dicebear.com/7.x/avataaars/svg?seed=${p.cardinal_name.replace(/\s+/g, "")}`,
        }));
        setCandidates(candidatesData);
      }

      // Carregar sessão do localStorage
      const storedSession = localStorage.getItem("votingSession");
      if (storedSession) {
        setVotingSession(JSON.parse(storedSession));
      } else {
        // Criar sessão inicial
        const newSession: VotingSession = {
          id: Date.now().toString(),
          current_round: 1,
          round_active: false,
          max_rounds: 4,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        setVotingSession(newSession);
        localStorage.setItem("votingSession", JSON.stringify(newSession));
      }

      // Carregar votos do localStorage
      const storedVotes = localStorage.getItem("votes");
      if (storedVotes) {
        const votesData = JSON.parse(storedVotes);
        setVotes(votesData);
        
        // Atualizar contagem de votos
        const currentRoundVotes = votesData.filter((v: VoteType) => v.round === votingSession?.current_round);
        const voteCounts: Record<string, number> = {};
        currentRoundVotes.forEach((v: VoteType) => {
          voteCounts[v.candidate_id] = (voteCounts[v.candidate_id] || 0) + 1;
        });
        
        setCandidates(prev => prev.map(c => ({
          ...c,
          votes: voteCounts[c.id] || 0,
          percentage: 0, // Será calculado abaixo
        })));
      }

      // Carregar sanções do localStorage
      const storedSanctions = localStorage.getItem("sanctions");
      if (storedSanctions) {
        setSanctions(JSON.parse(storedSanctions));
      }

    } catch (error) {
      console.error("Erro ao carregar dados:", error);
    }
  };

  // Registrar participante
  const registerParticipant = async (realName: string, cardinalName: string) => {
    try {
      const newParticipant: Participant = {
        id: Date.now().toString(),
        real_name: realName,
        cardinal_name: cardinalName,
        created_at: new Date().toISOString(),
      };

      const updatedParticipants = [...participants, newParticipant];
      setParticipants(updatedParticipants);
      localStorage.setItem("participants", JSON.stringify(updatedParticipants));

      // Atualizar candidatos
      const newCandidate: Candidate = {
        id: newParticipant.id,
        name: newParticipant.cardinal_name,
        votes: 0,
        percentage: 0,
        eliminated: false,
        hasVoted: false,
        image: `https://api.dicebear.com/7.x/avataaars/svg?seed=${newParticipant.cardinal_name.replace(/\s+/g, "")}`,
      };
      setCandidates(prev => [...prev, newCandidate]);

      return true;
    } catch (error) {
      console.error("Erro ao registrar participante:", error);
      return false;
    }
  };

  // Submeter voto
  const submitVote = async (candidateId: string) => {
    if (!currentUserId || !votingSession) return false;

    try {
      const newVote: VoteType = {
        id: Date.now().toString(),
        participant_id: currentUserId,
        candidate_id: candidateId,
        round: votingSession.current_round,
        created_at: new Date().toISOString(),
      };

      const updatedVotes = [...votes, newVote];
      setVotes(updatedVotes);
      localStorage.setItem("votes", JSON.stringify(updatedVotes));

      // Atualizar contagem de votos
      const currentRoundVotes = updatedVotes.filter(v => v.round === votingSession.current_round);
      const voteCounts: Record<string, number> = {};
      currentRoundVotes.forEach(v => {
        voteCounts[v.candidate_id] = (voteCounts[v.candidate_id] || 0) + 1;
      });

      const totalVotes = Object.values(voteCounts).reduce((a, b) => a + b, 0);
      
      setCandidates(prev => prev.map(c => ({
        ...c,
        votes: voteCounts[c.id] || 0,
        percentage: totalVotes > 0 ? Math.round(((voteCounts[c.id] || 0) / totalVotes) * 100) : 0,
      })));

      return true;
    } catch (error) {
      console.error("Erro ao submeter voto:", error);
      return false;
    }
  };

  // Votar
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

  // Iniciar nova rodada
  const handleStartNewRound = async () => {
    try {
      if (!votingSession) return;

      const updatedSession = {
        ...votingSession,
        round_active: true,
        updated_at: new Date().toISOString(),
      };

      setVotingSession(updatedSession);
      localStorage.setItem("votingSession", JSON.stringify(updatedSession));

      // Resetar estados de votação
      setHasVoted(false);
      setSelectedCandidate(null);
      setShowResults(false);
      setShowParticipantsList(false);

      // Animar sino
      setShowBellAnimation(true);
      setTimeout(() => setShowBellAnimation(false), 3000);

      onStartRound();
    } catch (error) {
      console.error("Erro ao iniciar rodada:", error);
    }
  };

  // Encerrar rodada
  const handleEndRound = async () => {
    try {
      if (!votingSession) return;

      // Verificar se há vencedor (>50%)
      const totalVotes = candidates.reduce((sum, c) => sum + c.votes, 0);
      const winner = candidates.find(
        (c) => !c.eliminated && totalVotes > 0 && c.votes / totalVotes > 0.5,
      );

      let nextRound = votingSession.current_round;
      let sessionEnded = false;

      if (winner) {
        // Vencedor encontrado
        sessionEnded = true;
        setShowWinnerAnimation(true);
      } else if (votingSession.current_round < votingSession.max_rounds) {
        // Preparar próxima rodada
        nextRound = votingSession.current_round + 1;
        setShowNewRoundMessage(true);
        setTimeout(() => setShowNewRoundMessage(false), 5000);
      } else {
        // Última rodada - vencedor é quem tem mais votos
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
        round_active: false,
        session_ended: sessionEnded,
        updated_at: new Date().toISOString(),
        ...(sessionEnded && { ended_at: new Date().toISOString() }),
        ...(winner && { winner_id: winner.id, winner_name: winner.name }),
      };

      setVotingSession(updatedSession);
      localStorage.setItem("votingSession", JSON.stringify(updatedSession));

      onEndRound();
    } catch (error) {
      console.error("Erro ao encerrar rodada:", error);
    }
  };

  // Aplicar sanção
  const handleApplySanction = async (message: string) => {
    if (!message.trim() || !votingSession) return;

    try {
      const newSanction: Sanction = {
        id: Date.now().toString(),
        message: message.trim(),
        round: votingSession.current_round,
        applied_by: "Admin",
        created_at: new Date().toISOString(),
      };

      const updatedSanctions = [...sanctions, newSanction];
      setSanctions(updatedSanctions);
      localStorage.setItem("sanctions", JSON.stringify(updatedSanctions));

      setSanctionMessage("");
      setShowSanctionInput(false);
    } catch (error) {
      console.error("Erro ao aplicar sanção:", error);
    }
  };

  // Funções auxiliares
  const toggleSanctionInput = () => setShowSanctionInput(!showSanctionInput);
  const updateSanctionMessage = (message: string) => setSanctionMessage(message);
  const toggleResults = () => setShowResults(!showResults);

  // Verificar senha admin
  const handlePasswordSubmit = () => {
    if (adminPassword === "loverson") {
      setIsAdminAuthenticated(true);
      setShowPasswordDialog(false);
      setAdminPassword("");
    } else {
      alert("Senha incorreta!");
    }
  };

  const handlePasswordCancel = () => {
    setShowPasswordDialog(false);
    setAdminPassword("");
  };

  // Remover participante
  const handleRemoveParticipant = async (participantId: string) => {
    if (!confirm("Tem certeza que deseja remover este participante?")) {
      return;
    }

    try {
      // Remover participante
      const updatedParticipants = participants.filter(p => p.id !== participantId);
      setParticipants(updatedParticipants);
      localStorage.setItem("participants", JSON.stringify(updatedParticipants));

      // Remover candidato
      const updatedCandidates = candidates.filter(c => c.id !== participantId);
      setCandidates(updatedCandidates);

      // Remover votos
      const updatedVotes = votes.filter(v => v.participant_id !== participantId);
      setVotes(updatedVotes);
      localStorage.setItem("votes", JSON.stringify(updatedVotes));

      alert("Participante removido com sucesso!");
    } catch (error) {
      console.error("Erro ao remover participante:", error);
      alert("Erro ao remover participante!");
    }
  };

  // Calcular estatísticas
  const totalVotes = candidates.reduce((sum, c) => sum + c.votes, 0);
  const activeParticipants = participants.length;
  const votedCount = totalVotes;
  const winner = candidates.find(
    (c) => !c.eliminated && totalVotes > 0 && c.votes / totalVotes > 0.5,
  );

  // Estados calculados
  const actualCurrentRound = votingSession?.current_round || 1;
  const actualRoundActive = votingSession?.round_active || false;
  const sessionEnded = votingSession?.session_ended || false;

  // Sanções da rodada atual
  const currentRoundSanctions = sanctions.filter(s => s.round === actualCurrentRound);

  // TV Mode - Tela cheia
  if (isTvMode) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-orange-600 to-red-700 p-8">
        <ResultsDashboard
          candidates={candidates}
          currentRound={actualCurrentRound}
          totalRounds={4}
          totalVotes={totalVotes}
          roundActive={actualRoundActive}
          winner={winner}
          isTvMode={true}
          participationStatus={{ total: activeParticipants, voted: votedCount }}
        />
      </div>
    );
  }

  // Auto-registrar usuário atual se necessário
  useEffect(() => {
    if (realName && nickname && realName !== "Participante" && nickname !== "Cardeal Participante") {
      const existingParticipant = participants.find(p => p.cardinal_name === nickname);
      if (!existingParticipant) {
        registerParticipant(realName, nickname);
      }
    }
  }, [realName, nickname, participants]);

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      {/* Animações */}
      {showBellAnimation && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          exit={{ scale: 0 }}
          className="fixed inset-0 flex items-center justify-center z-50"
        >
          <div className="bg-yellow-400 text-white p-8 rounded-full text-6xl animate-bounce">
            🔔
          </div>
        </motion.div>
      )}

      {showWinnerAnimation && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50"
        >
          <div className="bg-yellow-400 text-white p-8 rounded-lg text-center">
            <div className="text-6xl mb-4">🏆</div>
            <h2 className="text-2xl font-bold mb-2">HABEMUS PAPA!</h2>
            <p className="text-lg">{winner?.name}</p>
          </div>
        </motion.div>
      )}

      {showNewRoundMessage && (
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed top-4 left-1/2 transform -translate-x-1/2 z-40 bg-blue-500 text-white px-6 py-3 rounded-lg"
        >
          🔄 Nova rodada iniciada!
        </motion.div>
      )}

      {/* Dialog de senha admin */}
      <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Autenticação Admin</DialogTitle>
            <DialogDescription>
              Digite a senha para acessar o painel administrativo
            </DialogDescription>
          </DialogHeader>
          <Input
            type="password"
            placeholder="Senha"
            value={adminPassword}
            onChange={(e) => setAdminPassword(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handlePasswordSubmit()}
          />
          <div className="flex gap-2">
            <Button onClick={handlePasswordCancel} variant="outline">
              Cancelar
            </Button>
            <Button onClick={handlePasswordSubmit}>
              Entrar
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Painel Admin */}
      {isAdmin && isAdminAuthenticated && (
        <Card className="mb-6 border-red-300 bg-red-50">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg text-red-800 flex items-center gap-2">
              <Church className="text-red-600 h-5 w-5" />
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

              {!actualRoundActive && actualCurrentRound < 4 && !sessionEnded && (
                <div className="space-y-3">
                  <h3 className="font-semibold text-sm text-red-800">
                    Aplicar Sanção à Rodada
                  </h3>
                  <div className="space-y-3">
                    <div className="p-3 bg-orange-50 rounded border border-orange-200">
                      <p className="text-xs text-orange-800 mb-2">
                        ⚠️ A sanção será aplicada a todos os participantes desta rodada
                      </p>
                      <div className="flex items-center gap-2 text-xs text-orange-600">
                        <span>👥 {participants.length} participantes</span>
                        <span>•</span>
                        <span>🗳️ Rodada {actualCurrentRound}</span>
                      </div>
                    </div>

                    {!showSanctionInput ? (
                      <Button
                        onClick={toggleSanctionInput}
                        variant="destructive"
                        className="w-full h-10"
                      >
                        <AlertTriangle className="mr-2 h-4 w-4" />
                        Aplicar Sanção à Rodada
                      </Button>
                    ) : (
                      <div className="space-y-3">
                        <Textarea
                          placeholder="Descreva o motivo da sanção aplicada a todos os participantes desta rodada..."
                          value={sanctionMessage}
                          onChange={(e) => updateSanctionMessage(e.target.value)}
                          className="text-sm h-20 resize-none"
                        />
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            onClick={toggleSanctionInput}
                            className="flex-1 h-10"
                          >
                            Cancelar
                          </Button>
                          <Button
                            variant="destructive"
                            onClick={() => handleApplySanction(sanctionMessage)}
                            className="flex-1 h-10"
                          >
                            Aplicar Sanção
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="space-y-3">
                <h3 className="font-semibold text-sm text-red-800">
                  Gerenciar Participantes
                </h3>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {participants.map((participant) => (
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
                        <span className="text-sm text-gray-700">
                          {participant.cardinal_name}
                        </span>
                      </div>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="destructive" size="sm">
                            <X className="h-3 w-3" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Remover Participante</AlertDialogTitle>
                            <AlertDialogDescription>
                              Tem certeza que deseja remover {participant.cardinal_name}? Esta ação não pode ser desfeita.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleRemoveParticipant(participant.id)}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              Remover
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Interface de Votação */}
      {actualRoundActive && !hasVoted && !showResults ? (
        <Card className="border-orange-300 bg-white shadow-sm">
          <CardHeader className="pb-3 text-center">
            <CardTitle className="text-lg text-orange-800 flex items-center justify-center gap-2">
              <Vote className="text-orange-600 h-5 w-5" />
              Rodada {actualCurrentRound} do Conclave
            </CardTitle>
            <CardDescription className="text-sm text-gray-600">
              Selecione o cardeal que você deseja eleger como Papa Caipira
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <RadioGroup
              value={selectedCandidate || ""}
              onValueChange={setSelectedCandidate}
              className="space-y-3"
            >
              {candidates.map((candidate) => (
                <motion.div
                  key={candidate.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center space-x-3 p-3 rounded-lg border border-orange-200 hover:bg-orange-50 transition-colors"
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
      ) : showParticipantsList || (!actualRoundActive && !hasVoted && !showResults) ? (
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
                        variant={isCurrentUser ? "default" : "secondary"}
                        className="text-xs"
                      >
                        {isCurrentUser ? "Você" : "Participante"}
                      </Badge>
                    </motion.div>
                  );
                })
              )}
            </div>
          </CardContent>
          <CardFooter className="pt-4">
            <div className="w-full text-center">
              <p className="text-sm text-gray-600 mb-2">
                {actualRoundActive
                  ? "🎪 A votação está ativa! Selecione seu candidato."
                  : "⏳ Aguardando o organizador iniciar a rodada..."}
              </p>
              {!actualRoundActive && (
                <p className="text-xs text-orange-600">
                  O organizador ainda não iniciou a rodada {actualCurrentRound}.
                </p>
              )}
            </div>
          </CardFooter>
        </Card>
      ) : (
        <ResultsDashboard
          candidates={candidates}
          currentRound={actualCurrentRound}
          totalRounds={4}
          totalVotes={totalVotes}
          roundActive={actualRoundActive}
          winner={winner}
          isTvMode={false}
          participationStatus={{ total: activeParticipants, voted: votedCount }}
        />
      )}

      {/* Sanções da Rodada */}
      {currentRoundSanctions.length > 0 && (
        <Card className="mt-6 border-yellow-300 bg-yellow-50">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg text-yellow-800 flex items-center gap-2">
              <AlertTriangle className="text-yellow-600 h-5 w-5" />
              Sanções Aplicadas - Rodada {actualCurrentRound}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {currentRoundSanctions.map((sanction) => (
                <div
                  key={sanction.id}
                  className="p-3 bg-yellow-100 rounded border border-yellow-200"
                >
                  <p className="text-sm text-yellow-800">{sanction.message}</p>
                  <p className="text-xs text-yellow-600 mt-1">
                    Aplicada por {sanction.applied_by} em{" "}
                    {new Date(sanction.created_at).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default VotingArea;
