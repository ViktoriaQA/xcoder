import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CalendarIcon, Plus, Trophy } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { config } from "@/config";

interface CreateTournamentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

interface TournamentFormData {
  name: string;
  description: string;
  status: "upcoming" | "active" | "completed";
  difficulty: "easy" | "medium" | "hard";
  min_participants: number;
  max_participants: number;
  prize?: string;
  is_active: boolean;
  show_on_public_page: boolean;
}

const CreateTournamentModal = ({ open, onOpenChange, onSuccess }: CreateTournamentModalProps) => {
  const { t } = useTranslation();
  const { profile, role, token } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState<TournamentFormData>({
    name: "",
    description: "",
    status: "upcoming",
    difficulty: "medium",
    min_participants: 1,
    max_participants: 50,
    prize: "",
    is_active: true,
    show_on_public_page: false
  });

  const handleInputChange = (field: keyof TournamentFormData, value: string | number | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.description) {
      toast({
        title: t('common.error'),
        description: t('tournaments.fillAllRequiredFields'),
        variant: "destructive",
      });
      return;
    }

    // Check if user is authenticated and has proper role
    if (!token) {
      toast({
        title: t('common.error'),
        description: t('auth.loginRequired'),
        variant: "destructive",
      });
      return;
    }

    if (role !== 'trainer' && role !== 'admin') {
      toast({
        title: t('common.error'),
        description: t('tournaments.insufficientPermissions'),
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      const response = await fetch('/api/tournaments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const error = await response.json();
        if (response.status === 401) {
          // Token expired or invalid
          localStorage.removeItem(config.auth.tokenKey);
          localStorage.removeItem(config.auth.userKey);
          toast({
            title: t('common.error'),
            description: t('auth.sessionExpired'),
            variant: "destructive",
          });
          return;
        }
        throw new Error(error.message || 'Failed to create tournament');
      }

      const result = await response.json();
      
      toast({
        title: t('common.success'),
        description: t('tournaments.tournamentCreated'),
      });

      // Reset form
      setFormData({
        name: "",
        description: "",
        status: "upcoming",
        difficulty: "medium",
        min_participants: 1,
        max_participants: 50,
        prize: "",
        is_active: true,
        show_on_public_page: false
      });

      onOpenChange(false);
      onSuccess?.();
      
    } catch (error) {
      console.error('Error creating tournament:', error);
      toast({
        title: t('common.error'),
        description: error instanceof Error ? error.message : t('tournaments.failedToCreateTournament'),
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] bg-card/95 backdrop-blur-sm border-border/50">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-mono text-xl">
            <Trophy className="h-5 w-5 text-primary" />
            {t('tournaments.createTournament')}
          </DialogTitle>
          <DialogDescription className="font-mono text-sm">
            {t('tournaments.createTournamentDescription')}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="font-mono text-sm">
                  {t('tournaments.tournamentName')} *
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder={t('tournaments.tournamentNamePlaceholder')}
                  className="font-mono text-sm bg-background/50 border-border/50"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="font-mono text-sm">
                  {t('tournaments.description')} *
                </Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder={t('tournaments.descriptionPlaceholder')}
                  className="font-mono text-sm bg-background/50 border-border/50 min-h-[100px]"
                  required
                />
              </div>
            </div>
          </div>

          {/* Tournament Settings */}
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="status" className="font-mono text-sm">
                  {t('tournaments.status')}
                </Label>
                <Select
                  value={formData.status}
                  onValueChange={(value: "upcoming" | "active" | "completed") => 
                    handleInputChange('status', value)
                  }
                >
                  <SelectTrigger className="font-mono text-sm bg-background/50 border-border/50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="upcoming">{t('tournaments.statusText.upcoming')}</SelectItem>
                    <SelectItem value="active">{t('tournaments.statusText.active')}</SelectItem>
                    <SelectItem value="completed">{t('tournaments.statusText.completed')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="difficulty" className="font-mono text-sm">
                  {t('tournaments.difficulty')}
                </Label>
                <Select
                  value={formData.difficulty}
                  onValueChange={(value: "easy" | "medium" | "hard") => 
                    handleInputChange('difficulty', value)
                  }
                >
                  <SelectTrigger className="font-mono text-sm bg-background/50 border-border/50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="easy">{t('tournaments.difficultyLevel.easy')}</SelectItem>
                    <SelectItem value="medium">{t('tournaments.difficultyLevel.medium')}</SelectItem>
                    <SelectItem value="hard">{t('tournaments.difficultyLevel.hard')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="min_participants" className="font-mono text-sm">
                  {t('tournaments.minParticipants')}
                </Label>
                <Input
                  id="min_participants"
                  type="number"
                  min="1"
                  max="1000"
                  value={formData.min_participants}
                  onChange={(e) => handleInputChange('min_participants', parseInt(e.target.value) || 1)}
                  className="font-mono text-sm bg-background/50 border-border/50"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="max_participants" className="font-mono text-sm">
                  {t('tournaments.maxParticipants')}
                </Label>
                <Input
                  id="max_participants"
                  type="number"
                  min="1"
                  max="1000"
                  value={formData.max_participants}
                  onChange={(e) => handleInputChange('max_participants', parseInt(e.target.value) || 50)}
                  className="font-mono text-sm bg-background/50 border-border/50"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <Label htmlFor="prize" className="font-mono text-sm">
                  {t('tournaments.prize')} ({t('common.optional')})
                </Label>
                <Input
                  id="prize"
                  value={formData.prize}
                  onChange={(e) => handleInputChange('prize', e.target.value)}
                  placeholder={t('tournaments.prizePlaceholder')}
                  className="font-mono text-sm bg-background/50 border-border/50"
                />
              </div>
            </div>
          </div>

          {/* Visibility */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="is_active"
                checked={formData.is_active}
                onCheckedChange={(checked) => handleInputChange('is_active', checked)}
              />
              <Label htmlFor="is_active" className="font-mono text-sm">
                {t('tournaments.makeTournamentActive')}
              </Label>
            </div>
            <p className="text-xs text-muted-foreground font-mono">
              {formData.is_active 
                ? t('tournaments.activeTournamentDescription')
                : t('tournaments.inactiveTournamentDescription')
              }
            </p>

            <div className="space-y-3 pt-2">
              <div className="flex items-center space-x-2">
                <Switch
                  id="show_on_public_page"
                  checked={formData.show_on_public_page}
                  onCheckedChange={(checked) => handleInputChange('show_on_public_page', checked)}
                />
                <Label htmlFor="show_on_public_page" className="font-mono text-sm">
                  {t('tournaments.showOnPublicPage')}
                </Label>
              </div>
              <p className="text-xs text-muted-foreground font-mono">
                {formData.show_on_public_page 
                  ? t('tournaments.showOnPublicPageDescription')
                  : t('tournaments.hideFromPublicPageDescription')
                }
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="font-mono"
              disabled={isSubmitting}
            >
              {t('common.cancel')}
            </Button>
            <Button
              type="submit"
              className="font-mono"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin h-4 w-4 mr-2 border-2 border-current border-t-transparent rounded-full" />
                  {t('common.creating')}
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  {t('tournaments.createTournament')}
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateTournamentModal;
