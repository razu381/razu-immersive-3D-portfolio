import type { OrderId } from "../lib/run/events.ts";

// PLACEHOLDER content: all people, practices and companies below are made up. Replace in the content pass.
// Each work order is a real automation: the model reads fields, plain code checks them, the model routes and drafts.

export type Field = { key: string; label: string; hint: string };
export type Check = { rule: string; result: "pass" | "flag" | "reject"; key?: string; note?: string };
export type Route = { destination: string; confidence: number; reason: string };

export type WorkOrder = {
  id: OrderId;
  number: string;
  title: string;
  from: string;
  signer: string;
  input: string;
  fields: Field[];
  check: (values: Record<string, string>) => Check[];
  destinations: string[];
  draftBrief: string;
  // Canned model answers, used to build the placeholder run until a real one is recorded.
  canned: { read: Record<string, string>; reread: Record<string, string>; route: Route; draft: string };
};

const missing = (values: Record<string, string>, keys: string[]) => keys.filter((k) => !values[k]?.trim());
const required = (values: Record<string, string>, keys: string[], labels: Field[]): Check => {
  const gaps = missing(values, keys).map((k) => labels.find((f) => f.key === k)?.label ?? k);
  return gaps.length
    ? { rule: "Required fields present", result: "flag", note: `Missing: ${gaps.join(", ")}` }
    : { rule: "Required fields present", result: "pass" };
};
// Strict ISO date: rejects "12/O3/1986" and impossible dates like 1986-02-31.
export const isIsoDate = (v: string) =>
  /^\d{4}-\d{2}-\d{2}$/.test(v) && new Date(`${v}T00:00:00Z`).toISOString().slice(0, 10) === v;

const referralFields: Field[] = [
  { key: "patient", label: "Patient", hint: "Patient full name" },
  { key: "dob", label: "Date of birth", hint: "Patient date of birth as YYYY-MM-DD, copied exactly as written if unclear" },
  { key: "patientRef", label: "Patient ref", hint: "The practice's patient reference number" },
  { key: "referrer", label: "Referrer", hint: "Referring clinician and practice" },
  { key: "referrerContact", label: "Referrer contact", hint: "Phone and/or email for the referrer, exactly as given" },
  { key: "specialty", label: "Specialty requested", hint: "The specialty or service the letter is addressed to" },
  { key: "reason", label: "Reason (as written)", hint: "The reason for referral, short, in the referrer's words" },
  { key: "urgency", label: "Urgency (as stated)", hint: "Any urgency or timing the referrer states; empty if none" },
  { key: "attachments", label: "Attachments", hint: "Attachments mentioned, e.g. 'Photo (1)'; empty if none" },
];

const briefFields: Field[] = [
  { key: "studio", label: "Studio", hint: "The agency or studio sending the brief" },
  { key: "client", label: "Client", hint: "The end client the work is for" },
  { key: "deliverables", label: "Deliverables", hint: "What they want built, short" },
  { key: "deadline", label: "Deadline", hint: "The deadline as written" },
  { key: "budget", label: "Budget", hint: "Budget as written; empty if not stated" },
  { key: "stack", label: "Stack", hint: "Technologies they mention" },
  { key: "contact", label: "Contact", hint: "Who sent it and how to reach them" },
];

const leadFields: Field[] = [
  { key: "name", label: "Name", hint: "Sender's name" },
  { key: "company", label: "Company", hint: "Company name" },
  { key: "need", label: "Need", hint: "What they need, short" },
  { key: "size", label: "Team size", hint: "Company or team size as written" },
  { key: "timeline", label: "Timeline", hint: "When they want to start or finish" },
  { key: "budget", label: "Budget", hint: "Budget as written; empty if not stated" },
];

export const workOrders: WorkOrder[] = [
  {
    id: "referral",
    number: "WO-0142",
    title: "Clinic referral",
    from: "Westbrook Family Practice → St Anne's Clinic",
    signer: "Clinic admin",
    input: `WESTBROOK FAMILY PRACTICE · 14 Mill Lane, Westbrook
info@westbrookfp.example

To: Dermatology Outpatients, St Anne's Clinic

Re: Ms Clara Benning   DOB 12/O3/1986   Ref WFP-20417

Dear colleague,
I would be grateful if you could see Ms Benning, who has had a persistent itchy rash on both forearms for around three months, not settling with emollients.
She would appreciate an earlier appointment if at all possible.
Photo attached (1).

Kind regards,
Dr H. Okafor`,
    fields: referralFields,
    check: (v) => [
      required(v, ["patient", "dob", "referrer", "specialty", "reason"], referralFields),
      isIsoDate(v.dob)
        ? { rule: "Date of birth is a valid date", result: "pass", key: "dob" }
        : { rule: "Date of birth is a valid date", result: "reject", key: "dob", note: `"${v.dob}" is not a valid date` },
      /\d[\d\s-]{6,}/.test(v.referrerContact)
        ? { rule: "Referrer reachable by phone", result: "pass", key: "referrerContact" }
        : { rule: "Referrer reachable by phone", result: "flag", key: "referrerContact", note: "No phone number, email only" },
      // The machine never judges urgency; it only passes what the referrer wrote to a person.
      v.urgency?.trim() && !/^routine$/i.test(v.urgency.trim())
        ? { rule: "Urgency stated by referrer", result: "flag", key: "urgency", note: "For staff to decide" }
        : { rule: "Urgency stated by referrer", result: "pass", key: "urgency" },
    ],
    destinations: ["Dermatology outpatients", "Rheumatology outpatients", "General surgery", "Return to referrer"],
    draftBrief:
      "Write a short acknowledgement from the Referrals Office, St Anne's Clinic, to the referrer. Confirm receipt and where it was routed. Ask for any missing contact details. Say any stated urgency has been passed to the clinic team. No clinical advice. Under 90 words.",
    canned: {
      read: {
        patient: "Clara Benning",
        dob: "12/O3/1986",
        patientRef: "WFP-20417",
        referrer: "Dr H. Okafor, Westbrook Family Practice",
        referrerContact: "info@westbrookfp.example",
        specialty: "Dermatology",
        reason: "Persistent itchy rash on both forearms, ~3 months, not settling with emollients",
        urgency: "Earlier appointment requested",
        attachments: "Photo (1)",
      },
      reread: { dob: "1986-03-12" },
      route: {
        destination: "Dermatology outpatients",
        confidence: 0.94,
        reason: "Letter is addressed to dermatology; skin complaint described",
      },
      draft: `Dear Dr Okafor,

Thank you for your referral for Ms Clara Benning (WFP-20417). It has been received and routed to Dermatology Outpatients at St Anne's Clinic.

We couldn't find a phone number for your practice. Could you reply with a direct line so our booking team can reach you?

Ms Benning's request for an earlier appointment has been passed to the clinic team.

Kind regards,
Referrals Office, St Anne's Clinic`,
    },
  },
  {
    id: "brief",
    number: "WO-0143",
    title: "Agency brief",
    from: "Northbound Studio → you",
    signer: "You",
    input: `From: Maya Lindqvist <maya@northbound.example>
Subject: WebGL launch site — Halden Audio

Hi! We're Northbound, a small brand studio. Our client Halden Audio is launching a new speaker and wants a product site with a scroll-driven WebGL hero, plus a CMS so their team can edit copy.
We'd need it live in 3 weeks. Stack-wise we usually work in Next.js and Sanity.
Could you let us know if you're available?
Maya`,
    fields: briefFields,
    check: (v) => {
      const weeks = Number(/(\d+)\s*week/i.exec(v.deadline ?? "")?.[1]);
      return [
        required(v, ["studio", "client", "deliverables", "deadline"], briefFields),
        weeks && weeks < 6
          ? { rule: "Deadline is realistic", result: "flag", key: "deadline", note: `${weeks} weeks for WebGL + CMS is tight` }
          : { rule: "Deadline is realistic", result: "pass", key: "deadline" },
        v.budget?.trim()
          ? { rule: "Budget stated", result: "pass", key: "budget" }
          : { rule: "Budget stated", result: "flag", key: "budget", note: "Ask before scoping" },
      ];
    },
    destinations: ["WebGL build", "AI product", "Automation", "Not a fit"],
    draftBrief:
      "Write a short, warm reply from the freelancer to the studio: confirm interest, outline a scoped plan in 3 bullet points, raise the tight deadline honestly, and ask for the budget. Under 110 words.",
    canned: {
      read: {
        studio: "Northbound Studio",
        client: "Halden Audio",
        deliverables: "Product launch site with scroll-driven WebGL hero + CMS",
        deadline: "3 weeks",
        budget: "",
        stack: "Next.js, Sanity, WebGL",
        contact: "Maya Lindqvist, maya@northbound.example",
      },
      reread: {},
      route: { destination: "WebGL build", confidence: 0.91, reason: "Scroll-driven WebGL hero is the core deliverable" },
      draft: `Hi Maya,

Thanks for thinking of me. Halden Audio sounds like a great launch, and I'd love to help.

A first scope:
• Scroll-driven WebGL hero, designed in code with your team
• Next.js + Sanity so the copy stays editable
• A performance pass for mobile before launch

Honest note: three weeks is tight for WebGL plus a CMS. A short call this week would help us shape what's realistic.

Could you share the budget range?

Best,
[Your Name]`,
    },
  },
  {
    id: "lead",
    number: "WO-0144",
    title: "Inbound lead",
    from: "Website contact form → you",
    signer: "You",
    input: `Name: Daniel Mercer
Company: Fieldnote (logistics software, 40 people)
Message: Our support team answers the same shipping questions all day. We'd like an AI assistant that drafts replies from our docs and order data, with a person approving before anything is sent. Hoping to start next month.`,
    fields: leadFields,
    check: (v) => [
      required(v, ["name", "company", "need"], leadFields),
      /https?:\/\//.test(v.need ?? "")
        ? { rule: "Looks like a real enquiry", result: "reject", key: "need", note: "Contains links, likely spam" }
        : { rule: "Looks like a real enquiry", result: "pass", key: "need" },
      v.budget?.trim()
        ? { rule: "Budget stated", result: "pass", key: "budget" }
        : { rule: "Budget stated", result: "flag", key: "budget", note: "Ask on the call" },
    ],
    destinations: ["AI product", "Automation", "WebGL build", "Not a fit"],
    draftBrief:
      "Write a short reply from the freelancer: show you understood the need, describe the human-approval approach in one sentence, suggest a 30-minute call, and ask about budget. Under 90 words.",
    canned: {
      read: {
        name: "Daniel Mercer",
        company: "Fieldnote",
        need: "AI assistant that drafts support replies from docs and order data, human approves before sending",
        size: "40 people",
        timeline: "Start next month",
        budget: "",
      },
      reread: {},
      route: { destination: "AI product", confidence: 0.89, reason: "Drafting assistant with human approval over company data" },
      draft: `Hi Daniel,

Thanks for getting in touch. A drafting assistant your team approves before anything goes out is exactly how I like to build these: grounded in your docs and order data, with every reply checked by a person.

Would a 30-minute call next week work? It would also help to know the budget you have in mind.

Best,
[Your Name]`,
    },
  },
];

export const workOrder = (id: OrderId) => workOrders.find((o) => o.id === id)!;
