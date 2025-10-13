import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Mic, Plus, Play, BarChart3, FileText, Search, MessageSquare, Smartphone, Target, TrendingUp } from "lucide-react";
import { useDemoSupabase } from "@/hooks/useDemoSupabase";
import { useDemoEdgeFunctions } from "@/hooks/useDemoEdgeFunctions";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface VoiceSearchTest {
  id: string;
  name: string;
  market_city: string;
  market_state: string;
  market_zip?: string;
  practice_areas: string[];
  custom_practice_area?: string;
  test_questions: string[];
  selected_assistants: string[];
  settings: any;
  status: string;
  created_at: string;
  updated_at: string;
}

interface TestProgress {
  total: number;
  completed: number;
  failed: number;
  percentage: number;
}

export function VoiceSearchManager() {
  const { user } = useAuth();
  const supabase = useDemoSupabase();
  const { invoke } = useDemoEdgeFunctions();
  const [activeTab, setActiveTab] = useState("setup");
  const [tests, setTests] = useState<VoiceSearchTest[]>([]);
  const [currentTest, setCurrentTest] = useState<VoiceSearchTest | null>(null);
  const [testProgress, setTestProgress] = useState<TestProgress | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    marketCity: "",
    marketState: "",
    marketZip: "",
    practiceAreas: [] as string[],
    customPracticeArea: "",
    testQuestions: [""],
    selectedAssistants: [] as string[],
    firmDomain: "",
    firmBusinessName: ""
  });

  const practiceAreaOptions = [
    "Personal Injury",
    "Estate Planning", 
    "Family Law",
    "Criminal Defense",
    "Business Law",
    "Real Estate",
    "Employment Law",
    "Immigration Law",
    "Bankruptcy",
    "Medical Malpractice"
  ];

  const assistantOptions = [
    { id: "google", name: "Google Search", icon: Search, description: "AI Overviews & Local Pack" },
    { id: "bing", name: "Bing Copilot", icon: MessageSquare, description: "Chat Responses & Web Results" },
    { id: "siri", name: "Siri", icon: Smartphone, description: "Apple Maps & Business Connect" },
    { id: "alexa", name: "Alexa", icon: Mic, description: "Skills & Local Business" }
  ];

  const suggestedQuestions = [
    "What should I do after a car accident?",
    "How do I write a will?",
    "Do I need a lawyer for divorce?",
    "What are my rights if I'm arrested?",
    "How do I start an LLC?",
    "Can I sue for medical malpractice?"
  ];

  useEffect(() => {
    if (user) {
      loadTests();
    }
  }, [user]);

  const loadTests = async () => {
    try {
      const { data, error } = await supabase
        .from('voice_search_tests')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTests(data || []);
    } catch (error) {
      console.error('Error loading tests:', error);
      toast.error('Failed to load voice search tests');
    }
  };

  const createTest = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('voice_search_tests')
        .insert({
          user_id: user.id,
          name: formData.name,
          market_city: formData.marketCity,
          market_state: formData.marketState,
          market_zip: formData.marketZip || null,
          practice_areas: formData.practiceAreas,
          custom_practice_area: formData.customPracticeArea || null,
          test_questions: formData.testQuestions.filter(q => q.trim()),
          selected_assistants: formData.selectedAssistants,
          settings: {
            firmDomain: formData.firmDomain,
            firmBusinessName: formData.firmBusinessName
          }
        })
        .select()
        .single();

      if (error) throw error;

      setCurrentTest(data);
      toast.success('Voice search test created successfully');
      loadTests();
      setActiveTab("execution");
    } catch (error) {
      console.error('Error creating test:', error);
      toast.error('Failed to create voice search test');
    } finally {
      setIsLoading(false);
    }
  };

  const startTest = async (testId: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await invoke('voice-search-orchestrator', {
        body: {
          testId,
          action: 'start'
        }
      });

      if (error) throw error;

      toast.success('Voice search test started');
      monitorTestProgress(testId);
    } catch (error) {
      console.error('Error starting test:', error);
      toast.error('Failed to start voice search test');
    } finally {
      setIsLoading(false);
    }
  };

  const monitorTestProgress = async (testId: string) => {
    const interval = setInterval(async () => {
      try {
        const { data, error } = await invoke('voice-search-orchestrator', {
          body: {
            testId,
            action: 'status'
          }
        });

        if (error) throw error;

        setTestProgress(data.progress);

        if (data.status === 'completed' || data.status === 'failed') {
          clearInterval(interval);
          setActiveTab("results");
          loadTests();
        }
      } catch (error) {
        console.error('Error monitoring test progress:', error);
        clearInterval(interval);
      }
    }, 2000);
  };

  const addTestQuestion = () => {
    setFormData(prev => ({
      ...prev,
      testQuestions: [...prev.testQuestions, ""]
    }));
  };

  const updateTestQuestion = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      testQuestions: prev.testQuestions.map((q, i) => i === index ? value : q)
    }));
  };

  const addSuggestedQuestion = (question: string) => {
    setFormData(prev => ({
      ...prev,
      testQuestions: [...prev.testQuestions.filter(q => q.trim()), question]
    }));
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-3">
        <Mic className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">Voice Search Simulator</h1>
          <p className="text-muted-foreground">
            Test how Google, Bing, Siri, and Alexa respond to legal queries in your market
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="setup">Setup Test</TabsTrigger>
          <TabsTrigger value="execution">Run Test</TabsTrigger>
          <TabsTrigger value="results">Results</TabsTrigger>
          <TabsTrigger value="history">Test History</TabsTrigger>
        </TabsList>

        <TabsContent value="setup" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Create New Voice Search Test</CardTitle>
              <CardDescription>
                Configure your test parameters to analyze voice search performance across different assistants
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="testName">Test Name</Label>
                  <Input
                    id="testName"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g., Personal Injury - Atlanta Q1 2024"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="firmName">Firm Business Name</Label>
                  <Input
                    id="firmName"
                    value={formData.firmBusinessName}
                    onChange={(e) => setFormData(prev => ({ ...prev, firmBusinessName: e.target.value }))}
                    placeholder="e.g., Smith & Associates Law Firm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    value={formData.marketCity}
                    onChange={(e) => setFormData(prev => ({ ...prev, marketCity: e.target.value }))}
                    placeholder="Atlanta"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="state">State</Label>
                  <Input
                    id="state"
                    value={formData.marketState}
                    onChange={(e) => setFormData(prev => ({ ...prev, marketState: e.target.value }))}
                    placeholder="GA"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="zip">Zip Code (Optional)</Label>
                  <Input
                    id="zip"
                    value={formData.marketZip}
                    onChange={(e) => setFormData(prev => ({ ...prev, marketZip: e.target.value }))}
                    placeholder="30309"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="firmDomain">Firm Website (Optional)</Label>
                <Input
                  id="firmDomain"
                  value={formData.firmDomain}
                  onChange={(e) => setFormData(prev => ({ ...prev, firmDomain: e.target.value }))}
                  placeholder="https://yourfirm.com"
                />
              </div>

              <div className="space-y-4">
                <Label>Practice Areas</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {practiceAreaOptions.map((area) => (
                    <div key={area} className="flex items-center space-x-2">
                      <Checkbox
                        id={area}
                        checked={formData.practiceAreas.includes(area)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setFormData(prev => ({
                              ...prev,
                              practiceAreas: [...prev.practiceAreas, area]
                            }));
                          } else {
                            setFormData(prev => ({
                              ...prev,
                              practiceAreas: prev.practiceAreas.filter(a => a !== area)
                            }));
                          }
                        }}
                      />
                      <Label htmlFor={area} className="text-sm">{area}</Label>
                    </div>
                  ))}
                </div>
                <Input
                  value={formData.customPracticeArea}
                  onChange={(e) => setFormData(prev => ({ ...prev, customPracticeArea: e.target.value }))}
                  placeholder="Custom practice area..."
                />
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Test Questions</Label>
                  <Button type="button" variant="outline" size="sm" onClick={addTestQuestion}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Question
                  </Button>
                </div>
                
                {formData.testQuestions.map((question, index) => (
                  <Textarea
                    key={index}
                    value={question}
                    onChange={(e) => updateTestQuestion(index, e.target.value)}
                    placeholder="Enter a legal question potential clients might ask..."
                    className="min-h-[80px]"
                  />
                ))}

                <div className="space-y-2">
                  <Label className="text-sm text-muted-foreground">Suggested Questions:</Label>
                  <div className="flex flex-wrap gap-2">
                    {suggestedQuestions.map((question, index) => (
                      <Button
                        key={index}
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => addSuggestedQuestion(question)}
                        className="text-xs"
                      >
                        {question}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <Label>Voice Assistants</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {assistantOptions.map((assistant) => (
                    <Card key={assistant.id} className="p-4 hover:bg-muted/50 cursor-pointer">
                      <div className="flex items-center space-x-3">
                        <Checkbox
                          id={assistant.id}
                          checked={formData.selectedAssistants.includes(assistant.id)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setFormData(prev => ({
                                ...prev,
                                selectedAssistants: [...prev.selectedAssistants, assistant.id]
                              }));
                            } else {
                              setFormData(prev => ({
                                ...prev,
                                selectedAssistants: prev.selectedAssistants.filter(a => a !== assistant.id)
                              }));
                            }
                          }}
                        />
                        <assistant.icon className="h-6 w-6 text-primary" />
                        <div>
                          <Label htmlFor={assistant.id} className="font-medium cursor-pointer">
                            {assistant.name}
                          </Label>
                          <p className="text-sm text-muted-foreground">{assistant.description}</p>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>

              <div className="flex justify-end">
                <Button 
                  onClick={createTest}
                  disabled={isLoading || !formData.name || !formData.marketCity || !formData.marketState || formData.selectedAssistants.length === 0}
                  className="min-w-[150px]"
                >
                  {isLoading ? "Creating..." : "Create Test"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="execution" className="space-y-6">
          {currentTest ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Play className="h-5 w-5" />
                  {currentTest.name}
                </CardTitle>
                <CardDescription>
                  {currentTest.market_city}, {currentTest.market_state} • {currentTest.test_questions.length} questions • {currentTest.selected_assistants.length} assistants
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {testProgress && (
                  <div className="space-y-4">
                    <div className="flex justify-between text-sm">
                      <span>Test Progress</span>
                      <span>{testProgress.percentage}%</span>
                    </div>
                    <Progress value={testProgress.percentage} className="w-full" />
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <div className="text-2xl font-bold text-blue-600">{testProgress.total}</div>
                        <div className="text-sm text-muted-foreground">Total Queries</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-green-600">{testProgress.completed}</div>
                        <div className="text-sm text-muted-foreground">Completed</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-red-600">{testProgress.failed}</div>
                        <div className="text-sm text-muted-foreground">Failed</div>
                      </div>
                    </div>
                  </div>
                )}

                {currentTest.status === 'pending' && (
                  <Button 
                    onClick={() => startTest(currentTest.id)}
                    disabled={isLoading}
                    className="w-full"
                    size="lg"
                  >
                    <Play className="h-5 w-5 mr-2" />
                    {isLoading ? "Starting Test..." : "Start Voice Search Test"}
                  </Button>
                )}

                {currentTest.status === 'running' && (
                  <div className="text-center py-8">
                    <Mic className="h-12 w-12 mx-auto mb-4 text-primary animate-pulse" />
                    <h3 className="text-lg font-semibold mb-2">Test Running...</h3>
                    <p className="text-muted-foreground">
                      Testing voice assistants across your selected questions. This may take a few minutes.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <Target className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">No Active Test</h3>
                <p className="text-muted-foreground mb-4">Create a new test to get started with voice search analysis.</p>
                <Button onClick={() => setActiveTab("setup")}>
                  Create New Test
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="results" className="space-y-6">
          <Card>
            <CardContent className="py-12 text-center">
              <BarChart3 className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">Results Coming Soon</h3>
              <p className="text-muted-foreground">
                Detailed analysis and recommendations will appear here after your test completes.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          {tests.length > 0 ? (
            <div className="space-y-4">
              {tests.map((test) => (
                <Card key={test.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-semibold">{test.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {test.market_city}, {test.market_state} • {new Date(test.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <Badge variant={test.status === 'completed' ? 'default' : test.status === 'running' ? 'secondary' : 'outline'}>
                        {test.status}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Questions:</span>
                        <div className="font-medium">{test.test_questions.length}</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Assistants:</span>
                        <div className="font-medium">{test.selected_assistants.length}</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Practice Areas:</span>
                        <div className="font-medium">{test.practice_areas.length}</div>
                      </div>
                    </div>

                    {test.status === 'pending' && (
                      <div className="mt-4 flex gap-2">
                        <Button 
                          size="sm" 
                          onClick={() => {
                            setCurrentTest(test);
                            setActiveTab("execution");
                          }}
                        >
                          <Play className="h-4 w-4 mr-2" />
                          Run Test
                        </Button>
                      </div>
                    )}

                    {test.status === 'completed' && (
                      <div className="mt-4 flex gap-2">
                        <Button size="sm" variant="outline">
                          <BarChart3 className="h-4 w-4 mr-2" />
                          View Results
                        </Button>
                        <Button size="sm" variant="outline">
                          <FileText className="h-4 w-4 mr-2" />
                          Export Report
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <TrendingUp className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">No Tests Yet</h3>
                <p className="text-muted-foreground mb-4">
                  Create your first voice search test to start analyzing your firm's performance.
                </p>
                <Button onClick={() => setActiveTab("setup")}>
                  Create Your First Test
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}