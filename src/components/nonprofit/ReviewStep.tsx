import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileDown, Eye, CheckCircle } from 'lucide-react';
import { NonprofitFormData } from '@/types/nonprofit';

interface ReviewStepProps {
  data: NonprofitFormData;
  onExport: () => void;
}

const ReviewStep: React.FC<ReviewStepProps> = ({ data, onExport }) => {
  const formatCurrency = (amount: number) => 
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);

  return (
    <div className="space-y-6">
      <Card className="bg-green-50 border-green-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-800">
            <CheckCircle className="w-5 h-5" />
            Form 1023 Ready for Review
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-green-700 mb-4">
            Congratulations! You've completed all required sections. Please review the information below 
            and download your Form 1023 when ready.
          </p>
          <Button onClick={onExport} className="w-full md:w-auto">
            <FileDown className="w-4 h-4 mr-2" />
            Download Form 1023
          </Button>
        </CardContent>
      </Card>

      <div className="grid gap-6">
        {/* Organization Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="w-5 h-5" />
              Organization Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div>
                <strong>Legal Name:</strong> {data.organizationInfo.legalName}
              </div>
              <div>
                <strong>EIN:</strong> {data.organizationInfo.ein || 'Not yet obtained'}
              </div>
              <div>
                <strong>Formation Date:</strong> {data.organizationInfo.formationDate}
              </div>
              <div>
                <strong>State:</strong> {data.organizationInfo.incorporationState}
              </div>
              <div>
                <strong>Structure:</strong> {data.organizationInfo.organizationalStructure}
              </div>
              <div>
                <strong>Website:</strong> {data.organizationInfo.websiteUrl || 'None'}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div>
                <strong>Contact Person:</strong> {data.contactInfo.contactPersonName}
              </div>
              <div>
                <strong>Title:</strong> {data.contactInfo.contactPersonTitle}
              </div>
              <div>
                <strong>Phone:</strong> {data.contactInfo.phone}
              </div>
              <div>
                <strong>Email:</strong> {data.contactInfo.email}
              </div>
              <div>
                <strong>Authorized Official:</strong> {data.contactInfo.authorizedOfficialName}
              </div>
              <div>
                <strong>Official Title:</strong> {data.contactInfo.authorizedOfficialTitle}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Purpose and Activities */}
        <Card>
          <CardHeader>
            <CardTitle>Purpose and Activities</CardTitle>
          </CardHeader>
          <CardContent className="text-sm space-y-2">
            <div>
              <strong>Exempt Purposes:</strong> {data.purposeAndActivities.exemptPurposes.join(', ')}
            </div>
            <div>
              <strong>Primary Activity:</strong> {data.purposeAndActivities.primaryActivity}
            </div>
            <div>
              <strong>Geographic Area:</strong> {data.purposeAndActivities.geographicArea}
            </div>
            <div>
              <strong>Voting Members:</strong> {data.purposeAndActivities.votingMembers ? 'Yes' : 'No'}
            </div>
          </CardContent>
        </Card>

        {/* Board Members */}
        <Card>
          <CardHeader>
            <CardTitle>Board of Directors ({data.governanceStructure.boardMembers.length} members)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.governanceStructure.boardMembers.map((member, index) => (
                <div key={index} className="p-3 bg-muted rounded-lg text-sm">
                  <div className="grid md:grid-cols-3 gap-2">
                    <div><strong>{member.name}</strong></div>
                    <div>{member.title}</div>
                    <div>{formatCurrency(member.compensation)}/year</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Financial Projections */}
        <Card>
          <CardHeader>
            <CardTitle>Financial Projections (3-Year Summary)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2">Year</th>
                    <th className="text-right py-2">Revenue</th>
                    <th className="text-right py-2">Expenses</th>
                    <th className="text-right py-2">Net Income</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b">
                    <td className="py-2">Current Year</td>
                    <td className="text-right py-2">{formatCurrency(data.financialData.currentYearProjections.totalRevenue)}</td>
                    <td className="text-right py-2">{formatCurrency(data.financialData.currentYearProjections.totalExpenses)}</td>
                    <td className="text-right py-2">{formatCurrency(data.financialData.currentYearProjections.netIncome)}</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2">Year 2</td>
                    <td className="text-right py-2">{formatCurrency(data.financialData.year2Projections.totalRevenue)}</td>
                    <td className="text-right py-2">{formatCurrency(data.financialData.year2Projections.totalExpenses)}</td>
                    <td className="text-right py-2">{formatCurrency(data.financialData.year2Projections.netIncome)}</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2">Year 3</td>
                    <td className="text-right py-2">{formatCurrency(data.financialData.year3Projections.totalRevenue)}</td>
                    <td className="text-right py-2">{formatCurrency(data.financialData.year3Projections.totalExpenses)}</td>
                    <td className="text-right py-2">{formatCurrency(data.financialData.year3Projections.netIncome)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Public Support Classification */}
        <Card>
          <CardHeader>
            <CardTitle>Public Support Classification</CardTitle>
          </CardHeader>
          <CardContent className="text-sm">
            <div>
              <strong>Classification:</strong> {data.publicSupportTest.publicSupportType}
            </div>
            {data.publicSupportTest.supportCalculationMethod && (
              <div>
                <strong>Method:</strong> {data.publicSupportTest.supportCalculationMethod}
              </div>
            )}
            <div>
              <strong>Unusual Grants Expected:</strong> {data.publicSupportTest.unusualGrants ? 'Yes' : 'No'}
            </div>
          </CardContent>
        </Card>

        {/* Next Steps */}
        <Card className="bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-blue-800">Next Steps After Download</CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="list-decimal list-inside space-y-2 text-sm text-blue-700">
              <li>Review the downloaded Form 1023 for accuracy</li>
              <li>Have the authorized official sign and date the form</li>
              <li>Include required user fee (check current IRS fee schedule)</li>
              <li>Mail completed application to the IRS</li>
              <li>Apply for EIN if not already obtained</li>
              <li>File state-level nonprofit registration if required</li>
              <li>Once approved, apply for Google Ad Grants at grants.google.com</li>
            </ol>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ReviewStep;