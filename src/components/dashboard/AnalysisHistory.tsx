import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { useSeoAnalyses, SeoAnalysis } from '@/hooks/useSeoAnalyses';
import { ExternalLink, Trash2, Clock, TrendingUp } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface AnalysisHistoryProps {
  onSelectAnalysis?: (analysis: SeoAnalysis) => void;
}

export function AnalysisHistory({ onSelectAnalysis }: AnalysisHistoryProps) {
  const { user } = useAuth();
  const { analyses, loading, deleteAnalysis } = useSeoAnalyses();

  const getScoreColor = (score: number | null) => {
    if (!score) return "text-muted-foreground";
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreBadge = (score: number | null) => {
    if (!score) return "outline";
    if (score >= 80) return "default";
    if (score >= 60) return "secondary";
    return "destructive";
  };

  const getOverallScore = (analysis: SeoAnalysis) => {
    const scores = [analysis.seo_score, analysis.voice_seo_score, analysis.ai_overview_score].filter(Boolean);
    if (scores.length === 0) return null;
    return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
  };

  if (!user) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Analysis History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">
            Sign in to view your analysis history
          </p>
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Analysis History
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
              <div className="space-y-2 flex-1">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
              <div className="flex items-center gap-2">
                <Skeleton className="h-8 w-16" />
                <Skeleton className="h-8 w-8" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  if (analyses.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Analysis History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">
            No analyses yet. Analyze your first website to see results here.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Analysis History
          <Badge variant="outline" className="ml-auto">
            {analyses.length} {analyses.length === 1 ? 'analysis' : 'analyses'}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {analyses.map((analysis) => {
          const overallScore = getOverallScore(analysis);
          
          return (
            <div
              key={analysis.id}
              className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
            >
              <div className="space-y-2 flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-medium truncate">{analysis.url}</p>
                  {analysis.status === 'completed' && overallScore && (
                    <Badge variant={getScoreBadge(overallScore)} className="shrink-0">
                      {overallScore}
                    </Badge>
                  )}
                  {analysis.status !== 'completed' && (
                    <Badge variant="outline" className="shrink-0">
                      {analysis.status}
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span>{new Date(analysis.created_at).toLocaleDateString()}</span>
                  {analysis.status === 'completed' && (
                    <div className="flex items-center gap-3">
                      {analysis.seo_score && (
                        <span className={getScoreColor(analysis.seo_score)}>
                          SEO: {analysis.seo_score}
                        </span>
                      )}
                      {analysis.voice_seo_score && (
                        <span className={getScoreColor(analysis.voice_seo_score)}>
                          Voice: {analysis.voice_seo_score}
                        </span>
                      )}
                      {analysis.ai_overview_score && (
                        <span className={getScoreColor(analysis.ai_overview_score)}>
                          AI: {analysis.ai_overview_score}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex items-center gap-2 shrink-0">
                {onSelectAnalysis && analysis.status === 'completed' && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onSelectAnalysis(analysis)}
                  >
                    <TrendingUp className="h-4 w-4 mr-2" />
                    View
                  </Button>
                )}
                
                <Button variant="outline" size="sm" asChild>
                  <a href={analysis.url} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </Button>
                
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Analysis</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete this analysis for "{analysis.url}"? 
                        This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => deleteAnalysis(analysis.id)}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}