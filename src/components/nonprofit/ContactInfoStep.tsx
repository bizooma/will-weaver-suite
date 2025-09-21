import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ContactInfo } from '@/types/nonprofit';

interface ContactInfoStepProps {
  data: ContactInfo;
  onChange: (data: ContactInfo) => void;
}

const ContactInfoStep: React.FC<ContactInfoStepProps> = ({ data, onChange }) => {
  const updateField = (field: keyof ContactInfo, value: string) => {
    onChange({ ...data, [field]: value });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Primary Contact Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="contactPersonName">Contact Person Name *</Label>
            <Input
              id="contactPersonName"
              value={data.contactPersonName}
              onChange={(e) => updateField('contactPersonName', e.target.value)}
              placeholder="Full name of primary contact"
            />
          </div>

          <div>
            <Label htmlFor="contactPersonTitle">Contact Person Title *</Label>
            <Input
              id="contactPersonTitle"
              value={data.contactPersonTitle}
              onChange={(e) => updateField('contactPersonTitle', e.target.value)}
              placeholder="President, Executive Director, etc."
            />
          </div>

          <div>
            <Label htmlFor="phone">Phone Number *</Label>
            <Input
              id="phone"
              type="tel"
              value={data.phone}
              onChange={(e) => updateField('phone', e.target.value)}
              placeholder="(555) 123-4567"
            />
          </div>

          <div>
            <Label htmlFor="email">Email Address *</Label>
            <Input
              id="email"
              type="email"
              value={data.email}
              onChange={(e) => updateField('email', e.target.value)}
              placeholder="contact@organization.org"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Authorized Official</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="authorizedOfficialName">Authorized Official Name *</Label>
            <Input
              id="authorizedOfficialName"
              value={data.authorizedOfficialName}
              onChange={(e) => updateField('authorizedOfficialName', e.target.value)}
              placeholder="Person authorized to sign legal documents"
            />
          </div>

          <div>
            <Label htmlFor="authorizedOfficialTitle">Authorized Official Title *</Label>
            <Input
              id="authorizedOfficialTitle"
              value={data.authorizedOfficialTitle}
              onChange={(e) => updateField('authorizedOfficialTitle', e.target.value)}
              placeholder="President, Board Chair, etc."
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ContactInfoStep;