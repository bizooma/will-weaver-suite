import { Document, Packer, Paragraph, HeadingLevel, TextRun, Table, TableCell, TableRow, WidthType } from "docx";
import { NonprofitFormData } from "@/types/nonprofit";

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

export async function exportForm1023(data: NonprofitFormData, filename?: string) {
  const defaultFilename = `IRS-Form-1023-${data.organizationInfo.legalName.replace(/[^a-zA-Z0-9]/g, '-')}.docx`;
  const exportFilename = filename || defaultFilename;

  const doc = new Document({
    sections: [
      {
        properties: {},
        children: [
          // Header
          new Paragraph({
            text: "Form 1023",
            heading: HeadingLevel.TITLE,
            alignment: "center",
          }),
          new Paragraph({
            text: "Application for Recognition of Exemption Under Section 501(c)(3) of the Internal Revenue Code",
            alignment: "center",
            spacing: { after: 400 }
          }),

          // Part I - Identification of Applicant
          new Paragraph({
            text: "Part I - Identification of Applicant",
            heading: HeadingLevel.HEADING_1,
          }),
          
          new Paragraph({
            children: [
              new TextRun({ text: "1. Full name of organization: ", bold: true }),
              new TextRun(data.organizationInfo.legalName),
            ],
          }),
          
          new Paragraph({
            children: [
              new TextRun({ text: "2. Employer identification number (if obtained): ", bold: true }),
              new TextRun(data.organizationInfo.ein || "Not yet obtained"),
            ],
          }),

          new Paragraph({
            children: [
              new TextRun({ text: "3. Mailing address: ", bold: true }),
              new TextRun(`${data.organizationInfo.mailingAddress.street}, ${data.organizationInfo.mailingAddress.city}, ${data.organizationInfo.mailingAddress.state} ${data.organizationInfo.mailingAddress.zip}`),
            ],
          }),

          new Paragraph({
            children: [
              new TextRun({ text: "4. Website address: ", bold: true }),
              new TextRun(data.organizationInfo.websiteUrl || "Not applicable"),
            ],
          }),

          new Paragraph({
            children: [
              new TextRun({ text: "5. Organizational structure: ", bold: true }),
              new TextRun(data.organizationInfo.organizationalStructure),
            ],
          }),

          new Paragraph({
            children: [
              new TextRun({ text: "6. Date incorporated or formed: ", bold: true }),
              new TextRun(formatDate(data.organizationInfo.formationDate)),
            ],
          }),

          new Paragraph({
            children: [
              new TextRun({ text: "7. State of incorporation: ", bold: true }),
              new TextRun(data.organizationInfo.incorporationState),
            ],
          }),

          // Part II - Organizational Structure
          new Paragraph({
            text: "Part II - Organizational Structure",
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 400 }
          }),

          new Paragraph({
            children: [
              new TextRun({ text: "Contact Person: ", bold: true }),
              new TextRun(`${data.contactInfo.contactPersonName}, ${data.contactInfo.contactPersonTitle}`),
            ],
          }),

          new Paragraph({
            children: [
              new TextRun({ text: "Phone: ", bold: true }),
              new TextRun(data.contactInfo.phone),
            ],
          }),

          new Paragraph({
            children: [
              new TextRun({ text: "Email: ", bold: true }),
              new TextRun(data.contactInfo.email),
            ],
          }),

          // Part III - Required Provisions in Your Organizing Document
          new Paragraph({
            text: "Part III - Required Provisions in Your Organizing Document",
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 400 }
          }),

          new Paragraph({
            children: [
              new TextRun({ text: "Articles of Incorporation: ", bold: true }),
              new TextRun(data.legalCompliance.hasArticlesOfIncorporation ? "Yes" : "No"),
            ],
          }),

          new Paragraph({
            children: [
              new TextRun({ text: "Bylaws: ", bold: true }),
              new TextRun(data.legalCompliance.hasBylaws ? "Yes" : "No"),
            ],
          }),

          // Part IV - Narrative Description of Activities
          new Paragraph({
            text: "Part IV - Narrative Description of Activities",
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 400 }
          }),

          new Paragraph({
            children: [
              new TextRun({ text: "Primary Activity: ", bold: true }),
            ],
          }),
          new Paragraph({
            text: data.purposeAndActivities.primaryActivity,
            spacing: { after: 200 }
          }),

          new Paragraph({
            children: [
              new TextRun({ text: "Detailed Activities: ", bold: true }),
            ],
          }),
          new Paragraph({
            text: data.purposeAndActivities.detailedActivities,
            spacing: { after: 200 }
          }),

          new Paragraph({
            children: [
              new TextRun({ text: "Exempt Purposes: ", bold: true }),
              new TextRun(data.purposeAndActivities.exemptPurposes.join(", ")),
            ],
          }),

          new Paragraph({
            children: [
              new TextRun({ text: "Beneficiary Class: ", bold: true }),
              new TextRun(data.purposeAndActivities.beneficiaryClass),
            ],
          }),

          new Paragraph({
            children: [
              new TextRun({ text: "Geographic Area: ", bold: true }),
              new TextRun(data.purposeAndActivities.geographicArea),
            ],
          }),

          // Part V - Compensation and Other Financial Arrangements
          new Paragraph({
            text: "Part V - Compensation and Other Financial Arrangements",
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 400 }
          }),

          new Paragraph({
            text: "Board of Directors/Officers:",
            style: "Heading2",
          }),

          // Board Members Table
          ...data.governanceStructure.boardMembers.map((member, index) => [
            new Paragraph({
              children: [
                new TextRun({ text: `${index + 1}. Name: `, bold: true }),
                new TextRun(member.name),
              ],
            }),
            new Paragraph({
              children: [
                new TextRun({ text: "   Title: ", bold: true }),
                new TextRun(member.title),
              ],
            }),
            new Paragraph({
              children: [
                new TextRun({ text: "   Address: ", bold: true }),
                new TextRun(member.address),
              ],
            }),
            new Paragraph({
              children: [
                new TextRun({ text: "   Annual Compensation: ", bold: true }),
                new TextRun(formatCurrency(member.compensation)),
              ],
            }),
            new Paragraph({
              children: [
                new TextRun({ text: "   Hours per week: ", bold: true }),
                new TextRun(member.hoursPerWeek.toString()),
              ],
            }),
            new Paragraph({
              children: [
                new TextRun({ text: "   Relationship: ", bold: true }),
                new TextRun(member.relationshipToOrg),
              ],
              spacing: { after: 200 }
            }),
          ]).flat(),

          // Part VI - Your Members and Other Individuals and Organizations That Receive Benefits
          new Paragraph({
            text: "Part VI - Your Members and Other Individuals and Organizations That Receive Benefits",
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 400 }
          }),

          new Paragraph({
            children: [
              new TextRun({ text: "Voting members: ", bold: true }),
              new TextRun(data.purposeAndActivities.votingMembers ? "Yes" : "No"),
            ],
          }),

          ...(data.purposeAndActivities.membershipRequirements ? [
            new Paragraph({
              children: [
                new TextRun({ text: "Membership requirements: ", bold: true }),
                new TextRun(data.purposeAndActivities.membershipRequirements),
              ],
            }),
          ] : []),

          // Part VII - Your History
          new Paragraph({
            text: "Part VII - Your History",
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 400 }
          }),

          new Paragraph({
            text: "This is a newly formed organization applying for initial recognition of tax-exempt status.",
          }),

          // Part VIII - Your Specific Activities
          new Paragraph({
            text: "Part VIII - Your Specific Activities",
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 400 }
          }),

          new Paragraph({
            children: [
              new TextRun({ text: "Political activities: ", bold: true }),
              new TextRun(data.legalCompliance.politicalActivities ? "Yes" : "No"),
            ],
          }),

          ...(data.legalCompliance.politicalActivitiesDescription ? [
            new Paragraph({
              text: data.legalCompliance.politicalActivitiesDescription,
              spacing: { after: 200 }
            }),
          ] : []),

          new Paragraph({
            children: [
              new TextRun({ text: "Lobbying activities: ", bold: true }),
              new TextRun(data.legalCompliance.lobbying ? "Yes" : "No"),
            ],
          }),

          ...(data.legalCompliance.lobbyingDescription ? [
            new Paragraph({
              text: data.legalCompliance.lobbyingDescription,
              spacing: { after: 200 }
            }),
          ] : []),

          // Part IX - Financial Data
          new Paragraph({
            text: "Part IX - Financial Data",
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 400 }
          }),

          new Paragraph({
            children: [
              new TextRun({ text: "Accounting method: ", bold: true }),
              new TextRun(data.financialData.accountingMethod),
            ],
          }),

          new Paragraph({
            children: [
              new TextRun({ text: "Accounting period ends: ", bold: true }),
              new TextRun(data.financialData.accountingPeriodEnd),
            ],
          }),

          new Paragraph({
            text: "Three-Year Financial Projections:",
            style: "Heading2",
            spacing: { before: 200 }
          }),

          // Current Year
          new Paragraph({
            children: [
              new TextRun({ text: "Current Year Projections:", bold: true }),
            ],
            spacing: { before: 200 }
          }),
          new Paragraph({
            children: [
              new TextRun({ text: "  Revenue: ", bold: true }),
              new TextRun(formatCurrency(data.financialData.currentYearProjections.totalRevenue)),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({ text: "  Expenses: ", bold: true }),
              new TextRun(formatCurrency(data.financialData.currentYearProjections.totalExpenses)),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({ text: "  Net Income: ", bold: true }),
              new TextRun(formatCurrency(data.financialData.currentYearProjections.netIncome)),
            ],
          }),

          // Year 2
          new Paragraph({
            children: [
              new TextRun({ text: "Year 2 Projections:", bold: true }),
            ],
            spacing: { before: 200 }
          }),
          new Paragraph({
            children: [
              new TextRun({ text: "  Revenue: ", bold: true }),
              new TextRun(formatCurrency(data.financialData.year2Projections.totalRevenue)),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({ text: "  Expenses: ", bold: true }),
              new TextRun(formatCurrency(data.financialData.year2Projections.totalExpenses)),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({ text: "  Net Income: ", bold: true }),
              new TextRun(formatCurrency(data.financialData.year2Projections.netIncome)),
            ],
          }),

          // Year 3
          new Paragraph({
            children: [
              new TextRun({ text: "Year 3 Projections:", bold: true }),
            ],
            spacing: { before: 200 }
          }),
          new Paragraph({
            children: [
              new TextRun({ text: "  Revenue: ", bold: true }),
              new TextRun(formatCurrency(data.financialData.year3Projections.totalRevenue)),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({ text: "  Expenses: ", bold: true }),
              new TextRun(formatCurrency(data.financialData.year3Projections.totalExpenses)),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({ text: "  Net Income: ", bold: true }),
              new TextRun(formatCurrency(data.financialData.year3Projections.netIncome)),
            ],
          }),

          // Part X - Public Charity Status
          new Paragraph({
            text: "Part X - Public Charity Status",
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 400 }
          }),

          new Paragraph({
            children: [
              new TextRun({ text: "Public support type: ", bold: true }),
              new TextRun(data.publicSupportTest.publicSupportType),
            ],
          }),

          ...(data.publicSupportTest.supportCalculationMethod ? [
            new Paragraph({
              children: [
                new TextRun({ text: "Support calculation method: ", bold: true }),
                new TextRun(data.publicSupportTest.supportCalculationMethod),
              ],
            }),
          ] : []),

          new Paragraph({
            children: [
              new TextRun({ text: "Unusual grants: ", bold: true }),
              new TextRun(data.publicSupportTest.unusualGrants ? "Yes" : "No"),
            ],
          }),

          // Part XI - User Fee Information
          new Paragraph({
            text: "Part XI - User Fee Information",
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 400 }
          }),

          new Paragraph({
            text: "The appropriate user fee must be submitted with this application.",
          }),

          // Signature Section
          new Paragraph({
            text: "Part XII - Signature",
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 400 }
          }),

          new Paragraph({
            children: [
              new TextRun({ text: "Authorized Official: ", bold: true }),
              new TextRun(`${data.contactInfo.authorizedOfficialName}, ${data.contactInfo.authorizedOfficialTitle}`),
            ],
          }),

          new Paragraph({
            text: "Signature: ___________________________________ Date: _______________",
            spacing: { before: 400 }
          }),

          new Paragraph({
            text: "Note: This document was generated electronically and requires manual signature before submission to the IRS.",
            spacing: { before: 200 }
          }),
        ],
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  downloadBlob(blob, exportFilename);
}