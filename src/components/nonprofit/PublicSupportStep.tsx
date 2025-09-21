import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { PublicSupportTest } from '@/types/nonprofit';

interface PublicSupportStepProps {
  data: PublicSupportTest;
  onChange: (data: PublicSupportTest) => void;
}

const PublicSupportStep: React.FC<PublicSupportStepProps> = ({ data, onChange }) => {
  const updateField = (field: keyof PublicSupportTest, value: any) => {
    onChange({ ...data, [field]: value });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Public Charity Classification</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="publicSupportType">Public Support Type *</Label>
            <Select
              value={data.publicSupportType}
              onValueChange={(value) => updateField('publicSupportType', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select public support type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="public-charity-509a1">
                  Public Charity - 509(a)(1) - Churches, schools, hospitals, etc.
                </SelectItem>
                <SelectItem value="public-charity-509a2">
                  Public Charity - 509(a)(2) - Publicly supported organization
                </SelectItem>
                <SelectItem value="private-foundation">
                  Private Foundation
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {(data.publicSupportType === 'public-charity-509a1' || data.publicSupportType === 'public-charity-509a2') && (
            <div>
              <Label htmlFor="supportCalculationMethod">Support Calculation Method</Label>
              <Select
                value={data.supportCalculationMethod || ''}
                onValueChange={(value) => updateField('supportCalculationMethod', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select calculation method" />
                </SelectTrigger>
                <SelectContent>
                  {data.publicSupportType === 'public-charity-509a1' && (
                    <>
                      <SelectItem value="509a1-170b1Aii">
                        509(a)(1) - 170(b)(1)(A)(ii) - Educational institution
                      </SelectItem>
                      <SelectItem value="509a1-170b1Aiii">
                        509(a)(1) - 170(b)(1)(A)(iii) - Hospital or medical research
                      </SelectItem>
                    </>
                  )}
                  {data.publicSupportType === 'public-charity-509a2' && (
                    <SelectItem value="509a2">
                      509(a)(2) - Publicly supported organization
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Support Test Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="font-semibold text-blue-900 mb-2">Public Support Test Requirements</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• 509(a)(1): Must receive substantial support from government or general public</li>
              <li>• 509(a)(2): Must receive at least 1/3 of support from public sources</li>
              <li>• Private Foundation: Organizations that don't qualify as public charities</li>
            </ul>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="unusualGrants"
              checked={data.unusualGrants}
              onCheckedChange={(checked) => updateField('unusualGrants', checked)}
            />
            <Label htmlFor="unusualGrants">
              Organization expects to receive unusual grants
            </Label>
          </div>

          {data.unusualGrants && (
            <div>
              <Label htmlFor="unusualGrantsExplanation">Unusual Grants Explanation</Label>
              <Textarea
                id="unusualGrantsExplanation"
                value={data.unusualGrantsExplanation || ''}
                onChange={(e) => updateField('unusualGrantsExplanation', e.target.value)}
                placeholder="Explain the nature and circumstances of unusual grants..."
                className="min-h-[100px]"
              />
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Google Ad Grant Eligibility</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <h4 className="font-semibold text-green-900 mb-2">Ad Grant Requirements</h4>
            <ul className="text-sm text-green-800 space-y-1">
              <li>• Must be a 501(c)(3) tax-exempt organization</li>
              <li>• Must have a functioning website with substantial content</li>
              <li>• Must acknowledge receipt of the grant in advertising</li>
              <li>• Cannot be government entities, hospitals, or schools (with some exceptions)</li>
            </ul>
            <p className="text-sm text-green-700 mt-3">
              <strong>Note:</strong> While ads will promote your nonprofit foundation, your law firm 
              will gain valuable community exposure and recognition through this association.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PublicSupportStep;