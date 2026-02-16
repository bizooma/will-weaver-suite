/**
 * Platform Functionality Audit Data
 * Complete inventory of every feature with its current status.
 * Used to generate a downloadable CSV report for admins.
 */

/** Shape of a single audit row */
export interface AuditItem {
  feature: string;
  category: string;
  status: 'Functional' | 'Partial' | 'UI Only' | 'Placeholder' | 'Not Built' | 'Static' | 'Basic' | 'Marketing Only';
  notes: string;
}

/** Full platform audit data */
export const PLATFORM_AUDIT: AuditItem[] = [
  { feature: 'Supabase Auth (Email/Password)', category: 'Authentication', status: 'Functional', notes: 'Login, signup, password reset all working' },
  { feature: 'Protected Routes', category: 'Authentication', status: 'Functional', notes: 'ProtectedRoute component guards dashboard' },
  { feature: 'Dashboard Overview', category: 'Dashboard', status: 'Functional', notes: 'Real stats from Supabase tables' },
  { feature: 'User Management', category: 'Dashboard', status: 'Functional', notes: 'Add/remove users with role assignment' },
  { feature: 'System Messages', category: 'Dashboard', status: 'Functional', notes: 'Notification system with read/unread' },
  { feature: 'AIO SEO Analyzer', category: 'Tools', status: 'Functional', notes: 'OpenAI-powered analysis via edge function' },
  { feature: 'Chatbot Builder', category: 'Tools', status: 'Functional', notes: 'Full CRUD, configuration, embed code' },
  { feature: 'Chatbot Training', category: 'Tools', status: 'Functional', notes: 'URL and document training via OpenAI' },
  { feature: 'Chatbot Conversations', category: 'Tools', status: 'Functional', notes: 'View/manage chat history' },
  { feature: 'Live Operator Link', category: 'Tools', status: 'Functional', notes: 'Operator takeover for chatbot sessions' },
  { feature: 'QR Code Generator', category: 'Tools', status: 'Functional', notes: 'Generate, track, with scan analytics' },
  { feature: 'Will and Trust Creator', category: 'Tools', status: 'Functional', notes: 'Multi-step wizard, DOCX export, AI review' },
  { feature: 'Nonprofit Formation', category: 'Tools', status: 'Functional', notes: '8-step wizard with draft save/resume' },
  { feature: 'Marketing Calendar', category: 'Marketing', status: 'Functional', notes: 'Event CRUD with heritage month integration' },
  { feature: 'Contact Form', category: 'Marketing', status: 'Functional', notes: 'Resend email via edge function' },
  { feature: 'SEOHead Meta Tags', category: 'SEO', status: 'Functional', notes: 'OG, Twitter Card, JSON-LD on all pages' },
  { feature: 'Cookie Consent Banner', category: 'Compliance', status: 'Functional', notes: 'GDPR-style consent banner' },
  { feature: 'Stripe Pricing Table', category: 'Payments', status: 'UI Only', notes: 'PricingTable component exists but no checkout edge function' },
  { feature: 'Stripe Webhooks', category: 'Payments', status: 'Not Built', notes: 'No webhook handler for subscription events' },
  { feature: 'Subscription Gating', category: 'Payments', status: 'Not Built', notes: 'No logic to restrict features by plan' },
  { feature: 'Voice Search Simulator', category: 'Voice', status: 'Partial', notes: 'Saves tests to DB; orchestrator lacks real API integration' },
  { feature: 'Google Search Analyzer', category: 'Voice', status: 'Placeholder', notes: 'Edge function exists with TODO comments' },
  { feature: 'Bing Search Analyzer', category: 'Voice', status: 'Placeholder', notes: 'Edge function exists with TODO comments' },
  { feature: 'Voice Assistant Simulator', category: 'Voice', status: 'Partial', notes: 'Siri/Alexa simulation via OpenAI' },
  { feature: 'Alexa Skill Manager', category: 'Alexa', status: 'Marketing Only', notes: 'Static marketing page, no skill builder' },
  { feature: 'Mobile App Manager', category: 'Mobile', status: 'Marketing Only', notes: 'Static marketing page, no app builder' },
  { feature: 'Voice Agent Bar', category: 'Voice', status: 'Partial', notes: 'ElevenLabs wired but needs API key' },
  { feature: 'Analytics Dashboard', category: 'Analytics', status: 'Basic', notes: 'Shows counts only, no charts or trends' },
  { feature: 'Blog', category: 'Content', status: 'Static', notes: 'Placeholder page, no CMS' },
  { feature: 'White Label Settings', category: 'Settings', status: 'Partial', notes: 'DB schema and UI exist but not applied to frontend' },
  { feature: 'API Documentation', category: 'Developer', status: 'Functional', notes: 'Interactive API docs with key management' },
  { feature: 'SDK Downloader', category: 'Developer', status: 'Functional', notes: 'Generate SDK via edge function' },
  { feature: 'Production Readiness Panel', category: 'DevOps', status: 'Functional', notes: 'Automated checks for deployment readiness' },
  { feature: 'Training Admin Manager', category: 'Admin', status: 'Functional', notes: 'Manage training data across users' },
  { feature: 'Settings Manager', category: 'Settings', status: 'Functional', notes: 'User preferences and configuration' },
  { feature: 'Video Chatbots Page', category: 'Marketing', status: 'Static', notes: 'Marketing landing page only' },
  { feature: 'Draft Save/View', category: 'Tools', status: 'Functional', notes: 'Save and resume nonprofit and will drafts' },
  { feature: 'Heritage Month Display', category: 'Marketing', status: 'Functional', notes: 'Auto-displays relevant heritage months' },
  { feature: 'Tour/Demo Mode', category: 'Onboarding', status: 'Functional', notes: 'Guided tour with mock data' },
];

/**
 * Converts the audit data to CSV and triggers a browser download.
 * Escapes fields that contain commas or quotes per RFC 4180.
 */
export function downloadAuditCSV(): void {
  const headers = ['Feature', 'Category', 'Status', 'Notes'];

  /** Escape a CSV field value */
  const escapeField = (value: string): string => {
    if (value.includes(',') || value.includes('"') || value.includes('\n')) {
      return `"${value.replace(/"/g, '""')}"`;
    }
    return value;
  };

  const rows = PLATFORM_AUDIT.map((item) =>
    [item.feature, item.category, item.status, item.notes].map(escapeField).join(',')
  );

  const csvContent = [headers.join(','), ...rows].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  // Create a temporary link and click it to trigger download
  const link = document.createElement('a');
  link.href = url;
  link.download = `platform-audit-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
