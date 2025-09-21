import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { LegalCompliance } from '@/types/nonprofit';

interface LegalComplianceStepProps {
  data: LegalCompliance;
  onChange: (data: LegalCompliance) => void;
}

const LegalComplianceStep: React.FC<LegalComplianceStepProps> = ({ data, onChange }) => {
  const updateField = (field: keyof LegalCompliance, value: any) => {
    onChange({ ...data, [field]: value });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Required Documents</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="hasArticlesOfIncorporation"
              checked={data.hasArticlesOfIncorporation}
              onCheckedChange={(checked) => updateField('hasArticlesOfIncorporation', checked)}
            />
            <Label htmlFor="hasArticlesOfIncorporation">
              Organization has Articles of Incorporation or organizing document
            </Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="hasBylaws"
              checked={data.hasBylaws}
              onCheckedChange={(checked) => updateField('hasBylaws', checked)}
            />
            <Label htmlFor="hasBylaws">
              Organization has Bylaws
            </Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="hasConflictOfInterestPolicy"
              checked={data.hasConflictOfInterestPolicy}
              onCheckedChange={(checked) => updateField('hasConflictOfInterestPolicy', checked)}
            />
            <Label htmlFor="hasConflictOfInterestPolicy">
              Organization has a Conflict of Interest Policy
            </Label>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Political Activities</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="politicalActivities"
              checked={data.politicalActivities}
              onCheckedChange={(checked) => updateField('politicalActivities', checked)}
            />
            <Label htmlFor="politicalActivities">
              Organization plans to engage in political activities
            </Label>
          </div>

          {data.politicalActivities && (
            <div>
              <Label htmlFor="politicalActivitiesDescription">Political Activities Description</Label>
              <Textarea
                id="politicalActivitiesDescription"
                value={data.politicalActivitiesDescription || ''}
                onChange={(e) => updateField('politicalActivitiesDescription', e.target.value)}
                placeholder="Describe planned political activities..."
                className="min-h-[100px]"
              />
              <p className="text-sm text-yellow-600 mt-2">
                <strong>Warning:</strong> Political campaign activities may jeopardize tax-exempt status
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Lobbying Activities</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="lobbying"
              checked={data.lobbying}
              onCheckedChange={(checked) => updateField('lobbying', checked)}
            />
            <Label htmlFor="lobbying">
              Organization plans to engage in lobbying activities
            </Label>
          </div>

          {data.lobbying && (
            <div>
              <Label htmlFor="lobbyingDescription">Lobbying Activities Description</Label>
              <Textarea
                id="lobbyingDescription"
                value={data.lobbyingDescription || ''}
                onChange={(e) => updateField('lobbyingDescription', e.target.value)}
                placeholder="Describe planned lobbying activities..."
                className="min-h-[100px]"
              />
              <p className="text-sm text-blue-600 mt-2">
                <strong>Note:</strong> Limited lobbying is permitted but must be insubstantial
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Private Benefit</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="privateBenefit"
              checked={data.privateBenefit}
              onCheckedChange={(checked) => updateField('privateBenefit', checked)}
            />
            <Label htmlFor="privateBenefit">
              Any private individual or organization will benefit from the organization's activities
            </Label>
          </div>

          {data.privateBenefit && (
            <div>
              <Label htmlFor="privateBenefitDescription">Private Benefit Description</Label>
              <Textarea
                id="privateBenefitDescription"
                value={data.privateBenefitDescription || ''}
                onChange={(e) => updateField('privateBenefitDescription', e.target.value)}
                placeholder="Describe any private benefits..."
                className="min-h-[100px]"
              />
              <p className="text-sm text-red-600 mt-2">
                <strong>Important:</strong> Private benefit must be incidental to exempt purposes
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Compliance Reminders</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <h4 className="font-semibold text-amber-900 mb-2">Important Legal Requirements</h4>
            <ul className="text-sm text-amber-800 space-y-1">
              <li>• Must operate exclusively for exempt purposes</li>
              <li>• No private inurement to insiders</li>
              <li>• Must file annual Form 990 (with exceptions)</li>
              <li>• Must maintain public inspection requirements</li>
              <li>• State registration may be required</li>
              <li>• Consider professional legal review before filing</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LegalComplianceStep;