import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { BookOpen, Search, Plus, Loader2, Check } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface Task {
  id: string;
  title: string;
  description?: string;
  difficulty: "easy" | "medium" | "hard";
  category?: string;
  points?: number;
  created_at?: string;
}

interface AddTaskFromLibraryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tournamentId: string;
  onSuccess: () => void;
}

const AddTaskFromLibraryModal: React.FC<AddTaskFromLibraryModalProps> = ({
  open,
  onOpenChange,
  tournamentId,
  onSuccess
}) => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("all");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedTasks, setSelectedTasks] = useState<string[]>([]);
  const [addingTasks, setAddingTasks] = useState(false);

  const categories = [
    { value: "all", label: t('tasks.allCategories', 'Всі категорії') },
    { value: "algorithms", label: t("tasks.categories.algorithms", "Алгоритми") },
    { value: "data-structures", label: t("tasks.categories.dataStructures", "Структури даних") },
    { value: "math", label: t("tasks.categories.math", "Математика") },
    { value: "strings", label: t("tasks.categories.strings", "Рядки") },
    { value: "sorting", label: t("tasks.categories.sorting", "Сортування") },
    { value: "search", label: t("tasks.categories.search", "Пошук") },
    { value: "dynamic-programming", label: t("tasks.categories.dynamicProgramming", "Динамічне програмування") },
    { value: "graph", label: t("tasks.categories.graph", "Графи") },
    { value: "implementation", label: t("tasks.categories.implementation", "Реалізація") }
  ];

  const difficulties = [
    { value: "all", label: t('tasks.allDifficulties', 'Всі рівні') },
    { value: "easy", label: t("tasks.difficulty.easy", "Легка") },
    { value: "medium", label: t("tasks.difficulty.medium", "Середня") },
    { value: "hard", label: t("tasks.difficulty.hard", "Складна") }
  ];

  // Fetch tasks from library
  useEffect(() => {
    const fetchTasks = async () => {
      if (!open) return;
      
      setLoading(true);
      try {
        const token = localStorage.getItem('auth_token');
        if (!token) {
          throw new Error(t('auth.loginRequired'));
        }

        const params = new URLSearchParams();
        if (searchTerm) params.append('search', searchTerm);
        if (selectedDifficulty !== 'all') params.append('difficulty', selectedDifficulty);
        if (selectedCategory !== 'all') params.append('category', selectedCategory);

        const response = await fetch(`/api/tasks?${params.toString()}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error(t('tasks.failedToFetchTasks'));
        }

        const data = await response.json();
        setTasks(data.tasks || []);
      } catch (error) {
        console.error('Error fetching tasks:', error);
        toast({
          title: t('common.error'),
          description: error instanceof Error ? error.message : t('tasks.failedToFetchTasks'),
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, [open, searchTerm, selectedDifficulty, selectedCategory, t, toast]);

  const handleTaskToggle = (taskId: string) => {
    setSelectedTasks(prev => 
      prev.includes(taskId) 
        ? prev.filter(id => id !== taskId)
        : [...prev, taskId]
    );
  };

  const handleAddTasks = async () => {
    if (selectedTasks.length === 0) {
      toast({
        title: t('common.warning'),
        description: t('tasks.selectAtLeastOneTask'),
        variant: "destructive",
      });
      return;
    }

    setAddingTasks(true);
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        throw new Error(t('auth.loginRequired'));
      }

      // Add each selected task to the tournament
      const addPromises = selectedTasks.map(taskId =>
        fetch(`/api/tournaments/${tournamentId}/tasks`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ task_id: taskId })
        })
      );

      const results = await Promise.allSettled(addPromises);
      const successful = results.filter(result => result.status === 'fulfilled').length;
      const failed = results.filter(result => result.status === 'rejected').length;

      if (successful > 0) {
        toast({
          title: t('common.success'),
          description: t('tasks.tasksAddedSuccessfully', { 
            successful, 
            failed, 
            defaultValue: "{{successful}} задач додано, {{failed}} не вдалося" 
          }),
        });
      }

      if (failed > 0) {
        // Show details for failed tasks
        const failedResults = results.filter(result => result.status === 'rejected') as PromiseRejectedResult[];
        failedResults.forEach((result, index) => {
          console.error(`Failed to add task ${selectedTasks[index]}:`, result.reason);
        });
      }

      setSelectedTasks([]);
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error('Error adding tasks:', error);
      toast({
        title: t('common.error'),
        description: error instanceof Error ? error.message : t('tasks.failedToAddTasks'),
        variant: "destructive",
      });
    } finally {
      setAddingTasks(false);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy":
        return "bg-green-500/15 text-green-500 border-green-500/30";
      case "medium":
        return "bg-yellow-500/15 text-yellow-500 border-yellow-500/30";
      case "hard":
        return "bg-red-500/15 text-red-500 border-red-500/30";
      default:
        return "bg-gray-500/15 text-gray-500 border-gray-500/30";
    }
  };

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (task.description && task.description.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesDifficulty = selectedDifficulty === 'all' || task.difficulty === selectedDifficulty;
    const matchesCategory = selectedCategory === 'all' || task.category === selectedCategory;
    return matchesSearch && matchesDifficulty && matchesCategory;
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-mono">
            <BookOpen className="h-5 w-5" />
            {t('tasks.addTasksFromLibrary', 'Додати задачі з бібліотеки')}
          </DialogTitle>
          <DialogDescription className="font-mono">
            {t('tasks.addTasksFromLibraryDescription', 'Оберіть задачі з бібліотеки для додавання до турніру')}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={t('tasks.searchTasks', 'Пошук задач...')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 font-mono"
                />
              </div>
            </div>
            <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
              <SelectTrigger className="w-full sm:w-40 font-mono">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {difficulties.map(diff => (
                  <SelectItem key={diff.value} value={diff.value} className="font-mono">
                    {diff.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full sm:w-48 font-mono">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {categories.map(cat => (
                  <SelectItem key={cat.value} value={cat.value} className="font-mono">
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Selected tasks counter */}
          {selectedTasks.length > 0 && (
            <div className="flex items-center justify-between p-3 bg-primary/10 rounded-lg">
              <span className="font-mono text-sm">
                {t('tasks.selectedTasks', 'Обрано задач: {{count}}', { count: selectedTasks.length })}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedTasks([])}
                className="font-mono text-xs"
              >
                {t('common.clear', 'Очистити')}
              </Button>
            </div>
          )}

          {/* Tasks list */}
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center h-32">
                <div className="flex items-center gap-2 text-muted-foreground font-mono">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {t('common.loading')}
                </div>
              </div>
            ) : filteredTasks.length === 0 ? (
              <div className="text-center py-8">
                <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-mono font-semibold mb-2">
                  {t('tasks.noTasksFound', 'Задач не знайдено')}
                </h3>
                <p className="text-sm text-muted-foreground font-mono">
                  {t('tasks.tryDifferentFilters', 'Спробуйте змінити фільтри або пошуковий запит')}
                </p>
              </div>
            ) : (
              filteredTasks.map((task) => (
                <Card 
                  key={task.id} 
                  className={`cursor-pointer transition-all ${
                    selectedTasks.includes(task.id) 
                      ? 'border-primary bg-primary/5' 
                      : 'border-border/60 bg-card/70 hover:border-primary/50'
                  }`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <Checkbox
                        checked={selectedTasks.includes(task.id)}
                        onCheckedChange={() => handleTaskToggle(task.id)}
                        className="mt-1"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <h4 className="font-mono font-medium truncate">{task.title}</h4>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <Badge className={`${getDifficultyColor(task.difficulty)} font-mono text-[10px]`}>
                              {task.difficulty === "easy"
                                ? t("tasks.difficulty.easy", "Легка")
                                : task.difficulty === "medium"
                                ? t("tasks.difficulty.medium", "Середня")
                                : t("tasks.difficulty.hard", "Складна")}
                            </Badge>
                            <span className="text-xs font-mono text-muted-foreground">
                              {task.points || 100} {t('tasks.points', 'балів')}
                            </span>
                          </div>
                        </div>
                        {task.description && (
                          <p className="text-xs text-muted-foreground font-mono line-clamp-2 mb-2">
                            {task.description}
                          </p>
                        )}
                        {task.category && (
                          <Badge variant="outline" className="font-mono text-[10px]">
                            {task.category}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="font-mono"
            disabled={addingTasks}
          >
            {t('common.cancel')}
          </Button>
          <Button
            onClick={handleAddTasks}
            disabled={selectedTasks.length === 0 || addingTasks}
            className="font-mono"
          >
            {addingTasks ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                {t('common.adding', 'Додавання...')}
              </>
            ) : (
              <>
                <Plus className="h-4 w-4 mr-2" />
                {t('tasks.addSelectedTasks', 'Додати обрані задачі')}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddTaskFromLibraryModal;
