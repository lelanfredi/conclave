import React from "react";
import { motion } from "framer-motion";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  PartyPopper,
  Flag,
  Crown,
  Award,
  Medal,
  Church,
  Bell,
} from "lucide-react";

interface Candidate {
  id: string;
  name: string;
  votes: number;
  percentage: number;
  eliminated?: boolean;
}

interface ResultsDashboardProps {
  candidates?: Candidate[];
  currentRound?: number;
  totalRounds?: number;
  totalVotes?: number;
  roundActive?: boolean;
  winner?: Candidate | null;
  isTvMode?: boolean;
  participationStatus?: { total: number; voted: number };
}

const ResultsDashboard = ({
  candidates = [],
  currentRound = 2,
  totalRounds = 4,
  totalVotes = 100,
  roundActive = true,
  winner = null,
  isTvMode = false,
  participationStatus = { total: 6, voted: 4 },
}: ResultsDashboardProps) => {
  // Sort candidates by votes (highest first)
  const sortedCandidates = [...candidates].sort((a, b) => b.votes - a.votes);

  // Animation variants for progress bars
  const progressVariants = {
    hidden: { width: 0 },
    visible: (percentage: number) => ({
      width: `${percentage}%`,
      transition: { duration: 1, ease: "easeOut" },
    }),
  };

  // TV Mode styling
  const containerClass = isTvMode
    ? "w-full min-h-screen p-8 bg-gradient-to-b from-orange-600 to-red-700 text-white"
    : "w-full max-w-5xl mx-auto p-6 bg-white rounded-lg shadow-xl border-2 border-orange-200";

  const headerTextClass = isTvMode ? "text-white" : "text-orange-800";
  const cardClass = isTvMode
    ? "bg-white/10 border-white/20 backdrop-blur-sm"
    : "bg-white border-gray-200";

  return (
    <div className={containerClass}>
      {/* Header with round info */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2
            className={`${isTvMode ? "text-5xl" : "text-3xl"} font-bold ${headerTextClass} flex items-center gap-3`}
          >
            <Church className={`${isTvMode ? "h-12 w-12" : "h-8 w-8"}`} />
            {isTvMode ? "CONCLAVE JUNINO" : "Resultados do Conclave"}
          </h2>
          <p
            className={`${isTvMode ? "text-2xl text-orange-100" : "text-lg text-muted-foreground"} mt-2`}
          >
            {roundActive ? "Votação em andamento" : "Votação encerrada"} •{" "}
            {totalVotes} votos
          </p>
          {isTvMode && (
            <p className="text-xl text-orange-200 mt-1">
              Participação: {participationStatus.voted}/
              {participationStatus.total} cardeais
            </p>
          )}
        </div>
        <div className="flex flex-col items-end gap-3">
          <Badge
            variant="outline"
            className={`${isTvMode ? "text-2xl px-6 py-3 bg-white/20 text-white border-white/40" : "text-lg px-4 py-2"}`}
          >
            Rodada {currentRound} de {totalRounds}
          </Badge>
          {roundActive && (
            <Badge
              variant="secondary"
              className={`animate-pulse ${isTvMode ? "text-xl px-4 py-2 bg-green-500" : "text-sm"}`}
            >
              <Bell className={`${isTvMode ? "h-6 w-6" : "h-4 w-4"} mr-2`} />
              AO VIVO
            </Badge>
          )}
        </div>
      </div>

      {/* Winner announcement if there is one */}
      {winner && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mb-8"
        >
          <Card
            className={`${isTvMode ? "bg-gradient-to-r from-yellow-400/20 to-orange-400/20 border-yellow-400/40" : "bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-400"} ${isTvMode ? "p-8" : "p-6"}`}
          >
            <CardContent className="pt-0 flex items-center gap-6">
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                className={`${isTvMode ? "bg-yellow-500 p-6" : "bg-yellow-500 p-4"} rounded-full`}
              >
                <Crown
                  className={`${isTvMode ? "h-16 w-16" : "h-10 w-10"} text-white`}
                />
              </motion.div>
              <div>
                <h3
                  className={`${isTvMode ? "text-6xl" : "text-3xl"} font-bold ${isTvMode ? "text-yellow-100" : "text-yellow-800"}`}
                >
                  HABEMUS PAPA CAIPIRA!
                </h3>
                <h4
                  className={`${isTvMode ? "text-4xl" : "text-2xl"} font-bold ${isTvMode ? "text-white" : "text-orange-700"} mt-2`}
                >
                  {winner.name}
                </h4>
                <p
                  className={`${isTvMode ? "text-2xl text-orange-200" : "text-lg text-orange-600"} mt-1`}
                >
                  Vencedor com {winner.percentage}% dos votos!
                </p>
                {isTvMode && (
                  <div className="flex items-center gap-4 mt-4 text-4xl">
                    🏆 🥃 ☁️
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Results grid */}
      <div className={`space-y-${isTvMode ? "6" : "4"}`}>
        {candidates.length === 0 ? (
          <div className="text-center py-12">
            <Church
              className={`${isTvMode ? "h-16 w-16" : "h-12 w-12"} ${isTvMode ? "text-white/50" : "text-orange-300"} mx-auto mb-4`}
            />
            <p
              className={`${isTvMode ? "text-2xl text-white/70" : "text-lg text-orange-600"}`}
            >
              Nenhum candidato registrado ainda
            </p>
            <p
              className={`${isTvMode ? "text-xl text-white/50" : "text-sm text-orange-500"} mt-2`}
            >
              Aguardando participantes se registrarem...
            </p>
          </div>
        ) : (
          sortedCandidates.map((candidate, index) => (
            <motion.div
              key={candidate.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card
                className={`${candidate.eliminated ? "opacity-60" : ""} ${cardClass} ${isTvMode ? "p-6" : "p-4"}`}
              >
                <CardContent className="p-0">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-4">
                      {index === 0 && !winner && (
                        <motion.div
                          animate={{ rotate: [0, 10, -10, 0] }}
                          transition={{ duration: 2, repeat: Infinity }}
                        >
                          <Medal
                            className={`${isTvMode ? "h-8 w-8" : "h-6 w-6"} text-yellow-500`}
                          />
                        </motion.div>
                      )}
                      <h3
                        className={`font-bold ${isTvMode ? "text-3xl text-white" : "text-xl text-gray-800"}`}
                      >
                        {candidate.name}
                      </h3>
                      {candidate.eliminated && (
                        <Badge
                          variant="destructive"
                          className={`${isTvMode ? "text-lg px-3 py-1" : "text-xs"}`}
                        >
                          Sancionado
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <span
                        className={`font-bold ${isTvMode ? "text-4xl text-white" : "text-2xl text-gray-800"}`}
                      >
                        {candidate.votes}
                      </span>
                      <span
                        className={`${isTvMode ? "text-xl text-orange-200" : "text-sm text-muted-foreground"}`}
                      >
                        votos
                      </span>
                    </div>
                  </div>

                  <div
                    className={`relative ${isTvMode ? "h-12" : "h-8"} ${isTvMode ? "bg-white/20" : "bg-muted"} rounded-lg overflow-hidden`}
                  >
                    <motion.div
                      className={`absolute top-0 left-0 h-full ${
                        index === 0
                          ? isTvMode
                            ? "bg-gradient-to-r from-yellow-400 to-orange-500"
                            : "bg-primary"
                          : isTvMode
                            ? "bg-gradient-to-r from-orange-400 to-red-500"
                            : "bg-secondary"
                      }`}
                      initial="hidden"
                      animate="visible"
                      custom={candidate.percentage}
                      variants={progressVariants}
                    />
                    <div className="absolute inset-0 flex items-center justify-end pr-4">
                      <span
                        className={`font-bold ${isTvMode ? "text-2xl text-white drop-shadow-lg" : "text-lg text-gray-800"}`}
                      >
                        {candidate.percentage}%
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))
        )}
      </div>

      {/* Festive decorations */}
      <motion.div
        className="mt-12 flex justify-center"
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <div
          className={`flex gap-${isTvMode ? "8" : "4"} ${isTvMode ? "text-orange-200" : "text-muted-foreground"}`}
        >
          <PartyPopper className={`${isTvMode ? "h-12 w-12" : "h-8 w-8"}`} />
          <Flag className={`${isTvMode ? "h-12 w-12" : "h-8 w-8"}`} />
          <Award className={`${isTvMode ? "h-12 w-12" : "h-8 w-8"}`} />
          <Crown className={`${isTvMode ? "h-12 w-12" : "h-8 w-8"}`} />
        </div>
      </motion.div>

      {isTvMode && (
        <div className="mt-8 text-center">
          <p className="text-2xl text-orange-200">
            🎪 Festa Junina 2024 • Conclave Junino 🎪
          </p>
          <p className="text-lg text-orange-300 mt-2">
            "Habemus Papa Caipira!"
          </p>
        </div>
      )}
    </div>
  );
};

export default ResultsDashboard;
