// Shared Last Will & Testament text generator.
// Used by the Will Creator wizard AND the shared /drafts/:slug view so both
// render (and export) the exact same formatted document from the same data.
// Kept intentionally permissive on shape — accepts partial drafts loaded
// from the DB.

export type WillTemplateData = {
  fullName?: string;
  dob?: string;
  address?: string;
  zipCode?: string;
  state?: string;
  maritalStatus?: "single" | "married" | "divorced" | "widowed" | "";
  spouse?: { name?: string } | null;
  beneficiaries?: Array<{ name?: string; dob?: string; relationship?: string }>;
  executor?: { name?: string; address?: string } | null;
  altExecutor?: { name?: string; address?: string } | null;
  addGuardians?: boolean;
  guardian?: { name?: string; address?: string } | null;
  altGuardian?: { name?: string; address?: string } | null;
  guardianInstructions?: string;
  altGuardianInstructions?: string;
  gifts?: Array<{ description?: string; beneficiary?: string }>;
  residue?: Array<{ beneficiary?: string; percentage?: string }>;
  petName?: string;
  petType?: string;
  petCaregiver?: string;
  petInstructions?: string;
  funeralPreference?: "burial" | "cremation" | "no_preference" | "";
  funeralInstructions?: string;
  witnesses?: string[];
};

/**
 * Produce the plaintext will document. Same output the Will Creator preview
 * renders, so DraftView + DOCX export stay in sync with the wizard.
 */
export function generateWillText(data: WillTemplateData): string {
  const beneficiaries = data.beneficiaries ?? [];
  const gifts = data.gifts ?? [];
  const residue = data.residue ?? [];
  const witnesses = data.witnesses ?? [];

  const bList = beneficiaries
    .filter((b) => b?.name)
    .map(
      (b, i) =>
        `${i + 1}) ${b.name}${b.dob ? ` (b. ${b.dob})` : ""} – ${b.relationship ?? ""}`,
    )
    .join("\n");
  const gList = gifts
    .map((g, i) => `${i + 1}) ${g.description ?? ""} → ${g.beneficiary ?? ""}`)
    .join("\n");
  const rList = residue
    .map((r, i) => `${i + 1}) ${r.beneficiary ?? ""} (${r.percentage ?? "0"}%)`)
    .join("\n");

  return `LAST WILL AND TESTAMENT OF ${data.fullName?.toUpperCase() || "YOUR NAME"}

I, ${data.fullName || "your name"}, of ${data.address || "your address"}, ${data.state || "your state"}, being of sound mind and memory, do hereby make, publish and declare this to be my Last Will and Testament.

ARTICLE I - REVOCATION
I hereby revoke all former wills and codicils heretofore made by me.

ARTICLE II - IDENTIFICATION
${data.dob ? `I was born on ${data.dob}.` : ""}
${data.maritalStatus === "married" && data.spouse?.name ? `I am married to ${data.spouse.name}.` : ""}
${data.maritalStatus === "single" ? "I am unmarried." : ""}
${data.maritalStatus === "divorced" ? "I am divorced." : ""}
${data.maritalStatus === "widowed" ? "I am widowed." : ""}

ARTICLE III - BENEFICIARIES
${bList || "No beneficiaries listed."}

ARTICLE IV - EXECUTOR
I nominate ${data.executor?.name || "[Executor Name]"}${data.executor?.address ? `, of ${data.executor.address},` : ""} to serve as Executor of this Will.
${data.altExecutor?.name ? `If my primary Executor is unable or unwilling to serve, I nominate ${data.altExecutor.name}${data.altExecutor.address ? `, of ${data.altExecutor.address},` : ""} as alternate Executor.` : ""}

${data.addGuardians && data.guardian?.name ? `ARTICLE V - GUARDIANSHIP
I nominate ${data.guardian.name}${data.guardian.address ? `, of ${data.guardian.address},` : ""} as guardian for any minor children.
${data.guardianInstructions ? `\nGuardian Instructions: ${data.guardianInstructions}` : ""}
${data.altGuardian?.name ? `\nIf my primary guardian is unable or unwilling to serve, I nominate ${data.altGuardian.name}${data.altGuardian.address ? `, of ${data.altGuardian.address},` : ""} as alternate guardian.` : ""}
${data.altGuardianInstructions ? `\nAlternate Guardian Instructions: ${data.altGuardianInstructions}` : ""}` : ""}

${gifts.length > 0 ? `ARTICLE VI - SPECIFIC GIFTS
${gList}` : ""}

ARTICLE VII - RESIDUARY ESTATE
I give the rest, residue, and remainder of my estate to:
${rList}

${data.petName ? `ARTICLE VIII - PET CARE
I direct that my ${data.petType || "pet"} named ${data.petName} be cared for by ${data.petCaregiver || "[Pet Caregiver]"}.
${data.petInstructions ? `Pet Care Instructions: ${data.petInstructions}` : ""}` : ""}

${data.funeralInstructions || (data.funeralPreference && (data.funeralPreference as string) !== "") ? `ARTICLE IX - FUNERAL ARRANGEMENTS
${data.funeralPreference === "burial" ? "I prefer burial." : ""}
${data.funeralPreference === "cremation" ? "I prefer cremation." : ""}
${data.funeralPreference === "no_preference" ? "I have no specific preference for burial or cremation." : ""}
${data.funeralInstructions ? `\nFuneral Instructions: ${data.funeralInstructions}` : ""}` : ""}

ARTICLE X - EXECUTION
IN WITNESS WHEREOF, I have executed this Last Will and Testament on the _____ day of __________, 20__.

_________________________________
${data.fullName || "Your Signature"}


WITNESSES:
We, the undersigned, certify that the testator signed this Will in our presence, that we witnessed the signing, and that we signed below in the testator's presence and in the presence of each other.

Witness 1: ${witnesses[0] || "___________________________"}    Date: ________

Witness 2: ${witnesses[1] || "___________________________"}    Date: ________

[Note: This is a draft document. Consult with a licensed attorney before execution.]`;
}
