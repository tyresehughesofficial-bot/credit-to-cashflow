/**
 * Specialty dispute letters — beyond the 3 credit bureaus.
 * Built from Triad T's own templates:
 *   • LexisNexis (secondary consumer reporting agency)
 *   • Early Warning Services (banking CRA)
 *   • FTC-style Identity Theft Affidavit (for fraudulent accounts)
 *
 * Each returns copy-ready text, pre-filled with the client's data and clear
 * [PLACEHOLDERS] for anything not on file (SSN, DOB, etc.).
 */

export interface LetterClient {
  name: string;
  address?: string;
  dob?: string;
  ssnLast4?: string;
  phone?: string;
  email?: string;
}
export interface DisputedItem {
  creditor: string;
  detail?: string; // account #, type, etc.
}

const today = () => new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
const line = (label: string, value?: string) => `${label}: ${value && value.trim() ? value : `[${label.toUpperCase()}]`}`;

/* ── LexisNexis (secondary CRA / data broker) ──────────────────────────────── */
export function lexisNexisLetter(c: LetterClient, items: DisputedItem[]): string {
  const list = items.length
    ? items.map((it, i) => `  ${i + 1}. ${it.creditor}${it.detail ? ` — ${it.detail}` : ""}`).join("\n")
    : "  1. [ACCOUNT / ITEM]";
  return (
    `${c.name}\n${c.address ?? "[YOUR ADDRESS]"}\n${today()}\n\n` +
    `LEXISNEXIS\nP.O. BOX 105108\nATLANTA, GA 30348\n\n` +
    `Subject: REQUEST LETTER TO REMOVE INACCURATE INFORMATION\n\n` +
    `To Whom It May Concern,\n\n` +
    `Please accept this formal letter as my first request to investigate and remove derogatory ` +
    `accounts/items from my consumer report. Going over my report, I have found it has errors and is ` +
    `reporting what I believe to be inaccurate data, which I dispute. As a consumer reporting agency ` +
    `(15 U.S.C. §1681a(f)), you are governed by the Fair Credit Reporting Act (FCRA), 15 U.S.C. §1681 et seq., ` +
    `which protects consumers from inaccurate, outdated, or unverifiable reporting.\n\n` +
    `Under federal law you are required to, among other things:\n` +
    `1) follow reasonable procedures to assure maximum possible accuracy (15 U.S.C. §1681e(b));\n` +
    `2) comply with the investigation requirements of 15 U.S.C. §1681i;\n` +
    `3) furnish files only to those with a permissible purpose (15 U.S.C. §1681b);\n` +
    `4) provide the consumer file pursuant to 15 U.S.C. §1681g.\n\n` +
    `Accordingly, I request verifiable documentary proof (e.g., the original consumer contract bearing my ` +
    `wet-ink signature) for the accounts/items listed below. Under the FCRA, if you cannot provide documented, ` +
    `verifiable proof, you must remove all unverified, invalid, or derogatory information from my consumer report. ` +
    `The following items are neither my debts nor my authorized inquiries — please correct this by removing them:\n\n` +
    `${list}\n\n` +
    `Upon completion of your investigation, please send a detailed description of the procedures used to determine ` +
    `accuracy, and the name and contact information of the agent who conducted it.\n\n` +
    `Identity verification:\n` +
    `${line("Full Name", c.name)}\n${line("Social Security Number", c.ssnLast4 ? `XXX-XX-${c.ssnLast4}` : "")}\n` +
    `${line("Date of Birth", c.dob)}\n${line("Address", c.address)}\n${line("Phone Number", c.phone)}\n${line("Email", c.email)}\n\n` +
    `I sent this letter via certified mail to ensure resolution within the required thirty (30) day window. ` +
    `Please send me a copy of the corrected consumer report.\n\nThank you for your assistance.\n\nSincerely,\n${c.name}`
  );
}

/* ── Early Warning Services (banking CRA) ──────────────────────────────────── */
export function earlyWarningLetter(c: LetterClient, items: DisputedItem[]): string {
  const list = items.length
    ? items.map((it) => `Bank: ${it.creditor}${it.detail ? `\n${it.detail}` : ""}`).join("\n\n")
    : "Bank: [BANK NAME] (Open Date: [DATE])\nAccount #: [ACCOUNT]\nRouting #: [ROUTING]";
  return (
    `${line("Name", c.name)}\n${line("Date of Birth", c.dob)}\n${line("SSN", c.ssnLast4 ? `XXX-XX-${c.ssnLast4}` : "")}\n${line("Address", c.address)}\n\n` +
    `Early Warning Services, LLC\n16552 North 90th Street, Suite 100\nScottsdale, AZ 85260\n(800) 325-7775\n\n` +
    `I am writing to request an investigation of the following information that appears on my Early Warning ` +
    `Services consumer report. I have NEVER opened or used the following accounts:\n\n` +
    `${list}\n\n` +
    `I do not recognize the accounts above. I am a victim of identity theft and I request that this information ` +
    `be deleted from my Early Warning Services consumer report immediately. I have attached a copy of the report ` +
    `to this request.\n\nThank you for your assistance.\n\nSincerely,\n${c.name}`
  );
}

/* ── Identity Theft Affidavit ──────────────────────────────────────────────── */
export function identityTheftAffidavit(c: LetterClient, accounts: DisputedItem[]): string {
  const rows = accounts.length
    ? accounts.map((a) => `  • ${a.creditor}${a.detail ? ` — ${a.detail}` : ""}`).join("\n")
    : "  • [CREDITOR / INSTITUTION] — [ACCOUNT #] — [DATE] — [AMOUNT/TYPE]";
  return (
    `IDENTITY THEFT AFFIDAVIT\nUse this affidavit to report fraudulent accounts or activity resulting from identity theft.\n\n` +
    `SECTION 1 — VICTIM INFORMATION\n` +
    `${line("Full Legal Name", c.name)}\n${line("Date of Birth", c.dob)}\n${line("Current Address", c.address)}\n` +
    `${line("Phone Number", c.phone)}\n${line("Email Address", c.email)}\n\n` +
    `SECTION 2 — INCIDENT DESCRIPTION\n` +
    `Describe how you discovered the identity theft, when it occurred, and any known fraudulent activity:\n[DESCRIBE HERE]\n\n` +
    `SECTION 3 — FRAUDULENT ACCOUNTS OR TRANSACTIONS\n${rows}\n\n` +
    `SECTION 4 — SUPPORTING DOCUMENTS\nAttach government-issued ID, proof of address, and any police or FTC identity-theft reports.\n\n` +
    `SECTION 5 — STATEMENT OF TRUTH\n` +
    `I declare under penalty of perjury that the information provided in this affidavit is true and correct. ` +
    `I am a victim of identity theft, and the accounts listed above were opened or used without my authorization.\n\n` +
    `Signature: ____________________________   Date: ____________\n` +
    `Printed Name: ${c.name}\n` +
    `Notary Public (if applicable): ____________________________   Seal:`
  );
}

export const SPECIALTY_LETTERS = [
  { key: "lexisnexis", label: "LexisNexis Dispute", desc: "Secondary consumer reporting agency (data broker)." },
  { key: "earlywarning", label: "Early Warning Services", desc: "Banking CRA — fraudulent deposit/bank accounts." },
  { key: "idtheft", label: "Identity Theft Affidavit", desc: "Sworn statement for fraudulent accounts (FCRA §605B block)." },
] as const;
export type SpecialtyLetterKey = (typeof SPECIALTY_LETTERS)[number]["key"];
