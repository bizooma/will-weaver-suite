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
import { Mic, Plus, Play, BarChart3, FileText, Search, MessageSquare, Target, TrendingUp, AlertCircle } from "lucide-react";
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
  /** Queries whose provider has no live data source (edge function returned 501). */
  unavailable: number;
  percentage: number;
}

/**
 * One row of the results view: a test question, whether the firm was mentioned
 * in any assistant's answer, the evidence snippets (one per platform) and the
 * competitor names the assistants surfaced instead.
 */
interface QuestionResult {
  queryId: string;
  question: string;
  mentioned: boolean;
  /** Question contains the firm's own name — shown but excluded from scoring. */
  branded: boolean;
  snippets: { platform: string; snippet: string; isCitation: boolean }[];
  competitors: string[];
}

/**
 * Scorecard written by voice-search-analysis. Scores are per MODEL ANSWER (same
 * denominator as ai_visibility_runs) and exclude branded questions.
 */
interface TestAnalysis {
  presence_score: number;
  frequency_score: number;
  competitive_score: number;
  overall_score: number;
  competitor_data: {
    topCompetitors?: [string, number][];
    platformBreakdown?: { platform: string; mentions: number; total: number; score: number }[];
    scoredAnswers?: number;
    mentionAnswers?: number;
    brandedQuestionsExcluded?: number;
  } | null;
  optimization_suggestions: { priority: string; category: string; title: string; description: string; impact: number }[] | null;
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
  // Per-question results for the currently selected test (results tab).
  const [questionResults, setQuestionResults] = useState<QuestionResult[] | null>(null);
  const [isLoadingResults, setIsLoadingResults] = useState(false);
  // Scorecard for the selected test (per-model-answer scores + platform split).
  const [analysis, setAnalysis] = useState<TestAnalysis | null>(null);

  // True while the 'start' request is in flight — blocks a double click.
  const [isStarting, setIsStarting] = useState(false);
  // Wall-clock start of the current run; drives the elapsed-time readout so a
  // slow step still looks alive next to the percentage.
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  // Tick the elapsed counter once a second while a run is in progress.
  useEffect(() => {
    if (startedAt === null) return;
    const t = setInterval(() => setElapsedSeconds(Math.floor((Date.now() - startedAt) / 1000)), 1000);
    return () => clearInterval(t);
  }, [startedAt]);

  /** mm:ss formatting for the elapsed readout. */
  const formatElapsed = (s: number) =>
    `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;


  // Form state
  const [formData, setFormData] = useState({
    name: "",
    marketCity: "",
    marketState: "",
    marketZip: "",
    practiceAreas: [] as string[],
    customPracticeArea: "",
    testQuestions: [""],
    // AI Assistants is the default (and only) provider that returns real data.
    selectedAssistants: ["ai_assistants"] as string[],

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

  /**
   * Selectable providers.
   *
   * 'ai_assistants' is the default and only enabled option: it routes to the
   * ai-visibility-check engine, which asks ChatGPT and Gemini the test questions
   * live and detects real mentions, citations and competitors.
   *
   * Siri and Alexa are intentionally absent: there is no public API that returns
   * what those assistants would answer, so they can never produce real data.
   *
   * Google and Bing remain listed but are disabled until a paid SERP data
   * provider is wired up — they are genuinely buildable later.
   */
  const assistantOptions = [
    { id: "ai_assistants", name: "AI Assistants (ChatGPT, Gemini)", icon: MessageSquare, description: "Live answers from ChatGPT & Gemini — mentions, citations, competitors", available: true },
    { id: "google", name: "Google Search", icon: Search, description: "AI Overviews & Local Pack", available: false },
    { id: "bing", name: "Bing Copilot", icon: MessageSquare, description: "Chat Responses & Web Results", available: false }
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

  /**
   * Load the per-question results for a finished test. Two plain queries
   * (queries, then their results) joined in JS — RLS scopes both to the owner.
   */
  const loadResults = async (testId: string) => {
    setIsLoadingResults(true);
    try {
      const { data: queries, error: queriesError } = await supabase
        .from('voice_search_queries')
        .select('id, question, assistant')
        .eq('test_id', testId)
        .order('created_at', { ascending: true });

      if (queriesError) throw queriesError;

      const queryIds = (queries || []).map((q: any) => q.id);
      let rows: any[] = [];
      if (queryIds.length > 0) {
        const { data: results, error: resultsError } = await supabase
          .from('voice_search_results')
          .select('*')
          .in('query_id', queryIds);
        if (resultsError) throw resultsError;
        rows = results || [];
      }

      // Latest scorecard for this test (per-model-answer scoring).
      const { data: analysisRow } = await supabase
        .from('voice_search_analysis')
        .select('presence_score, frequency_score, competitive_score, overall_score, competitor_data, optimization_suggestions')
        .eq('test_id', testId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      setAnalysis((analysisRow as unknown as TestAnalysis) ?? null);

      // The firm's own name: questions containing it are branded queries and are
      // excluded from the score by voice-search-analysis.
      const { data: testRow } = await supabase
        .from('voice_search_tests')
        .select('settings')
        .eq('id', testId)
        .maybeSingle();
      const businessName = String(
        ((testRow?.settings || {}) as Record<string, unknown>).firmBusinessName || ''
      ).trim();

      const mapped: QuestionResult[] = (queries || []).map((q: any) => {
        const matching = rows.filter((r) => r.query_id === q.id);
        const snippets = matching.flatMap((r) =>
          (Array.isArray(r.snippets) ? r.snippets : []).map((s: any) => ({
            // The orchestrator stores the answering platform in snippets[].title.
            platform: String(s.title || r.assistant || 'unknown'),
            snippet: String(s.snippet || ''),
            isCitation: !!s.is_citation,
          }))
        );
        const competitors = [
          ...new Set(
            matching.flatMap((r) =>
              (Array.isArray(r.local_pack_results) ? r.local_pack_results : [])
                .map((c: any) => String(c?.name || c?.business_name || ''))
                .filter(Boolean)
            )
          ),
        ];
        return {
          queryId: q.id,
          question: q.question,
          // ai_overview_text is only written when a mention was detected.
          mentioned: matching.some((r) => !!r.ai_overview_text),
          branded: !!businessName &&
            String(q.question || '').toLowerCase().includes(businessName.toLowerCase()),
          snippets,
          competitors,
        };
      });

      setQuestionResults(mapped);

    } catch (error) {
      console.error('Error loading results:', error);
      toast.error('Failed to load test results');
      setQuestionResults([]);
    } finally {
      setIsLoadingResults(false);
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
          test_questions: formData.testQuestions.filter(q => q.trim()).slice(0, 8),
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
    // Guard the double click on the client too: the orchestrator answers 409 for
    // an already-running test, but we should never even send the second request.
    if (isStarting || currentTest?.status === 'running') return;
    setIsStarting(true);
    // Show the progress card immediately instead of waiting for the first poll.
    setTestProgress({ total: 0, completed: 0, failed: 0, unavailable: 0, percentage: 0 });
    setElapsedSeconds(0);
    setStartedAt(Date.now());
    setCurrentTest(prev => (prev ? { ...prev, status: 'running' } : prev));
    setQuestionResults(null);

    try {
      const { data, error } = await invoke('voice-search-orchestrator', {
        body: {
          testId,
          action: 'start'
        }
      });

      if (error) throw error;

      toast.success('AI search visibility test started');
      monitorTestProgress(testId);
    } catch (error) {
      console.error('Error starting test:', error);
      toast.error('Failed to start test — it may already be running');
      // Roll back the optimistic 'running' state so the button comes back.
      setCurrentTest(prev => (prev ? { ...prev, status: 'pending' } : prev));
      setTestProgress(null);
      setStartedAt(null);
    } finally {
      setIsStarting(false);
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

        // 'unavailable' means no provider returned live data — stop polling too.
        if (data.status === 'completed' || data.status === 'failed' || data.status === 'unavailable') {
          clearInterval(interval);
          setStartedAt(null);
          setActiveTab("results");
          loadTests();
          // Keep the final counts on screen (the results tab renders the same
          // progress card) and load the per-question results.
          setCurrentTest(prev => (prev ? { ...prev, status: data.status } : prev));
          if (data.status !== 'unavailable') loadResults(testId);
        }
      } catch (error) {
        console.error('Error monitoring test progress:', error);
        clearInterval(interval);
        setStartedAt(null);
      }
    }, 2000);
  };


  /**
   * Hard cap on questions per test. ai-visibility-check runs each prompt
   * sequentially against 2 models with a pacing delay, so more than 8 questions
   * cannot complete inside the edge function time limit. The orchestrator
   * enforces the same cap server-side.
   */
  const MAX_QUESTIONS = 8;

  const addTestQuestion = () => {
    setFormData(prev => ({
      ...prev,
      testQuestions: prev.testQuestions.length >= MAX_QUESTIONS
        ? prev.testQuestions
        : [...prev.testQuestions, ""]
    }));
  };

  const updateTestQuestion = (index: number, value: string) => {
    // Pasting a multi-line list should become multiple questions, not one blob.
    if (/[\r\n]/.test(value)) {
      const lines = value.split(/[\r\n]+/).map(l => l.trim()).filter(Boolean);
      setFormData(prev => {
        const next = [...prev.testQuestions];
        // First pasted line replaces the edited slot; the rest fill/append after
        // it, all within the MAX_QUESTIONS cap.
        next.splice(index, 1, ...lines);
        return { ...prev, testQuestions: next.slice(0, MAX_QUESTIONS) };
      });
      return;
    }

    setFormData(prev => ({
      ...prev,
      testQuestions: prev.testQuestions.map((q, i) => i === index ? value : q)
    }));
  };

  const addSuggestedQuestion = (question: string) => {
    setFormData(prev => ({
      ...prev,
      // Filtering blanks first keeps the empty starter row from eating a slot.
      testQuestions: [...prev.testQuestions.filter(q => q.trim()), question]
        .slice(0, MAX_QUESTIONS)
    }));
  };


  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-3">
        <Mic className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">AI Search Visibility</h1>
          <p className="text-muted-foreground">
            See whether ChatGPT and Gemini recommend your law firm when prospective clients ask legal questions in your market
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
              <CardTitle>Create New AI Search Visibility Test</CardTitle>
              <CardDescription>
                Configure your test to measure how often AI assistants recommend your firm for these questions

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

              {/* Required: mention detection needs a domain to look for. */}
              <div className="space-y-2">
                <Label htmlFor="firmDomain">Firm Website</Label>
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
                  <div>
                    <Label>Test Questions</Label>
                    {/* Runtime cap: 2 AI models per question, run sequentially. */}
                    <p className="text-xs text-muted-foreground">
                      Up to {MAX_QUESTIONS} questions per test
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addTestQuestion}
                    disabled={formData.testQuestions.length >= MAX_QUESTIONS}
                  >
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
                <Label>AI Assistants & Search Engines</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {assistantOptions.map((assistant) => {
                    const checked = formData.selectedAssistants.includes(assistant.id);
                    return (
                      <Card key={assistant.id} className={`p-4 ${assistant.available ? "" : "opacity-60"}`}>
                        <div className="flex items-center space-x-3">
                          {/* Unavailable providers stay visible but locked. */}
                          <Checkbox
                            id={assistant.id}
                            checked={assistant.available ? checked : false}
                            disabled={!assistant.available}
                            onCheckedChange={(value) => {
                              if (!assistant.available) return;
                              setFormData(prev => ({
                                ...prev,
                                selectedAssistants: value
                                  ? [...new Set([...prev.selectedAssistants, assistant.id])]
                                  : prev.selectedAssistants.filter(a => a !== assistant.id),
                              }));
                            }}
                          />
                          <assistant.icon className={`h-6 w-6 ${assistant.available ? "text-primary" : "text-muted-foreground"}`} />
                          <div>
                            <Label htmlFor={assistant.id} className="font-medium">
                              {assistant.name}
                            </Label>
                            <p className="text-sm text-muted-foreground">{assistant.description}</p>
                            {!assistant.available && (
                              <p className="text-xs text-muted-foreground mt-1">
                                Coming soon — requires SERP data provider
                              </p>
                            )}
                          </div>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              </div>

              <div className="flex justify-end">
                <Button 
                  onClick={createTest}
                  disabled={isLoading || !formData.name || !formData.marketCity || !formData.marketState || !formData.firmDomain.trim() || formData.selectedAssistants.length === 0}
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
                      <span>
                        Test Progress
                        {/* Elapsed time keeps a long-running question looking alive. */}
                        {startedAt !== null && (
                          <span className="text-muted-foreground"> • {formatElapsed(elapsedSeconds)} elapsed</span>
                        )}
                      </span>
                      <span>{testProgress.percentage}%</span>
                    </div>

                    <Progress value={testProgress.percentage} className="w-full" />
                    {/* Four counters so Total = Completed + Failed + Unavailable is verifiable. */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
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
                      <div>
                        <div className="text-2xl font-bold text-muted-foreground">{testProgress.unavailable ?? 0}</div>
                        <div className="text-sm text-muted-foreground">Unavailable</div>
                      </div>
                    </div>
                  </div>
                )}


                {currentTest.status === 'pending' && (
                  <Button 
                    onClick={() => startTest(currentTest.id)}
                    // Disabled while the start request is in flight or the test
                    // is already running — prevents duplicate query row sets.
                    disabled={isStarting || currentTest.status !== 'pending'}
                    className="w-full"
                    size="lg"
                  >
                    <Play className="h-5 w-5 mr-2" />
                    {isStarting ? "Starting Test..." : "Start Voice Search Test"}
                  </Button>
                )}


                {currentTest.status === 'running' && (
                  <div className="text-center py-8">
                    <Mic className="h-12 w-12 mx-auto mb-4 text-primary animate-pulse" />
                    <h3 className="text-lg font-semibold mb-2">Test Running...</h3>
                    <p className="text-muted-foreground">
                      Querying ChatGPT and Gemini with your selected questions. This may take a few minutes.
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
          {/* The progress card stays visible here so the final counts
              (total / completed / failed / unavailable) are not lost when the
              poll flips the user over to this tab. */}
          {testProgress && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Run Summary</CardTitle>
                <CardDescription>Final query counts for this test</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Progress value={testProgress.percentage} className="w-full" />
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
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
                  <div>
                    <div className="text-2xl font-bold text-muted-foreground">{testProgress.unavailable ?? 0}</div>
                    <div className="text-sm text-muted-foreground">Unavailable</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* When a test ends as 'unavailable', no live provider data was collected.
              We must never show scores, charts, or a results table in that case. */}
          {currentTest?.status === 'unavailable' ? (
            <Card>
              <CardContent className="py-12 text-center">
                <AlertCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">
                  Live voice assistant data is not currently available. No results were generated for this test.
                </p>
              </CardContent>
            </Card>
          ) : isLoadingResults ? (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                Loading results...
              </CardContent>
            </Card>
          ) : questionResults && questionResults.length > 0 ? (
            <div className="space-y-4">
              {questionResults.map((qr) => (
                <Card key={qr.queryId}>
                  <CardHeader>
                    <div className="flex items-start justify-between gap-4">
                      <CardTitle className="text-base leading-snug">{qr.question}</CardTitle>
                      {/* Presence: was the firm named in any assistant answer? */}
                      <Badge variant={qr.mentioned ? "default" : "secondary"}>
                        {qr.mentioned ? "Firm mentioned" : "Not mentioned"}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Evidence snippets, one per answering platform. */}
                    {qr.snippets.length > 0 ? (
                      <div className="space-y-3">
                        {qr.snippets.map((s, i) => (
                          <div key={i} className="rounded-md border p-3">
                            <div className="flex items-center gap-2 mb-1">
                              <Badge variant="outline" className="capitalize">{s.platform}</Badge>
                              {s.isCitation && <Badge variant="outline">Cited link</Badge>}
                            </div>
                            <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                              {s.snippet || "No evidence text returned."}
                            </p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">No answer captured for this question.</p>
                    )}

                    {/* Competitors the assistants surfaced instead of the firm. */}
                    <div>
                      <Label className="text-sm">Competitors mentioned</Label>
                      {qr.competitors.length > 0 ? (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {qr.competitors.map((c) => (
                            <Badge key={c} variant="secondary">{c}</Badge>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground mt-1">None detected.</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <BarChart3 className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">No results yet</h3>
                <p className="text-muted-foreground">
                  Run a test to see which AI assistants recommend your firm.
                </p>
              </CardContent>
            </Card>
          )}
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
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            // Load this historical test's per-question results.
                            setCurrentTest(test);
                            setActiveTab("results");
                            loadResults(test.id);
                          }}
                        >
                          <BarChart3 className="h-4 w-4 mr-2" />
                          View Results
                        </Button>
                        <Button size="sm" variant="outline">
                          <FileText className="h-4 w-4 mr-2" />
                          Export Report
                        </Button>
                      </div>
                    )}

                    {/* No live provider data: show a plain notice, never a score or export. */}
                    {test.status === 'unavailable' && (
                      <p className="mt-4 text-sm text-muted-foreground">
                        Live voice assistant data is not currently available. No results were generated for this test.
                      </p>
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