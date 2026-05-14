export type AgendaType =
  | "information" | "entscheidung" | "brainstorm"
  | "beratung" | "kreativ" | "ankommen" | "checkout" | "sonstige"

export interface AgendaItem {
  id: number
  topic: string
  type: AgendaType
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
}

export interface Todo {
  id: number
  text: string
  done: boolean
  meetingId?: number
  meetingTitle?: string
}
