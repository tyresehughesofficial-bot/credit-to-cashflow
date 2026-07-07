# Triad T — Specialty Dispute Templates (source reference)

Extracted from the 3 PDFs provided by the owner. These power the in-app
**Specialty Letters** generator (Client Command Center → Strategy) and the
**Secondary CRA / Identity Theft** intelligence in Bureau Intelligence.

---

## 1. LexisNexis Dispute (secondary consumer reporting agency)
**To:** LEXISNEXIS · P.O. BOX 105108 · ATLANTA, GA 30348
**Subject:** REQUEST LETTER TO REMOVE INACCURATE INFORMATION

Key points: formal FCRA dispute citing §1681a(f) (CRA), §1681e(b) (maximum
possible accuracy), §1681i (investigation), §1681b (permissible purpose),
§1681g (file disclosure). Demands verifiable documentary proof (original
contract with wet-ink signature) or removal within 30 days. Includes an
identity-verification block (name, SSN, DOB, address, phone, email) and an
itemized "Exhibit A" list of disputed accounts/inquiries. Sent certified mail.

## 2. Identity Theft Affidavit
Sworn statement (penalty of perjury) to report fraudulent accounts. Sections:
1. Victim Information (name, DOB, address, phone, email)
2. Incident Description (how/when discovered)
3. Fraudulent Accounts or Transactions (creditor · account # · date · amount/type)
4. Supporting Documents (gov ID, proof of address, police/FTC identity-theft report)
5. Statement of Truth + signature/date/printed name + optional notary
Used to trigger an **FCRA §605B block** (blocked within 4 business days of a
valid identity-theft report).

## 3. Early Warning Services Dispute (banking CRA)
**To:** Early Warning Services, LLC · 16552 North 90th Street, Suite 100 ·
Scottsdale, AZ 85260 · (800) 325-7775

Disputes fraudulent **deposit/bank** accounts (Citibank, BofA, Discover, Wells
Fargo, etc.) listed on the EWS consumer report — bank name, open date, account
#, routing #. States identity theft, requests immediate deletion, attaches the
report.

---

### How it's wired into the app
- **Generator:** `src/lib/credit/letter-templates.ts` — `lexisNexisLetter()`,
  `earlyWarningLetter()`, `identityTheftAffidavit()` (pre-fill from client data).
- **UI:** Client Command Center → a client → **Strategy** tab → **Specialty
  Dispute Letters** (buttons + copy-ready output).
- **Knowledge:** Bureau Intelligence → **Item Intelligence** → "Secondary CRA
  Intelligence" + "Identity Theft Intelligence" (addresses, playbook, legal basis).
