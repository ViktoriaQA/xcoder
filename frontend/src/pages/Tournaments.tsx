import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Loading } from "@/components/ui/loading";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Terminal, Trophy, Users, Clock, Calendar, ArrowRight, Gamepad2, ArrowLeft, Plus, Search, Filter } from "lucide-react";
import { AuthFab } from "@/components/AuthFab";
import { RegistrationSheet } from "@/components/RegistrationSheet";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useToast } from "@/components/ui/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAuth } from "@/hooks/useAuth";

interface Tournament {
  id: string;
  name: string;
  description: string;
  status: "upcoming" | "active" | "completed";
  participants: number;
  minParticipants?: number;
  maxParticipants: number;
  startDate: string;
  endDate: string;
  difficulty: "easy" | "medium" | "hard";
  prize?: string;
  show_on_public_page?: boolean;
}

const Tournaments = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { loginWithGoogle, register, user } = useAuth();
  const { toast } = useToast();
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [filteredTournaments, setFilteredTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);
  const [showRegistrationSheet, setShowRegistrationSheet] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('available');

  useEffect(() => {
    const fetchPublicTournaments = async () => {
      try {
        // Use public endpoint that doesn't require authentication
        const response = await fetch('/api/public/tournaments');
        
        if (!response.ok) {
          throw new Error('Failed to fetch tournaments');
        }

        const data = await response.json();
        
        // Transform API data to frontend format and filter for public tournaments
        const transformedTournaments: Tournament[] = data.tournaments
          .filter((tournament: any) => tournament.show_on_public_page)
          .map((tournament: any) => {
            const startDate = new Date(tournament.start_time);
            const endDate = new Date(tournament.end_time);
            const now = new Date();
            
            // Auto-update status based on dates
            let status = tournament.status;
            if (tournament.status === 'upcoming' && now >= startDate && now <= endDate) {
              status = 'active';
            } else if (tournament.status === 'active' && now > endDate) {
              status = 'completed';
            }
            
            return {
              id: tournament.id,
              name: tournament.name,
              description: tournament.description,
              status: status,
              participants: tournament.participants || 0,
              minParticipants: tournament.minParticipants || 0,
              maxParticipants: tournament.max_participants || 50,
              startDate: tournament.start_time,
              endDate: tournament.end_time,
              difficulty: tournament.difficulty || 'medium',
              prize: tournament.prize,
              show_on_public_page: tournament.show_on_public_page
            };
          });

        setTournaments(transformedTournaments);
        setFilteredTournaments(transformedTournaments);
      } catch (error) {
        console.error('Error fetching public tournaments:', error);
        // Show empty state when API fails
        setTournaments([]);
        setFilteredTournaments([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPublicTournaments();
  }, []);

  // Search effect
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredTournaments(tournaments);
    } else {
      const filtered = tournaments.filter(tournament => 
        tournament.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tournament.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredTournaments(filtered);
    }
  }, [searchQuery, tournaments]);

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
    return t(`tournaments.statusText.${status}`);
  };

  const getDifficultyText = (difficulty: Tournament["difficulty"]) => {
    return t(`tournaments.difficultyLevel.${difficulty}`);
  };

  const handleRegister = async (email: string, password: string, firstName: string, lastName: string, isTrainer: boolean) => {
    if (!email || !password) {
      toast({
        title: t('common.error'),
        description: t('auth.fillAllFields'),
        variant: "destructive",
      });
      return;
    }

    setIsRegistering(true);
    try {
      await register({
        email,
        password,
        first_name: firstName,
        last_name: lastName,
        role: isTrainer ? 'trainer' : 'student'
      });
      setShowRegistrationSheet(false);
    } catch (error) {
      console.error("❌ Registration error:", error);
      // Error handling is done in auth context
    } finally {
      setIsRegistering(false);
    }
  };

  const handleGoogleAuth = async () => {
    try {
      await loginWithGoogle();
      setShowRegistrationSheet(false);
    } catch (error) {
      console.error("Google auth error:", error);
    }
  };

  const handleDiscordAuth = async () => {
    try {
      // Discord auth not implemented yet
      console.log("Discord auth not implemented");
      setShowRegistrationSheet(false);
    } catch (error) {
      console.error("Discord auth error:", error);
    }
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="min-h-screen bg-background matrix-bg flex flex-col">
      {/* Header */}
      <Header showHomeButton={false} showTournamentsButton={false} currentPage="tournaments" />

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-8 pb-20">
        <div className="space-y-8">
          {/* Page Title */}
          <div className="text-center space-y-4 relative">
            <div className="flex items-center justify-center gap-3">
              <div className="absolute left-0">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="font-mono text-xs h-8 px-3 bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 hover:text-primary/90 hover:border-primary/30 transition-all"
                  onClick={() => navigate("/")}
                >
                  <ArrowLeft className="h-4 w-4 mr-1" />
                </Button>
              </div>
              <Trophy className="h-8 w-8 text-primary" />
              <h1 className="text-3xl font-bold font-mono text-primary neon-text">
                {t('tournaments.title')}
              </h1>
              {(user?.role === 'admin' || user?.role === 'trainer') && (
                <div className="absolute right-0">
                  <Button 
                    className="font-mono text-sm gap-2 bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 hover:text-primary/90 hover:border-primary/30 transition-all"
                    onClick={() => navigate("/admin/tournaments")}
                    data-testid="create-tournament-btn"
                  >
                    <Plus className="h-4 w-4" />
                    Створити турнір
                  </Button>
                </div>
              )}
            </div>
            <p className="text-muted-foreground font-mono max-w-2xl mx-auto">
              {t('tournaments.pageSubtitle')}
            </p>
          </div>

          {/* Search and Filter */}
          <div className="flex flex-col sm:flex-row gap-4 max-w-2xl mx-auto">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Пошук турнірів..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 font-mono"
                data-testid="search-input"
              />
            </div>
            <Button 
              variant="outline" 
              className="font-mono gap-2 border-border/60 hover:bg-primary/10"
              data-testid="filter-btn"
            >
              <Filter className="h-4 w-4" />
              Фільтр
            </Button>
          </div>

          {/* Stats
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
            <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-primary font-mono">
                  {tournaments.filter(t => t.status === "active").length}
                </div>
                <div className="text-sm text-muted-foreground font-mono">{t('home.activeTournaments')}</div>
              </CardContent>
            </Card>
            <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-accent font-mono">
                  {tournaments.filter(t => t.status === "upcoming").length}
                </div>
                <div className="text-sm text-muted-foreground font-mono">{t('home.upcomingTournaments')}</div>
              </CardContent>
            </Card>
            <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-neon-cyan font-mono">
                  {tournaments.reduce((sum, t) => sum + t.participants, 0)}
                </div>
                <div className="text-sm text-muted-foreground font-mono">{t('tournaments.participants')}</div>
              </CardContent>
            </Card>
          </div> */}

          {/* Tournaments Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto">
              <TabsTrigger value="available" className="font-mono" data-testid="available-tournaments-tab">
                Доступні турніри
              </TabsTrigger>
              <TabsTrigger value="my" className="font-mono" data-testid="my-tournaments-tab">
                Мої турніри
              </TabsTrigger>
            </TabsList>

            <TabsContent value="available" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" data-testid="tournaments-list">
                {filteredTournaments.map((tournament) => (
                  <Card 
                    key={tournament.id} 
                    className="border-border/50 bg-card/50 backdrop-blur-sm hover:neon-border transition-all duration-300 group cursor-pointer"
                    data-testid="tournament-card"
                    onClick={() => {
                      // Navigate to tournament detail page
                      navigate(`/tournaments/${tournament.id}`);
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
                      <CardTitle className="font-mono text-lg group-hover:text-primary transition-colors" data-testid="tournament-title">
                        {tournament.name}
                      </CardTitle>
                      <CardDescription className="font-mono text-sm line-clamp-2" data-testid="tournament-description">
                        {tournament.description}
                      </CardDescription>
                    </CardHeader>
                    
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          <span className="font-mono text-muted-foreground">
                            {tournament.minParticipants && tournament.minParticipants > 0
                              ? `${tournament.minParticipants + tournament.participants}/${tournament.maxParticipants} учасників`
                              : `${tournament.participants}/${tournament.maxParticipants} учасників`
                            }
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
                          style={{ 
                            width: `${((tournament.minParticipants || 0) + tournament.participants) / tournament.maxParticipants * 100}%` 
                          }}
                        />
                      </div>

                      {(tournament.status === "active" || tournament.status === "upcoming") && (
                        <Button 
                          className="w-full font-mono text-sm group-hover:bg-primary/90 transition-colors"
                          onClick={(e) => {
                            e.stopPropagation();
                            // Navigate to tournament detail page
                            navigate(`/tournaments/${tournament.id}`);
                          }}
                        >
                          <Gamepad2 className="h-4 w-4 mr-2" />
                          {tournament.status === "active" ? t('tournaments.viewDetails', 'Переглянути') : t('tournaments.viewDetails', 'Переглянути')}
                          <ArrowRight className="h-4 w-4 ml-2" />
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>

              {filteredTournaments.length === 0 && (
                <div className="text-center py-12">
                  <Trophy className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <p className="text-xl text-muted-foreground font-mono">Немає доступних турнірів</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="my" className="space-y-6">
              <div className="text-center py-12">
                <Trophy className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-mono font-semibold mb-2">Увійдіть, щоб побачити ваші турніри</h3>
                <p className="text-sm text-muted-foreground font-mono mb-4">
                  Після реєстрації ви зможете відстежувати свої турніри
                </p>
                <Button onClick={() => navigate("/auth")} className="font-mono">
                  Увійти / Зареєструватися
                </Button>
              </div>
            </TabsContent>
          </Tabs>

          {/* Call to Action */}
          <div className="text-center space-y-4 pt-8">
            <h2 className="text-xl font-bold font-mono text-primary">
              {t('tournaments.readyToChallenge')}
            </h2>
            <p className="text-muted-foreground font-mono">
              {t('tournaments.createAccountToJoin')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                className="font-mono"
                onClick={() => {
                  setShowRegistrationSheet(true);
                }}
              >
                {t('tournaments.createAccount')}
              </Button>
              <Button 
                variant="outline" 
                size="lg" 
                className="font-mono border-primary/20 hover:bg-primary/5 hover:text-green-500"
                onClick={() => navigate("/auth")}
              >
                {t('tournaments.learnMoreAboutPlatform')}
              </Button>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <Footer hasSidebar={false} />

      {/* Registration Sheet */}
      <RegistrationSheet
        open={showRegistrationSheet}
        onOpenChange={setShowRegistrationSheet}
        onSubmit={handleRegister}
        onGoogleAuth={handleGoogleAuth}
        onDiscordAuth={handleDiscordAuth}
        isLoading={isRegistering}
      />

      {/* Mobile FAB */}
      <AuthFab isMobile={isMobile} />
    </div>
  );
};

export default Tournaments;
