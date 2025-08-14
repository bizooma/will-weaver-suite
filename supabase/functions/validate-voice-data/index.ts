import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ValidationIssue {
  type: 'missing_critical' | 'inconsistent' | 'low_confidence' | 'legal_concern';
  field: string;
  message: string;
  severity: 'low' | 'medium' | 'high';
  suggestions?: string[];
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { extractedData, confidenceScores, existingFormData } = await req.json();
    
    const validationIssues: ValidationIssue[] = [];

    // Check for missing critical information
    const criticalFields = [
      { field: 'personal.fullName', label: 'Full Name' },
      { field: 'personal.state', label: 'State of Residence' },
      { field: 'executor.name', label: 'Executor Name' }
    ];

    criticalFields.forEach(({ field, label }) => {
      const keys = field.split('.');
      let value = extractedData;
      for (const key of keys) {
        value = value?.[key];
      }
      
      if (!value || (typeof value === 'string' && value.trim() === '')) {
        validationIssues.push({
          type: 'missing_critical',
          field,
          message: `${label} is required for a valid will`,
          severity: 'high',
          suggestions: [`Please provide your ${label.toLowerCase()}`]
        });
      }
    });

    // Check confidence scores
    Object.entries(confidenceScores).forEach(([field, confidence]) => {
      if (confidence < 0.6) {
        validationIssues.push({
          type: 'low_confidence',
          field,
          message: `Low confidence in extracted ${field.replace(/\./g, ' ')}`,
          severity: confidence < 0.4 ? 'high' : 'medium',
          suggestions: ['Please speak more clearly or repeat this information']
        });
      }
    });

    // Check for inconsistencies
    if (extractedData.personal?.maritalStatus === 'married' && !extractedData.spouse?.name) {
      validationIssues.push({
        type: 'inconsistent',
        field: 'spouse',
        message: 'You mentioned being married but no spouse information was provided',
        severity: 'medium',
        suggestions: ['Please provide your spouse\'s name and details']
      });
    }

    if (extractedData.beneficiaries?.length === 0 && extractedData.gifts?.length === 0) {
      validationIssues.push({
        type: 'missing_critical',
        field: 'beneficiaries',
        message: 'No beneficiaries or specific gifts were mentioned',
        severity: 'high',
        suggestions: ['Please specify who should inherit your assets']
      });
    }

    // Check for legal concerns
    if (extractedData.executor?.name && 
        extractedData.beneficiaries?.some(b => b.name === extractedData.executor?.name)) {
      validationIssues.push({
        type: 'legal_concern',
        field: 'executor',
        message: 'Your executor is also listed as a beneficiary, which may create conflicts',
        severity: 'medium',
        suggestions: ['Consider appointing a neutral executor or consult with an attorney']
      });
    }

    // Check age consistency (if DOB provided)
    if (extractedData.personal?.dob) {
      const birthYear = new Date(extractedData.personal.dob).getFullYear();
      const currentYear = new Date().getFullYear();
      const age = currentYear - birthYear;
      
      if (age < 18) {
        validationIssues.push({
          type: 'legal_concern',
          field: 'personal.dob',
          message: 'You must be at least 18 years old to create a valid will',
          severity: 'high',
          suggestions: ['Please verify your date of birth']
        });
      }
    }

    // Check for guardian information if beneficiaries include minors
    const hasMinorBeneficiaries = extractedData.beneficiaries?.some(b => {
      if (b.dob) {
        const birthYear = new Date(b.dob).getFullYear();
        const age = new Date().getFullYear() - birthYear;
        return age < 18;
      }
      return b.relationship?.toLowerCase().includes('child') || 
             b.relationship?.toLowerCase().includes('son') ||
             b.relationship?.toLowerCase().includes('daughter');
    });

    if (hasMinorBeneficiaries && !extractedData.guardian?.name) {
      validationIssues.push({
        type: 'missing_critical',
        field: 'guardian',
        message: 'Guardian information is needed when beneficiaries include minors',
        severity: 'high',
        suggestions: ['Please specify who should care for minor beneficiaries']
      });
    }

    console.log(`Validation completed with ${validationIssues.length} issues found`);

    return new Response(
      JSON.stringify({ validationIssues }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Validation error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});