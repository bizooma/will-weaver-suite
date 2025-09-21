import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { OrganizationInfo } from '@/types/nonprofit';

interface OrganizationInfoStepProps {
  data: OrganizationInfo;
  onChange: (data: OrganizationInfo) => void;
}

const OrganizationInfoStep: React.FC<OrganizationInfoStepProps> = ({ data, onChange }) => {
  const updateField = (field: keyof OrganizationInfo, value: any) => {
    onChange({ ...data, [field]: value });
  };

  const updateAddress = (type: 'mailingAddress' | 'physicalAddress', field: string, value: string) => {
    onChange({
      ...data,
      [type]: { ...data[type], [field]: value }
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Basic Organization Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="legalName">Legal Name of Organization *</Label>
            <Input
              id="legalName"
              value={data.legalName}
              onChange={(e) => updateField('legalName', e.target.value)}
              placeholder="Enter the full legal name"
            />
          </div>

          <div>
            <Label htmlFor="ein">Employer Identification Number (EIN)</Label>
            <Input
              id="ein"
              value={data.ein || ''}
              onChange={(e) => updateField('ein', e.target.value)}
              placeholder="XX-XXXXXXX (if already obtained)"
            />
          </div>

          <div>
            <Label htmlFor="formationDate">Date of Formation *</Label>
            <Input
              id="formationDate"
              type="date"
              value={data.formationDate}
              onChange={(e) => updateField('formationDate', e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="incorporationState">State of Incorporation *</Label>
            <Input
              id="incorporationState"
              value={data.incorporationState}
              onChange={(e) => updateField('incorporationState', e.target.value)}
              placeholder="State where organization was incorporated"
            />
          </div>

          <div>
            <Label htmlFor="organizationalStructure">Organizational Structure *</Label>
            <Select
              value={data.organizationalStructure}
              onValueChange={(value) => updateField('organizationalStructure', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select structure type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="corporation">Corporation</SelectItem>
                <SelectItem value="trust">Trust</SelectItem>
                <SelectItem value="llc">Limited Liability Company (LLC)</SelectItem>
                <SelectItem value="unincorporated-association">Unincorporated Association</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="websiteUrl">Website URL</Label>
            <Input
              id="websiteUrl"
              type="url"
              value={data.websiteUrl || ''}
              onChange={(e) => updateField('websiteUrl', e.target.value)}
              placeholder="https://www.example.org"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Mailing Address</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="mailingStreet">Street Address *</Label>
            <Input
              id="mailingStreet"
              value={data.mailingAddress.street}
              onChange={(e) => updateAddress('mailingAddress', 'street', e.target.value)}
              placeholder="123 Main Street"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="mailingCity">City *</Label>
              <Input
                id="mailingCity"
                value={data.mailingAddress.city}
                onChange={(e) => updateAddress('mailingAddress', 'city', e.target.value)}
                placeholder="City"
              />
            </div>
            <div>
              <Label htmlFor="mailingState">State *</Label>
              <Input
                id="mailingState"
                value={data.mailingAddress.state}
                onChange={(e) => updateAddress('mailingAddress', 'state', e.target.value)}
                placeholder="State"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="mailingZip">ZIP Code *</Label>
            <Input
              id="mailingZip"
              value={data.mailingAddress.zip}
              onChange={(e) => updateAddress('mailingAddress', 'zip', e.target.value)}
              placeholder="12345"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OrganizationInfoStep;