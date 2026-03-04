import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, Code, FileText, TestTube } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface TestCase {
  input: string;
  expected_output: string;
  description?: string;
}

interface TaskData {
  title: string;
  description: string;
  difficulty: "easy" | "medium" | "hard";
  category: string;
  points: number;
  time_limit: number;
  memory_limit: number;
  test_cases: TestCase[];
  starter_code?: string;
  solution?: string;
}

interface AddTaskModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tournamentId: string;
  onSuccess: () => void;
}

const AddTaskModal: React.FC<AddTaskModalProps> = ({
  open,
  onOpenChange,
  tournamentId,
  onSuccess
}) => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [taskData, setTaskData] = useState<TaskData>({
    title: "",
    description: "",
    difficulty: "medium",
    category: "algorithms",
    points: 100,
    time_limit: 1000,
    memory_limit: 256,
    test_cases: [{ input: "", expected_output: "" }],
    starter_code: "",
    solution: ""
  });

  const categories = [
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

  const handleAddTestCase = () => {
    setTaskData(prev => ({
      ...prev,
      test_cases: [...prev.test_cases, { input: "", expected_output: "" }]
    }));
  };

  const handleRemoveTestCase = (index: number) => {
    setTaskData(prev => ({
      ...prev,
      test_cases: prev.test_cases.filter((_, i) => i !== index)
    }));
  };

  const handleTestCaseChange = (index: number, field: keyof TestCase, value: string) => {
    setTaskData(prev => ({
      ...prev,
      test_cases: prev.test_cases.map((testCase, i) =>
        i === index ? { ...testCase, [field]: value } : testCase
      )
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        throw new Error(t('auth.loginRequired'));
      }

      // Validate test cases
      const validTestCases = taskData.test_cases.filter(
        tc => tc.input.trim() !== "" && tc.expected_output.trim() !== ""
      );

      if (validTestCases.length === 0) {
        throw new Error(t('tasks.atLeastOneTestCase'));
      }

      const response = await fetch(`/api/tournaments/${tournamentId}/tasks`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...taskData,
          test_cases: validTestCases,
          is_active: true,
          order_index: 0
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || t('tasks.failedToCreateTask'));
      }

      const result = await response.json();

      toast({
        title: t('common.success'),
        description: t('tasks.taskCreatedSuccessfully'),
      });

      // Reset form
      setTaskData({
        title: "",
        description: "",
        difficulty: "medium",
        category: "algorithms",
        points: 100,
        time_limit: 1000,
        memory_limit: 256,
        test_cases: [{ input: "", expected_output: "" }],
        starter_code: "",
        solution: ""
      });

      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error('Error creating task:', error);
      toast({
        title: t('common.error'),
        description: error instanceof Error ? error.message : t('tasks.failedToCreateTask'),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-mono">
            <Plus className="h-5 w-5" />
            {t('tasks.addTaskToTournament')}
          </DialogTitle>
          <DialogDescription className="font-mono">
            {t('tasks.addTaskDescription')}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-mono text-base">
                <FileText className="h-4 w-4" />
                {t('tasks.basicInformation')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title" className="font-mono text-sm">{t('tasks.title')}</Label>
                  <Input
                    id="title"
                    value={taskData.title}
                    onChange={(e) => setTaskData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder={t('tasks.titlePlaceholder')}
                    required
                    className="font-mono"
                  />
                </div>
                <div>
                  <Label htmlFor="category" className="font-mono text-sm">{t('tasks.category')}</Label>
                  <Select
                    value={taskData.category}
                    onValueChange={(value) => setTaskData(prev => ({ ...prev, category: value }))}
                  >
                    <SelectTrigger className="font-mono">
                      <SelectValue placeholder={t('tasks.selectCategory')} />
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
              </div>

              <div>
                <Label htmlFor="description" className="font-mono text-sm">{t('tasks.description')}</Label>
                <Textarea
                  id="description"
                  value={taskData.description}
                  onChange={(e) => setTaskData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder={t('tasks.descriptionPlaceholder')}
                  rows={4}
                  required
                  className="font-mono"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="difficulty" className="font-mono text-sm">{t('tasks.difficulty')}</Label>
                  <Select
                    value={taskData.difficulty}
                    onValueChange={(value: "easy" | "medium" | "hard") => setTaskData(prev => ({ ...prev, difficulty: value }))}
                  >
                    <SelectTrigger className="font-mono">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="easy" className="font-mono">
                        {t('tasks.difficulty.easy')}
                      </SelectItem>
                      <SelectItem value="medium" className="font-mono">
                        {t('tasks.difficulty.medium')}
                      </SelectItem>
                      <SelectItem value="hard" className="font-mono">
                        {t('tasks.difficulty.hard')}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="points" className="font-mono text-sm">{t('tasks.points')}</Label>
                  <Input
                    id="points"
                    type="number"
                    min="1"
                    max="1000"
                    value={taskData.points}
                    onChange={(e) => setTaskData(prev => ({ ...prev, points: parseInt(e.target.value) || 0 }))}
                    className="font-mono"
                  />
                </div>
                <div>
                  <Label htmlFor="time_limit" className="font-mono text-sm">{t('tasks.timeLimitMs')}</Label>
                  <Input
                    id="time_limit"
                    type="number"
                    min="100"
                    max="10000"
                    step="100"
                    value={taskData.time_limit}
                    onChange={(e) => setTaskData(prev => ({ ...prev, time_limit: parseInt(e.target.value) || 1000 }))}
                    className="font-mono"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Test Cases */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-mono text-base">
                <TestTube className="h-4 w-4" />
                {t('tasks.testCases')}
              </CardTitle>
              <CardDescription className="font-mono text-xs">
                {t('tasks.testCasesDescription')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {taskData.test_cases.map((testCase, index) => (
                <div key={index} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="font-mono text-xs">
                      {t('tasks.testCase')} {index + 1}
                    </Badge>
                    {taskData.test_cases.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveTestCase(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <Label className="font-mono text-xs">{t('tasks.input')}</Label>
                      <Textarea
                        value={testCase.input}
                        onChange={(e) => handleTestCaseChange(index, 'input', e.target.value)}
                        placeholder={t('tasks.inputPlaceholder')}
                        rows={3}
                        className="font-mono text-sm"
                      />
                    </div>
                    <div>
                      <Label className="font-mono text-xs">{t('tasks.expectedOutput')}</Label>
                      <Textarea
                        value={testCase.expected_output}
                        onChange={(e) => handleTestCaseChange(index, 'expected_output', e.target.value)}
                        placeholder={t('tasks.expectedOutputPlaceholder')}
                        rows={3}
                        className="font-mono text-sm"
                      />
                    </div>
                  </div>
                  {testCase.description && (
                    <div>
                      <Label className="font-mono text-xs">{t('tasks.description')}</Label>
                      <Input
                        value={testCase.description}
                        onChange={(e) => handleTestCaseChange(index, 'description', e.target.value)}
                        placeholder={t('tasks.testCaseDescriptionPlaceholder')}
                        className="font-mono text-sm"
                      />
                    </div>
                  )}
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                onClick={handleAddTestCase}
                className="w-full font-mono"
              >
                <Plus className="h-4 w-4 mr-2" />
                {t('tasks.addTestCase')}
              </Button>
            </CardContent>
          </Card>

          {/* Optional Code */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-mono text-base">
                <Code className="h-4 w-4" />
                {t('tasks.optionalCode')}
              </CardTitle>
              <CardDescription className="font-mono text-xs">
                {t('tasks.optionalCodeDescription')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="starter_code" className="font-mono text-sm">{t('tasks.starterCode')}</Label>
                <Textarea
                  id="starter_code"
                  value={taskData.starter_code}
                  onChange={(e) => setTaskData(prev => ({ ...prev, starter_code: e.target.value }))}
                  placeholder={t('tasks.starterCodePlaceholder')}
                  rows={6}
                  className="font-mono text-sm font-mono"
                />
              </div>
              <div>
                <Label htmlFor="solution" className="font-mono text-sm">{t('tasks.solution')}</Label>
                <Textarea
                  id="solution"
                  value={taskData.solution}
                  onChange={(e) => setTaskData(prev => ({ ...prev, solution: e.target.value }))}
                  placeholder={t('tasks.solutionPlaceholder')}
                  rows={6}
                  className="font-mono text-sm font-mono"
                />
              </div>
            </CardContent>
          </Card>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="font-mono"
            >
              {t('common.cancel')}
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="font-mono"
            >
              {loading ? t('common.creating') : t('tasks.createTask')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddTaskModal;
