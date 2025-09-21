import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, Trash2 } from 'lucide-react';
import { GovernanceStructure, BoardMember } from '@/types/nonprofit';

interface GovernanceStepProps {
  data: GovernanceStructure;
  onChange: (data: GovernanceStructure) => void;
}

const GovernanceStep: React.FC<GovernanceStepProps> = ({ data, onChange }) => {
  const updateField = (field: keyof GovernanceStructure, value: any) => {
    onChange({ ...data, [field]: value });
  };

  const addBoardMember = () => {
    const newMember: BoardMember = {
      name: '',
      title: '',
      address: '',
      compensation: 0,
      hoursPerWeek: 0,
      relationshipToOrg: ''
    };
    updateField('boardMembers', [...data.boardMembers, newMember]);
  };

  const updateBoardMember = (index: number, field: keyof BoardMember, value: any) => {
    const updated = data.boardMembers.map((member, i) =>
      i === index ? { ...member, [field]: value } : member
    );
    updateField('boardMembers', updated);
  };

  const removeBoardMember = (index: number) => {
    const updated = data.boardMembers.filter((_, i) => i !== index);
    updateField('boardMembers', updated);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Board of Directors</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            At least 3 board members are required. Include all directors, officers, and key employees.
          </p>
          
          {data.boardMembers.map((member, index) => (
            <Card key={index} className="border-muted">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-lg">Board Member #{index + 1}</CardTitle>
                  {data.boardMembers.length > 1 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removeBoardMember(index)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor={`name-${index}`}>Full Name *</Label>
                    <Input
                      id={`name-${index}`}
                      value={member.name}
                      onChange={(e) => updateBoardMember(index, 'name', e.target.value)}
                      placeholder="John Smith"
                    />
                  </div>
                  <div>
                    <Label htmlFor={`title-${index}`}>Title *</Label>
                    <Input
                      id={`title-${index}`}
                      value={member.title}
                      onChange={(e) => updateBoardMember(index, 'title', e.target.value)}
                      placeholder="President, Secretary, etc."
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor={`address-${index}`}>Address *</Label>
                  <Input
                    id={`address-${index}`}
                    value={member.address}
                    onChange={(e) => updateBoardMember(index, 'address', e.target.value)}
                    placeholder="123 Main St, City, State 12345"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor={`compensation-${index}`}>Annual Compensation ($)</Label>
                    <Input
                      id={`compensation-${index}`}
                      type="number"
                      min="0"
                      value={member.compensation}
                      onChange={(e) => updateBoardMember(index, 'compensation', Number(e.target.value))}
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <Label htmlFor={`hours-${index}`}>Hours per Week</Label>
                    <Input
                      id={`hours-${index}`}
                      type="number"
                      min="0"
                      max="168"
                      value={member.hoursPerWeek}
                      onChange={(e) => updateBoardMember(index, 'hoursPerWeek', Number(e.target.value))}
                      placeholder="5"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor={`relationship-${index}`}>Relationship to Organization *</Label>
                  <Input
                    id={`relationship-${index}`}
                    value={member.relationshipToOrg}
                    onChange={(e) => updateBoardMember(index, 'relationshipToOrg', e.target.value)}
                    placeholder="Founder, Board Member, etc."
                  />
                </div>
              </CardContent>
            </Card>
          ))}

          <Button onClick={addBoardMember} variant="outline" className="w-full">
            <Plus className="w-4 h-4 mr-2" />
            Add Board Member
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Governance Policies</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="conflictOfInterestPolicy"
              checked={data.conflictOfInterestPolicy}
              onCheckedChange={(checked) => updateField('conflictOfInterestPolicy', checked)}
            />
            <Label htmlFor="conflictOfInterestPolicy">
              Organization has a conflict of interest policy
            </Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="whistleblowerPolicy"
              checked={data.whistleblowerPolicy}
              onCheckedChange={(checked) => updateField('whistleblowerPolicy', checked)}
            />
            <Label htmlFor="whistleblowerPolicy">
              Organization has a whistleblower policy
            </Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="documentRetentionPolicy"
              checked={data.documentRetentionPolicy}
              onCheckedChange={(checked) => updateField('documentRetentionPolicy', checked)}
            />
            <Label htmlFor="documentRetentionPolicy">
              Organization has a document retention and destruction policy
            </Label>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Joint Ventures and Partnerships</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="jointVentures"
              checked={data.jointVentures}
              onCheckedChange={(checked) => updateField('jointVentures', checked)}
            />
            <Label htmlFor="jointVentures">
              Organization plans to participate in joint ventures or partnerships
            </Label>
          </div>

          {data.jointVentures && (
            <div>
              <Label htmlFor="jointVentureDetails">Joint Venture Details</Label>
              <Textarea
                id="jointVentureDetails"
                value={data.jointVentureDetails || ''}
                onChange={(e) => updateField('jointVentureDetails', e.target.value)}
                placeholder="Describe planned joint ventures or partnerships..."
              />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default GovernanceStep;