import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, ExternalLink, Code2, FileText, Package } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useDemoEdgeFunctions } from "@/hooks/useDemoEdgeFunctions";

interface SdkDownloaderProps {
  apiKey?: string;
}

export function SdkDownloader({ apiKey }: SdkDownloaderProps) {
  const { toast } = useToast();
  const { invoke } = useDemoEdgeFunctions();
  const [downloading, setDownloading] = useState<string | null>(null);

  const downloadSdk = async (type: string) => {
    if (!apiKey) {
      toast({
        title: "API Key Required",
        description: "Please generate an API key first to download SDKs",
        variant: "destructive",
      });
      return;
    }

    setDownloading(type);
    
    try {
      const { data, error } = await invoke('generate-sdk', {
        body: { 
          type,
          apiKey,
          baseUrl: "https://fmcgsxdtyvssvwtxufll.supabase.co/functions/v1"
        }
      });

      if (error) throw error;

      // Create and download the file
      const blob = new Blob([data.content], { type: 'application/zip' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = data.filename;
      document.body.appendChild(link);
      link.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(link);

      toast({
        title: "SDK Downloaded",
        description: `${data.filename} has been downloaded successfully`,
      });
    } catch (error) {
      console.error('SDK download error:', error);
      toast({
        title: "Download Failed",
        description: "There was an error downloading the SDK. Please try again.",
        variant: "destructive",
      });
    } finally {
      setDownloading(null);
    }
  };

  const downloadPostmanCollection = async () => {
    const collection = {
      info: {
        name: "Legal AI Assistant API",
        description: "Complete API collection for Legal AI Assistant",
        schema: "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
      },
      auth: {
        type: "bearer",
        bearer: [
          {
            key: "token",
            value: apiKey || "{{api_key}}",
            type: "string"
          }
        ]
      },
      variable: [
        {
          key: "base_url",
          value: "https://fmcgsxdtyvssvwtxufll.supabase.co/functions/v1",
          type: "string"
        }
      ],
      item: [
        {
          name: "Chat Response",
          request: {
            method: "POST",
            header: [
              {
                key: "Content-Type",
                value: "application/json"
              }
            ],
            body: {
              mode: "raw",
              raw: JSON.stringify({
                message: "What should I include in my will?",
                chatbot_id: "your-chatbot-id",
                session_id: "optional-session-id"
              }, null, 2)
            },
            url: {
              raw: "{{base_url}}/chatbot-response",
              host: ["{{base_url}}"],
              path: ["chatbot-response"]
            }
          }
        },
        {
          name: "AI Copilot",
          request: {
            method: "POST",
            header: [
              {
                key: "Content-Type", 
                value: "application/json"
              }
            ],
            body: {
              mode: "raw",
              raw: JSON.stringify({
                messages: [{"role": "user", "content": "Help me with estate planning"}],
                data: {},
                tone: "professional"
              }, null, 2)
            },
            url: {
              raw: "{{base_url}}/ai-copilot",
              host: ["{{base_url}}"],
              path: ["ai-copilot"]
            }
          }
        },
        {
          name: "Generate Clause",
          request: {
            method: "POST",
            header: [
              {
                key: "Content-Type",
                value: "application/json"
              }
            ],
            body: {
              mode: "raw",
              raw: JSON.stringify({
                field: "executor",
                data: { name: "John Doe", relationship: "spouse" },
                tone: "formal"
              }, null, 2)
            },
            url: {
              raw: "{{base_url}}/ai-generate-clause", 
              host: ["{{base_url}}"],
              path: ["ai-generate-clause"]
            }
          }
        },
        {
          name: "Review Will",
          request: {
            method: "POST",
            header: [
              {
                key: "Content-Type",
                value: "application/json"
              }
            ],
            body: {
              mode: "raw",
              raw: JSON.stringify({
                draft: "Last Will and Testament content...",
                state: "California"
              }, null, 2)
            },
            url: {
              raw: "{{base_url}}/ai-review-will",
              host: ["{{base_url}}"],
              path: ["ai-review-will"]
            }
          }
        },
        {
          name: "Voice to Text",
          request: {
            method: "POST",
            header: [
              {
                key: "Content-Type",
                value: "application/json"
              }
            ],
            body: {
              mode: "raw",
              raw: JSON.stringify({
                audio: "base64-encoded-audio-data"
              }, null, 2)
            },
            url: {
              raw: "{{base_url}}/voice-to-text",
              host: ["{{base_url}}"],
              path: ["voice-to-text"]
            }
          }
        },
        {
          name: "Text to Voice",
          request: {
            method: "POST",
            header: [
              {
                key: "Content-Type",
                value: "application/json"
              }
            ],
            body: {
              mode: "raw",
              raw: JSON.stringify({
                text: "Hello, this is a test message",
                voice: "alloy"
              }, null, 2)
            },
            url: {
              raw: "{{base_url}}/text-to-voice",
              host: ["{{base_url}}"],
              path: ["text-to-voice"]
            }
          }
        }
      ]
    };

    const blob = new Blob([JSON.stringify(collection, null, 2)], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'legal-ai-assistant-postman-collection.json';
    document.body.appendChild(link);
    link.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(link);

    toast({
      title: "Collection Downloaded",
      description: "Postman collection downloaded successfully",
    });
  };

  const sdkOptions = [
    {
      id: "javascript",
      name: "JavaScript/TypeScript SDK",
      description: "NPM package with TypeScript definitions",
      icon: Code2,
      features: ["TypeScript support", "Promise-based API", "Built-in error handling", "Auto-retry logic"],
      filename: "legal-ai-javascript-sdk.zip"
    },
    {
      id: "python",
      name: "Python SDK",
      description: "pip installable Python package",
      icon: Package,
      features: ["Type hints", "Async/await support", "Pydantic models", "Comprehensive docs"],
      filename: "legal-ai-python-sdk.zip"
    },
    {
      id: "postman",
      name: "API Collection",
      description: "Postman/Insomnia collection for testing",
      icon: FileText,
      features: ["Pre-configured requests", "Environment variables", "Example payloads", "Response examples"],
      filename: "legal-ai-api-collection.json",
      isCollection: true
    }
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Download SDKs</CardTitle>
          <CardDescription>
            Get started quickly with our pre-built SDKs and API collections
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sdkOptions.map((sdk) => {
              const Icon = sdk.icon;
              return (
                <Card key={sdk.id} className="relative">
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-2 mb-2">
                      <Icon className="h-5 w-5 text-primary" />
                      <CardTitle className="text-base">{sdk.name}</CardTitle>
                    </div>
                    <CardDescription className="text-sm">
                      {sdk.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-3">
                      <div className="space-y-1">
                        {sdk.features.map((feature, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                            <span className="text-xs text-muted-foreground">{feature}</span>
                          </div>
                        ))}
                      </div>
                      
                      <Button
                        onClick={() => sdk.isCollection ? downloadPostmanCollection() : downloadSdk(sdk.id)}
                        disabled={downloading === sdk.id || (!apiKey && !sdk.isCollection)}
                        className="w-full"
                        size="sm"
                      >
                        {downloading === sdk.id ? (
                          "Downloading..."
                        ) : (
                          <>
                            <Download className="h-4 w-4 mr-2" />
                            Download
                          </>
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {!apiKey && (
            <div className="mt-4 p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">
                <strong>Note:</strong> Generate an API key above to download SDKs with your personalized examples and authentication.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Getting Started</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-sm font-medium mx-auto mb-2">
                  1
                </div>
                <h4 className="font-medium mb-1">Generate API Key</h4>
                <p className="text-xs text-muted-foreground">Create your API key above to authenticate requests</p>
              </div>
              
              <div className="text-center">
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-sm font-medium mx-auto mb-2">
                  2
                </div>
                <h4 className="font-medium mb-1">Download SDK</h4>
                <p className="text-xs text-muted-foreground">Choose your preferred language or API collection</p>
              </div>
              
              <div className="text-center">
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-sm font-medium mx-auto mb-2">
                  3
                </div>
                <h4 className="font-medium mb-1">Start Building</h4>
                <p className="text-xs text-muted-foreground">Follow the documentation and examples to integrate</p>
              </div>
            </div>
            
            <div className="flex gap-2 justify-center pt-4">
              <Button variant="outline" size="sm">
                <ExternalLink className="h-4 w-4 mr-2" />
                View Guides
              </Button>
              <Button variant="outline" size="sm">
                <ExternalLink className="h-4 w-4 mr-2" />
                API Reference
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}