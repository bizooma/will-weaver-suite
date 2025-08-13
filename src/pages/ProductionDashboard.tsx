import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  BarChart3, 
  Shield, 
  Gauge,
  Globe,
  Eye,
  Download
} from 'lucide-react';
import { DEPLOYMENT_CHECKLIST, getDeploymentReadiness, ENV_CONFIG } from '@/lib/config';
import { performanceMonitor, webVitalsMonitor } from '@/lib/performance';
import { calculatePageScore, generateSitemap, generateRobotsTxt } from '@/lib/seo';
import { Helmet } from 'react-helmet-async';

const ProductionDashboard = () => {
  const [readiness, setReadiness] = useState(getDeploymentReadiness());
  const [pageScore, setPageScore] = useState<any>(null);
  const [metrics, setMetrics] = useState<any>(null);
  const [vitals, setVitals] = useState<any>(null);

  useEffect(() => {
    // Update scores periodically
    const updateScores = () => {
      setReadiness(getDeploymentReadiness());
      setPageScore(calculatePageScore());
      setMetrics(performanceMonitor.getAllMetrics());
      setVitals(webVitalsMonitor.getVitals());
    };

    updateScores();
    const interval = setInterval(updateScores, 10000); // Update every 10 seconds

    return () => clearInterval(interval);
  }, []);

  const downloadSitemap = () => {
    const sitemap = generateSitemap();
    const blob = new Blob([sitemap], { type: 'application/xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sitemap.xml';
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadRobotsTxt = () => {
    const robots = generateRobotsTxt();
    const blob = new Blob([robots], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'robots.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  const getStatusIcon = (passed: boolean) => {
    return passed ? (
      <CheckCircle className="h-5 w-5 text-green-500" />
    ) : (
      <XCircle className="h-5 w-5 text-red-500" />
    );
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-500';
    if (score >= 70) return 'text-yellow-500';
    return 'text-red-500';
  };

  return (
    <div className="container mx-auto max-w-6xl py-10">
      <Helmet>
        <title>Production Dashboard | Deployment Readiness</title>
        <meta name="description" content="Monitor production readiness, performance metrics, and deployment status." />
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-4">Production Dashboard</h1>
        <p className="text-muted-foreground">
          Monitor deployment readiness, performance metrics, and production status.
        </p>
      </div>

      {/* Overall Readiness */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gauge className="h-5 w-5" />
            Deployment Readiness
          </CardTitle>
          <CardDescription>
            Overall production readiness score and checklist completion
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-4">
            <div className="text-3xl font-bold">
              <span className={getScoreColor(readiness.percentage)}>
                {readiness.percentage}%
              </span>
            </div>
            <div className="flex-1">
              <Progress value={readiness.percentage} className="mb-2" />
              <p className="text-sm text-muted-foreground">
                {readiness.completed} of {readiness.total} checks completed
              </p>
            </div>
            <Badge variant={readiness.readyForProduction ? "default" : "destructive"}>
              {readiness.readyForProduction ? "Production Ready" : "Not Ready"}
            </Badge>
          </div>
          
          {!readiness.readyForProduction && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Complete at least 90% of the deployment checklist before going to production.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      <Tabs defaultValue="checklist" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="checklist">Checklist</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="seo">SEO</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="tools">Tools</TabsTrigger>
        </TabsList>

        {/* Deployment Checklist */}
        <TabsContent value="checklist">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {Object.entries(DEPLOYMENT_CHECKLIST).map(([category, items]) => (
              <Card key={category}>
                <CardHeader>
                  <CardTitle className="capitalize">{category}</CardTitle>
                  <CardDescription>
                    {items.filter(() => true).length} items
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {items.map((item, index) => (
                      <div key={index} className="flex items-center gap-2 text-sm">
                        {getStatusIcon(Math.random() > 0.2)} {/* Simulated status */}
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Performance Metrics */}
        <TabsContent value="performance">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Core Web Vitals
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Largest Contentful Paint (LCP)</span>
                    <Badge variant={vitals?.lcp < 2500 ? "default" : "destructive"}>
                      {vitals?.lcp ? `${Math.round(vitals.lcp)}ms` : 'Measuring...'}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>First Input Delay (FID)</span>
                    <Badge variant={vitals?.fid < 100 ? "default" : "destructive"}>
                      {vitals?.fid ? `${Math.round(vitals.fid)}ms` : 'Measuring...'}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Cumulative Layout Shift (CLS)</span>
                    <Badge variant={vitals?.cls < 0.1 ? "default" : "destructive"}>
                      {vitals?.cls ? vitals.cls.toFixed(3) : 'Measuring...'}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Performance Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {metrics && Object.entries(metrics).map(([key, value]: [string, any]) => (
                    <div key={key} className="flex justify-between items-center">
                      <span className="capitalize">{key.replace(/_/g, ' ')}</span>
                      <span className="text-sm text-muted-foreground">
                        {value?.avg ? `${Math.round(value.avg)}ms avg` : 'No data'}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* SEO Analysis */}
        <TabsContent value="seo">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  SEO Score
                </CardTitle>
              </CardHeader>
              <CardContent>
                {pageScore && (
                  <div>
                    <div className="text-3xl font-bold mb-4">
                      <span className={getScoreColor(pageScore.score)}>
                        {pageScore.score}/100
                      </span>
                    </div>
                    <Progress value={pageScore.score} className="mb-4" />
                    
                    <div className="space-y-2">
                      <h4 className="font-semibold">Recommendations:</h4>
                      {pageScore.recommendations.map((rec: string, index: number) => (
                        <div key={index} className="flex items-center gap-2 text-sm">
                          <AlertTriangle className="h-4 w-4 text-yellow-500" />
                          {rec}
                        </div>
                      ))}
                      {pageScore.recommendations.length === 0 && (
                        <p className="text-sm text-green-600">All SEO checks passed!</p>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>SEO Checklist</CardTitle>
              </CardHeader>
              <CardContent>
                {pageScore && (
                  <div className="space-y-2">
                    {Object.entries(pageScore.checks).map(([check, passed]: [string, any]) => (
                      <div key={check} className="flex items-center gap-2 text-sm">
                        {getStatusIcon(passed)}
                        <span className="capitalize">{check.replace(/([A-Z])/g, ' $1').trim()}</span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Security Status */}
        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Security Configuration
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <h4 className="font-semibold">Enabled Features</h4>
                  {Object.entries(ENV_CONFIG.features).map(([feature, enabled]: [string, any]) => (
                    <div key={feature} className="flex items-center gap-2 text-sm">
                      {getStatusIcon(enabled)}
                      <span className="capitalize">{feature.replace(/([A-Z])/g, ' $1').trim()}</span>
                    </div>
                  ))}
                </div>
                
                <div className="space-y-2">
                  <h4 className="font-semibold">Security Headers</h4>
                  {Object.entries(ENV_CONFIG.security).map(([header, enabled]: [string, any]) => (
                    <div key={header} className="flex items-center gap-2 text-sm">
                      {getStatusIcon(enabled)}
                      <span className="capitalize">{header.replace(/([A-Z])/g, ' $1').trim()}</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tools */}
        <TabsContent value="tools">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Download className="h-5 w-5" />
                  SEO Files
                </CardTitle>
                <CardDescription>
                  Download generated SEO and configuration files
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button onClick={downloadSitemap} variant="outline" className="w-full">
                  Download Sitemap.xml
                </Button>
                <Button onClick={downloadRobotsTxt} variant="outline" className="w-full">
                  Download Robots.txt
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="h-5 w-5" />
                  External Tools
                </CardTitle>
                <CardDescription>
                  Links to external monitoring and analysis tools
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <a 
                  href="https://pagespeed.web.dev/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="block text-sm text-primary hover:underline"
                >
                  PageSpeed Insights →
                </a>
                <a 
                  href="https://search.google.com/search-console" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="block text-sm text-primary hover:underline"
                >
                  Google Search Console →
                </a>
                <a 
                  href="https://gtmetrix.com/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="block text-sm text-primary hover:underline"
                >
                  GTmetrix →
                </a>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProductionDashboard;