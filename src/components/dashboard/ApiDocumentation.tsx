import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Copy, ExternalLink } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ApiDocumentationProps {
  apiKey?: string;
}

export function ApiDocumentation({ apiKey }: ApiDocumentationProps) {
  const { toast } = useToast();
  const [selectedEndpoint, setSelectedEndpoint] = useState<string>("chat");

  const baseUrl = "https://fmcgsxdtyvssvwtxufll.supabase.co/functions/v1";

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied to clipboard",
      description: "Code example copied successfully",
    });
  };

  const endpoints = [
    {
      id: "chat",
      name: "Chat Response",
      method: "POST",
      path: "/chatbot-response",
      description: "Get AI-powered responses for legal questions",
      requestBody: {
        message: "string",
        chatbot_id: "uuid",
        session_id: "string (optional)"
      },
      responseExample: {
        response: "AI-generated legal guidance...",
        session_id: "unique-session-id"
      }
    },
    {
      id: "copilot",
      name: "AI Copilot",
      method: "POST", 
      path: "/ai-copilot",
      description: "Get AI assistance for estate planning",
      requestBody: {
        messages: "array",
        data: "object",
        tone: "string (professional|friendly|formal)"
      },
      responseExample: {
        reply: "AI copilot suggestion..."
      }
    },
    {
      id: "clause",
      name: "Generate Clause",
      method: "POST",
      path: "/ai-generate-clause", 
      description: "Generate legal clauses",
      requestBody: {
        field: "string",
        data: "object",
        tone: "string"
      },
      responseExample: {
        clause: "Generated legal clause content..."
      }
    },
    {
      id: "review",
      name: "Review Will",
      method: "POST",
      path: "/ai-review-will",
      description: "AI-powered will review and analysis",
      requestBody: {
        draft: "string",
        state: "string"
      },
      responseExample: {
        analysis: {
          summary: "Document analysis...",
          issues: [],
          suggestions: []
        }
      }
    },
    {
      id: "voice-to-text",
      name: "Voice to Text",
      method: "POST",
      path: "/voice-to-text",
      description: "Convert audio to text transcription",
      requestBody: {
        audio: "base64 encoded audio data"
      },
      responseExample: {
        text: "Transcribed text content..."
      }
    },
    {
      id: "text-to-voice",
      name: "Text to Voice", 
      method: "POST",
      path: "/text-to-voice",
      description: "Convert text to speech audio",
      requestBody: {
        text: "string",
        voice: "string (optional: alloy, echo, fable, onyx, nova, shimmer)"
      },
      responseExample: {
        audioContent: "base64 encoded audio data"
      }
    }
  ];

  const generateJavaScriptExample = (endpoint: any) => {
    return `// JavaScript/TypeScript Example
const response = await fetch('${baseUrl}${endpoint.path}', {
  method: '${endpoint.method}',
  headers: {
    'Authorization': 'Bearer ${apiKey || 'your-api-key-here'}',
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(${JSON.stringify(endpoint.requestBody, null, 2)})
});

const data = await response.json();
console.log(data);`;
  };

  const generatePythonExample = (endpoint: any) => {
    return `# Python Example
import requests
import json

url = "${baseUrl}${endpoint.path}"
headers = {
    "Authorization": "Bearer ${apiKey || 'your-api-key-here'}",
    "Content-Type": "application/json"
}

data = ${JSON.stringify(endpoint.requestBody, null, 2)}

response = requests.post(url, headers=headers, json=data)
result = response.json()
print(result)`;
  };

  const generateCurlExample = (endpoint: any) => {
    return `# cURL Example
curl -X ${endpoint.method} "${baseUrl}${endpoint.path}" \\
  -H "Authorization: Bearer ${apiKey || 'your-api-key-here'}" \\
  -H "Content-Type: application/json" \\
  -d '${JSON.stringify(endpoint.requestBody)}'`;
  };

  const selectedEndpointData = endpoints.find(e => e.id === selectedEndpoint);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>API Documentation</CardTitle>
          <CardDescription>
            Complete reference for integrating with the Legal AI Assistant API
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium mb-2">Base URL</h4>
              <code className="bg-muted px-2 py-1 rounded text-sm">{baseUrl}</code>
            </div>
            
            <div>
              <h4 className="text-sm font-medium mb-2">Authentication</h4>
              <p className="text-sm text-muted-foreground mb-2">
                Include your API key in the Authorization header:
              </p>
              <code className="bg-muted px-2 py-1 rounded text-sm">
                Authorization: Bearer {apiKey || 'your-api-key-here'}
              </code>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>API Endpoints</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="space-y-2">
              {endpoints.map((endpoint) => (
                <div
                  key={endpoint.id}
                  className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                    selectedEndpoint === endpoint.id
                      ? "border-primary bg-primary/5"
                      : "border-border hover:bg-muted/50"
                  }`}
                  onClick={() => setSelectedEndpoint(endpoint.id)}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant={endpoint.method === "POST" ? "default" : "secondary"}>
                      {endpoint.method}
                    </Badge>
                    <span className="font-medium text-sm">{endpoint.name}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">{endpoint.description}</p>
                </div>
              ))}
            </div>

            <div className="lg:col-span-2">
              {selectedEndpointData && (
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">{selectedEndpointData.name}</h4>
                    <p className="text-sm text-muted-foreground mb-4">
                      {selectedEndpointData.description}
                    </p>
                    
                    <div className="flex items-center gap-2 mb-4">
                      <Badge variant="outline">{selectedEndpointData.method}</Badge>
                      <code className="text-sm">{selectedEndpointData.path}</code>
                    </div>
                  </div>

                  <Tabs defaultValue="javascript" className="w-full">
                    <TabsList>
                      <TabsTrigger value="javascript">JavaScript</TabsTrigger>
                      <TabsTrigger value="python">Python</TabsTrigger>
                      <TabsTrigger value="curl">cURL</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="javascript" className="space-y-2">
                      <div className="relative">
                        <pre className="bg-muted p-4 rounded-lg text-sm overflow-x-auto">
                          <code>{generateJavaScriptExample(selectedEndpointData)}</code>
                        </pre>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="absolute top-2 right-2"
                          onClick={() => copyToClipboard(generateJavaScriptExample(selectedEndpointData))}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="python" className="space-y-2">
                      <div className="relative">
                        <pre className="bg-muted p-4 rounded-lg text-sm overflow-x-auto">
                          <code>{generatePythonExample(selectedEndpointData)}</code>
                        </pre>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="absolute top-2 right-2"
                          onClick={() => copyToClipboard(generatePythonExample(selectedEndpointData))}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="curl" className="space-y-2">
                      <div className="relative">
                        <pre className="bg-muted p-4 rounded-lg text-sm overflow-x-auto">
                          <code>{generateCurlExample(selectedEndpointData)}</code>
                        </pre>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="absolute top-2 right-2"
                          onClick={() => copyToClipboard(generateCurlExample(selectedEndpointData))}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </TabsContent>
                  </Tabs>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                    <div>
                      <h5 className="font-medium mb-2">Request Body</h5>
                      <pre className="bg-muted p-3 rounded text-xs overflow-x-auto">
                        <code>{JSON.stringify(selectedEndpointData.requestBody, null, 2)}</code>
                      </pre>
                    </div>
                    
                    <div>
                      <h5 className="font-medium mb-2">Response Example</h5>
                      <pre className="bg-muted p-3 rounded text-xs overflow-x-auto">
                        <code>{JSON.stringify(selectedEndpointData.responseExample, null, 2)}</code>
                      </pre>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}