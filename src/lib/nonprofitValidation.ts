import { z } from 'zod';

// Organization Info Schema
export const organizationInfoSchema = z.object({
  legalName: z.string().min(1, 'Legal name is required').max(200, 'Legal name must be less than 200 characters'),
  ein: z.string().optional(),
  formationDate: z.string().min(1, 'Formation date is required'),
  incorporationState: z.string().min(1, 'Incorporation state is required'),
  mailingAddress: z.object({
    street: z.string().min(1, 'Street address is required'),
    city: z.string().min(1, 'City is required'),
    state: z.string().min(1, 'State is required'),
    zip: z.string().min(5, 'ZIP code must be at least 5 characters'),
  }),
  physicalAddress: z.object({
    street: z.string(),
    city: z.string(),
    state: z.string(),
    zip: z.string(),
  }).optional(),
  websiteUrl: z.string().url('Please enter a valid URL').optional().or(z.literal('')),
  organizationalStructure: z.enum(['corporation', 'trust', 'llc', 'unincorporated-association']),
});

// Contact Info Schema
export const contactInfoSchema = z.object({
  contactPersonName: z.string().min(1, 'Contact person name is required'),
  contactPersonTitle: z.string().min(1, 'Contact person title is required'),
  phone: z.string().min(10, 'Phone number must be at least 10 digits'),
  email: z.string().email('Please enter a valid email address'),
  authorizedOfficialName: z.string().min(1, 'Authorized official name is required'),
  authorizedOfficialTitle: z.string().min(1, 'Authorized official title is required'),
});

// Purpose and Activities Schema
export const purposeAndActivitiesSchema = z.object({
  exemptPurposes: z.array(z.string()).min(1, 'At least one exempt purpose is required'),
  primaryActivity: z.string().min(1, 'Primary activity is required'),
  detailedActivities: z.string().min(50, 'Please provide a detailed description of at least 50 characters'),
  beneficiaryClass: z.string().min(1, 'Beneficiary class is required'),
  geographicArea: z.string().min(1, 'Geographic area is required'),
  votingMembers: z.boolean(),
  membershipRequirements: z.string().optional(),
});

// Board Member Schema
export const boardMemberSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  title: z.string().min(1, 'Title is required'),
  address: z.string().min(1, 'Address is required'),
  compensation: z.number().min(0, 'Compensation cannot be negative'),
  hoursPerWeek: z.number().min(0, 'Hours per week cannot be negative').max(168, 'Hours per week cannot exceed 168'),
  relationshipToOrg: z.string().min(1, 'Relationship to organization is required'),
});

// Governance Structure Schema
export const governanceStructureSchema = z.object({
  boardMembers: z.array(boardMemberSchema).min(3, 'At least 3 board members are required'),
  conflictOfInterestPolicy: z.boolean(),
  whistleblowerPolicy: z.boolean(),
  documentRetentionPolicy: z.boolean(),
  jointVentures: z.boolean(),
  jointVentureDetails: z.string().optional(),
});

// Yearly Financials Schema
export const yearlyFinancialsSchema = z.object({
  contributions: z.number().min(0, 'Contributions cannot be negative'),
  programServiceRevenue: z.number().min(0, 'Program service revenue cannot be negative'),
  investmentIncome: z.number().min(0, 'Investment income cannot be negative'),
  otherRevenue: z.number().min(0, 'Other revenue cannot be negative'),
  totalRevenue: z.number().min(0, 'Total revenue cannot be negative'),
  programServices: z.number().min(0, 'Program services expenses cannot be negative'),
  managementGeneral: z.number().min(0, 'Management expenses cannot be negative'),
  fundraising: z.number().min(0, 'Fundraising expenses cannot be negative'),
  totalExpenses: z.number().min(0, 'Total expenses cannot be negative'),
  netIncome: z.number(),
});

// Financial Data Schema
export const financialDataSchema = z.object({
  accountingPeriodEnd: z.string().min(1, 'Accounting period end is required'),
  accountingMethod: z.enum(['cash', 'accrual']),
  currentYearProjections: yearlyFinancialsSchema,
  year2Projections: yearlyFinancialsSchema,
  year3Projections: yearlyFinancialsSchema,
  grantWritingPlanned: z.boolean(),
  fundraisingPlanned: z.boolean(),
  fundraisingMethods: z.array(z.string()).optional(),
});

// Public Support Test Schema
export const publicSupportTestSchema = z.object({
  publicSupportType: z.enum(['public-charity-509a1', 'public-charity-509a2', 'private-foundation']),
  supportCalculationMethod: z.enum(['509a1-170b1Aii', '509a1-170b1Aiii', '509a2']).optional(),
  unusualGrants: z.boolean(),
  unusualGrantsExplanation: z.string().optional(),
});

// Legal Compliance Schema
export const legalComplianceSchema = z.object({
  hasArticlesOfIncorporation: z.boolean(),
  hasBylaws: z.boolean(),
  hasConflictOfInterestPolicy: z.boolean(),
  politicalActivities: z.boolean(),
  politicalActivitiesDescription: z.string().optional(),
  lobbying: z.boolean(),
  lobbyingDescription: z.string().optional(),
  privateBenefit: z.boolean(),
  privateBenefitDescription: z.string().optional(),
});

// Complete Form Schema
export const nonprofitFormSchema = z.object({
  organizationInfo: organizationInfoSchema,
  contactInfo: contactInfoSchema,
  purposeAndActivities: purposeAndActivitiesSchema,
  governanceStructure: governanceStructureSchema,
  financialData: financialDataSchema,
  publicSupportTest: publicSupportTestSchema,
  legalCompliance: legalComplianceSchema,
  currentStep: z.number().min(0).max(15),
  completedSteps: z.array(z.number()),
});

export type OrganizationInfoInput = z.infer<typeof organizationInfoSchema>;
export type ContactInfoInput = z.infer<typeof contactInfoSchema>;
export type PurposeAndActivitiesInput = z.infer<typeof purposeAndActivitiesSchema>;
export type GovernanceStructureInput = z.infer<typeof governanceStructureSchema>;
export type FinancialDataInput = z.infer<typeof financialDataSchema>;
export type PublicSupportTestInput = z.infer<typeof publicSupportTestSchema>;
export type LegalComplianceInput = z.infer<typeof legalComplianceSchema>;
export type NonprofitFormInput = z.infer<typeof nonprofitFormSchema>;