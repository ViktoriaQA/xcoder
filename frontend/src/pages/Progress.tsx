import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress as ProgressBar } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Trophy, Target, TrendingUp, Calendar } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

const Progress = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    completedTasks: 12,
    totalTasks: 25,
    tournamentsWon: 3,
    tournamentsParticipated: 8,
    currentStreak: 5,
    longestStreak: 12,
    averageScore: 85,
    totalPoints: 480,
  });

  const completionPercentage = (stats.completedTasks / stats.totalTasks) * 100;
  const tournamentWinRate = (stats.tournamentsWon / stats.tournamentsParticipated) * 100;

  return (
    <div className="min-h-screen bg-gray-900 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            Мій прогрес
          </h1>
          <p className="text-gray-300">
            Відстежуйте свої досягнення та успіхи в навчанні
          </p>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <Target className="w-8 h-8 text-blue-500" />
                <span className="text-2xl font-bold text-white">
                  {completionPercentage.toFixed(0)}%
                </span>
              </div>
              <p className="text-sm text-gray-400 mb-3">Завершені завдання</p>
              <ProgressBar value={completionPercentage} className="h-2" />
              <p className="text-xs text-gray-500 mt-2">
                {stats.completedTasks} з {stats.totalTasks}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <Trophy className="w-8 h-8 text-yellow-500" />
                <span className="text-2xl font-bold text-white">
                  {stats.tournamentsWon}
                </span>
              </div>
              <p className="text-sm text-gray-400 mb-3">Перемоги в турнірах</p>
              <ProgressBar value={tournamentWinRate} className="h-2" />
              <p className="text-xs text-gray-500 mt-2">
                {tournamentWinRate.toFixed(0)}% перемог
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <TrendingUp className="w-8 h-8 text-green-500" />
                <span className="text-2xl font-bold text-white">
                  {stats.currentStreak}
                </span>
              </div>
              <p className="text-sm text-gray-400 mb-3">Поточна серія</p>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-xs">
                  Найкраща: {stats.longestStreak}
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <Calendar className="w-8 h-8 text-purple-500" />
                <span className="text-2xl font-bold text-white">
                  {stats.averageScore}
                </span>
              </div>
              <p className="text-sm text-gray-400 mb-3">Середній бал</p>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">
                  {stats.totalPoints} очок
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card className="bg-gray-800 border-gray-700 mb-8">
          <CardHeader>
            <CardTitle className="text-white">Остання активність</CardTitle>
            <CardDescription className="text-gray-400">
              Ваші нещодавні досягнення та прогрес
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <div>
                    <p className="text-white font-medium">Завершено завдання "Рекурсія"</p>
                    <p className="text-sm text-gray-400">2 години тому</p>
                  </div>
                </div>
                <Badge className="bg-green-600">+50 очок</Badge>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  <div>
                    <p className="text-white font-medium">Участь у турнірі "Spring Coding 2024"</p>
                    <p className="text-sm text-gray-400">1 день тому</p>
                  </div>
                </div>
                <Badge className="bg-yellow-600">3 місце</Badge>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <div>
                    <p className="text-white font-medium">Досягнуто серії 5 днів</p>
                    <p className="text-sm text-gray-400">3 дні тому</p>
                  </div>
                </div>
                <Badge className="bg-blue-600">+100 очок</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Skills Progress */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Прогрес за навичками</CardTitle>
            <CardDescription className="text-gray-400">
              Ваш рівень володіння різними технологіями
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-white font-medium">JavaScript</span>
                  <span className="text-gray-400">85%</span>
                </div>
                <ProgressBar value={85} className="h-2" />
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-white font-medium">Python</span>
                  <span className="text-gray-400">72%</span>
                </div>
                <ProgressBar value={72} className="h-2" />
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-white font-medium">Алгоритми</span>
                  <span className="text-gray-400">68%</span>
                </div>
                <ProgressBar value={68} className="h-2" />
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-white font-medium">Структури даних</span>
                  <span className="text-gray-400">90%</span>
                </div>
                <ProgressBar value={90} className="h-2" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Progress;
