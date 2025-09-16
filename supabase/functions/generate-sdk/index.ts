import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { type, apiKey, baseUrl } = await req.json();
    
    if (!type || !apiKey || !baseUrl) {
      throw new Error("Missing required parameters: type, apiKey, and baseUrl");
    }

    let content: string;
    let filename: string;

    switch (type) {
      case "javascript":
        content = generateJavaScriptSDK(apiKey, baseUrl);
        filename = "legal-ai-javascript-sdk.zip";
        break;
      case "python":
        content = generatePythonSDK(apiKey, baseUrl);
        filename = "legal-ai-python-sdk.zip";
        break;
      default:
        throw new Error("Invalid SDK type. Supported types: javascript, python");
    }

    // For simplicity, return the main SDK file content
    // In a real implementation, you'd create a proper zip file
    return new Response(JSON.stringify({ content, filename }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("SDK generation error:", error);
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

function generateJavaScriptSDK(apiKey: string, baseUrl: string): string {
  return `// Legal AI Assistant JavaScript SDK
// Version: 1.0.0

class LegalAISDK {
  constructor(apiKey = '${apiKey}', baseUrl = '${baseUrl}') {
    this.apiKey = apiKey;
    this.baseUrl = baseUrl;
  }

  async makeRequest(endpoint, data) {
    const response = await fetch(\`\${this.baseUrl}\${endpoint}\`, {
      method: 'POST',
      headers: {
        'Authorization': \`Bearer \${this.apiKey}\`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error || \`HTTP \${response.status}\`);
    }

    return response.json();
  }

  // Chat with legal AI assistant
  async chat(message, chatbotId, sessionId = null) {
    return this.makeRequest('/chatbot-response', {
      message,
      chatbot_id: chatbotId,
      session_id: sessionId
    });
  }

  // Get AI copilot assistance
  async getCopilotSuggestion(messages, data = {}, tone = 'professional') {
    return this.makeRequest('/ai-copilot', {
      messages,
      data,
      tone
    });
  }

  // Generate legal clauses
  async generateClause(field, data, tone = 'formal') {
    return this.makeRequest('/ai-generate-clause', {
      field,
      data,
      tone
    });
  }

  // Review will documents
  async reviewWill(draft, state) {
    return this.makeRequest('/ai-review-will', {
      draft,
      state
    });
  }

  // Convert voice to text
  async voiceToText(audioBase64) {
    return this.makeRequest('/voice-to-text', {
      audio: audioBase64
    });
  }

  // Convert text to voice
  async textToVoice(text, voice = 'alloy') {
    return this.makeRequest('/text-to-voice', {
      text,
      voice
    });
  }

  // Extract structured data from voice
  async voiceToStructuredData(audioBase64) {
    return this.makeRequest('/voice-to-structured-data', {
      audio: audioBase64
    });
  }
}

// Export for different module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = LegalAISDK;
}

if (typeof window !== 'undefined') {
  window.LegalAISDK = LegalAISDK;
}

// Usage Example:
/*
const sdk = new LegalAISDK('${apiKey}');

// Chat example
const chatResponse = await sdk.chat(
  "What should I include in my will?", 
  "your-chatbot-id"
);

// Generate clause example
const clause = await sdk.generateClause(
  "executor",
  { name: "John Doe", relationship: "spouse" }
);

// Voice to text example
const transcription = await sdk.voiceToText(base64AudioData);
*/`;
}

function generatePythonSDK(apiKey: string, baseUrl: string): string {
  return `"""
Legal AI Assistant Python SDK
Version: 1.0.0
"""

import requests
import json
from typing import Dict, List, Optional, Any

class LegalAISDK:
    def __init__(self, api_key: str = '${apiKey}', base_url: str = '${baseUrl}'):
        self.api_key = api_key
        self.base_url = base_url
        self.session = requests.Session()
        self.session.headers.update({
            'Authorization': f'Bearer {self.api_key}',
            'Content-Type': 'application/json'
        })

    def _make_request(self, endpoint: str, data: Dict[str, Any]) -> Dict[str, Any]:
        """Make HTTP request to API endpoint"""
        url = f"{self.base_url}{endpoint}"
        
        try:
            response = self.session.post(url, json=data)
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            raise Exception(f"API request failed: {e}")

    def chat(self, message: str, chatbot_id: str, session_id: Optional[str] = None) -> Dict[str, Any]:
        """Chat with legal AI assistant"""
        return self._make_request('/chatbot-response', {
            'message': message,
            'chatbot_id': chatbot_id,
            'session_id': session_id
        })

    def get_copilot_suggestion(self, messages: List[Dict], data: Dict = None, tone: str = 'professional') -> Dict[str, Any]:
        """Get AI copilot assistance"""
        return self._make_request('/ai-copilot', {
            'messages': messages,
            'data': data or {},
            'tone': tone
        })

    def generate_clause(self, field: str, data: Dict, tone: str = 'formal') -> Dict[str, Any]:
        """Generate legal clauses"""
        return self._make_request('/ai-generate-clause', {
            'field': field,
            'data': data,
            'tone': tone
        })

    def review_will(self, draft: str, state: str) -> Dict[str, Any]:
        """Review will documents"""
        return self._make_request('/ai-review-will', {
            'draft': draft,
            'state': state
        })

    def voice_to_text(self, audio_base64: str) -> Dict[str, Any]:
        """Convert voice to text"""
        return self._make_request('/voice-to-text', {
            'audio': audio_base64
        })

    def text_to_voice(self, text: str, voice: str = 'alloy') -> Dict[str, Any]:
        """Convert text to voice"""
        return self._make_request('/text-to-voice', {
            'text': text,
            'voice': voice
        })

    def voice_to_structured_data(self, audio_base64: str) -> Dict[str, Any]:
        """Extract structured data from voice"""
        return self._make_request('/voice-to-structured-data', {
            'audio': audio_base64
        })

# Usage Example:
if __name__ == "__main__":
    sdk = LegalAISDK('${apiKey}')
    
    # Chat example
    chat_response = sdk.chat(
        "What should I include in my will?", 
        "your-chatbot-id"
    )
    print("Chat response:", chat_response)
    
    # Generate clause example
    clause = sdk.generate_clause(
        "executor",
        {"name": "John Doe", "relationship": "spouse"}
    )
    print("Generated clause:", clause)
`;
}