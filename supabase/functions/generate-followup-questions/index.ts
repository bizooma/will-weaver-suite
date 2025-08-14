import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SmartFollowUp {
  question: string;
  context: string;
  expectedFields: string[];
  priority: 'high' | 'medium' | 'low';
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { extractedData, validationIssues, sessionContext } = await req.json();
    
    const followUpQuestions: SmartFollowUp[] = [];
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    // Generate context-aware follow-up questions based on extracted data and validation issues
    const systemPrompt = `You are an estate planning assistant helping users complete their will information. 
Based on the extracted data and validation issues, generate relevant follow-up questions to gather missing or clarify unclear information.

Guidelines:
- Ask specific, clear questions
- Prioritize critical missing information  
- Be empathetic and professional
- Avoid legal advice, focus on information gathering
- Limit to 3-5 most important questions
- Format as JSON array with question, context, expectedFields, and priority`;

    const userPrompt = `
Extracted Data: ${JSON.stringify(extractedData, null, 2)}
Validation Issues: ${JSON.stringify(validationIssues, null, 2)}
Session Context: ${JSON.stringify(sessionContext, null, 2)}

Generate follow-up questions to complete the will information.`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4.1-2025-04-14',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        max_completion_tokens: 1000,
        functions: [
          {
            name: 'generate_followup_questions',
            description: 'Generate context-aware follow-up questions for estate planning',
            parameters: {
              type: 'object',
              properties: {
                questions: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      question: { type: 'string', description: 'The follow-up question to ask' },
                      context: { type: 'string', description: 'Why this question is being asked' },
                      expectedFields: { 
                        type: 'array', 
                        items: { type: 'string' },
                        description: 'Form fields this question aims to fill'
                      },
                      priority: { 
                        type: 'string', 
                        enum: ['high', 'medium', 'low'],
                        description: 'Priority level of this question'
                      }
                    },
                    required: ['question', 'context', 'expectedFields', 'priority']
                  }
                }
              },
              required: ['questions']
            }
          }
        ],
        function_call: { name: 'generate_followup_questions' }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error:', response.status, errorText);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const functionCall = data.choices[0]?.message?.function_call;
    
    if (functionCall?.name === 'generate_followup_questions') {
      const parsedArgs = JSON.parse(functionCall.arguments);
      followUpQuestions.push(...parsedArgs.questions);
    }

    // Add some rule-based questions for critical missing info
    const criticalMissing = validationIssues.filter(issue => 
      issue.type === 'missing_critical' && issue.severity === 'high'
    );

    criticalMissing.forEach(issue => {
      if (issue.field === 'personal.fullName') {
        followUpQuestions.unshift({
          question: "What is your full legal name as it appears on official documents?",
          context: "Your legal name is required for a valid will",
          expectedFields: ['personal.fullName'],
          priority: 'high'
        });
      } else if (issue.field === 'personal.state') {
        followUpQuestions.unshift({
          question: "Which state do you currently reside in? This determines which laws apply to your will.",
          context: "State of residence determines legal requirements",
          expectedFields: ['personal.state'],
          priority: 'high'
        });
      } else if (issue.field === 'executor.name') {
        followUpQuestions.unshift({
          question: "Who would you like to name as the executor of your will? This person will carry out your wishes.",
          context: "An executor is required to manage your estate",
          expectedFields: ['executor.name', 'executor.relationship'],
          priority: 'high'
        });
      }
    });

    // Remove duplicate questions and limit to top 5
    const uniqueQuestions = followUpQuestions.filter((q, index, self) => 
      self.findIndex(other => other.question === q.question) === index
    ).slice(0, 5);

    console.log(`Generated ${uniqueQuestions.length} follow-up questions`);

    return new Response(
      JSON.stringify({ followUpQuestions: uniqueQuestions }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Follow-up generation error:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        followUpQuestions: [] 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});