import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders, guardAuthed } from "../_shared/security.ts";

// Process base64 in chunks to prevent memory issues
function processBase64Chunks(base64String: string, chunkSize = 32768) {
  const chunks: Uint8Array[] = [];
  let position = 0;
  
  while (position < base64String.length) {
    const chunk = base64String.slice(position, position + chunkSize);
    const binaryChunk = atob(chunk);
    const bytes = new Uint8Array(binaryChunk.length);
    
    for (let i = 0; i < binaryChunk.length; i++) {
      bytes[i] = binaryChunk.charCodeAt(i);
    }
    
    chunks.push(bytes);
    position += chunkSize;
  }

  const totalLength = chunks.reduce((acc, chunk) => acc + chunk.length, 0);
  const result = new Uint8Array(totalLength);
  let offset = 0;

  for (const chunk of chunks) {
    result.set(chunk, offset);
    offset += chunk.length;
  }

  return result;
}

// Auth + rate + body-size gate — this is Whisper + GPT chained, so it's the
// most expensive of the voice endpoints. Cap at 20/min per user.
serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const guard = await guardAuthed(req, { maxBytes: 6_000_000, limit: 20, windowSeconds: 60 });
  if (guard instanceof Response) return guard;

  try {
    const { audio } = await req.json();
    
    if (!audio) {
      throw new Error('No audio data provided');
    }

    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    // Step 1: Transcribe audio using Whisper
    const binaryAudio = processBase64Chunks(audio);
    const formData = new FormData();
    const blob = new Blob([binaryAudio], { type: 'audio/webm' });
    formData.append('file', blob, 'audio.webm');
    formData.append('model', 'whisper-1');

    const transcriptionResponse = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
      },
      body: formData,
    });

    if (!transcriptionResponse.ok) {
      throw new Error(`Transcription failed: ${await transcriptionResponse.text()}`);
    }

    const transcriptionResult = await transcriptionResponse.json();
    const transcribedText = transcriptionResult.text;

    // Step 2: Extract structured data using GPT with function calling
    const extractionResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You are an AI assistant that extracts structured estate planning information from natural speech. 
            Extract as much relevant information as possible from the user's speech, but only include information that was explicitly mentioned.
            
            For relationships, use common terms like: "son", "daughter", "spouse", "brother", "sister", "mother", "father", "friend", etc.
            For marital status, use: "single", "married", "divorced", or "widowed".
            For dates, try to convert to YYYY-MM-DD format if possible.
            For addresses, include full address if mentioned.
            
            If information is unclear or not mentioned, leave those fields empty. 
            Assign confidence scores: 1.0 = very confident, 0.8 = confident, 0.6 = somewhat confident, 0.4 = uncertain.`
          },
          {
            role: 'user',
            content: transcribedText
          }
        ],
        functions: [
          {
            name: 'extract_estate_data',
            description: 'Extract structured estate planning data from natural speech',
            parameters: {
              type: 'object',
              properties: {
                personal: {
                  type: 'object',
                  properties: {
                    fullName: { type: 'string', description: 'Full legal name' },
                    dob: { type: 'string', description: 'Date of birth in YYYY-MM-DD format' },
                    address: { type: 'string', description: 'Full address' },
                    state: { type: 'string', description: 'State of residence' },
                    maritalStatus: { type: 'string', enum: ['single', 'married', 'divorced', 'widowed', ''] }
                  }
                },
                spouse: {
                  type: 'object',
                  properties: {
                    name: { type: 'string' },
                    dob: { type: 'string' },
                    address: { type: 'string' }
                  }
                },
                beneficiaries: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      name: { type: 'string' },
                      dob: { type: 'string' },
                      relationship: { type: 'string' }
                    }
                  }
                },
                executor: {
                  type: 'object',
                  properties: {
                    name: { type: 'string' },
                    dob: { type: 'string' },
                    address: { type: 'string' },
                    relationship: { type: 'string' }
                  }
                },
                altExecutor: {
                  type: 'object',
                  properties: {
                    name: { type: 'string' },
                    dob: { type: 'string' },
                    address: { type: 'string' },
                    relationship: { type: 'string' }
                  }
                },
                guardian: {
                  type: 'object',
                  properties: {
                    name: { type: 'string' },
                    dob: { type: 'string' },
                    address: { type: 'string' },
                    relationship: { type: 'string' }
                  }
                },
                altGuardian: {
                  type: 'object',
                  properties: {
                    name: { type: 'string' },
                    dob: { type: 'string' },
                    address: { type: 'string' },
                    relationship: { type: 'string' }
                  }
                },
                gifts: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      description: { type: 'string' },
                      beneficiary: { type: 'string' }
                    }
                  }
                },
                pets: {
                  type: 'object',
                  properties: {
                    petName: { type: 'string' },
                    petType: { type: 'string' },
                    petCaregiver: { type: 'string' },
                    petInstructions: { type: 'string' }
                  }
                },
                funeral: {
                  type: 'object',
                  properties: {
                    funeralPreference: { type: 'string', enum: ['burial', 'cremation', 'no_preference', ''] },
                    funeralInstructions: { type: 'string' }
                  }
                },
                confidence: {
                  type: 'object',
                  description: 'Confidence scores for each extracted field',
                  additionalProperties: { type: 'number', minimum: 0, maximum: 1 }
                }
              }
            }
          }
        ],
        function_call: { name: 'extract_estate_data' }
      }),
    });

    if (!extractionResponse.ok) {
      throw new Error(`Data extraction failed: ${await extractionResponse.text()}`);
    }

    const extractionResult = await extractionResponse.json();
    const functionCall = extractionResult.choices[0].message.function_call;
    
    if (!functionCall || functionCall.name !== 'extract_estate_data') {
      throw new Error('Failed to extract structured data');
    }

    const extractedData = JSON.parse(functionCall.arguments);

    return new Response(
      JSON.stringify({
        transcription: transcribedText,
        extractedData: extractedData,
        success: true
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error in voice-to-structured-data function:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        success: false 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});