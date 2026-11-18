import type { Booking, CatalogItem, Post } from "@/types/hub";

/** Seed content for the internal hub. Everything is persisted through the hub service. */

const minutesAgo = (minutes: number) => Date.now() - minutes * 60 * 1000;
const hoursAgo = (hours: number) => Date.now() - hours * 60 * 60 * 1000;
const daysAgo = (days: number) => Date.now() - days * 24 * 60 * 60 * 1000;

const isoDay = (offset: number) => {
  const date = new Date();
  date.setDate(date.getDate() + offset);
  return date.toISOString().slice(0, 10);
};

export const seedPosts: Post[] = [
  {
    id: "post-floor-sensors",
    authorName: "Maya Chen",
    authorInitials: "MC",
    authorAccent: "#60a5fa",
    title: "Floor sensors are live in every room",
    body: "Occupancy now updates from the badge readers rather than the old desk survey. The 3D floor and the room panels both use the same feed, so if something looks off, check the service status before assuming the sensor is broken. Shout in the comments if a room does not update within a minute.",
    tag: "announcement",
    likes: 12,
    likedByMe: false,
    createdAt: minutesAgo(34),
    comments: [
      {
        id: "comment-sensor-1",
        authorName: "Felix Nakamura",
        authorInitials: "FN",
        authorAccent: "#5eead4",
        body: "I am monitoring the feed all week. Server room is the one to watch — the gateway drops when the cooling kicks in.",
        createdAt: minutesAgo(21),
      },
      {
        id: "comment-sensor-2",
        authorName: "Chloe Martin",
        authorInitials: "CM",
        authorAccent: "#fda4af",
        body: "Reception is showing a visitor count as well. That has already made front-of-house handovers easier.",
        createdAt: minutesAgo(12),
      },
    ],
  },
  {
    id: "post-ops-digest",
    authorName: "Elena Rossi",
    authorInitials: "ER",
    authorAccent: "#f472b6",
    title: "The Q4 operations digest is in the catalog",
    body: "I have uploaded the digest with the new handover checklist, the coverage rota and everything we agreed in Thursday's review. Start with the checklist if you are onboarding a new client next week. Add comments on the catalog item if you spot a gap.",
    tag: "resource",
    likes: 8,
    likedByMe: false,
    createdAt: hoursAgo(2),
    comments: [
      {
        id: "comment-ops-1",
        authorName: "Marcus Reed",
        authorInitials: "MR",
        authorAccent: "#fdba74",
        body: "Used the checklist on the Northwind call this morning. Saved me at least half an hour.",
        createdAt: hoursAgo(1),
      },
    ],
  },
  {
    id: "post-visitor-policy",
    authorName: "Chloe Martin",
    authorInitials: "CM",
    authorAccent: "#fda4af",
    title: "Visitor policy change from Monday",
    body: "Visitors now receive a temporary badge at reception and must be signed out by their host. If you are booking a room for an external meeting, add the guest names to the booking note so reception can prepare the badges ahead of time.",
    tag: "update",
    likes: 5,
    likedByMe: true,
    createdAt: hoursAgo(5),
    comments: [
      {
        id: "comment-visitor-1",
        authorName: "Isla Campbell",
        authorInitials: "IC",
        authorAccent: "#f9a8d4",
        body: "Will the visitor notes show on the room display too, or only at reception?",
        createdAt: hoursAgo(4),
      },
      {
        id: "comment-visitor-2",
        authorName: "Chloe Martin",
        authorInitials: "CM",
        authorAccent: "#fda4af",
        body: "Both. The display pulls the first line of the booking note.",
        createdAt: hoursAgo(3),
      },
    ],
  },
  {
    id: "post-travel-adapter",
    authorName: "Hana Suzuki",
    authorInitials: "HS",
    authorAccent: "#facc15",
    title: "Spare travel adapter, anyone?",
    body: "I am packing the demo kit for the Berlin workshop and I am one USB-C adapter short. If yours lives in a desk drawer and you are not using it this week, drop a comment — I will return it on Friday.",
    tag: "question",
    likes: 3,
    likedByMe: false,
    createdAt: hoursAgo(8),
    comments: [],
  },
  {
    id: "post-design-tokens",
    authorName: "Lucas Moreau",
    authorInitials: "LM",
    authorAccent: "#a78bfa",
    title: "Design system v3 tokens are ready",
    body: "New colour, type and spacing tokens are live in the shared library. If your work touches the client portal, pull the latest before Friday so the audit catches everything at once. The migration notes are linked from the catalog entry.",
    tag: "update",
    likes: 9,
    likedByMe: false,
    createdAt: daysAgo(1),
    comments: [
      {
        id: "comment-tokens-1",
        authorName: "Aisha Rahman",
        authorInitials: "AR",
        authorAccent: "#2dd4bf",
        body: "Frontend is upgraded. Only the older reports pages still need mapping.",
        createdAt: daysAgo(1),
      },
    ],
  },
];

export const seedCatalog: CatalogItem[] = [
  {
    id: "catalog-client-handover",
    name: "Client handover checklist",
    category: "template",
    summary:
      "A repeatable checklist for handing an account from delivery to success without losing context.",
    description:
      "Use this checklist when ownership of a client moves between teammates or teams. It covers access handover, open conversations, billing details, renewal dates and the short internal brief that should accompany every transition.\n\nThe document is maintained by the operations team. If your team has a step that is missing, add it in the comments on the quarterly digest post or message the owner directly.",
    owner: "Maya Chen",
    tags: ["handover", "operations", "clients"],
    format: "Notion · 12 checks",
    updatedAt: daysAgo(2),
  },
  {
    id: "catalog-onboarding-playbook",
    name: "Agent onboarding playbook",
    category: "playbook",
    summary:
      "The first two weeks for a new teammate, from accounts and introductions to their first solo shift.",
    description:
      "A structured onboarding plan for new members of the team. It includes account provisioning, the welcome session, shadowing slots, the first independent task and the 30-day check-in.\n\nManagers should copy the playbook into their team space and adjust the shadowing sessions to the current rota. The people team reviews the content at the end of every quarter.",
    owner: "Nadia Haddad",
    tags: ["onboarding", "people", "enablement"],
    format: "Playbook · 14 pages",
    updatedAt: daysAgo(6),
  },
  {
    id: "catalog-escalation-matrix",
    name: "Support escalation matrix",
    category: "playbook",
    summary:
      "Who to contact, in what order, and how quickly for every class of support issue.",
    description:
      "This matrix replaces the old chat pinned message. It defines four severity levels, the response targets for each level, the primary and secondary contacts, and the point at which the account lead must be informed.\n\nWhen a rota changes, update the matrix in the same edit so the on-call display and the handover notes stay aligned.",
    owner: "Felix Nakamura",
    tags: ["support", "escalation", "sla"],
    format: "PDF · 4 pages",
    updatedAt: daysAgo(9),
  },
  {
    id: "catalog-coverage-rota",
    name: "Weekend coverage rota",
    category: "template",
    summary:
      "A shared rota for weekend cover, including swap rules and the escalation contact for each shift.",
    description:
      "The coverage rota is the source of truth for who is on call at the weekend. Swap requests go through the bookings flow so the calendar and the rota never diverge.\n\nEach shift has a primary and a backup. If both are unavailable, the on-call lead is responsible for finding cover and updating the rota.",
    owner: "Marcus Reed",
    tags: ["rota", "coverage", "operations"],
    format: "Spreadsheet",
    updatedAt: daysAgo(4),
  },
  {
    id: "catalog-automation-library",
    name: "Automation library",
    category: "automation",
    summary:
      "The approved scripts and workflows that keep recurring admin work out of the team's calendar.",
    description:
      "A catalogue of the automations the team has approved for everyday work: new client intake, renewal reminders, weekly reporting exports and inbox triage. Each entry lists the trigger, what it changes and who owns it.\n\nProposals for new automations go through the operations review on Wednesdays. Do not connect a new tool to client data before the review has signed it off.",
    owner: "Ravi Patel",
    tags: ["automation", "workflows", "admin"],
    format: "Library · 18 entries",
    updatedAt: daysAgo(11),
  },
  {
    id: "catalog-field-kit",
    name: "Field kit inventory",
    category: "equipment",
    summary:
      "What lives in the shared travel kit and how to reserve it before an offsite.",
    description:
      "The field kit contains two demo laptops, a portable display, the travel router, power adapters, a speakerphone and the loaner headsets. Reserve the kit through the bookings flow and note which items you need.\n\nMissing or damaged equipment should be reported to reception on return so the next team is not caught short.",
    owner: "Chloe Martin",
    tags: ["kit", "equipment", "travel"],
    format: "Inventory · 16 items",
    updatedAt: daysAgo(8),
  },
  {
    id: "catalog-brand-motion",
    name: "Brand motion pack",
    category: "template",
    summary:
      "Approved motion presets and export settings for presentations, social clips and the client portal.",
    description:
      "The motion pack contains the current easing curves, transitions and export presets for product and brand work. Use the named presets rather than rebuilding transitions from scratch — the pack is updated whenever the design system changes.\n\nFor anything client-facing, check the version number against the design system release before exporting.",
    owner: "Lucas Moreau",
    tags: ["brand", "motion", "design"],
    format: "Figma · 6 presets",
    updatedAt: daysAgo(3),
  },
  {
    id: "catalog-research-digest",
    name: "Quarterly research digest",
    category: "research",
    summary:
      "The strongest signals from customer interviews, support themes and market research this quarter.",
    description:
      "A condensed view of what customers told us this quarter and the patterns the team should act on. It combines interview highlights, the top support themes and the open questions that still need a decision.\n\nRead the summary first, then use the linked evidence if you need the detail. The next digest closes at the end of the quarter.",
    owner: "Oscar Lind",
    tags: ["research", "insights", "customers"],
    format: "Report · 9 pages",
    updatedAt: daysAgo(16),
  },
];

export const seedBookings: Booking[] = [
  {
    id: "booking-team-sync",
    title: "Weekly team sync",
    roomId: "meeting-room",
    date: isoDay(0),
    startTime: "10:00",
    endTime: "11:00",
    organizer: "Elena Rossi",
    attendees: 6,
    note: "Bring the Q4 digest and your open questions.",
    status: "confirmed",
    createdAt: Date.now() - 3 * 60 * 60 * 1000,
  },
  {
    id: "booking-design-critique",
    title: "Design critique",
    roomId: "lounge",
    date: isoDay(0),
    startTime: "14:30",
    endTime: "15:15",
    organizer: "Lucas Moreau",
    attendees: 4,
    note: "Client portal refresh. Review the motion pack beforehand.",
    status: "confirmed",
    createdAt: Date.now() - 5 * 60 * 60 * 1000,
  },
  {
    id: "booking-orientation",
    title: "New starter orientation",
    roomId: "management",
    date: isoDay(1),
    startTime: "09:30",
    endTime: "10:30",
    organizer: "Nadia Haddad",
    attendees: 3,
    note: "Two new starters joining the delivery team.",
    status: "confirmed",
    createdAt: Date.now() - 26 * 60 * 60 * 1000,
  },
  {
    id: "booking-vendor-call",
    title: "Vendor review",
    roomId: "meeting-room",
    date: isoDay(2),
    startTime: "13:00",
    endTime: "14:00",
    organizer: "Felix Nakamura",
    attendees: 5,
    note: "Network hardware refresh. External guests attending.",
    status: "confirmed",
    createdAt: Date.now() - 30 * 60 * 60 * 1000,
  },
];
