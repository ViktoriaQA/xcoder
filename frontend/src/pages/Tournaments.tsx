import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Terminal, Trophy, Users, Clock, Calendar, ArrowRight, Gamepad2 } from "lucide-react";
import { AuthFab } from "@/components/AuthFab";
import { useIsMobile } from "@/hooks/use-mobile";

interface Tournament {
  id: string;
  name: string;
  description: string;
  status: "upcoming" | "active" | "completed";
  participants: number;
  maxParticipants: number;
  startDate: string;
  endDate: string;
  difficulty: "easy" | "medium" | "hard";
  prize?: string;
}

const Tournaments = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock data for tournaments
    const mockTournaments: Tournament[] = [
      {
        id: "1",
        name: "Spring Coding Challenge 2024",
        description: "Test your skills in this comprehensive coding competition featuring algorithmic challenges and problem-solving tasks.",
        status: "active",
        participants: 45,
        maxParticipants: 100,
        startDate: "2024-03-15",
        endDate: "2024-03-20",
        difficulty: "medium",
        prize: "Premium subscription + Certificate"
      },
      {
        id: "2",
        name: "Algorithm Masters",
        description: "Advanced algorithmic tournament for experienced programmers. Focus on data structures and optimization.",
        status: "upcoming",
        participants: 12,
        maxParticipants: 50,
        startDate: "2024-03-25",
        endDate: "2024-03-30",
        difficulty: "hard",
        prize: "$500 + Mentorship session"
      },
      {
        id: "3",
        name: "Beginner Friendly Contest",
        description: "Perfect for newcomers! Learn the basics of competitive programming in a supportive environment.",
        status: "completed",
        participants: 78,
        maxParticipants: 80,
        startDate: "2024-03-01",
        endDate: "2024-03-05",
        difficulty: "easy",
        prize: "Certificate + Badge"
      },
      {
        id: "4",
        name: "Speed Coding Sprint",
        description: "Race against the clock! Solve as many problems as possible in the shortest time.",
        status: "active",
        participants: 23,
        maxParticipants: 60,
        startDate: "2024-03-18",
        endDate: "2024-03-19",
        difficulty: "medium",
        prize: "Merchandise + Premium features"
      }
    ];

    setTimeout(() => {
      setTournaments(mockTournaments);
      setLoading(false);
    }, 1000);
  }, []);

  const getStatusColor = (status: Tournament["status"]) => {
    switch (status) {
      case "active":
        return "bg-green-500/20 text-green-600 border-green-500/30";
      case "upcoming":
        return "bg-blue-500/20 text-blue-600 border-blue-500/30";
      case "completed":
        return "bg-gray-500/20 text-gray-600 border-gray-500/30";
      default:
        return "bg-gray-500/20 text-gray-600 border-gray-500/30";
    }
  };

  const getDifficultyColor = (difficulty: Tournament["difficulty"]) => {
    switch (difficulty) {
      case "easy":
        return "bg-green-500/20 text-green-600 border-green-500/30";
      case "medium":
        return "bg-yellow-500/20 text-yellow-600 border-yellow-500/30";
      case "hard":
        return "bg-red-500/20 text-red-600 border-red-500/30";
      default:
        return "bg-gray-500/20 text-gray-600 border-gray-500/30";
    }
  };

  const getStatusText = (status: Tournament["status"]) => {
    switch (status) {
      case "active":
        return "Активний";
      case "upcoming":
        return "Незабаром";
      case "completed":
        return "Завершено";
      default:
        return status;
    }
  };

  const getDifficultyText = (difficulty: Tournament["difficulty"]) => {
    switch (difficulty) {
      case "easy":
        return "Легкий";
      case "medium":
        return "Середній";
      case "hard":
        return "Складний";
      default:
        return difficulty;
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background matrix-bg">
        <div className="animate-pulse-glow text-primary font-mono text-lg">Loading tournaments...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background matrix-bg">
      {/* Header */}
      <header className="w-full border-b border-border/40 bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <div 
              className="flex h-10 w-10 items-center justify-center rounded-lg border border-primary/30 bg-primary/5 neon-glow cursor-pointer hover:bg-primary/10 transition-colors"
              onClick={() => navigate("/")}
            >
              <Terminal className="h-5 w-5 text-primary" />
            </div>
            <h1 
              className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-xl font-bold text-transparent font-mono cursor-pointer hover:opacity-80 transition-opacity"
              onClick={() => navigate("/")}
            >
              CodeArena
            </h1>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            className="font-mono text-xs h-8 px-3 border-primary/20 hover:bg-primary/5"
            onClick={() => navigate("/auth")}
          >
            Увійти
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="space-y-8">
          {/* Page Title */}
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center gap-3">
              <Trophy className="h-8 w-8 text-primary" />
              <h1 className="text-3xl font-bold font-mono text-primary neon-text">
                Турніри
              </h1>
              <Trophy className="h-8 w-8 text-primary" />
            </div>
            <p className="text-muted-foreground font-mono max-w-2xl mx-auto">
              Приєднуйтесь до захоплюючих змагань з програмування та випробуйте свої навички проти інших розробників
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
            <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-primary font-mono">
                  {tournaments.filter(t => t.status === "active").length}
                </div>
                <div className="text-sm text-muted-foreground font-mono">Активні турніри</div>
              </CardContent>
            </Card>
            <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-accent font-mono">
                  {tournaments.filter(t => t.status === "upcoming").length}
                </div>
                <div className="text-sm text-muted-foreground font-mono">Незабаром</div>
              </CardContent>
            </Card>
            <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-neon-cyan font-mono">
                  {tournaments.reduce((sum, t) => sum + t.participants, 0)}
                </div>
                <div className="text-sm text-muted-foreground font-mono">Учасників</div>
              </CardContent>
            </Card>
          </div>

          {/* Tournaments Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tournaments.map((tournament) => (
              <Card 
                key={tournament.id} 
                className="border-border/50 bg-card/50 backdrop-blur-sm hover:neon-border transition-all duration-300 group cursor-pointer"
                onClick={() => {
                  if (tournament.status === "active" || tournament.status === "upcoming") {
                    navigate("/auth");
                  }
                }}
              >
                <CardHeader className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Badge className={`${getStatusColor(tournament.status)} font-mono text-xs`}>
                      {getStatusText(tournament.status)}
                    </Badge>
                    <Badge className={`${getDifficultyColor(tournament.difficulty)} font-mono text-xs`}>
                      {getDifficultyText(tournament.difficulty)}
                    </Badge>
                  </div>
                  <CardTitle className="font-mono text-lg group-hover:text-primary transition-colors">
                    {tournament.name}
                  </CardTitle>
                  <CardDescription className="font-mono text-sm line-clamp-2">
                    {tournament.description}
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span className="font-mono text-muted-foreground">
                        {tournament.participants}/{tournament.maxParticipants} учасників
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="font-mono text-muted-foreground">
                        {new Date(tournament.startDate).toLocaleDateString("uk-UA")} - {new Date(tournament.endDate).toLocaleDateString("uk-UA")}
                      </span>
                    </div>
                    {tournament.prize && (
                      <div className="flex items-center gap-2 text-sm">
                        <Trophy className="h-4 w-4 text-primary" />
                        <span className="font-mono text-primary font-medium">
                          {tournament.prize}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="w-full bg-muted rounded-full h-2">
                    <div 
                      className="bg-primary h-2 rounded-full transition-all duration-300"
                      style={{ width: `${(tournament.participants / tournament.maxParticipants) * 100}%` }}
                    />
                  </div>

                  {(tournament.status === "active" || tournament.status === "upcoming") && (
                    <Button 
                      className="w-full font-mono text-sm group-hover:bg-primary/90 transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate("/auth");
                      }}
                    >
                      <Gamepad2 className="h-4 w-4 mr-2" />
                      {tournament.status === "active" ? "Приєднатися" : "Зареєструватися"}
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Call to Action */}
          <div className="text-center space-y-4 pt-8">
            <h2 className="text-xl font-bold font-mono text-primary">
              Готові до виклику?
            </h2>
            <p className="text-muted-foreground font-mono">
              Створіть акаунт, щоб приєднатися до турнірів та відстежувати свій прогрес
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                className="font-mono"
                onClick={() => navigate("/auth")}
              >
                Створити акаунт
              </Button>
              <Button 
                variant="outline" 
                size="lg" 
                className="font-mono border-primary/20 hover:bg-primary/5"
                onClick={() => navigate("/auth")}
              >
                Детальніше про платформу
              </Button>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-border/40 py-4 mt-16">
        <div className="container mx-auto px-4">
          <p className="text-xs text-center text-muted-foreground font-mono">
            v1.0.0 | &copy; {new Date().getFullYear()} CodeArena
          </p>
        </div>
      </footer>

      {/* Mobile FAB */}
      <AuthFab isMobile={isMobile} />
    </div>
  );
};

export default Tournaments;
