import { useDemoMode } from '@/contexts/DemoModeContext';
import { supabase } from '@/integrations/supabase/client';

/**
 * Demo-aware edge function wrapper
 * Intercepts all edge function calls in demo mode to prevent
 * real external API calls and provide mock responses
 */
export function useDemoEdgeFunctions() {
  const { isDemoMode, showDemoToast } = useDemoMode();

  /**
   * Wrapper for supabase.functions.invoke that handles demo mode
   * In demo mode: shows toast and returns mock success response
   * In normal mode: passes through to real edge function
   */
  const invoke = async (functionName: string, options?: any) => {
    if (!isDemoMode) {
      return supabase.functions.invoke(functionName, options);
    }

    // In demo mode: show toast and return mock response
    showDemoToast(`Demo mode - ${functionName} call simulated`);

    // Return appropriate mock data based on function name
    const mockResponses: Record<string, any> = {
      'chatbot-response': {
        data: {
          response: 'This is a demo response from the AI chatbot. In live mode, you would get personalized answers based on your training data.',
          operatorActive: false
        },
        error: null
      },
      'ai-copilot': {
        data: {
          reply: 'This is a demo reply from the AI co-pilot. In live mode, this would be a personalized response based on your will data.'
        },
        error: null
      },
      'text-to-voice': {
        data: {
          audioContent: '' // Empty audio in demo mode
        },
        error: null
      },
      'voice-to-text': {
        data: {
          text: 'This is simulated voice transcription'
        },
        error: null
      },
      'eleven-signed-url': {
        data: {
          signed_url: 'demo-signed-url'
        },
        error: null
      },
      'system-notifications': {
        data: {
          notifications: [
            {
              id: 'demo-notif-1',
              title: 'Demo Notification',
              message: 'This is a demo system notification',
              created_at: new Date().toISOString(),
              user_notifications: [{ read_at: null }]
            }
          ]
        },
        error: null
      },
      'qr-generate': {
        data: {
          qrCodeUrl: 'https://via.placeholder.com/300?text=Demo+QR+Code',
          qrId: 'demo-qr-id'
        },
        error: null
      },
      'analyze-seo': {
        data: {
          seoScore: 85,
          voiceSeoScore: 78,
          aiOverviewScore: 90,
          analysis: 'Demo SEO analysis results'
        },
        error: null
      },
      'voice-search-orchestrator': {
        data: {
          results: 'Demo voice search results'
        },
        error: null
      },
      'process-training-url': {
        data: { success: true },
        error: null
      },
      'process-training-document': {
        data: { success: true },
        error: null
      },
      'submit-contact-form': {
        data: { success: true },
        error: null
      }
    };

    // Return mock response or default success
    return mockResponses[functionName] || {
      data: { success: true },
      error: null
    };
  };

  return { invoke };
}
