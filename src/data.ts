import type { Meeting, Todo, Project } from "./types"

export const MOCK_MEETINGS: Meeting[] = [
  {
    id: 1,
    title: "Q2 2026 Quarterly Review",
    date: "2026-04-30",
    startTime: "09:00",
    endTime: "10:00",
    owner: "Lisa Jacob",
    participants: ["max.koehler@chairly.app", "sara.fischer@chairly.app", "tom.becker@chairly.app"],
    intention: "Reflect on the quarter's results together",
    desiredOutcome: "Clear priorities for Q3 defined",
    link: "https://meet.google.com/abc-defg-hij",
    agenda: [
      { id: 1, topic: "Welcome & Check-in", type: "ankommen", duration: "5", outcome: "", note: "" },
      { id: 2, topic: "Q2 Results", type: "information", duration: "20", outcome: "", note: "" },
      { id: 3, topic: "Learnings & Retro", type: "brainstorm", duration: "20", outcome: "", note: "" },
      { id: 4, topic: "Q3 Priorities", type: "entscheidung", duration: "10", outcome: "", note: "" },
    ],
  },
  {
    id: 2,
    title: "Product Roadmap Workshop",
    date: "2026-05-06",
    startTime: "13:00",
    endTime: "15:00",
    owner: "Max Köhler",
    participants: ["lisa.jacob@chairly.app", "anna.mueller@chairly.app"],
    intention: "Define the roadmap for the next 6 months",
    desiredOutcome: "Prioritized feature list and milestones",
    agenda: [
      { id: 1, topic: "Status Quo", type: "information", duration: "15", outcome: "", note: "" },
      { id: 2, topic: "Gather feature ideas", type: "brainstorm", duration: "30", outcome: "", note: "" },
      { id: 3, topic: "Prioritization", type: "entscheidung", duration: "30", outcome: "", note: "" },
      { id: 4, topic: "Define milestones", type: "entscheidung", duration: "20", outcome: "", note: "" },
      { id: 5, topic: "Next Steps", type: "beratung", duration: "10", outcome: "", note: "" },
    ],
  },
  {
    id: 3,
    title: "Weekly Team Sync",
    date: "2026-05-04",
    startTime: "10:00",
    endTime: "10:30",
    owner: "Sara Fischer",
    participants: ["lisa.jacob@chairly.app", "max.koehler@chairly.app", "tom.becker@chairly.app", "anna.mueller@chairly.app"],
    intention: "Share weekly status and resolve blockers",
    desiredOutcome: "Everyone is aligned, blockers resolved",
    link: "https://zoom.us/j/123456789",
    agenda: [
      { id: 1, topic: "Check-in Round", type: "ankommen", duration: "5", outcome: "", note: "" },
      { id: 2, topic: "Status Updates", type: "information", duration: "10", outcome: "", note: "" },
      { id: 3, topic: "Blockers & Help", type: "beratung", duration: "10", outcome: "", note: "" },
    ],
  },
  {
    id: 4,
    title: "UX Research Review",
    date: "2026-05-12",
    startTime: "14:00",
    endTime: "15:00",
    owner: "Anna Müller",
    participants: ["lisa.jacob@chairly.app", "sara.fischer@chairly.app"],
    intention: "Analyze user feedback together and derive insights",
    desiredOutcome: "Top 5 insights and concrete action items",
    agenda: [
      { id: 1, topic: "Present research findings", type: "information", duration: "20", outcome: "", note: "" },
      { id: 2, topic: "Cluster insights", type: "brainstorm", duration: "20", outcome: "", note: "" },
      { id: 3, topic: "Action recommendations", type: "entscheidung", duration: "15", outcome: "", note: "" },
    ],
  },

  // ── 20 upcoming meetings · June 2 – June 22, 2026 (next 3 weeks) ──

  // Week 1: June 2 – June 8
  {
    id: 100, title: "Weekly Team Sync", date: "2026-06-02", startTime: "10:00", endTime: "10:30",
    owner: "Sara Fischer", participants: ["lisa.jacob@chairly.app", "max.koehler@chairly.app", "tom.becker@chairly.app", "anna.mueller@chairly.app"],
    intention: "Align on weekly priorities", desiredOutcome: "Everyone clear on this week's focus",
    link: "https://zoom.us/j/123456789",
    agenda: [
      { id: 1, topic: "Check-in",        type: "ankommen",     duration: "5",  outcome: "", note: "" },
      { id: 2, topic: "Status round",    type: "information",  duration: "15", outcome: "", note: "" },
      { id: 3, topic: "Blockers",        type: "beratung",     duration: "10", outcome: "", note: "" },
    ],
  },
  {
    id: 101, title: "1:1 Lisa & Max", date: "2026-06-02", startTime: "14:00", endTime: "14:30",
    owner: "Lisa Jacob", participants: ["max.koehler@chairly.app"],
    intention: "Catch up on personal goals & blockers", desiredOutcome: "Clear next steps",
    agenda: [
      { id: 1, topic: "Check-in",         type: "ankommen",     duration: "5",  outcome: "", note: "" },
      { id: 2, topic: "Career & goals",   type: "beratung",     duration: "20", outcome: "", note: "" },
      { id: 3, topic: "Wrap up",          type: "checkout",     duration: "5",  outcome: "", note: "" },
    ],
  },
  {
    id: 102, title: "Sprint Planning", date: "2026-06-03", startTime: "10:00", endTime: "11:30",
    owner: "Max Köhler", participants: ["lisa.jacob@chairly.app", "tom.becker@chairly.app", "anna.mueller@chairly.app"],
    intention: "Plan next sprint scope", desiredOutcome: "Sprint backlog finalized",
    agenda: [
      { id: 1, topic: "Warm Up",          type: "ankommen",     duration: "5",  outcome: "", note: "" },
      { id: 2, topic: "Review backlog",   type: "information",  duration: "30", outcome: "", note: "" },
      { id: 3, topic: "Story estimation", type: "beratung",     duration: "30", outcome: "", note: "" },
      { id: 4, topic: "Commit & sign-off",type: "entscheidung", duration: "15", outcome: "", note: "" },
      { id: 5, topic: "Wrap Up",          type: "checkout",     duration: "5",  outcome: "", note: "" },
    ],
  },
  {
    id: 103, title: "Customer Feedback Review", date: "2026-06-04", startTime: "11:00", endTime: "12:00",
    owner: "Anna Müller", participants: ["lisa.jacob@chairly.app", "sara.fischer@chairly.app"],
    intention: "Review latest customer feedback batch", desiredOutcome: "Top 3 themes identified",
    agenda: [
      { id: 1, topic: "Check-in",            type: "ankommen",     duration: "5",  outcome: "", note: "" },
      { id: 2, topic: "Feedback walkthrough",type: "information",  duration: "25", outcome: "", note: "" },
      { id: 3, topic: "Theme clustering",    type: "kreativ",      duration: "20", outcome: "", note: "" },
      { id: 4, topic: "Wrap Up",             type: "checkout",     duration: "5",  outcome: "", note: "" },
    ],
  },
  {
    id: 104, title: "Hiring Sync — Senior Designer", date: "2026-06-04", startTime: "15:00", endTime: "15:45",
    owner: "Lisa Jacob", participants: ["sara.fischer@chairly.app", "anna.mueller@chairly.app"],
    intention: "Align on candidate pipeline", desiredOutcome: "Shortlist for next round",
    agenda: [
      { id: 1, topic: "Check-in",           type: "ankommen",     duration: "5",  outcome: "", note: "" },
      { id: 2, topic: "Pipeline status",    type: "information",  duration: "15", outcome: "", note: "" },
      { id: 3, topic: "Shortlist decision", type: "entscheidung", duration: "20", outcome: "", note: "" },
      { id: 4, topic: "Wrap Up",            type: "checkout",     duration: "5",  outcome: "", note: "" },
    ],
  },
  {
    id: 105, title: "Friday Demo", date: "2026-06-05", startTime: "16:00", endTime: "17:00",
    owner: "Tom Becker", participants: ["lisa.jacob@chairly.app", "max.koehler@chairly.app", "sara.fischer@chairly.app", "anna.mueller@chairly.app"],
    intention: "Show what was built this week", desiredOutcome: "Team celebrates wins & gives feedback",
    link: "https://meet.google.com/demo-xyz-abc",
    agenda: [
      { id: 1, topic: "Warm Up",         type: "ankommen",     duration: "5",  outcome: "", note: "" },
      { id: 2, topic: "Engineering demo",type: "information",  duration: "20", outcome: "", note: "" },
      { id: 3, topic: "Design demo",     type: "information",  duration: "20", outcome: "", note: "" },
      { id: 4, topic: "Feedback round",  type: "beratung",     duration: "10", outcome: "", note: "" },
      { id: 5, topic: "Wrap Up",         type: "checkout",     duration: "5",  outcome: "", note: "" },
    ],
  },
  {
    id: 106, title: "Product Strategy Brainstorm", date: "2026-06-08", startTime: "10:00", endTime: "11:30",
    owner: "Lisa Jacob", participants: ["max.koehler@chairly.app", "sara.fischer@chairly.app", "anna.mueller@chairly.app"],
    intention: "Generate ideas for H2 strategy", desiredOutcome: "5 strategic directions to explore",
    agenda: [
      { id: 1, topic: "Warm Up",         type: "ankommen",     duration: "5",  outcome: "", note: "" },
      { id: 2, topic: "Context setting", type: "information",  duration: "15", outcome: "", note: "" },
      { id: 3, topic: "Idea generation", type: "kreativ",      duration: "40", outcome: "", note: "" },
      { id: 4, topic: "Cluster & vote",  type: "entscheidung", duration: "25", outcome: "", note: "" },
      { id: 5, topic: "Wrap Up",         type: "checkout",     duration: "5",  outcome: "", note: "" },
    ],
  },

  // Week 2: June 9 – June 15
  {
    id: 107, title: "Weekly Team Sync", date: "2026-06-09", startTime: "10:00", endTime: "10:30",
    owner: "Sara Fischer", participants: ["lisa.jacob@chairly.app", "max.koehler@chairly.app", "tom.becker@chairly.app", "anna.mueller@chairly.app"],
    intention: "Align on weekly priorities", desiredOutcome: "Everyone clear on this week's focus",
    link: "https://zoom.us/j/123456789",
    agenda: [
      { id: 1, topic: "Check-in",     type: "ankommen",     duration: "5",  outcome: "", note: "" },
      { id: 2, topic: "Status round", type: "information",  duration: "15", outcome: "", note: "" },
      { id: 3, topic: "Blockers",     type: "beratung",     duration: "10", outcome: "", note: "" },
    ],
  },
  {
    id: 108, title: "Q3 Goal Setting Workshop", date: "2026-06-10", startTime: "09:30", endTime: "12:00",
    owner: "Lisa Jacob", participants: ["max.koehler@chairly.app", "sara.fischer@chairly.app", "tom.becker@chairly.app", "anna.mueller@chairly.app"],
    intention: "Define Q3 objectives together", desiredOutcome: "3-5 OKRs locked in",
    agenda: [
      { id: 1, topic: "Warm Up",                type: "ankommen",     duration: "10", outcome: "", note: "" },
      { id: 2, topic: "Q2 retrospective",       type: "beratung",     duration: "30", outcome: "", note: "" },
      { id: 3, topic: "Q3 themes brainstorm",   type: "kreativ",      duration: "40", outcome: "", note: "" },
      { id: 4, topic: "OKR drafting",           type: "entscheidung", duration: "50", outcome: "", note: "" },
      { id: 5, topic: "Wrap Up",                type: "checkout",     duration: "10", outcome: "", note: "" },
    ],
  },
  {
    id: 109, title: "Design Critique", date: "2026-06-10", startTime: "14:00", endTime: "15:00",
    owner: "Anna Müller", participants: ["sara.fischer@chairly.app", "lisa.jacob@chairly.app"],
    intention: "Get feedback on new dashboard mocks", desiredOutcome: "Clear direction for v2",
    agenda: [
      { id: 1, topic: "Check-in",         type: "ankommen",     duration: "5",  outcome: "", note: "" },
      { id: 2, topic: "Walkthrough mocks",type: "information",  duration: "20", outcome: "", note: "" },
      { id: 3, topic: "Critique round",   type: "beratung",     duration: "25", outcome: "", note: "" },
      { id: 4, topic: "Wrap Up",          type: "checkout",     duration: "5",  outcome: "", note: "" },
    ],
  },
  {
    id: 110, title: "1:1 Lisa & Sara", date: "2026-06-11", startTime: "11:00", endTime: "11:30",
    owner: "Lisa Jacob", participants: ["sara.fischer@chairly.app"],
    intention: "Check in on team health", desiredOutcome: "Clear action items",
    agenda: [
      { id: 1, topic: "Check-in",   type: "ankommen", duration: "5",  outcome: "", note: "" },
      { id: 2, topic: "Team health",type: "beratung", duration: "20", outcome: "", note: "" },
      { id: 3, topic: "Wrap Up",    type: "checkout", duration: "5",  outcome: "", note: "" },
    ],
  },
  {
    id: 111, title: "Engineering Architecture Review", date: "2026-06-11", startTime: "15:00", endTime: "16:30",
    owner: "Tom Becker", participants: ["max.koehler@chairly.app", "lisa.jacob@chairly.app"],
    intention: "Review proposed event-driven architecture", desiredOutcome: "Go/no-go decision",
    agenda: [
      { id: 1, topic: "Warm Up",            type: "ankommen",     duration: "5",  outcome: "", note: "" },
      { id: 2, topic: "Architecture deck",  type: "information",  duration: "30", outcome: "", note: "" },
      { id: 3, topic: "Q&A and trade-offs", type: "beratung",     duration: "30", outcome: "", note: "" },
      { id: 4, topic: "Decision",           type: "entscheidung", duration: "20", outcome: "", note: "" },
      { id: 5, topic: "Wrap Up",            type: "checkout",     duration: "5",  outcome: "", note: "" },
    ],
  },
  {
    id: 112, title: "Sales Pipeline Review", date: "2026-06-12", startTime: "13:00", endTime: "14:00",
    owner: "Max Köhler", participants: ["lisa.jacob@chairly.app"],
    intention: "Review pipeline and forecast", desiredOutcome: "Updated forecast for the board",
    agenda: [
      { id: 1, topic: "Check-in",          type: "ankommen",     duration: "5",  outcome: "", note: "" },
      { id: 2, topic: "Pipeline overview", type: "information",  duration: "25", outcome: "", note: "" },
      { id: 3, topic: "Forecast scenarios",type: "entscheidung", duration: "25", outcome: "", note: "" },
      { id: 4, topic: "Wrap Up",           type: "checkout",     duration: "5",  outcome: "", note: "" },
    ],
  },
  {
    id: 113, title: "All Hands", date: "2026-06-15", startTime: "16:00", endTime: "17:00",
    owner: "Lisa Jacob", participants: ["max.koehler@chairly.app", "sara.fischer@chairly.app", "tom.becker@chairly.app", "anna.mueller@chairly.app"],
    intention: "Monthly company update", desiredOutcome: "Whole team aligned & energized",
    link: "https://zoom.us/j/all-hands",
    agenda: [
      { id: 1, topic: "Warm Up",       type: "ankommen",     duration: "5",  outcome: "", note: "" },
      { id: 2, topic: "Company update",type: "information",  duration: "20", outcome: "", note: "" },
      { id: 3, topic: "Wins & shoutouts",type: "information",duration: "10", outcome: "", note: "" },
      { id: 4, topic: "Open Q&A",      type: "beratung",     duration: "20", outcome: "", note: "" },
      { id: 5, topic: "Wrap Up",       type: "checkout",     duration: "5",  outcome: "", note: "" },
    ],
  },

  // Week 3: June 16 – June 22
  {
    id: 114, title: "Weekly Team Sync", date: "2026-06-16", startTime: "10:00", endTime: "10:30",
    owner: "Sara Fischer", participants: ["lisa.jacob@chairly.app", "max.koehler@chairly.app", "tom.becker@chairly.app", "anna.mueller@chairly.app"],
    intention: "Align on weekly priorities", desiredOutcome: "Everyone clear on this week's focus",
    link: "https://zoom.us/j/123456789",
    agenda: [
      { id: 1, topic: "Check-in",     type: "ankommen",     duration: "5",  outcome: "", note: "" },
      { id: 2, topic: "Status round", type: "information",  duration: "15", outcome: "", note: "" },
      { id: 3, topic: "Blockers",     type: "beratung",     duration: "10", outcome: "", note: "" },
    ],
  },
  {
    id: 115, title: "Pricing Strategy Decision", date: "2026-06-17", startTime: "14:00", endTime: "15:30",
    owner: "Lisa Jacob", participants: ["max.koehler@chairly.app", "anna.mueller@chairly.app"],
    intention: "Decide on new pricing tiers", desiredOutcome: "Final pricing locked",
    agenda: [
      { id: 1, topic: "Warm Up",            type: "ankommen",     duration: "5",  outcome: "", note: "" },
      { id: 2, topic: "Market analysis",    type: "information",  duration: "20", outcome: "", note: "" },
      { id: 3, topic: "Options review",     type: "beratung",     duration: "30", outcome: "", note: "" },
      { id: 4, topic: "Konsent decision",   type: "entscheidung", duration: "25", outcome: "", note: "" },
      { id: 5, topic: "Wrap Up",            type: "checkout",     duration: "5",  outcome: "", note: "" },
    ],
  },
  {
    id: 116, title: "Onboarding — New Hire", date: "2026-06-18", startTime: "10:00", endTime: "10:45",
    owner: "Sara Fischer", participants: ["lisa.jacob@chairly.app"],
    intention: "Onboard new designer", desiredOutcome: "Clear first-week plan",
    agenda: [
      { id: 1, topic: "Welcome",            type: "ankommen",     duration: "5",  outcome: "", note: "" },
      { id: 2, topic: "Team intro",         type: "information",  duration: "10", outcome: "", note: "" },
      { id: 3, topic: "Goals & expectations",type: "information", duration: "15", outcome: "", note: "" },
      { id: 4, topic: "Questions",          type: "beratung",     duration: "10", outcome: "", note: "" },
      { id: 5, topic: "Wrap Up",            type: "checkout",     duration: "5",  outcome: "", note: "" },
    ],
  },
  {
    id: 117, title: "User Interview Synthesis", date: "2026-06-18", startTime: "14:00", endTime: "15:30",
    owner: "Anna Müller", participants: ["sara.fischer@chairly.app", "lisa.jacob@chairly.app"],
    intention: "Synthesize 10 user interviews", desiredOutcome: "Top insights doc finalized",
    agenda: [
      { id: 1, topic: "Check-in",            type: "ankommen",     duration: "5",  outcome: "", note: "" },
      { id: 2, topic: "Interview highlights",type: "information",  duration: "30", outcome: "", note: "" },
      { id: 3, topic: "Theme clustering",    type: "kreativ",      duration: "30", outcome: "", note: "" },
      { id: 4, topic: "Top insights decision",type:"entscheidung", duration: "20", outcome: "", note: "" },
      { id: 5, topic: "Wrap Up",             type: "checkout",     duration: "5",  outcome: "", note: "" },
    ],
  },
  {
    id: 118, title: "Engineering Retro", date: "2026-06-19", startTime: "15:00", endTime: "16:00",
    owner: "Tom Becker", participants: ["max.koehler@chairly.app"],
    intention: "Reflect on the sprint", desiredOutcome: "3 concrete improvements for next sprint",
    agenda: [
      { id: 1, topic: "Check-in",          type: "ankommen",     duration: "5",  outcome: "", note: "" },
      { id: 2, topic: "What went well",    type: "beratung",     duration: "15", outcome: "", note: "" },
      { id: 3, topic: "What didn't",       type: "beratung",     duration: "15", outcome: "", note: "" },
      { id: 4, topic: "Action items",      type: "entscheidung", duration: "20", outcome: "", note: "" },
      { id: 5, topic: "Wrap Up",           type: "checkout",     duration: "5",  outcome: "", note: "" },
    ],
  },
  {
    id: 119, title: "Customer Advisory Board", date: "2026-06-22", startTime: "16:00", endTime: "17:30",
    owner: "Lisa Jacob", participants: ["max.koehler@chairly.app", "anna.mueller@chairly.app"],
    intention: "Gather product input from key customers", desiredOutcome: "Roadmap validated with 3 customer signals",
    link: "https://meet.google.com/cab-001",
    agenda: [
      { id: 1, topic: "Warm Up",         type: "ankommen",     duration: "5",  outcome: "", note: "" },
      { id: 2, topic: "Roadmap preview", type: "information",  duration: "30", outcome: "", note: "" },
      { id: 3, topic: "Customer input",  type: "beratung",     duration: "40", outcome: "", note: "" },
      { id: 4, topic: "Next steps",      type: "entscheidung", duration: "10", outcome: "", note: "" },
      { id: 5, topic: "Wrap Up",         type: "checkout",     duration: "5",  outcome: "", note: "" },
    ],
  },
]

export const MOCK_TODOS: Todo[] = [
  { id: 1, text: "Finalize agenda for quarterly review", done: false, meetingId: 1, meetingTitle: "Q2 2026 Quarterly Review" },
  { id: 2, text: "Invite participants for roadmap workshop", done: false, meetingId: 2, meetingTitle: "Product Roadmap Workshop" },
  { id: 3, text: "Prepare Q2 numbers and create slides", done: false, meetingId: 1, meetingTitle: "Q2 2026 Quarterly Review" },
  { id: 4, text: "Review last week's meeting notes", done: true, meetingId: 3, meetingTitle: "Weekly Team Sync" },
  { id: 5, text: "Transcribe interview recordings", done: false, meetingId: 4, meetingTitle: "UX Research Review" },
  { id: 6, text: "Send Zoom link for weekly sync", done: true, meetingId: 3, meetingTitle: "Weekly Team Sync" },
]

export const MOCK_PROJECTS: Project[] = [
  {
    id: "chairly",
    name: "Chairly Product",
    emoji: "🚀",
    description: "Product development & roadmap",
    files: [
      { id: 1, name: "Q2 2026 Review – Minutes",     type: "protocol", date: "2026-04-30", author: "Lisa Jacob",   meetingId: 1, meetingTitle: "Q2 2026 Quarterly Review" },
      { id: 2, name: "Roadmap Workshop – Minutes",   type: "protocol", date: "2026-05-06", author: "Max Köhler",   meetingId: 2, meetingTitle: "Product Roadmap Workshop" },
      { id: 3, name: "Q2 Metrics Deck.pdf",          type: "pdf",      date: "2026-04-29", author: "Lisa Jacob",   meetingId: 1 },
      { id: 4, name: "Feature backlog Q3.xlsx",      type: "sheet",    date: "2026-05-07", author: "Max Köhler" },
      { id: 5, name: "Product vision.doc",           type: "doc",      date: "2026-04-15", author: "Lisa Jacob" },
    ],
  },
  {
    id: "ux-research",
    name: "UX Research",
    emoji: "🎨",
    description: "User interviews & insights",
    files: [
      { id: 10, name: "UX Research Review – Minutes", type: "protocol", date: "2026-05-12", author: "Anna Müller", meetingId: 4, meetingTitle: "UX Research Review" },
      { id: 11, name: "Interview transcripts.pdf",   type: "pdf",      date: "2026-05-10", author: "Anna Müller" },
      { id: 12, name: "User journey map.png",        type: "image",    date: "2026-05-08", author: "Sara Fischer" },
      { id: 13, name: "Insights board (Figma)",      type: "link",     date: "2026-05-11", author: "Sara Fischer" },
    ],
  },
  {
    id: "team-ops",
    name: "Team Operations",
    emoji: "⚙️",
    description: "Weekly syncs & team docs",
    files: [
      { id: 20, name: "Weekly Sync – May 4 Minutes",  type: "protocol", date: "2026-05-04", author: "Sara Fischer", meetingId: 3, meetingTitle: "Weekly Team Sync" },
      { id: 21, name: "Weekly Sync – Apr 27 Minutes", type: "protocol", date: "2026-04-27", author: "Sara Fischer" },
      { id: 22, name: "Team handbook.doc",            type: "doc",      date: "2026-03-10", author: "Lisa Jacob" },
      { id: 23, name: "Onboarding checklist.doc",     type: "doc",      date: "2026-02-20", author: "Tom Becker" },
    ],
  },
  {
    id: "general",
    name: "General",
    emoji: "📋",
    description: "Misc files & notes",
    files: [
      { id: 30, name: "Office floor plan.png",        type: "image",    date: "2026-01-15", author: "Tom Becker" },
      { id: 31, name: "Company values.doc",           type: "doc",      date: "2025-11-02", author: "Lisa Jacob" },
    ],
  },
]
