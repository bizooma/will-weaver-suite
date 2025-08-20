import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { AlertTriangle, CheckCircle, Shield, Zap, Globe, RefreshCw } from 'lucide-react';
import { useProductionReadiness } from '@/hooks/useProductionReadiness';

export function ProductionReadinessPanel() {
  const { report, loading, generateReport } = useProductionReadiness();

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'passed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'failed':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'passed':
        return <Badge variant="default" className="bg-green-500">Passed</Badge>;
      case 'warning':
        return <Badge variant="secondary">Warning</Badge>;
      case 'failed':
        return <Badge variant="destructive">Failed</Badge>;
      default:
        return null;
    }
  };

  const getOverallStatus = () => {
    if (!report) return null;
    
    switch (report.overall) {
      case 'ready':
        return (
          <div className="flex items-center gap-2 text-green-600">
            <CheckCircle className="h-5 w-5" />
            <span className="font-medium">Production Ready</span>
          </div>
        );
      case 'issues':
        return (
          <div className="flex items-center gap-2 text-yellow-600">
            <AlertTriangle className="h-5 w-5" />
            <span className="font-medium">Issues Found</span>
          </div>
        );
      case 'critical':
        return (
          <div className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="h-5 w-5" />
            <span className="font-medium">Critical Issues</span>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Production Readiness
            </CardTitle>
            <CardDescription>
              Comprehensive analysis of your application's readiness for production deployment
            </CardDescription>
          </div>
          <Button onClick={generateReport} disabled={loading} variant="outline">
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            {loading ? 'Analyzing...' : 'Run Check'}
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {report && (
          <>
            <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
              <div>
                <h3 className="font-medium text-lg">Overall Status</h3>
                <p className="text-sm text-muted-foreground">
                  Based on security, functionality, and widget deployment checks
                </p>
              </div>
              {getOverallStatus()}
            </div>

            <div className="space-y-4">
              <div>
                <h4 className="font-medium flex items-center gap-2 mb-3">
                  <Shield className="h-4 w-4" />
                  Security Checks
                </h4>
                <div className="space-y-2">
                  {report.securityChecks.map((check, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        {getStatusIcon(check.status)}
                        <div>
                          <p className="font-medium">{check.name}</p>
                          <p className="text-sm text-muted-foreground">{check.description}</p>
                          {check.recommendation && (
                            <p className="text-xs text-blue-600 mt-1">{check.recommendation}</p>
                          )}
                        </div>
                      </div>
                      {getStatusBadge(check.status)}
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              <div>
                <h4 className="font-medium flex items-center gap-2 mb-3">
                  <Zap className="h-4 w-4" />
                  Functionality Checks
                </h4>
                <div className="space-y-2">
                  {report.functionalityChecks.map((check, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        {getStatusIcon(check.status)}
                        <div>
                          <p className="font-medium">{check.name}</p>
                          <p className="text-sm text-muted-foreground">{check.description}</p>
                          {check.recommendation && (
                            <p className="text-xs text-blue-600 mt-1">{check.recommendation}</p>
                          )}
                        </div>
                      </div>
                      {getStatusBadge(check.status)}
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              <div>
                <h4 className="font-medium flex items-center gap-2 mb-3">
                  <Globe className="h-4 w-4" />
                  Widget Deployment
                </h4>
                <div className="space-y-2">
                  {report.widgetChecks.map((check, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        {getStatusIcon(check.status)}
                        <div>
                          <p className="font-medium">{check.name}</p>
                          <p className="text-sm text-muted-foreground">{check.description}</p>
                          {check.recommendation && (
                            <p className="text-xs text-blue-600 mt-1">{check.recommendation}</p>
                          )}
                        </div>
                      </div>
                      {getStatusBadge(check.status)}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {report.overall === 'ready' && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <h4 className="font-medium text-green-800 mb-2">🎉 Congratulations!</h4>
                <p className="text-sm text-green-700">
                  Your application is ready for production deployment. All critical checks have passed.
                </p>
              </div>
            )}

            {report.overall === 'critical' && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <h4 className="font-medium text-red-800 mb-2">⚠️ Critical Issues Found</h4>
                <p className="text-sm text-red-700">
                  Please address the failed checks before deploying to production. These issues could affect security or functionality.
                </p>
              </div>
            )}
          </>
        )}

        {!report && !loading && (
          <div className="text-center py-8">
            <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-medium mb-2">Ready to Check Production Readiness?</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Run a comprehensive analysis to ensure your application is ready for deployment.
            </p>
            <Button onClick={generateReport}>
              <Shield className="h-4 w-4 mr-2" />
              Start Analysis
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}