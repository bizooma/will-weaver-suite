import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { FinancialData, YearlyFinancials } from '@/types/nonprofit';

interface FinancialDataStepProps {
  data: FinancialData;
  onChange: (data: FinancialData) => void;
}

const FinancialDataStep: React.FC<FinancialDataStepProps> = ({ data, onChange }) => {
  const updateField = (field: keyof FinancialData, value: any) => {
    onChange({ ...data, [field]: value });
  };

  const updateFinancials = (
    year: 'currentYearProjections' | 'year2Projections' | 'year3Projections',
    field: keyof YearlyFinancials,
    value: number
  ) => {
    const updated = { ...data[year], [field]: value };
    // Auto-calculate totals
    if (field !== 'totalRevenue' && field !== 'totalExpenses' && field !== 'netIncome') {
      if (['contributions', 'programServiceRevenue', 'investmentIncome', 'otherRevenue'].includes(field)) {
        updated.totalRevenue = updated.contributions + updated.programServiceRevenue + updated.investmentIncome + updated.otherRevenue;
      }
      if (['programServices', 'managementGeneral', 'fundraising'].includes(field)) {
        updated.totalExpenses = updated.programServices + updated.managementGeneral + updated.fundraising;
      }
      updated.netIncome = updated.totalRevenue - updated.totalExpenses;
    }
    updateField(year, updated);
  };

  const renderFinancialYear = (
    year: 'currentYearProjections' | 'year2Projections' | 'year3Projections',
    title: string,
    yearData: YearlyFinancials
  ) => (
    <Card key={year}>
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="font-semibold mb-3">Revenue</h4>
            <div className="space-y-3">
              <div>
                <Label htmlFor={`${year}-contributions`}>Contributions & Grants</Label>
                <Input
                  id={`${year}-contributions`}
                  type="number"
                  min="0"
                  value={yearData.contributions}
                  onChange={(e) => updateFinancials(year, 'contributions', Number(e.target.value))}
                />
              </div>
              <div>
                <Label htmlFor={`${year}-programServiceRevenue`}>Program Service Revenue</Label>
                <Input
                  id={`${year}-programServiceRevenue`}
                  type="number"
                  min="0"
                  value={yearData.programServiceRevenue}
                  onChange={(e) => updateFinancials(year, 'programServiceRevenue', Number(e.target.value))}
                />
              </div>
              <div>
                <Label htmlFor={`${year}-investmentIncome`}>Investment Income</Label>
                <Input
                  id={`${year}-investmentIncome`}
                  type="number"
                  min="0"
                  value={yearData.investmentIncome}
                  onChange={(e) => updateFinancials(year, 'investmentIncome', Number(e.target.value))}
                />
              </div>
              <div>
                <Label htmlFor={`${year}-otherRevenue`}>Other Revenue</Label>
                <Input
                  id={`${year}-otherRevenue`}
                  type="number"
                  min="0"
                  value={yearData.otherRevenue}
                  onChange={(e) => updateFinancials(year, 'otherRevenue', Number(e.target.value))}
                />
              </div>
              <div className="pt-2 border-t">
                <Label className="font-semibold">Total Revenue: ${yearData.totalRevenue.toLocaleString()}</Label>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-3">Expenses</h4>
            <div className="space-y-3">
              <div>
                <Label htmlFor={`${year}-programServices`}>Program Services</Label>
                <Input
                  id={`${year}-programServices`}
                  type="number"
                  min="0"
                  value={yearData.programServices}
                  onChange={(e) => updateFinancials(year, 'programServices', Number(e.target.value))}
                />
              </div>
              <div>
                <Label htmlFor={`${year}-managementGeneral`}>Management & General</Label>
                <Input
                  id={`${year}-managementGeneral`}
                  type="number"
                  min="0"
                  value={yearData.managementGeneral}
                  onChange={(e) => updateFinancials(year, 'managementGeneral', Number(e.target.value))}
                />
              </div>
              <div>
                <Label htmlFor={`${year}-fundraising`}>Fundraising</Label>
                <Input
                  id={`${year}-fundraising`}
                  type="number"
                  min="0"
                  value={yearData.fundraising}
                  onChange={(e) => updateFinancials(year, 'fundraising', Number(e.target.value))}
                />
              </div>
              <div className="pt-2 border-t">
                <Label className="font-semibold">Total Expenses: ${yearData.totalExpenses.toLocaleString()}</Label>
              </div>
              <div className="pt-2 border-t">
                <Label className={`font-semibold ${yearData.netIncome >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  Net Income: ${yearData.netIncome.toLocaleString()}
                </Label>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Accounting Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="accountingPeriodEnd">Accounting Period End *</Label>
            <Input
              id="accountingPeriodEnd"
              value={data.accountingPeriodEnd}
              onChange={(e) => updateField('accountingPeriodEnd', e.target.value)}
              placeholder="December 31"
            />
          </div>

          <div>
            <Label htmlFor="accountingMethod">Accounting Method *</Label>
            <Select
              value={data.accountingMethod}
              onValueChange={(value) => updateField('accountingMethod', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select accounting method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cash">Cash Basis</SelectItem>
                <SelectItem value="accrual">Accrual Basis</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <h3 className="text-xl font-semibold">Three-Year Financial Projections</h3>
        {renderFinancialYear('currentYearProjections', 'Current Year', data.currentYearProjections)}
        {renderFinancialYear('year2Projections', 'Year 2', data.year2Projections)}
        {renderFinancialYear('year3Projections', 'Year 3', data.year3Projections)}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Fundraising Plans</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="grantWritingPlanned"
              checked={data.grantWritingPlanned}
              onCheckedChange={(checked) => updateField('grantWritingPlanned', checked)}
            />
            <Label htmlFor="grantWritingPlanned">
              Organization plans to write grants
            </Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="fundraisingPlanned"
              checked={data.fundraisingPlanned}
              onCheckedChange={(checked) => updateField('fundraisingPlanned', checked)}
            />
            <Label htmlFor="fundraisingPlanned">
              Organization plans other fundraising activities
            </Label>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FinancialDataStep;