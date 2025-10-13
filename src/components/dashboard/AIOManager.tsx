import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/components/ui/use-toast";
import { useDemoEdgeFunctions } from "@/hooks/useDemoEdgeFunctions";
import { useAuth } from "@/contexts/AuthContext";
import { Search, CheckCircle, AlertCircle, Info, ExternalLink } from "lucide-react";
import { AnalysisHistory } from "./AnalysisHistory";
import { SeoAnalysis } from "@/hooks/useSeoAnalyses";

interface AnalysisResult {
  analysisId?: string;
  saved?: boolean;
  authenticated?: boolean;
  url: string;
  analysis: {
    seo: {
      score: number;
      title: { content: string; length: number; optimized: boolean; suggestions: string[] };
      metaDescription: { content: string; length: number; optimized: boolean; suggestions: string[] };
      headings: { h1Count: number; h2Count: number; structure: boolean; suggestions: string[] };
      images: { total: number; withAlt: number; missingAlt: string[]; suggestions: string[] };
      links: { internal: number; external: number; suggestions: string[] };
    };
    voiceSeo: {
      score: number;
      conversational: { detected: boolean; examples: string[]; suggestions: string[] };
      faq: { detected: boolean; count: number; suggestions: string[] };
      localSeo: { detected: boolean; elements: string[]; suggestions: string[] };
      longTail: { opportunities: string[]; suggestions: string[] };
    };
    aiOverview: {
      score: number;
      structuredData: { detected: boolean; types: string[]; suggestions: string[] };
      featuredSnippet: { potential: boolean; opportunities: string[]; suggestions: string[] };
      questionAnswer: { detected: boolean; count: number; suggestions: string[] };
      entities: { detected: string[]; suggestions: string[] };
    };
  };
  timestamp: string;
}

export function AIOManager() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { invoke } = useDemoEdgeFunctions();
  const [url, setUrl] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSelectAnalysis = (analysis: SeoAnalysis) => {
    if (analysis.analysis_data && analysis.status === 'completed') {
      // Convert stored analysis to display format
      const analysisResult: AnalysisResult = {
        analysisId: analysis.id,
        saved: true,
        authenticated: true,
        url: analysis.url,
        analysis: analysis.analysis_data,
        timestamp: analysis.created_at,
      };
      setResult(analysisResult);
      setUrl(analysis.url);
    }
  };

  const validateUrl = (urlString: string): boolean => {
    try {
      const url = new URL(urlString);
      return url.protocol === 'http:' || url.protocol === 'https:';
    } catch {
      return false;
    }
  };

  const handleAnalyze = async () => {
    if (!url.trim()) {
      toast({
        title: "Error",
        description: "Please enter a URL to analyze",
        variant: "destructive",
      });
      return;
    }

    if (!validateUrl(url)) {
      toast({
        title: "Error",
        description: "Please enter a valid URL (including http:// or https://)",
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);
    setProgress(0);
    setError(null);
    setResult(null);

    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 10, 90));
      }, 500);

      const { data, error } = await invoke('analyze-seo', {
        body: {
          url: url.trim()
        }
      });

      clearInterval(progressInterval);
      setProgress(100);

      if (error) throw error;

      if (!data.success) {
        throw new Error(data.error || 'Analysis failed');
      }

      setResult(data);
      
      // Show appropriate success message based on save status
      const description = data.saved 
        ? "Analysis completed and saved to your account" 
        : data.authenticated 
        ? "Analysis completed but couldn't be saved" 
        : "Analysis completed (sign in to save results)";
      
      toast({
        title: "Analysis Complete",
        description,
      });

    } catch (error) {
      console.error('Analysis error:', error);
      setError(error.message || 'Failed to analyze URL');
      toast({
        title: "Analysis Failed",
        description: error.message || 'Failed to analyze URL',
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreBadge = (score: number) => {
    if (score >= 80) return "default";
    if (score >= 60) return "secondary";
    return "destructive";
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">AIO SEO Analyzer</h1>
        <p className="text-muted-foreground">
          Comprehensive analysis for SEO, Voice SEO, and AI Overview optimization
        </p>
      </div>

      {/* Analysis History */}
      <AnalysisHistory onSelectAnalysis={handleSelectAnalysis} />

      {/* URL Input */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Analyze Website
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              type="url"
              placeholder="https://example.com"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              disabled={isAnalyzing}
              className="flex-1"
            />
            <Button onClick={handleAnalyze} disabled={isAnalyzing || !url.trim()}>
              {isAnalyzing ? "Analyzing..." : "Analyze"}
            </Button>
          </div>

          {isAnalyzing && (
            <div className="space-y-2">
              <Progress value={progress} className="w-full" />
              <p className="text-sm text-muted-foreground">
                Analyzing website content and SEO factors...
              </p>
            </div>
          )}

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Results */}
      {result && (
        <div className="space-y-6">
          {/* Overview Scores */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">SEO Score</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <span className={`text-2xl font-bold ${getScoreColor(result.analysis.seo.score)}`}>
                    {result.analysis.seo.score}
                  </span>
                  <Badge variant={getScoreBadge(result.analysis.seo.score)}>
                    {result.analysis.seo.score >= 80 ? "Excellent" : 
                     result.analysis.seo.score >= 60 ? "Good" : "Needs Work"}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Voice SEO Score</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <span className={`text-2xl font-bold ${getScoreColor(result.analysis.voiceSeo.score)}`}>
                    {result.analysis.voiceSeo.score}
                  </span>
                  <Badge variant={getScoreBadge(result.analysis.voiceSeo.score)}>
                    {result.analysis.voiceSeo.score >= 80 ? "Excellent" : 
                     result.analysis.voiceSeo.score >= 60 ? "Good" : "Needs Work"}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">AI Overview Score</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <span className={`text-2xl font-bold ${getScoreColor(result.analysis.aiOverview.score)}`}>
                    {result.analysis.aiOverview.score}
                  </span>
                  <Badge variant={getScoreBadge(result.analysis.aiOverview.score)}>
                    {result.analysis.aiOverview.score >= 80 ? "Excellent" : 
                     result.analysis.aiOverview.score >= 60 ? "Good" : "Needs Work"}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* URL Info and Save Status */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="font-medium">Analyzed URL:</p>
                  <p className="text-sm text-muted-foreground">{result.url}</p>
                  <div className="flex items-center gap-2">
                    {result.saved ? (
                      <Badge variant="default" className="text-xs">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Saved to Account
                      </Badge>
                    ) : result.authenticated ? (
                      <Badge variant="secondary" className="text-xs">
                        <AlertCircle className="h-3 w-3 mr-1" />
                        Not Saved
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-xs">
                        <Info className="h-3 w-3 mr-1" />
                        Sign in to Save
                      </Badge>
                    )}
                    <span className="text-xs text-muted-foreground">
                      {new Date(result.timestamp).toLocaleString()}
                    </span>
                  </div>
                </div>
                <Button variant="outline" size="sm" asChild>
                  <a href={result.url} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Visit Site
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Detailed Analysis */}
          <Tabs defaultValue="seo" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="seo">SEO Analysis</TabsTrigger>
              <TabsTrigger value="voice">Voice SEO</TabsTrigger>
              <TabsTrigger value="ai">AI Overview</TabsTrigger>
            </TabsList>

            <TabsContent value="seo" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>SEO Analysis Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Title */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium">Title Tag</h4>
                      {result.analysis.seo.title.optimized ? 
                        <CheckCircle className="h-4 w-4 text-green-600" /> :
                        <AlertCircle className="h-4 w-4 text-red-600" />
                      }
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {result.analysis.seo.title.content || 'No title found'} 
                      ({result.analysis.seo.title.length} characters)
                    </p>
                    {result.analysis.seo.title.suggestions.map((suggestion, index) => (
                      <Alert key={index}>
                        <Info className="h-4 w-4" />
                        <AlertDescription>{suggestion}</AlertDescription>
                      </Alert>
                    ))}
                  </div>

                  {/* Meta Description */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium">Meta Description</h4>
                      {result.analysis.seo.metaDescription.optimized ? 
                        <CheckCircle className="h-4 w-4 text-green-600" /> :
                        <AlertCircle className="h-4 w-4 text-red-600" />
                      }
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {result.analysis.seo.metaDescription.content || 'No meta description found'} 
                      ({result.analysis.seo.metaDescription.length} characters)
                    </p>
                    {result.analysis.seo.metaDescription.suggestions.map((suggestion, index) => (
                      <Alert key={index}>
                        <Info className="h-4 w-4" />
                        <AlertDescription>{suggestion}</AlertDescription>
                      </Alert>
                    ))}
                  </div>

                  {/* Headings */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium">Heading Structure</h4>
                      {result.analysis.seo.headings.structure ? 
                        <CheckCircle className="h-4 w-4 text-green-600" /> :
                        <AlertCircle className="h-4 w-4 text-red-600" />
                      }
                    </div>
                    <p className="text-sm text-muted-foreground">
                      H1: {result.analysis.seo.headings.h1Count}, H2: {result.analysis.seo.headings.h2Count}
                    </p>
                    {result.analysis.seo.headings.suggestions.map((suggestion, index) => (
                      <Alert key={index}>
                        <Info className="h-4 w-4" />
                        <AlertDescription>{suggestion}</AlertDescription>
                      </Alert>
                    ))}
                  </div>

                  {/* Images */}
                  <div className="space-y-2">
                    <h4 className="font-medium">Image Optimization</h4>
                    <p className="text-sm text-muted-foreground">
                      {result.analysis.seo.images.withAlt} of {result.analysis.seo.images.total} images have alt text
                    </p>
                    {result.analysis.seo.images.suggestions.map((suggestion, index) => (
                      <Alert key={index}>
                        <Info className="h-4 w-4" />
                        <AlertDescription>{suggestion}</AlertDescription>
                      </Alert>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="voice" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Voice SEO Analysis Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Conversational Content */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium">Conversational Content</h4>
                      {result.analysis.voiceSeo.conversational.detected ? 
                        <CheckCircle className="h-4 w-4 text-green-600" /> :
                        <AlertCircle className="h-4 w-4 text-red-600" />
                      }
                    </div>
                    {result.analysis.voiceSeo.conversational.suggestions.map((suggestion, index) => (
                      <Alert key={index}>
                        <Info className="h-4 w-4" />
                        <AlertDescription>{suggestion}</AlertDescription>
                      </Alert>
                    ))}
                  </div>

                  {/* FAQ Section */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium">FAQ Content</h4>
                      {result.analysis.voiceSeo.faq.detected ? 
                        <CheckCircle className="h-4 w-4 text-green-600" /> :
                        <AlertCircle className="h-4 w-4 text-red-600" />
                      }
                    </div>
                    <p className="text-sm text-muted-foreground">
                      FAQ sections detected: {result.analysis.voiceSeo.faq.count}
                    </p>
                    {result.analysis.voiceSeo.faq.suggestions.map((suggestion, index) => (
                      <Alert key={index}>
                        <Info className="h-4 w-4" />
                        <AlertDescription>{suggestion}</AlertDescription>
                      </Alert>
                    ))}
                  </div>

                  {/* Local SEO */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium">Local SEO Elements</h4>
                      {result.analysis.voiceSeo.localSeo.detected ? 
                        <CheckCircle className="h-4 w-4 text-green-600" /> :
                        <AlertCircle className="h-4 w-4 text-red-600" />
                      }
                    </div>
                    {result.analysis.voiceSeo.localSeo.suggestions.map((suggestion, index) => (
                      <Alert key={index}>
                        <Info className="h-4 w-4" />
                        <AlertDescription>{suggestion}</AlertDescription>
                      </Alert>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="ai" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>AI Overview Optimization Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Structured Data */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium">Structured Data</h4>
                      {result.analysis.aiOverview.structuredData.detected ? 
                        <CheckCircle className="h-4 w-4 text-green-600" /> :
                        <AlertCircle className="h-4 w-4 text-red-600" />
                      }
                    </div>
                    {result.analysis.aiOverview.structuredData.suggestions.map((suggestion, index) => (
                      <Alert key={index}>
                        <Info className="h-4 w-4" />
                        <AlertDescription>{suggestion}</AlertDescription>
                      </Alert>
                    ))}
                  </div>

                  {/* Featured Snippet Potential */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium">Featured Snippet Potential</h4>
                      {result.analysis.aiOverview.featuredSnippet.potential ? 
                        <CheckCircle className="h-4 w-4 text-green-600" /> :
                        <AlertCircle className="h-4 w-4 text-red-600" />
                      }
                    </div>
                    {result.analysis.aiOverview.featuredSnippet.suggestions.map((suggestion, index) => (
                      <Alert key={index}>
                        <Info className="h-4 w-4" />
                        <AlertDescription>{suggestion}</AlertDescription>
                      </Alert>
                    ))}
                  </div>

                  {/* Question-Answer Format */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium">Question-Answer Content</h4>
                      {result.analysis.aiOverview.questionAnswer.detected ? 
                        <CheckCircle className="h-4 w-4 text-green-600" /> :
                        <AlertCircle className="h-4 w-4 text-red-600" />
                      }
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Q&A sections detected: {result.analysis.aiOverview.questionAnswer.count}
                    </p>
                    {result.analysis.aiOverview.questionAnswer.suggestions.map((suggestion, index) => (
                      <Alert key={index}>
                        <Info className="h-4 w-4" />
                        <AlertDescription>{suggestion}</AlertDescription>
                      </Alert>
                    ))}
                  </div>
                </CardContent>
              </Card>
              </TabsContent>
              
              <TabsContent value="recommendations" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Recommendations Coming Soon */}
                  <Card className="p-6">
                    <h3 className="font-semibold mb-4">📈 Enhanced Recommendations</h3>
                    <p className="text-muted-foreground">
                      Advanced action plans with priority rankings, quick wins, and long-term strategies 
                      will be available once the enhanced analysis interface is fully updated.
                    </p>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </div>
      )}
    </div>
  );
}