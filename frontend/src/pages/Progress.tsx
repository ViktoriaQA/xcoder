import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress as ProgressBar } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Trophy, Target, TrendingUp, Calendar } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

const Progress = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    completedTasks: 0,
    totalTasks: 0,
    tournamentsWon: 0,
    tournamentsParticipated: 0,
    currentStreak: 0,
    longestStreak: 0,
    averageScore: 0,
    totalPoints: 0,
  });

  const completionPercentage = stats.totalTasks > 0 ? (stats.completedTasks / stats.totalTasks) * 100 : 0;
  const tournamentWinRate = stats.tournamentsParticipated > 0 ? (stats.tournamentsWon / stats.tournamentsParticipated) * 100 : 0;

  return (
    <div className="p-6 space-y-8">
      <div className="max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            Мій прогрес
          </h1>
          <p className="text-gray-300">
            Відстежуйте свої досягнення та успіхи в навчанні
          </p>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="rounded-lg border border-border bg-card p-6 space-y-3 hover:neon-border transition-all duration-300 group">
            <div className="flex items-center justify-between">
              <Target className="w-8 h-8 text-primary group-hover:animate-pulse-glow" />
              <span className="text-2xl font-bold font-mono text-card-foreground">
                {completionPercentage.toFixed(0)}%
              </span>
            </div>
            <h3 className="font-mono font-semibold text-card-foreground">Завершені завдання</h3>
            <ProgressBar value={completionPercentage} className="h-2" />
            <p className="text-xs text-muted-foreground font-mono">
              {stats.completedTasks} з {stats.totalTasks}
            </p>
          </div>

          <div className="rounded-lg border border-border bg-card p-6 space-y-3 hover:neon-border transition-all duration-300 group">
            <div className="flex items-center justify-between">
              <Trophy className="w-8 h-8 text-accent group-hover:animate-pulse-glow" />
              <span className="text-2xl font-bold font-mono text-card-foreground">
                {stats.tournamentsWon}
              </span>
            </div>
            <h3 className="font-mono font-semibold text-card-foreground">Перемоги в турнірах</h3>
            <ProgressBar value={tournamentWinRate} className="h-2" />
            <p className="text-xs text-muted-foreground font-mono">
              {tournamentWinRate.toFixed(0)}% перемог
            </p>
          </div>

          <div className="rounded-lg border border-border bg-card p-6 space-y-3 hover:neon-border transition-all duration-300 group">
            <div className="flex items-center justify-between">
              <TrendingUp className="w-8 h-8 text-neon-green group-hover:animate-pulse-glow" />
              <span className="text-2xl font-bold font-mono text-card-foreground">
                {stats.currentStreak}
              </span>
            </div>
            <h3 className="font-mono font-semibold text-card-foreground">Поточна серія</h3>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-xs font-mono">
                Найкраща: {stats.longestStreak}
              </Badge>
            </div>
          </div>

          <div className="rounded-lg border border-border bg-card p-6 space-y-3 hover:neon-border transition-all duration-300 group">
            <div className="flex items-center justify-between">
              <Calendar className="w-8 h-8 text-neon-cyan group-hover:animate-pulse-glow" />
              <span className="text-2xl font-bold font-mono text-card-foreground">
                {stats.averageScore}
              </span>
            </div>
            <h3 className="font-mono font-semibold text-card-foreground">Середній бал</h3>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs font-mono">
                {stats.totalPoints} очок
              </Badge>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="rounded-lg border border-border bg-card p-6 space-y-3 mb-8">
          <div className="space-y-2">
            <h3 className="font-mono font-semibold text-card-foreground text-lg">Остання активність</h3>
            <p className="text-sm text-muted-foreground font-mono">
              Ваші нещодавні досягнення та прогрес
            </p>
          </div>
          {stats.completedTasks === 0 && stats.tournamentsWon === 0 && stats.currentStreak === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground font-mono">Поки немає активності</p>
              <p className="text-sm text-muted-foreground font-mono mt-2">Почніть виконувати завдання, щоб побачити тут свій прогрес</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  <div>
                    <p className="text-card-foreground font-medium font-mono">Завершено завдання "Рекурсія"</p>
                    <p className="text-sm text-muted-foreground font-mono">2 години тому</p>
                  </div>
                </div>
                <Badge className="bg-primary text-primary-foreground font-mono">+50 очок</Badge>
              </div>

              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-accent rounded-full"></div>
                  <div>
                    <p className="text-card-foreground font-medium font-mono">Участь у турнірі "Spring Coding 2024"</p>
                    <p className="text-sm text-muted-foreground font-mono">1 день тому</p>
                  </div>
                </div>
                <Badge className="bg-accent text-accent-foreground font-mono">3 місце</Badge>
              </div>

              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-neon-cyan rounded-full"></div>
                  <div>
                    <p className="text-card-foreground font-medium font-mono">Досягнуто серії 5 днів</p>
                    <p className="text-sm text-muted-foreground font-mono">3 дні тому</p>
                  </div>
                </div>
                <Badge className="bg-neon-cyan text-background font-mono">+100 очок</Badge>
              </div>
            </div>
          )}
        </div>

        {/* Skills Progress */}
        <div className="rounded-lg border border-border bg-card p-6 space-y-3">
          <div className="space-y-2">
            <h3 className="font-mono font-semibold text-card-foreground text-lg">Прогрес за навичками</h3>
            <p className="text-sm text-muted-foreground font-mono">
              Ваш рівень володіння різними технологіями
            </p>
          </div>
          {stats.averageScore === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground font-mono">Поки немає даних про навички</p>
              <p className="text-sm text-muted-foreground font-mono mt-2">Виконуйте завдання, щоб відстежувати прогрес за навичками</p>
            </div>
          ) : (
            <div className="space-y-6">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-card-foreground font-medium font-mono">JavaScript</span>
                  <span className="text-muted-foreground font-mono">0%</span>
                </div>
                <ProgressBar value={0} className="h-2" />
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-card-foreground font-medium font-mono">Python</span>
                  <span className="text-muted-foreground font-mono">0%</span>
                </div>
                <ProgressBar value={0} className="h-2" />
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-card-foreground font-medium font-mono">Алгоритми</span>
                  <span className="text-muted-foreground font-mono">0%</span>
                </div>
                <ProgressBar value={0} className="h-2" />
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-card-foreground font-medium font-mono">Структури даних</span>
                  <span className="text-muted-foreground font-mono">0%</span>
                </div>
                <ProgressBar value={0} className="h-2" />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Progress;
