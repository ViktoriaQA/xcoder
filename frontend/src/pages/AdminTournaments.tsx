import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Edit, Trash2, ArrowLeft, Trophy, Users, Calendar, Clock, Eye, EyeOff, Archive, Globe, FolderOpen } from "lucide-react";

interface Tournament {
  id: string;
  name: string;
  description: string;
  status: "upcoming" | "active" | "completed" | "archived";
  participants: number;
  maxParticipants: number;
  minParticipants?: number;
  startDate: string;
  endDate: string;
  difficulty: "easy" | "medium" | "hard";
  prize?: string;
  show_on_public_page?: boolean;
  is_active?: boolean;
  creator?: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
  };
}

const AdminTournaments = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"all" | "public" | "archived">("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingTournament, setEditingTournament] = useState<Tournament | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    status: 'upcoming' as 'upcoming' | 'active' | 'completed' | 'archived',
    max_participants: 50,
    current_participants: 0,
    min_participants: 0,
    difficulty: 'medium' as 'easy' | 'medium' | 'hard',
    prize: '',
    show_on_public_page: false,
    is_active: true,
  });

  useEffect(() => {
    if (user?.role !== 'admin') {
      navigate('/dashboard');
      return;
    }
    fetchTournaments();
  }, [user, navigate]);

  const fetchTournaments = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch('/api/tournaments/admin/all', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch tournaments');
      }

      const data = await response.json();
      setTournaments(data.tournaments || []);
    } catch (error) {
      console.error('Failed to fetch tournaments:', error);
      toast({
        title: "Помилка",
        description: "Не вдалося завантажити турніри",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      status: 'upcoming',
      max_participants: 50,
      current_participants: 0,
      min_participants: 0,
      difficulty: 'medium',
      prize: '',
      show_on_public_page: false,
      is_active: true,
    });
    setEditingTournament(null);
  };

  const handleCreateTournament = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch('/api/tournaments', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to create tournament');
      }

      toast({
        title: "Успіх",
        description: "Турнір створено",
      });
      setIsCreateDialogOpen(false);
      resetForm();
      fetchTournaments();
    } catch (error) {
      console.error('Create tournament error:', error);
      toast({
        title: "Помилка",
        description: error instanceof Error ? error.message : "Не вдалося створити турнір",
        variant: "destructive",
      });
    }
  };

  const handleUpdateTournament = async () => {
    if (!editingTournament) return;

    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`/api/tournaments/${editingTournament.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to update tournament');
      }

      toast({
        title: "Успіх",
        description: "Турнір оновлено",
      });
      setIsEditDialogOpen(false);
      resetForm();
      fetchTournaments();
    } catch (error) {
      console.error('Update tournament error:', error);
      toast({
        title: "Помилка",
        description: error instanceof Error ? error.message : "Не вдалося оновити турнір",
        variant: "destructive",
      });
    }
  };

  const handleDeleteTournament = async (tournamentId: string) => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`/api/tournaments/${tournamentId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to delete tournament');
      }

      toast({
        title: "Успіх",
        description: "Турнір видалено",
      });
      fetchTournaments();
    } catch (error) {
      console.error('Delete tournament error:', error);
      toast({
        title: "Помилка",
        description: error instanceof Error ? error.message : "Не вдалося видалити турнір",
        variant: "destructive",
      });
    }
  };

  const handleArchiveTournament = async (tournamentId: string) => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`/api/tournaments/${tournamentId}/archive`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to archive tournament');
      }

      toast({
        title: "Успіх",
        description: "Турнір заархівовано",
      });
      fetchTournaments();
    } catch (error) {
      console.error('Archive tournament error:', error);
      toast({
        title: "Помилка",
        description: error instanceof Error ? error.message : "Не вдалося заархівувати турнір",
        variant: "destructive",
      });
    }
  };

  const openEditDialog = (tournament: Tournament) => {
    console.log('Opening edit dialog with tournament:', tournament);
    setEditingTournament(tournament);
    const formDataToSet = {
      name: tournament.name,
      description: tournament.description,
      status: tournament.status,
      max_participants: tournament.maxParticipants,
      current_participants: tournament.participants,
      min_participants: tournament.minParticipants || 0,
      difficulty: tournament.difficulty,
      prize: tournament.prize || '',
      show_on_public_page: tournament.show_on_public_page || false,
      is_active: tournament.is_active !== false,
    };
    console.log('Setting form data:', formDataToSet);
    setFormData(formDataToSet);
    setIsEditDialogOpen(true);
  };

  const getStatusColor = (status: Tournament["status"]) => {
    switch (status) {
      case "active":
        return "bg-green-500/20 text-green-600 border-green-500/30";
      case "upcoming":
        return "bg-blue-500/20 text-blue-600 border-blue-500/30";
      case "completed":
        return "bg-gray-500/20 text-gray-600 border-gray-500/30";
      case "archived":
        return "bg-orange-500/20 text-orange-600 border-orange-500/30";
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
      case "active": return "Активний";
      case "upcoming": return "Майбутній";
      case "completed": return "Завершений";
      case "archived": return "Заархівований";
      default: return status;
    }
  };

  const getDifficultyText = (difficulty: Tournament["difficulty"]) => {
    switch (difficulty) {
      case "easy": return "Легкий";
      case "medium": return "Середній";
      case "hard": return "Складний";
      default: return difficulty;
    }
  };

  // Filter tournaments based on active tab
  const filteredTournaments = tournaments.filter(tournament => {
    switch (activeTab) {
      case "public":
        return tournament.show_on_public_page === true;
      case "archived":
        return tournament.status === "archived";
      case "all":
      default:
        return true;
    }
  });

  if (user?.role !== 'admin') {
    return null;
  }

  return (
    <div className="min-h-screen bg-background matrix-bg">
      <div className="max-w-7xl mx-auto py-8 px-4">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              onClick={() => navigate('/admin')}
              className="gap-2 border-border/60 hover:bg-primary/10"
            >
              <ArrowLeft className="w-4 h-4" />
              Назад до адміністрування
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-primary font-mono">Керування турнірами</h1>
              <p className="text-muted-foreground font-mono">Створюйте та редагуйте всі турніри платформи</p>
            </div>
          </div>

          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2 font-mono">
                <Plus className="w-4 h-4" />
                Створити турнір
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="font-mono">Створити новий турнір</DialogTitle>
                <DialogDescription className="font-mono">
                  Заповніть деталі нового турніру
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div>
                  <Label htmlFor="name">Назва турніру</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Назва турніру"
                    className="font-mono"
                  />
                </div>
                
                <div>
                  <Label htmlFor="description">Опис</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Опис турніру"
                    className="font-mono"
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="status">Статус</Label>
                    <Select
                      value={formData.status}
                      onValueChange={(value: 'upcoming' | 'active' | 'completed' | 'archived') => 
                        setFormData(prev => ({ ...prev, status: value }))
                      }
                    >
                      <SelectTrigger className="font-mono">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="upcoming">Майбутній</SelectItem>
                        <SelectItem value="active">Активний</SelectItem>
                        <SelectItem value="completed">Завершений</SelectItem>
                        <SelectItem value="archived">Заархівований</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="difficulty">Складність</Label>
                    <Select
                      value={formData.difficulty}
                      onValueChange={(value: 'easy' | 'medium' | 'hard') => 
                        setFormData(prev => ({ ...prev, difficulty: value }))
                      }
                    >
                      <SelectTrigger className="font-mono">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="easy">Легкий</SelectItem>
                        <SelectItem value="medium">Середній</SelectItem>
                        <SelectItem value="hard">Складний</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="max_participants">Макс. учасників</Label>
                    <Input
                      id="max_participants"
                      type="number"
                      value={formData.max_participants}
                      onChange={(e) => setFormData(prev => ({ ...prev, max_participants: parseInt(e.target.value) || 50 }))}
                      placeholder="50"
                      className="font-mono"
                    />
                  </div>
                  <div>
                    <Label htmlFor="min_participants">Мін. учасників</Label>
                    <Input
                      id="min_participants"
                      type="number"
                      value={formData.min_participants}
                      onChange={(e) => setFormData(prev => ({ ...prev, min_participants: parseInt(e.target.value) || 0 }))}
                      placeholder="0"
                      className="font-mono"
                      min="0"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="current_participants">Поточних учасників</Label>
                    <Input
                      id="current_participants"
                      type="number"
                      value={formData.current_participants}
                      onChange={(e) => setFormData(prev => ({ ...prev, current_participants: parseInt(e.target.value) || 0 }))}
                      placeholder="0"
                      className="font-mono"
                      min="0"
                    />
                  </div>
                  <div>
                    <Label htmlFor="prize">Приз</Label>
                    <Input
                      id="prize"
                      value={formData.prize}
                      onChange={(e) => setFormData(prev => ({ ...prev, prize: e.target.value }))}
                      placeholder="Приз за перемогу"
                      className="font-mono"
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="show_on_public_page"
                      checked={formData.show_on_public_page}
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, show_on_public_page: checked }))}
                    />
                    <Label htmlFor="show_on_public_page" className="font-mono">Показувати на публічній сторінці</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="is_active"
                      checked={formData.is_active}
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
                    />
                    <Label htmlFor="is_active" className="font-mono">Активний</Label>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)} className="font-mono">
                  Скасувати
                </Button>
                <Button onClick={handleCreateTournament} className="font-mono">Створити</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-xl text-muted-foreground font-mono">Завантаження...</p>
          </div>
        ) : (
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "all" | "public" | "archived")} className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-6">
              <TabsTrigger value="all" className="font-mono gap-2">
                <FolderOpen className="h-4 w-4" />
                Всі турніри
              </TabsTrigger>
              <TabsTrigger value="public" className="font-mono gap-2">
                <Globe className="h-4 w-4" />
                Публічні
              </TabsTrigger>
              <TabsTrigger value="archived" className="font-mono gap-2">
                <Archive className="h-4 w-4" />
                Архівовані
              </TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredTournaments.map((tournament) => (
                  <Card 
                    key={tournament.id} 
                    className={`relative overflow-hidden transition-all duration-300 hover:shadow-lg ${
                      tournament.status === 'archived' 
                        ? 'opacity-75 border-border/30 bg-card/50' 
                        : 'border-border/60 bg-card/70'
                    }`}
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
                      <CardTitle className="font-mono text-lg">
                        {tournament.name}
                      </CardTitle>
                      <CardDescription className="font-mono text-sm line-clamp-2">
                        {tournament.description}
                      </CardDescription>
                      {tournament.creator && (
                        <div className="text-xs text-muted-foreground font-mono">
                          Створено: {tournament.creator.first_name} {tournament.creator.last_name}
                        </div>
                      )}
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
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span className="font-mono text-muted-foreground">
                            {new Date(tournament.startDate).toLocaleDateString('uk-UA')}
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

                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openEditDialog(tournament)}
                          className="flex-1 gap-1 font-mono text-xs"
                        >
                          <Edit className="w-3 h-3" />
                          Редагувати
                        </Button>
                        {tournament.status !== 'archived' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleArchiveTournament(tournament.id)}
                            className="gap-1 font-mono text-xs"
                          >
                            <Archive className="w-3 h-3" />
                          </Button>
                        )}
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="destructive" size="sm" className="gap-1 font-mono text-xs">
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle className="font-mono">Ви впевнені?</AlertDialogTitle>
                              <AlertDialogDescription className="font-mono">
                                Ця дія назавжди видалить турнір "{tournament.name}".
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel className="font-mono">Скасувати</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDeleteTournament(tournament.id)} className="font-mono">
                                Видалити
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {filteredTournaments.length === 0 && (
                <div className="text-center py-12">
                  <Trophy className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <p className="text-xl text-muted-foreground font-mono">Немає турнірів</p>
                  <Button 
                    className="mt-4 gap-2 font-mono" 
                    onClick={() => setIsCreateDialogOpen(true)}
                  >
                    <Plus className="w-4 h-4" />
                    Створити турнір
                  </Button>
                </div>
              )}
            </TabsContent>

            <TabsContent value="public" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredTournaments.map((tournament) => (
                  <Card 
                    key={tournament.id} 
                    className="relative overflow-hidden transition-all duration-300 hover:shadow-lg border-border/60 bg-card/70"
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
                      <CardTitle className="font-mono text-lg">
                        {tournament.name}
                      </CardTitle>
                      <CardDescription className="font-mono text-sm line-clamp-2">
                        {tournament.description}
                      </CardDescription>
                      {tournament.creator && (
                        <div className="text-xs text-muted-foreground font-mono">
                          Створено: {tournament.creator.first_name} {tournament.creator.last_name}
                        </div>
                      )}
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
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span className="font-mono text-muted-foreground">
                            {new Date(tournament.startDate).toLocaleDateString('uk-UA')}
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

                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openEditDialog(tournament)}
                          className="flex-1 gap-1 font-mono text-xs"
                        >
                          <Edit className="w-3 h-3" />
                          Редагувати
                        </Button>
                        {tournament.status !== 'archived' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleArchiveTournament(tournament.id)}
                            className="gap-1 font-mono text-xs"
                          >
                            <Archive className="w-3 h-3" />
                          </Button>
                        )}
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="destructive" size="sm" className="gap-1 font-mono text-xs">
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle className="font-mono">Ви впевнені?</AlertDialogTitle>
                              <AlertDialogDescription className="font-mono">
                                Ця дія назавжди видалить турнір "{tournament.name}".
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel className="font-mono">Скасувати</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDeleteTournament(tournament.id)} className="font-mono">
                                Видалити
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {filteredTournaments.length === 0 && (
                <div className="text-center py-12">
                  <Globe className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <p className="text-xl text-muted-foreground font-mono">Немає публічних турнірів</p>
                  <Button 
                    className="mt-4 gap-2 font-mono" 
                    onClick={() => setIsCreateDialogOpen(true)}
                  >
                    <Plus className="w-4 h-4" />
                    Створити публічний турнір
                  </Button>
                </div>
              )}
            </TabsContent>

            <TabsContent value="archived" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredTournaments.map((tournament) => (
                  <Card 
                    key={tournament.id} 
                    className="relative overflow-hidden transition-all duration-300 hover:shadow-lg opacity-75 border-border/30 bg-card/50"
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
                      <CardTitle className="font-mono text-lg">
                        {tournament.name}
                      </CardTitle>
                      <CardDescription className="font-mono text-sm line-clamp-2">
                        {tournament.description}
                      </CardDescription>
                      {tournament.creator && (
                        <div className="text-xs text-muted-foreground font-mono">
                          Створено: {tournament.creator.first_name} {tournament.creator.last_name}
                        </div>
                      )}
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
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span className="font-mono text-muted-foreground">
                            {new Date(tournament.startDate).toLocaleDateString('uk-UA')}
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

                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openEditDialog(tournament)}
                          className="flex-1 gap-1 font-mono text-xs"
                        >
                          <Edit className="w-3 h-3" />
                          Редагувати
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="destructive" size="sm" className="gap-1 font-mono text-xs">
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle className="font-mono">Ви впевнені?</AlertDialogTitle>
                              <AlertDialogDescription className="font-mono">
                                Ця дія назавжди видалить турнір "{tournament.name}".
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel className="font-mono">Скасувати</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDeleteTournament(tournament.id)} className="font-mono">
                                Видалити
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {filteredTournaments.length === 0 && (
                <div className="text-center py-12">
                  <Archive className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <p className="text-xl text-muted-foreground font-mono">Немає архівованих турнірів</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        )}

        {!loading && tournaments.length === 0 && (
          <div className="text-center py-12">
            <Trophy className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <p className="text-xl text-muted-foreground font-mono">Немає створених турнірів</p>
            <Button 
              className="mt-4 gap-2 font-mono" 
              onClick={() => setIsCreateDialogOpen(true)}
            >
              <Plus className="w-4 h-4" />
              Створити перший турнір
            </Button>
          </div>
        )}
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-mono">Редагувати турнір</DialogTitle>
            <DialogDescription className="font-mono">
              Внесіть зміни в турнір
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div>
              <Label htmlFor="edit-name">Назва турніру</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Назва турніру"
                className="font-mono"
              />
            </div>
            
            <div>
              <Label htmlFor="edit-description">Опис</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Опис турніру"
                className="font-mono"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-status">Статус</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value: 'upcoming' | 'active' | 'completed' | 'archived') => 
                    setFormData(prev => ({ ...prev, status: value }))
                  }
                >
                  <SelectTrigger className="font-mono">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="upcoming">Майбутній</SelectItem>
                    <SelectItem value="active">Активний</SelectItem>
                    <SelectItem value="completed">Завершений</SelectItem>
                    <SelectItem value="archived">Заархівований</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="edit-difficulty">Складність</Label>
                <Select
                  value={formData.difficulty}
                  onValueChange={(value: 'easy' | 'medium' | 'hard') => 
                    setFormData(prev => ({ ...prev, difficulty: value }))
                  }
                >
                  <SelectTrigger className="font-mono">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="easy">Легкий</SelectItem>
                    <SelectItem value="medium">Середній</SelectItem>
                    <SelectItem value="hard">Складний</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-max_participants">Макс. учасників</Label>
                <Input
                  id="edit-max_participants"
                  type="number"
                  value={formData.max_participants}
                  onChange={(e) => setFormData(prev => ({ ...prev, max_participants: parseInt(e.target.value) || 50 }))}
                  placeholder="50"
                  className="font-mono"
                />
              </div>
              <div>
                <Label htmlFor="edit-min_participants">Мін. учасників</Label>
                <Input
                  id="edit-min_participants"
                  type="number"
                  value={formData.min_participants}
                  onChange={(e) => {
                    const newValue = parseInt(e.target.value) || 0;
                    console.log('Changing min_participants to:', newValue);
                    setFormData(prev => ({ ...prev, min_participants: newValue }));
                  }}
                  placeholder="0"
                  className="font-mono"
                  min="0"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-current_participants">Поточних учасників</Label>
                <Input
                  id="edit-current_participants"
                  type="number"
                  value={formData.current_participants}
                  onChange={(e) => setFormData(prev => ({ ...prev, current_participants: parseInt(e.target.value) || 0 }))}
                  placeholder="0"
                  className="font-mono"
                  min="0"
                />
              </div>
              <div>
                <Label htmlFor="edit-prize">Приз</Label>
                <Input
                  id="edit-prize"
                  value={formData.prize}
                  onChange={(e) => setFormData(prev => ({ ...prev, prize: e.target.value }))}
                  placeholder="Приз за перемогу"
                  className="font-mono"
                />
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="edit-show_on_public_page"
                  checked={formData.show_on_public_page}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, show_on_public_page: checked }))}
                />
                <Label htmlFor="edit-show_on_public_page" className="font-mono">Показувати на публічній сторінці</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="edit-is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
                />
                <Label htmlFor="edit-is_active" className="font-mono">Активний</Label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)} className="font-mono">
              Скасувати
            </Button>
            <Button onClick={handleUpdateTournament} className="font-mono">Зберегти зміни</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminTournaments;
