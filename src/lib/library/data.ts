import type { Row } from "@/lib/db/use-collection";

/* Generic template/record seeds for the library + automation pages. */

export interface Template extends Row {
  id: string;
  title: string;
  category: string;
  body: string;
}

export const SMS_SEED: Template[] = [
  { id: "sms-1", title: "Missed call text-back", category: "Follow-up", body: "Hey {{name}}, sorry we missed you! This is Triad T — want me to text you a time to chat about your credit & funding goals?" },
  { id: "sms-2", title: "Consult reminder", category: "Booking", body: "Reminder: your Triad T consult is {{time}}. Reply C to confirm or R to reschedule." },
  { id: "sms-3", title: "No-show re-book", category: "Re-engage", body: "Missed you on the call, {{name}}. No worries — here's my calendar to grab a new time: {{link}}" },
];

export const EMAIL_SEED: Template[] = [
  { id: "em-1", title: "Welcome / onboarding", category: "Onboarding", body: "Welcome to Triad T, {{name}}! Here's what happens next in your Credit → Structure → Capital → Growth journey…" },
  { id: "em-2", title: "Funding-ready announcement", category: "Sales", body: "{{name}}, big news — your profile is now funding-ready. Let's map your capital strategy." },
  { id: "em-3", title: "Re-engagement", category: "Re-engage", body: "Still serious about getting fundable, {{name}}? Your spot is open — let's pick up where we left off." },
];

export const OBJECTION_SEED: Template[] = [
  { id: "ob-1", title: "“It's too expensive”", category: "Price", body: "Compared to staying un-fundable? The cost of NOT fixing this is every approval you keep getting denied. Let's look at the ROI." },
  { id: "ob-2", title: "“I can do it myself”", category: "DIY", body: "You can — and some clients do with our DIY track. Most pay us because we compress months into weeks and avoid the costly mistakes." },
  { id: "ob-3", title: "“I need to think about it”", category: "Stall", body: "Totally fair. What specifically do you want to think through — the timeline, the investment, or whether it'll work for your situation?" },
];

export const SCRIPT_SEED: Template[] = [
  { id: "sc-1", title: "Consultation open", category: "Open", body: "Thanks for booking. Before I show you the plan — walk me through where you are with credit, business structure, and funding goals." },
  { id: "sc-2", title: "Diagnosis reveal", category: "Diagnose", body: "Based on your profile, here's exactly what's blocking your approvals and the order we'd fix it…" },
  { id: "sc-3", title: "Close", category: "Close", body: "Two ways we can work together — done-with-you or done-for-you. Which fits how hands-on you want to be?" },
];

export interface Trend extends Row {
  id: string;
  title: string;
  type: string;
  platform: string;
  note: string;
}
export const TREND_SEED: Trend[] = [
  { id: "tr-1", title: "“Credit repair myths” debunk format", type: "Format", platform: "Reels/TikTok", note: "Stitch a myth → correct it with FCRA fact." },
  { id: "tr-2", title: "0% business funding explainer", type: "Topic", platform: "YouTube", note: "Rising search interest around 0% APR stacking." },
  { id: "tr-3", title: "Trending audio: motivational build", type: "Audio", platform: "Instagram", note: "Pairs with client-win transformations." },
];

export interface Automation extends Row {
  id: string;
  name: string;
  trigger: string;
  action: string;
  status: string;
}
export const AUTOMATION_SEED: Automation[] = [
  { id: "au-1", name: "New lead → welcome", trigger: "Lead created", action: "Send welcome SMS + email", status: "active" },
  { id: "au-2", name: "Consult booked → reminder", trigger: "Booking created", action: "Schedule reminder SMS 24h prior", status: "active" },
  { id: "au-3", name: "No-show → re-book", trigger: "Consult no-show", action: "Send re-book link + tag", status: "active" },
  { id: "au-4", name: "Round completed → update", trigger: "Dispute round completed", action: "Send progress update to client", status: "paused" },
];

export interface ScheduledTask extends Row {
  id: string;
  task: string;
  schedule: string;
  nextRun: string;
  status: string;
}
export const SCHEDULED_SEED: ScheduledTask[] = [
  { id: "st-1", task: "Weekly review report", schedule: "Fri 9:00am", nextRun: "2026-07-03", status: "scheduled" },
  { id: "st-2", task: "Pull updated bureau scores", schedule: "Monthly", nextRun: "2026-07-01", status: "scheduled" },
  { id: "st-3", task: "Affiliate payout batch", schedule: "Bi-weekly", nextRun: "2026-07-04", status: "scheduled" },
];

export interface WorkflowStep extends Row {
  id: string;
  step: string;
  module: string;
  output: string;
}
export const WORKFLOW_SEED: WorkflowStep[] = [
  { id: "wf-1", step: "1. Idea", module: "Idea Generation", output: "Approved content idea" },
  { id: "wf-2", step: "2. Script", module: "Script Writer", output: "Reel/carousel script" },
  { id: "wf-3", step: "3. Motion", module: "Motion Graphics", output: "Visual asset" },
  { id: "wf-4", step: "4. Thumbnail", module: "Thumbnail Studio", output: "Thumbnail" },
  { id: "wf-5", step: "5. Schedule", module: "Content Calendar", output: "Queued post" },
  { id: "wf-6", step: "6. Publish", module: "Publish Queue", output: "Live post" },
  { id: "wf-7", step: "7. Measure", module: "Analytics", output: "Performance → feedback loop" },
];
