import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import VotingArea from "./VotingArea";
import { Crown, Church, ExternalLink } from "lucide-react";

const Home = () => {
  const [realName, setRealName] = useState("");
  const [cardenalName, setCardenalName] = useState("");
  const [isRegistered, setIsRegistered] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (realName.trim() && cardenalName.trim()) {
      setIsRegistered(true);
    }
  };

  if (isRegistered) {
    return <VotingArea realName={realName} nickname={cardenalName} />;
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="w-full border-0 shadow-lg">
          <CardHeader className="text-center pb-4">
            <div className="mb-3">
              <div className="flex justify-center gap-4 mb-2">
                <Link
                  to="/tv"
                  className="text-xs text-orange-600 hover:text-orange-800 flex items-center gap-1"
                >
                  📺 resultados
                  <ExternalLink className="h-3 w-3" />
                </Link>
                <Link
                  to="/admin"
                  className="text-xs text-red-600 hover:text-red-800 flex items-center gap-1"
                >
                  🔒 admin
                  <ExternalLink className="h-3 w-3" />
                </Link>
              </div>
              <div className="flex items-center justify-center gap-2">
                <Church className="h-6 w-6 text-orange-600" />
                <Crown className="h-7 w-7 text-orange-600" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold text-orange-800">
              CONCLAVE JUNINO
            </CardTitle>
            <p className="text-sm text-gray-600 mt-1">
              Eleição do Papa Caipira 2024
            </p>
          </CardHeader>

          <CardContent className="px-6 pb-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="realName" className="text-sm font-medium">
                  Seu Nome
                </Label>
                <Input
                  id="realName"
                  placeholder="Ex: João Silva"
                  value={realName}
                  onChange={(e) => setRealName(e.target.value)}
                  required
                  className="h-12"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cardenalName" className="text-sm font-medium">
                  Nome de Cardeal
                </Label>
                <Input
                  id="cardenalName"
                  placeholder="Ex: Cardeal Zé da Pamonha..."
                  value={cardenalName}
                  onChange={(e) => setCardenalName(e.target.value)}
                  required
                  className="h-12"
                />
              </div>
              <Button
                type="submit"
                className="w-full h-12 bg-orange-600 hover:bg-orange-700"
              >
                Entrar no Conclave
              </Button>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default Home;
