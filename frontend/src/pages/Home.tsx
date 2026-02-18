import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Terminal, Trophy, Users, Clock, Calendar, ArrowRight, Gamepad2, LogIn, UserPlus, X, Mail, Lock, GraduationCap, User } from "lucide-react";
import { AuthFab } from "@/components/AuthFab";
import { useIsMobile } from "@/hooks/use-mobile";
import { useToast } from "@/components/ui/use-toast";

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

const Home = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { toast } = useToast();
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [showRegisterSheet, setShowRegisterSheet] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isTrainer, setIsTrainer] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

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
        prize: "Mentorship session"
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

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast({
        title: "Помилка",
        description: "Будь ласка, заповніть всі поля",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      // TODO: Implement email/password auth
      console.log("Signing in with:", { email });
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Успіх",
        description: "Перевірте пошту для входу",
      });
      navigate("/auth");
    } catch (error) {
      console.error("Login error:", error);
      toast({
        title: "Помилка",
        description: "Не вдалося увійти. Спробуйте ще раз.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast({
        title: "Помилка",
        description: "Будь ласка, заповніть всі поля",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      // TODO: Implement email/password registration
      console.log("Registering with:", { email, role: isTrainer ? 'trainer' : 'student' });
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Успіх",
        description: "Перевірте пошту для підтвердження реєстрації",
      });
      navigate("/auth");
    } catch (error) {
      console.error("Registration error:", error);
      toast({
        title: "Помилка",
        description: "Не вдалося зареєструватися. Спробуйте ще раз.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

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
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="sm" 
              className="font-mono text-xs h-8 px-3 hover:bg-primary/5 text-muted-foreground hover:text-primary"
              onClick={() => navigate("/tournaments")}
            >
              <Trophy className="h-4 w-4 mr-1" />
              Турніри
            </Button>
            {!isMobile ? (
              <>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="font-mono text-xs h-8 px-3 border-primary/20 hover:bg-primary/5"
                  onClick={() => setShowEmailForm(true)}
                >
                  <LogIn className="h-4 w-4 mr-1" />
                  Увійти
                </Button>
                <Button 
                  size="lg" 
                  className="font-mono text-xs h-8 px-3"
                  onClick={() => setShowRegisterSheet(true)}
                >
                  <UserPlus className="h-4 w-4 mr-1" />
                  Реєстрація
                </Button>
              </>
            ) : null}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center space-y-6 max-w-4xl mx-auto">
          <div className="flex items-center justify-center gap-4">
            <Trophy className="h-12 w-12 text-primary animate-pulse-glow" />
            <h1 className="text-4xl md:text-6xl font-bold font-mono text-primary neon-text">
              CodeArena
            </h1>
            <Trophy className="h-12 w-12 text-primary animate-pulse-glow" />
          </div>
          <p className="text-xl md:text-2xl text-muted-foreground font-mono">
            Приєднуйтесь до захоплюючих змагань з програмування
          </p>
          <p className="text-lg text-muted-foreground font-mono max-w-2xl mx-auto">
            Випробуйте свої навички проти інших розробників, вигравайте призи та станьте чемпіоном з кодингу
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Button 
              size="lg" 
              className="font-mono text-base px-8 py-3"
              onClick={() => setShowRegisterSheet(true)}
            >
              <UserPlus className="h-5 w-5 mr-2" />
              Створити акаунт
            </Button>
            <Button 
              variant="outline" 
              size="lg" 
              className="font-mono text-base px-8 py-3 border-primary/20 hover:bg-primary/5"
              onClick={() => navigate("/tournaments")}
            >
              <Trophy className="h-5 w-5 mr-2" />
              Переглянути турніри
            </Button>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 max-w-6xl mx-auto">
          <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-primary font-mono">
                {tournaments.filter(t => t.status === "active").length}
              </div>
              <div className="text-sm text-muted-foreground font-mono">Активні турніри</div>
            </CardContent>
          </Card>
          <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-accent font-mono">
                {tournaments.filter(t => t.status === "upcoming").length}
              </div>
              <div className="text-sm text-muted-foreground font-mono">Незабаром</div>
            </CardContent>
          </Card>
          <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-neon-cyan font-mono">
                {tournaments.reduce((sum, t) => sum + t.participants, 0)}
              </div>
              <div className="text-sm text-muted-foreground font-mono">Учасників</div>
            </CardContent>
          </Card>
          <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-neon-green font-mono">
                {tournaments.length}
              </div>
              <div className="text-sm text-muted-foreground font-mono">Всього турнірів</div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Featured Tournaments */}
      <section className="container mx-auto px-4 py-12">
        <div className="text-center space-y-4 mb-8">
          <h2 className="text-3xl font-bold font-mono text-primary">
            Популярні турніри
          </h2>
          <p className="text-muted-foreground font-mono max-w-2xl mx-auto">
            Оберіть турнір за вашим рівнем та інтересами
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {tournaments.slice(0, 6).map((tournament) => (
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

        <div className="text-center mt-8">
          <Button 
            variant="outline" 
            size="lg" 
            className="font-mono border-primary/20 hover:bg-primary/5"
            onClick={() => navigate("/tournaments")}
          >
            Переглянути всі турніри
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center space-y-6 max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold font-mono text-primary">
            Готові до виклику?
          </h2>
          <p className="text-xl text-muted-foreground font-mono">
            Створіть акаунт та приєднуйтесь до спільноти програмістів
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              className="font-mono text-base px-8 py-3"
              onClick={() => setShowRegisterSheet(true)}
            >
              <UserPlus className="h-5 w-5 mr-2" />
              Створити акаунт
            </Button>
            <Button 
              variant="outline" 
              size="lg" 
              className="font-mono text-base px-8 py-3 border-primary/20 hover:bg-primary/5"
              onClick={() => setShowEmailForm(true)}
            >
              <LogIn className="h-5 w-5 mr-2" />
              Увійти
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full border-t border-border/40 py-8">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-primary/30 bg-primary/5">
                <Terminal className="h-4 w-4 text-primary" />
              </div>
              <h3 className="font-mono text-lg text-primary">CodeArena</h3>
            </div>
            <p className="text-sm text-muted-foreground font-mono">
              Платформа для змагань з програмування
            </p>
            <p className="text-xs text-muted-foreground font-mono">
              v1.0.0 | &copy; {new Date().getFullYear()} CodeArena
            </p>
          </div>
        </div>
      </footer>

      {/* Email Form Modal */}
      {showEmailForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-card border border-border rounded-lg p-6 w-full max-w-sm animate-in fade-in duration-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-mono text-lg font-bold text-primary">Вхід</h3>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => setShowEmailForm(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            <form onSubmit={handleEmailLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="home-email" className="font-mono text-sm">
                  <span className="text-primary">$</span> email
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="home-email"
                    type="email"
                    placeholder="your@email.com"
                    className="pl-10 font-mono text-sm h-11"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="home-password" className="font-mono text-sm">
                  <span className="text-primary">$</span> пароль
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="home-password"
                    type="password"
                    placeholder="••••••••"
                    className="pl-10 font-mono text-sm h-11"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-11 font-mono text-sm"
                disabled={isLoading}
              >
                {isLoading ? 'Вхід...' : 'Увійти'}
              </Button>
            </form>

            <div className="text-center mt-4">
              <button
                className="text-sm text-primary hover:underline font-mono"
                onClick={() => {
                  setShowEmailForm(false);
                  setShowRegisterSheet(true);
                }}
              >
                Немає акаунту? Зареєструватися
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Registration Sheet */}
      {showRegisterSheet && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-card border border-border rounded-t-2xl w-full max-w-lg animate-in slide-in-from-bottom-3 duration-200">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-mono text-xl font-bold text-primary">Реєстрація</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={() => setShowRegisterSheet(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="space-y-6">
                {/* Role Selector */}
                <div className="space-y-2">
                  <Label className="block text-sm font-mono text-muted-foreground mb-2">
                    <span className="text-primary">$</span> оберіть роль
                  </Label>
                  <div className="flex items-center justify-between p-0.5 bg-muted/30 rounded-lg border border-border h-9">
                    <button
                      type="button"
                      onClick={() => setIsTrainer(false)}
                      className={`flex-1 flex items-center justify-center gap-1.5 py-1 px-3 rounded-md text-sm transition-colors ${
                        !isTrainer ? 'bg-background shadow-sm' : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      <GraduationCap className="h-3.5 w-3.5" />
                      <span>Студент</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsTrainer(true)}
                      className={`flex-1 flex items-center justify-center gap-1.5 py-1 px-3 rounded-md text-sm transition-colors ${
                        isTrainer ? 'bg-background shadow-sm' : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      <User className="h-3.5 w-3.5" />
                      <span>Тренер</span>
                    </button>
                  </div>
                </div>

                <form onSubmit={handleRegister} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="home-register-email" className="font-mono text-sm">
                      <span className="text-primary">$</span> email
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="home-register-email"
                        type="email"
                        placeholder="your@email.com"
                        className="pl-10 font-mono text-sm h-11"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        disabled={isLoading}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="home-register-password" className="font-mono text-sm">
                      <span className="text-primary">$</span> пароль
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="home-register-password"
                        type="password"
                        placeholder="•••••••"
                        className="pl-10 font-mono text-sm h-11"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        disabled={isLoading}
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full h-11 font-mono text-sm"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Реєстрація...' : 'Зареєструватися'}
                  </Button>
                </form>

                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-border"></span>
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-2 text-muted-foreground font-mono">або продовжити з</span>
                  </div>
                </div>

                <Button
                  className="w-full h-11 font-mono text-sm bg-transparent border border-border text-foreground hover:bg-accent/50 transition-colors"
                  variant="outline"
                  disabled={isLoading}
                >
                  <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                    <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                    <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                  </svg>
                  Google
                </Button>

                <div className="text-center mt-4">
                  <button
                    className="text-sm text-primary hover:underline font-mono"
                    onClick={() => {
                      setShowRegisterSheet(false);
                      setShowEmailForm(true);
                    }}
                  >
                    Вже є акаунт? Увійти
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mobile FAB */}
      <AuthFab isMobile={isMobile} />
    </div>
  );
};

export default Home;
