import { useState } from "react";
import { ExtractedData } from "@/hooks/useVoiceAutoFill";

export interface AutoFillPreview {
  field: string;
  oldValue: string;
  newValue: string;
  confidence: number;
  path: string[];
}

export function useFormAutoFill() {
  const [previewChanges, setPreviewChanges] = useState<AutoFillPreview[]>([]);

  const generateAutoFillPreview = (currentData: any, extractedData: ExtractedData, confidence: Record<string, number>) => {
    const changes: AutoFillPreview[] = [];

    // Helper function to add change if new value exists and is different
    const addChange = (path: string[], fieldName: string, oldValue: string, newValue: string | undefined, confidenceKey: string) => {
      if (newValue && newValue.trim() && newValue !== oldValue) {
        changes.push({
          field: fieldName,
          oldValue: oldValue || '',
          newValue: newValue,
          confidence: confidence[confidenceKey] || 0,
          path
        });
      }
    };

    // Personal information
    if (extractedData.personal) {
      addChange(['fullName'], 'Full Name', currentData.fullName, extractedData.personal.fullName, 'personal.fullName');
      addChange(['dob'], 'Date of Birth', currentData.dob, extractedData.personal.dob, 'personal.dob');
      addChange(['address'], 'Address', currentData.address, extractedData.personal.address, 'personal.address');
      addChange(['state'], 'State', currentData.state, extractedData.personal.state, 'personal.state');
      addChange(['maritalStatus'], 'Marital Status', currentData.maritalStatus, extractedData.personal.maritalStatus, 'personal.maritalStatus');
    }

    // Spouse
    if (extractedData.spouse && extractedData.spouse.name) {
      addChange(['spouse', 'name'], 'Spouse Name', currentData.spouse?.name || '', extractedData.spouse.name, 'spouse.name');
      addChange(['spouse', 'dob'], 'Spouse DOB', currentData.spouse?.dob || '', extractedData.spouse.dob, 'spouse.dob');
      addChange(['spouse', 'address'], 'Spouse Address', currentData.spouse?.address || '', extractedData.spouse.address, 'spouse.address');
    }

    // Executor
    if (extractedData.executor && extractedData.executor.name) {
      addChange(['executor', 'name'], 'Executor Name', currentData.executor?.name || '', extractedData.executor.name, 'executor.name');
      addChange(['executor', 'relationship'], 'Executor Relationship', currentData.executor?.relationship || '', extractedData.executor.relationship, 'executor.relationship');
      addChange(['executor', 'dob'], 'Executor DOB', currentData.executor?.dob || '', extractedData.executor.dob, 'executor.dob');
      addChange(['executor', 'address'], 'Executor Address', currentData.executor?.address || '', extractedData.executor.address, 'executor.address');
    }

    // Alternative Executor
    if (extractedData.altExecutor && extractedData.altExecutor.name) {
      addChange(['altExecutor', 'name'], 'Alt Executor Name', currentData.altExecutor?.name || '', extractedData.altExecutor.name, 'altExecutor.name');
      addChange(['altExecutor', 'relationship'], 'Alt Executor Relationship', currentData.altExecutor?.relationship || '', extractedData.altExecutor.relationship, 'altExecutor.relationship');
    }

    // Guardian
    if (extractedData.guardian && extractedData.guardian.name) {
      addChange(['guardian', 'name'], 'Guardian Name', currentData.guardian?.name || '', extractedData.guardian.name, 'guardian.name');
      addChange(['guardian', 'relationship'], 'Guardian Relationship', currentData.guardian?.relationship || '', extractedData.guardian.relationship, 'guardian.relationship');
      addChange(['addGuardians'], 'Add Guardians', currentData.addGuardians ? 'true' : 'false', 'true', 'guardian.name');
    }

    // Alternative Guardian
    if (extractedData.altGuardian && extractedData.altGuardian.name) {
      addChange(['altGuardian', 'name'], 'Alt Guardian Name', currentData.altGuardian?.name || '', extractedData.altGuardian.name, 'altGuardian.name');
      addChange(['altGuardian', 'relationship'], 'Alt Guardian Relationship', currentData.altGuardian?.relationship || '', extractedData.altGuardian.relationship, 'altGuardian.relationship');
    }

    // Pets
    if (extractedData.pets) {
      addChange(['petName'], 'Pet Name', currentData.petName || '', extractedData.pets.petName, 'pets.petName');
      addChange(['petType'], 'Pet Type', currentData.petType || '', extractedData.pets.petType, 'pets.petType');
      addChange(['petCaregiver'], 'Pet Caregiver', currentData.petCaregiver || '', extractedData.pets.petCaregiver, 'pets.petCaregiver');
      addChange(['petInstructions'], 'Pet Instructions', currentData.petInstructions || '', extractedData.pets.petInstructions, 'pets.petInstructions');
    }

    // Funeral preferences
    if (extractedData.funeral) {
      addChange(['funeralPreference'], 'Funeral Preference', currentData.funeralPreference || '', extractedData.funeral.funeralPreference, 'funeral.funeralPreference');
      addChange(['funeralInstructions'], 'Funeral Instructions', currentData.funeralInstructions || '', extractedData.funeral.funeralInstructions, 'funeral.funeralInstructions');
    }

    // Beneficiaries - handle as additions to existing array
    if (extractedData.beneficiaries && extractedData.beneficiaries.length > 0) {
      extractedData.beneficiaries.forEach((beneficiary, index) => {
        if (beneficiary.name) {
          const existingBeneficiary = currentData.beneficiaries?.[index];
          addChange(['beneficiaries', index.toString(), 'name'], `Beneficiary ${index + 1} Name`, existingBeneficiary?.name || '', beneficiary.name, `beneficiaries.${index}.name`);
          addChange(['beneficiaries', index.toString(), 'relationship'], `Beneficiary ${index + 1} Relationship`, existingBeneficiary?.relationship || '', beneficiary.relationship, `beneficiaries.${index}.relationship`);
          addChange(['beneficiaries', index.toString(), 'dob'], `Beneficiary ${index + 1} DOB`, existingBeneficiary?.dob || '', beneficiary.dob, `beneficiaries.${index}.dob`);
        }
      });
    }

    // Gifts - handle as additions to existing array
    if (extractedData.gifts && extractedData.gifts.length > 0) {
      extractedData.gifts.forEach((gift, index) => {
        if (gift.description) {
          addChange(['gifts', index.toString(), 'description'], `Gift ${index + 1} Description`, '', gift.description, `gifts.${index}.description`);
          addChange(['gifts', index.toString(), 'beneficiary'], `Gift ${index + 1} Beneficiary`, '', gift.beneficiary || '', `gifts.${index}.beneficiary`);
        }
      });
    }

    return changes;
  };

  const applyAutoFill = (currentData: any, extractedData: ExtractedData, approvedChanges: AutoFillPreview[]) => {
    const newData = JSON.parse(JSON.stringify(currentData)); // Deep clone

    approvedChanges.forEach(change => {
      let target = newData;
      
      // Navigate to the target object
      for (let i = 0; i < change.path.length - 1; i++) {
        const key = change.path[i];
        
        if (key === 'beneficiaries' || key === 'gifts') {
          if (!target[key]) target[key] = [];
          const index = parseInt(change.path[i + 1], 10);
          if (!target[key][index]) {
            // Initialize object for beneficiaries/gifts
            target[key][index] = key === 'beneficiaries' 
              ? { name: '', dob: '', relationship: '' }
              : { description: '', beneficiary: '' };
          }
          target = target[key][index];
          i++; // Skip the index path element
        } else if (key === 'spouse' || key === 'executor' || key === 'altExecutor' || key === 'guardian' || key === 'altGuardian') {
          if (!target[key]) {
            target[key] = { name: '', dob: '', address: '', relationship: '' };
          }
          target = target[key];
        } else {
          target = target[key];
        }
      }

      // Set the final value
      const finalKey = change.path[change.path.length - 1];
      if (finalKey === 'addGuardians') {
        target[finalKey] = change.newValue === 'true';
      } else {
        target[finalKey] = change.newValue;
      }
    });

    return newData;
  };

  return {
    generateAutoFillPreview,
    applyAutoFill,
    previewChanges,
    setPreviewChanges
  };
}