/**
 * Mock Dashboard Data
 * Pre-populated demo data for the interactive dashboard tour.
 * Represents a fictional law firm "Smith & Associates" exploring the platform.
 */

export const DEMO_USER = {
  id: 'demo-user-id',
  email: 'demo@smithlawfirm.com',
  user_metadata: {
    display_name: 'Demo User',
  },
};

export const DEMO_CHATBOTS = [
  {
    id: 'chatbot-1',
    user_id: DEMO_USER.id,
    name: 'Personal Injury Intake Bot',
    description: 'Automated client intake for personal injury cases',
    avatar_url: '/lovable-uploads/22c96565-b032-41c7-85c0-d846886cac6c.png',
    is_active: true,
    created_at: '2025-01-15T10:00:00Z',
    updated_at: '2025-01-15T10:00:00Z',
    configuration: {
      primaryColor: '#3b82f6',
      greeting: 'Hello! I can help you with your personal injury case.',
    },
    script_data: {},
    calendly_url: 'https://calendly.com/demo/consultation',
  },
  {
    id: 'chatbot-2',
    user_id: DEMO_USER.id,
    name: 'Estate Planning Assistant',
    description: 'Guides clients through estate planning basics',
    avatar_url: '/lovable-uploads/4ffe9938-1a7b-48ff-bede-e8a8b46f4d7a.png',
    is_active: true,
    created_at: '2025-01-10T14:30:00Z',
    updated_at: '2025-01-10T14:30:00Z',
    configuration: {
      primaryColor: '#10b981',
      greeting: 'Welcome! Let me help you understand estate planning options.',
    },
    script_data: {},
  },
];

export const DEMO_CONVERSATIONS = [
  {
    id: 'conv-1',
    chatbot_id: 'chatbot-1',
    session_id: 'session-1',
    message_count: 8,
    operator_status: 'ai',
    created_at: '2025-01-20T09:15:00Z',
    conversation_data: {
      messages: [
        { role: 'assistant', content: 'Hello! I can help you with your personal injury case.' },
        { role: 'user', content: 'I was injured in a car accident last week.' },
        { role: 'assistant', content: 'I\'m sorry to hear that. Can you tell me more about what happened?' },
      ],
    },
  },
  {
    id: 'conv-2',
    chatbot_id: 'chatbot-1',
    session_id: 'session-2',
    message_count: 5,
    operator_status: 'ai',
    created_at: '2025-01-19T14:30:00Z',
    conversation_data: {
      messages: [
        { role: 'assistant', content: 'Hello! How can I assist you today?' },
        { role: 'user', content: 'I need help with a slip and fall case.' },
      ],
    },
  },
];

export const DEMO_QR_CODES = [
  {
    id: 'qr-1',
    user_id: DEMO_USER.id,
    name: 'Office Business Card',
    slug: 'office-card',
    target_url: 'https://smithlawfirm.com',
    is_active: true,
    created_at: '2025-01-05T10:00:00Z',
    updated_at: '2025-01-05T10:00:00Z',
    qr_config: {
      size: 256,
      backgroundColor: '#ffffff',
      foregroundColor: '#000000',
      errorCorrectionLevel: 'M',
    },
  },
  {
    id: 'qr-2',
    user_id: DEMO_USER.id,
    name: 'Free Consultation Promo',
    slug: 'free-consult',
    target_url: 'https://smithlawfirm.com/consultation',
    is_active: true,
    created_at: '2025-01-12T15:20:00Z',
    updated_at: '2025-01-12T15:20:00Z',
    qr_config: {
      size: 256,
      backgroundColor: '#ffffff',
      foregroundColor: '#3b82f6',
      errorCorrectionLevel: 'H',
    },
  },
];

export const DEMO_QR_SCANS = [
  { qr_code_id: 'qr-1', scanned_at: '2025-01-21T10:30:00Z', city: 'Los Angeles', region: 'CA' },
  { qr_code_id: 'qr-1', scanned_at: '2025-01-21T14:15:00Z', city: 'Los Angeles', region: 'CA' },
  { qr_code_id: 'qr-2', scanned_at: '2025-01-20T09:45:00Z', city: 'San Diego', region: 'CA' },
  { qr_code_id: 'qr-1', scanned_at: '2025-01-19T16:20:00Z', city: 'Pasadena', region: 'CA' },
  { qr_code_id: 'qr-2', scanned_at: '2025-01-19T11:10:00Z', city: 'Los Angeles', region: 'CA' },
];

export const DEMO_WILL_DRAFTS = [
  {
    id: 'will-1',
    user_id: DEMO_USER.id,
    slug: 'demo-will-draft',
    step: 3,
    created_at: '2025-01-18T13:00:00Z',
    data: {
      personalInfo: {
        fullName: 'John Doe',
        city: 'Los Angeles',
        state: 'California',
      },
      executor: {
        name: 'Jane Doe',
        relationship: 'Spouse',
      },
    },
  },
];

export const DEMO_VOICE_SEARCH_TESTS = [
  {
    id: 'voice-test-1',
    user_id: DEMO_USER.id,
    name: 'Personal Injury Lawyer LA',
    market_city: 'Los Angeles',
    market_state: 'California',
    practice_areas: ['Personal Injury', 'Car Accidents'],
    status: 'completed',
    created_at: '2025-01-16T10:00:00Z',
    updated_at: '2025-01-16T11:30:00Z',
    test_questions: [
      'Find a personal injury lawyer near me',
      'Best car accident attorney in Los Angeles',
    ],
    selected_assistants: ['Google', 'Alexa', 'Siri'],
    settings: {},
  },
];

export const DEMO_VOICE_SEARCH_ANALYSIS = [
  {
    id: 'analysis-1',
    test_id: 'voice-test-1',
    firm_business_name: 'Smith & Associates',
    firm_domain: 'smithlawfirm.com',
    presence_score: 78,
    frequency_score: 65,
    competitive_score: 72,
    overall_score: 72,
    created_at: '2025-01-16T11:30:00Z',
    updated_at: '2025-01-16T11:30:00Z',
    competitor_data: {
      topCompetitors: [
        { name: 'Johnson Law Group', mentions: 12 },
        { name: 'Martinez & Partners', mentions: 8 },
      ],
    },
    optimization_suggestions: {
      suggestions: [
        'Add more local content to your website',
        'Optimize Google Business Profile',
        'Create FAQ pages for voice search queries',
      ],
    },
    compliance_issues: {},
  },
];

export const DEMO_SEO_ANALYSES = [
  {
    id: 'seo-1',
    user_id: DEMO_USER.id,
    url: 'https://smithlawfirm.com',
    status: 'completed',
    seo_score: 85,
    voice_seo_score: 72,
    ai_overview_score: 68,
    created_at: '2025-01-14T09:00:00Z',
    updated_at: '2025-01-14T09:15:00Z',
    analysis_data: {
      findings: [
        { type: 'success', message: 'Mobile-friendly design detected' },
        { type: 'warning', message: 'Page speed could be improved' },
        { type: 'info', message: 'Schema markup present' },
      ],
    },
  },
];

export const DEMO_MARKETING_EVENTS = [
  {
    id: 'event-1',
    title: 'National Preparedness Month',
    description: 'October is National Preparedness Month',
    event_date: '2025-10-01',
    event_type: 'system',
    tags: ['preparedness', 'emergency', 'planning'],
    is_active: true,
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z',
    content_suggestions: {
      social_media: ['Share emergency preparedness tips for law firms'],
      blog_topics: ['Legal Considerations in Emergency Preparedness'],
    },
  },
];

export const DEMO_USER_ROLE = {
  id: 'role-1',
  user_id: DEMO_USER.id,
  role: 'user',
  created_at: '2025-01-01T00:00:00Z',
};

/**
 * Get mock data for a specific table
 */
export function getMockData(table: string): any[] {
  const mockDataMap: Record<string, any[]> = {
    chatbots: DEMO_CHATBOTS,
    chatbot_conversations: DEMO_CONVERSATIONS,
    qr_codes: DEMO_QR_CODES,
    qr_scans: DEMO_QR_SCANS,
    will_drafts: DEMO_WILL_DRAFTS,
    voice_search_tests: DEMO_VOICE_SEARCH_TESTS,
    voice_search_analysis: DEMO_VOICE_SEARCH_ANALYSIS,
    seo_analyses: DEMO_SEO_ANALYSES,
    marketing_events: DEMO_MARKETING_EVENTS,
    user_roles: [DEMO_USER_ROLE],
  };

  return mockDataMap[table] || [];
}
