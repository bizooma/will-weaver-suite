// TypeScript interfaces for IRS Form 1023 data structure

export interface OrganizationInfo {
  legalName: string;
  ein?: string;
  formationDate: string;
  incorporationState: string;
  mailingAddress: {
    street: string;
    city: string;
    state: string;
    zip: string;
  };
  physicalAddress?: {
    street: string;
    city: string;
    state: string;
    zip: string;
  };
  websiteUrl?: string;
  organizationalStructure: 'corporation' | 'trust' | 'llc' | 'unincorporated-association';
}

export interface ContactInfo {
  contactPersonName: string;
  contactPersonTitle: string;
  phone: string;
  email: string;
  authorizedOfficialName: string;
  authorizedOfficialTitle: string;
}

export interface PurposeAndActivities {
  exemptPurposes: string[];
  primaryActivity: string;
  detailedActivities: string;
  beneficiaryClass: string;
  geographicArea: string;
  votingMembers: boolean;
  membershipRequirements?: string;
}

export interface GovernanceStructure {
  boardMembers: BoardMember[];
  conflictOfInterestPolicy: boolean;
  whistleblowerPolicy: boolean;
  documentRetentionPolicy: boolean;
  jointVentures: boolean;
  jointVentureDetails?: string;
}

export interface BoardMember {
  name: string;
  title: string;
  address: string;
  compensation: number;
  hoursPerWeek: number;
  relationshipToOrg: string;
}

export interface FinancialData {
  accountingPeriodEnd: string;
  accountingMethod: 'cash' | 'accrual';
  currentYearProjections: YearlyFinancials;
  year2Projections: YearlyFinancials;
  year3Projections: YearlyFinancials;
  grantWritingPlanned: boolean;
  fundraisingPlanned: boolean;
  fundraisingMethods?: string[];
}

export interface YearlyFinancials {
  contributions: number;
  programServiceRevenue: number;
  investmentIncome: number;
  otherRevenue: number;
  totalRevenue: number;
  programServices: number;
  managementGeneral: number;
  fundraising: number;
  totalExpenses: number;
  netIncome: number;
}

export interface PublicSupportTest {
  publicSupportType: 'public-charity-509a1' | 'public-charity-509a2' | 'private-foundation';
  supportCalculationMethod?: '509a1-170b1Aii' | '509a1-170b1Aiii' | '509a2';
  unusualGrants: boolean;
  unusualGrantsExplanation?: string;
}

export interface LegalCompliance {
  hasArticlesOfIncorporation: boolean;
  hasBylaws: boolean;
  hasConflictOfInterestPolicy: boolean;
  politicalActivities: boolean;
  politicalActivitiesDescription?: string;
  lobbying: boolean;
  lobbyingDescription?: string;
  privateBenefit: boolean;
  privateBenefitDescription?: string;
}

export interface NonprofitFormData {
  organizationInfo: OrganizationInfo;
  contactInfo: ContactInfo;
  purposeAndActivities: PurposeAndActivities;
  governanceStructure: GovernanceStructure;
  financialData: FinancialData;
  publicSupportTest: PublicSupportTest;
  legalCompliance: LegalCompliance;
  currentStep: number;
  completedSteps: number[];
}

export interface NonprofitDraft {
  id: string;
  slug: string;
  data: NonprofitFormData;
  user_id: string;
  created_at: string;
  updated_at: string;
  step: number;
}