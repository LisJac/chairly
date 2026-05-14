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
