import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { PurposeAndActivities } from '@/types/nonprofit';

interface PurposeActivitiesStepProps {
  data: PurposeAndActivities;
  onChange: (data: PurposeAndActivities) => void;
}

const exemptPurposeOptions = [
  'Charitable',
  'Religious',
  'Educational',
  'Scientific',
  'Literary',
  'Testing for public safety',
  'Fostering amateur sports competition',
  'Prevention of cruelty to children or animals'
];

const PurposeActivitiesStep: React.FC<PurposeActivitiesStepProps> = ({ data, onChange }) => {
  const updateField = (field: keyof PurposeAndActivities, value: any) => {
    onChange({ ...data, [field]: value });
  };

  const toggleExemptPurpose = (purpose: string) => {
    const updated = data.exemptPurposes.includes(purpose)
      ? data.exemptPurposes.filter(p => p !== purpose)
      : [...data.exemptPurposes, purpose];
    updateField('exemptPurposes', updated);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Exempt Purposes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Label>Select all that apply to your organization: *</Label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {exemptPurposeOptions.map((purpose) => (
              <div key={purpose} className="flex items-center space-x-2">
                <Checkbox
                  id={purpose}
                  checked={data.exemptPurposes.includes(purpose)}
                  onCheckedChange={() => toggleExemptPurpose(purpose)}
                />
                <Label htmlFor={purpose} className="text-sm font-normal">
                  {purpose}
                </Label>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Activities and Purpose</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="primaryActivity">Primary Activity *</Label>
            <Input
              id="primaryActivity"
              value={data.primaryActivity}
              onChange={(e) => updateField('primaryActivity', e.target.value)}
              placeholder="Brief description of main activity"
            />
          </div>

          <div>
            <Label htmlFor="detailedActivities">Detailed Activities Description *</Label>
            <Textarea
              id="detailedActivities"
              value={data.detailedActivities}
              onChange={(e) => updateField('detailedActivities', e.target.value)}
              placeholder="Provide a comprehensive description of all activities your organization will conduct..."
              className="min-h-[120px]"
            />
          </div>

          <div>
            <Label htmlFor="beneficiaryClass">Class of Beneficiaries *</Label>
            <Input
              id="beneficiaryClass"
              value={data.beneficiaryClass}
              onChange={(e) => updateField('beneficiaryClass', e.target.value)}
              placeholder="Who will benefit from your organization's activities?"
            />
          </div>

          <div>
            <Label htmlFor="geographicArea">Geographic Area Served *</Label>
            <Input
              id="geographicArea"
              value={data.geographicArea}
              onChange={(e) => updateField('geographicArea', e.target.value)}
              placeholder="Local, state, national, international, etc."
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Membership Structure</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="votingMembers"
              checked={data.votingMembers}
              onCheckedChange={(checked) => updateField('votingMembers', checked)}
            />
            <Label htmlFor="votingMembers">
              Organization will have voting members
            </Label>
          </div>

          {data.votingMembers && (
            <div>
              <Label htmlFor="membershipRequirements">Membership Requirements</Label>
              <Textarea
                id="membershipRequirements"
                value={data.membershipRequirements || ''}
                onChange={(e) => updateField('membershipRequirements', e.target.value)}
                placeholder="Describe requirements for becoming a voting member..."
              />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PurposeActivitiesStep;