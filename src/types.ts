export type AgendaType =
  | "information" | "entscheidung" | "brainstorm"
  | "beratung" | "kreativ" | "ankommen" | "checkout" | "sonstige"

export type TemplateId =
  | "none"
  | "basic_info"            // for Information goal
  | "grow"                  // for Input goal
  | "three_field"           // for Input goal
  | "konsent"               // for Decision goal
  | "systemic_condensing"   // for Decision goal
  // legacy / live capture templates (kept for backward compat)
  | "decision" | "actions" | "brainstorm" | "status" | "notes"

export interface AgendaItem {
  id: number
  topic: string
  type: AgendaType
  template?: TemplateId
  useGenerator?: boolean      // ✨ check-in / retro generator toggle for ankommen / checkout types
  outcome: string
  duration: string
  note: string
}

export interface Meeting {
  id: number
  title: string
  date: string
  startTime: string
  endTime: string
  owner: string
  participants: string[]
  intention: string
  desiredOutcome: string
  link?: string
  agenda: AgendaItem[]
  isDraft?: boolean
}

export interface Todo {
  id: number
  text: string
  done: boolean
  meetingId?: number
  meetingTitle?: string
}

export type DocumentFileType = "protocol" | "pdf" | "doc" | "sheet" | "image" | "link"

export interface DocumentFile {
  id: number
  name: string
  type: DocumentFileType
  date: string          // ISO date YYYY-MM-DD
  author: string
  meetingId?: number
  meetingTitle?: string
}

export interface Project {
  id: string
  name: string
  emoji: string
  description?: string
  files: DocumentFile[]
}
