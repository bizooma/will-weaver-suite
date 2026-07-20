import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Download, 
  Trash2, 
  Shield, 
  AlertTriangle,
  UserCheck,
  FileText,
  Clock,
  CheckCircle
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { gdprDataManager, cookieManager, checkLegalCompliance } from '@/lib/compliance';
import SEOHead from '@/components/SEOHead';
import { GDPRNotice } from '@/components/compliance/LegalNotices';

const DataPrivacy = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState<{ [key: string]: boolean }>({});
  const [compliance, setCompliance] = useState(checkLegalCompliance());

  const handleExportData = async () => {
    if (!user) return;
    
    setLoading(prev => ({ ...prev, export: true }));
    try {
      const exportData = await gdprDataManager.exportUserData(user.id);
      
      // Create and download JSON file
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { 
        type: 'application/json' 
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `data-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast({
        title: "Data exported successfully",
        description: "Your personal data has been downloaded to your device.",
      });
    } catch (error) {
      toast({
        title: "Export failed",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(prev => ({ ...prev, export: false }));
    }
  };

  const handleDeleteData = async () => {
    if (!user) return;
    
    const confirmed = window.confirm(
      'Are you sure you want to delete all your data? This action cannot be undone.'
    );
    
    if (!confirmed) return;
    
    setLoading(prev => ({ ...prev, delete: true }));
    try {
      await gdprDataManager.deleteUserData(user.id, 'User requested deletion');
      
      toast({
        title: "Data deletion initiated",
        description: "Your data will be permanently deleted within 30 days. You can contact support to cancel this request.",
      });
    } catch (error) {
      toast({
        title: "Deletion failed",
        description: error instanceof Error ? error.message : "Please contact support.",
        variant: "destructive",
      });
    } finally {
      setLoading(prev => ({ ...prev, delete: false }));
    }
  };

  const handleAnonymizeData = async () => {
    if (!user) return;
    
    const confirmed = window.confirm(
      'Are you sure you want to anonymize your data? This will remove all personally identifiable information.'
    );
    
    if (!confirmed) return;
    
    setLoading(prev => ({ ...prev, anonymize: true }));
    try {
      await gdprDataManager.anonymizeUserData(user.id);
      
      toast({
        title: "Data anonymized",
        description: "Your personal information has been anonymized while preserving aggregate data.",
      });
    } catch (error) {
      toast({
        title: "Anonymization failed",
        description: error instanceof Error ? error.message : "Please contact support.",
        variant: "destructive",
      });
    } finally {
      setLoading(prev => ({ ...prev, anonymize: false }));
    }
  };

  const handleResetCookieConsent = () => {
    localStorage.removeItem('gdpr_cookie_consent');
    toast({
      title: "Cookie consent reset",
      description: "Refresh the page to see the cookie consent banner again.",
    });
  };

  return (
    <div className="container mx-auto max-w-4xl py-10">
      {/* SEO meta tags for Data Privacy page */}
      <SEOHead
        title="Data Privacy Center | Amicus Edge"
        description="Manage your personal data, privacy settings, and GDPR rights on the Amicus Edge legal marketing platform."
        path="/data-privacy"
        keywords={['data privacy', 'GDPR', 'law firm data management']}
      />
      
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-4">Data Privacy Center</h1>
        <p className="text-muted-foreground">
          Manage your personal data and privacy preferences in accordance with GDPR and other privacy laws.
        </p>
      </div>

      <GDPRNotice />

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="rights">Your Rights</TabsTrigger>
          <TabsTrigger value="cookies">Cookie Settings</TabsTrigger>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
        </TabsList>

        {/* Overview */}
        <TabsContent value="overview">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserCheck className="h-5 w-5" />
                  Your Data
                </CardTitle>
                <CardDescription>
                  Information we collect and how we use it
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-sm">
                  <strong>Account Information:</strong> Email, display name
                </div>
                <div className="text-sm">
                  <strong>Document Data:</strong> Will drafts and legal documents you create
                </div>
                <div className="text-sm">
                  <strong>Usage Data:</strong> How you interact with our platform
                </div>
                <div className="text-sm">
                  <strong>Technical Data:</strong> IP address, browser type, device info
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Data Protection
                </CardTitle>
                <CardDescription>
                  How we protect your information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-sm">
                  <strong>Encryption:</strong> Data encrypted in transit and at rest
                </div>
                <div className="text-sm">
                  <strong>Access Controls:</strong> Role-based access with authentication
                </div>
                <div className="text-sm">
                  <strong>Monitoring:</strong> 24/7 security monitoring and alerts
                </div>
                <div className="text-sm">
                  <strong>Backups:</strong> Regular secure backups with encryption
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Your Rights */}
        <TabsContent value="rights">
          <div className="space-y-6">
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Under GDPR and other privacy laws, you have specific rights regarding your personal data. 
                Exercise these rights responsibly.
              </AlertDescription>
            </Alert>

            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Download className="h-5 w-5" />
                    Export Your Data
                  </CardTitle>
                  <CardDescription>
                    Download a copy of all your personal data
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    Get a machine-readable copy of all personal data we have about you, 
                    including your profile, documents, and activity history.
                  </p>
                  <Button 
                    onClick={handleExportData}
                    disabled={!user || loading.export}
                    className="w-full"
                  >
                    {loading.export ? 'Exporting...' : 'Export My Data'}
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Trash2 className="h-5 w-5" />
                    Delete Your Data
                  </CardTitle>
                  <CardDescription>
                    Permanently delete all your personal data
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    Request permanent deletion of your account and all associated data. 
                    This action cannot be undone.
                  </p>
                  <Button 
                    onClick={handleDeleteData}
                    disabled={!user || loading.delete}
                    variant="destructive"
                    className="w-full"
                  >
                    {loading.delete ? 'Processing...' : 'Delete My Data'}
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Anonymize Data
                  </CardTitle>
                  <CardDescription>
                    Remove personal identifiers while keeping aggregate data
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    Replace your personal information with anonymous identifiers. 
                    This preserves statistical data while protecting your privacy.
                  </p>
                  <Button 
                    onClick={handleAnonymizeData}
                    disabled={!user || loading.anonymize}
                    variant="outline"
                    className="w-full"
                  >
                    {loading.anonymize ? 'Processing...' : 'Anonymize My Data'}
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Data Retention
                  </CardTitle>
                  <CardDescription>
                    How long we keep your data
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div><strong>User Profiles:</strong> 3 years after last activity</div>
                    <div><strong>Document Drafts:</strong> 7 years (legal requirement)</div>
                    <div><strong>Activity Logs:</strong> 2 years</div>
                    <div><strong>Deleted Data:</strong> 30 days grace period</div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Cookie Settings */}
        <TabsContent value="cookies">
          <Card>
            <CardHeader>
              <CardTitle>Cookie Preferences</CardTitle>
              <CardDescription>
                Manage your cookie and tracking preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 border rounded">
                  <div>
                    <div className="font-medium">Current Consent Status</div>
                    <div className="text-sm text-muted-foreground">
                      {cookieManager.hasValidConsent() 
                        ? 'You have provided cookie consent' 
                        : 'No cookie consent on file'
                      }
                    </div>
                  </div>
                  <CheckCircle className={`h-5 w-5 ${cookieManager.hasValidConsent() ? 'text-green-500' : 'text-gray-400'}`} />
                </div>

                <Button 
                  onClick={handleResetCookieConsent}
                  variant="outline"
                  className="w-full"
                >
                  Reset Cookie Preferences
                </Button>

                <div className="text-sm text-muted-foreground">
                  <p>
                    Resetting your cookie preferences will show the cookie consent banner again, 
                    allowing you to make new choices about tracking and analytics.
                  </p>
                  <p className="mt-2">
                    Learn more in our <a href="/cookies" className="text-primary hover:underline">Cookie Policy</a>.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Compliance */}
        <TabsContent value="compliance">
          <Card>
            <CardHeader>
              <CardTitle>Privacy Compliance Status</CardTitle>
              <CardDescription>
                Platform compliance with privacy regulations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="font-medium">Overall Compliance Score</span>
                  <span className={`font-bold ${compliance.score >= 90 ? 'text-green-600' : 'text-yellow-600'}`}>
                    {compliance.score}%
                  </span>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium">Compliance Checks:</h4>
                  {Object.entries(compliance.checks).map(([check, passed]) => (
                    <div key={check} className="flex items-center gap-2 text-sm">
                      {passed ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <AlertTriangle className="h-4 w-4 text-red-500" />
                      )}
                      <span className="capitalize">
                        {check.replace(/([A-Z])/g, ' $1').trim()}
                      </span>
                    </div>
                  ))}
                </div>

                {compliance.recommendations.length > 0 && (
                  <div className="mt-4">
                    <h4 className="font-medium mb-2">Recommendations:</h4>
                    <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
                      {compliance.recommendations.map((rec, index) => (
                        <li key={index}>{rec}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DataPrivacy;