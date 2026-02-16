import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import SEOHead from '@/components/SEOHead';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { NonprofitFormData, OrganizationInfo, ContactInfo, PurposeAndActivities, GovernanceStructure, FinancialData, PublicSupportTest, LegalCompliance } from '@/types/nonprofit';
import { 
  organizationInfoSchema, 
  contactInfoSchema, 
  purposeAndActivitiesSchema, 
  governanceStructureSchema, 
  financialDataSchema, 
  publicSupportTestSchema, 
  legalComplianceSchema 
} from '@/lib/nonprofitValidation';
import { useNonprofitDrafts } from '@/hooks/useNonprofitDrafts';
import { exportForm1023 } from '@/utils/form1023Export';
import { ChevronLeft, ChevronRight, FileDown, Building2, Users, DollarSign, Shield, CheckCircle, Info } from 'lucide-react';

// Step Components
import OrganizationInfoStep from '@/components/nonprofit/OrganizationInfoStep';
import ContactInfoStep from '@/components/nonprofit/ContactInfoStep';
import PurposeActivitiesStep from '@/components/nonprofit/PurposeActivitiesStep';
import GovernanceStep from '@/components/nonprofit/GovernanceStep';
import FinancialDataStep from '@/components/nonprofit/FinancialDataStep';
import PublicSupportStep from '@/components/nonprofit/PublicSupportStep';
import LegalComplianceStep from '@/components/nonprofit/LegalComplianceStep';
import ReviewStep from '@/components/nonprofit/ReviewStep';

const steps = [
  { id: 1, title: 'Organization Info', icon: Building2, schema: organizationInfoSchema },
  { id: 2, title: 'Contact Information', icon: Users, schema: contactInfoSchema },
  { id: 3, title: 'Purpose & Activities', icon: Info, schema: purposeAndActivitiesSchema },
  { id: 4, title: 'Governance', icon: Shield, schema: governanceStructureSchema },
  { id: 5, title: 'Financial Data', icon: DollarSign, schema: financialDataSchema },
  { id: 6, title: 'Public Support', icon: CheckCircle, schema: publicSupportTestSchema },
  { id: 7, title: 'Legal Compliance', icon: Shield, schema: legalComplianceSchema },
  { id: 8, title: 'Review & Submit', icon: FileDown, schema: null },
];

const defaultFormData: NonprofitFormData = {
  organizationInfo: {
    legalName: '',
    ein: '',
    formationDate: '',
    incorporationState: '',
    mailingAddress: { street: '', city: '', state: '', zip: '' },
    physicalAddress: { street: '', city: '', state: '', zip: '' },
    websiteUrl: '',
    organizationalStructure: 'corporation',
  },
  contactInfo: {
    contactPersonName: '',
    contactPersonTitle: '',
    phone: '',
    email: '',
    authorizedOfficialName: '',
    authorizedOfficialTitle: '',
  },
  purposeAndActivities: {
    exemptPurposes: [],
    primaryActivity: '',
    detailedActivities: '',
    beneficiaryClass: '',
    geographicArea: '',
    votingMembers: false,
    membershipRequirements: '',
  },
  governanceStructure: {
    boardMembers: [],
    conflictOfInterestPolicy: false,
    whistleblowerPolicy: false,
    documentRetentionPolicy: false,
    jointVentures: false,
    jointVentureDetails: '',
  },
  financialData: {
    accountingPeriodEnd: 'December 31',
    accountingMethod: 'accrual',
    currentYearProjections: {
      contributions: 0,
      programServiceRevenue: 0,
      investmentIncome: 0,
      otherRevenue: 0,
      totalRevenue: 0,
      programServices: 0,
      managementGeneral: 0,
      fundraising: 0,
      totalExpenses: 0,
      netIncome: 0,
    },
    year2Projections: {
      contributions: 0,
      programServiceRevenue: 0,
      investmentIncome: 0,
      otherRevenue: 0,
      totalRevenue: 0,
      programServices: 0,
      managementGeneral: 0,
      fundraising: 0,
      totalExpenses: 0,
      netIncome: 0,
    },
    year3Projections: {
      contributions: 0,
      programServiceRevenue: 0,
      investmentIncome: 0,
      otherRevenue: 0,
      totalRevenue: 0,
      programServices: 0,
      managementGeneral: 0,
      fundraising: 0,
      totalExpenses: 0,
      netIncome: 0,
    },
    grantWritingPlanned: false,
    fundraisingPlanned: false,
    fundraisingMethods: [],
  },
  publicSupportTest: {
    publicSupportType: 'public-charity-509a1',
    supportCalculationMethod: '509a1-170b1Aii',
    unusualGrants: false,
    unusualGrantsExplanation: '',
  },
  legalCompliance: {
    hasArticlesOfIncorporation: false,
    hasBylaws: false,
    hasConflictOfInterestPolicy: false,
    politicalActivities: false,
    politicalActivitiesDescription: '',
    lobbying: false,
    lobbyingDescription: '',
    privateBenefit: false,
    privateBenefitDescription: '',
  },
  currentStep: 1,
  completedSteps: [],
};

const NonprofitFormation = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<NonprofitFormData>(defaultFormData);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const { createDraft, loading } = useNonprofitDrafts();

  const form = useForm({
    resolver: zodResolver(steps.find(step => step.id === currentStep)?.schema || organizationInfoSchema),
    mode: 'onChange',
  });

  const progress = ((currentStep - 1) / (steps.length - 1)) * 100;

  const validateCurrentStep = async () => {
    const currentStepConfig = steps.find(step => step.id === currentStep);
    if (!currentStepConfig?.schema) return true;

    try {
      const stepData = getStepData(currentStep);
      await currentStepConfig.schema.parseAsync(stepData);
      return true;
    } catch (error) {
      toast.error('Please complete all required fields before proceeding');
      return false;
    }
  };

  const getStepData = (step: number) => {
    switch (step) {
      case 1: return formData.organizationInfo;
      case 2: return formData.contactInfo;
      case 3: return formData.purposeAndActivities;
      case 4: return formData.governanceStructure;
      case 5: return formData.financialData;
      case 6: return formData.publicSupportTest;
      case 7: return formData.legalCompliance;
      default: return formData;
    }
  };

  const updateStepData = (step: number, data: any) => {
    setFormData(prev => {
      const updated = { ...prev };
      switch (step) {
        case 1: updated.organizationInfo = data; break;
        case 2: updated.contactInfo = data; break;
        case 3: updated.purposeAndActivities = data; break;
        case 4: updated.governanceStructure = data; break;
        case 5: updated.financialData = data; break;
        case 6: updated.publicSupportTest = data; break;
        case 7: updated.legalCompliance = data; break;
      }
      updated.currentStep = step;
      return updated;
    });
  };

  const handleNext = async () => {
    const isValid = await validateCurrentStep();
    if (!isValid) return;

    if (!completedSteps.includes(currentStep)) {
      setCompletedSteps(prev => [...prev, currentStep]);
    }

    if (currentStep < steps.length) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleStepClick = (stepId: number) => {
    if (stepId <= Math.max(...completedSteps, currentStep)) {
      setCurrentStep(stepId);
    }
  };

  const handleSaveDraft = async () => {
    try {
      const updatedFormData = { ...formData, currentStep, completedSteps };
      await createDraft(updatedFormData);
      toast.success('Draft saved successfully');
    } catch (error) {
      toast.error('Failed to save draft');
    }
  };

  const handleExportForm = async () => {
    try {
      await exportForm1023(formData);
      toast.success('Form 1023 exported successfully');
    } catch (error) {
      toast.error('Failed to export form');
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return <OrganizationInfoStep data={formData.organizationInfo} onChange={(data) => updateStepData(1, data)} />;
      case 2:
        return <ContactInfoStep data={formData.contactInfo} onChange={(data) => updateStepData(2, data)} />;
      case 3:
        return <PurposeActivitiesStep data={formData.purposeAndActivities} onChange={(data) => updateStepData(3, data)} />;
      case 4:
        return <GovernanceStep data={formData.governanceStructure} onChange={(data) => updateStepData(4, data)} />;
      case 5:
        return <FinancialDataStep data={formData.financialData} onChange={(data) => updateStepData(5, data)} />;
      case 6:
        return <PublicSupportStep data={formData.publicSupportTest} onChange={(data) => updateStepData(6, data)} />;
      case 7:
        return <LegalComplianceStep data={formData.legalCompliance} onChange={(data) => updateStepData(7, data)} />;
      case 8:
        return <ReviewStep data={formData} onExport={handleExportForm} />;
      default:
        return null;
    }
  };

  return (
    <>
      {/* SEO meta tags for Nonprofit Formation wizard */}
      <SEOHead
        title="Nonprofit Formation Wizard | Amicus Edge"
        description="Step-by-step wizard to help law firms establish nonprofits and qualify for Google Ad Grants."
        path="/nonprofit-formation"
        keywords={['nonprofit wizard', 'law firm nonprofit', 'Google Ad Grants qualification']}
      />

      <div className="min-h-screen bg-gradient-to-br from-background to-muted/50">
        <div className="container max-w-6xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-4">Nonprofit Formation Wizard</h1>
            <p className="text-lg text-muted-foreground mb-6">
              Complete your IRS Form 1023 to establish a nonprofit and qualify for Google Ad Grants
            </p>
            <Progress value={progress} className="w-full max-w-md mx-auto" />
            <p className="text-sm text-muted-foreground mt-2">
              Step {currentStep} of {steps.length}
            </p>
          </div>

          {/* Steps Navigation */}
          <div className="flex flex-wrap justify-center gap-2 mb-8">
            {steps.map((step) => {
              const Icon = step.icon;
              const isCompleted = completedSteps.includes(step.id);
              const isCurrent = currentStep === step.id;
              const isAccessible = step.id <= Math.max(...completedSteps, currentStep);

              return (
                <button
                  key={step.id}
                  onClick={() => handleStepClick(step.id)}
                  disabled={!isAccessible}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                    isCurrent
                      ? 'bg-primary text-primary-foreground'
                      : isCompleted
                      ? 'bg-green-100 text-green-800 border border-green-200'
                      : isAccessible
                      ? 'bg-muted hover:bg-muted/80 text-muted-foreground'
                      : 'bg-muted/50 text-muted-foreground/50 cursor-not-allowed'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{step.title}</span>
                </button>
              );
            })}
          </div>

          {/* Main Content */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {React.createElement(steps.find(s => s.id === currentStep)?.icon || Building2, { className: "w-5 h-5" })}
                {steps.find(s => s.id === currentStep)?.title}
              </CardTitle>
              <CardDescription>
                {currentStep === 8 
                  ? 'Review your information and download your Form 1023'
                  : 'Complete the required information for this section'
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              {renderStepContent()}
            </CardContent>
          </Card>

          {/* Navigation Buttons */}
          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 1}
              className="flex items-center gap-2"
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </Button>

            <div className="flex gap-2">
              <Button variant="outline" onClick={handleSaveDraft} disabled={loading}>
                Save Draft
              </Button>
              
              {currentStep === steps.length ? (
                <Button onClick={handleExportForm} className="flex items-center gap-2">
                  <FileDown className="w-4 h-4" />
                  Download Form 1023
                </Button>
              ) : (
                <Button onClick={handleNext} className="flex items-center gap-2">
                  Next
                  <ChevronRight className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>

          {/* Google Ad Grant Info */}
          <Card className="mt-8 bg-blue-50 border-blue-200">
            <CardContent className="pt-6">
              <h3 className="font-semibold text-blue-900 mb-2">About Google Ad Grants</h3>
              <p className="text-blue-800 text-sm">
                Once your nonprofit is approved, you'll be eligible for Google Ad Grants providing up to $10,000/month 
                in free advertising. Even though ads will be for your foundation, your law firm will gain valuable exposure 
                and community recognition.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};

export default NonprofitFormation;