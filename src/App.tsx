import { useState } from "react"
import Dashboard from "./Dashboard"
import MeetingForm from "./MeetingForm"
import MeetingDetail from "./MeetingDetail"
import MeetingLive from "./MeetingLive"
import { MOCK_MEETINGS } from "./data"
import type { Meeting } from "./types"

type View = "dashboard" | "new-meeting" | "meeting-detail" | "meeting-live"

export default function App() {
  const [view, setView] = useState<View>("dashboard")
  const [meetings, setMeetings] = useState<Meeting[]>(MOCK_MEETINGS)
  const [selectedMeetingId, setSelectedMeetingId] = useState<number | null>(null)
  const [draftMeetingId, setDraftMeetingId] = useState<number | null>(null)

  const addMeeting    = (m: Meeting) => setMeetings(ms => [...ms, m])
  const updateMeeting = (updated: Meeting) =>
    setMeetings(ms => ms.map(m => m.id === updated.id ? updated : m))
  const deleteMeeting = (id: number) =>
    setMeetings(ms => ms.filter(m => m.id !== id))

  // Detail view is a full page replacement
  if (view === "meeting-detail" && selectedMeetingId !== null) {
    const meeting = meetings.find(m => m.id === selectedMeetingId)
    if (meeting) {
      return (
        <MeetingDetail
          meeting={meeting}
          onBack={() => setView("dashboard")}
          onSave={updated => updateMeeting(updated)}
          onDelete={id => { deleteMeeting(id); setView("dashboard") }}
          onStart={() => setView("meeting-live")}
        />
      )
    }
  }

  // Live meeting (full page)
  if (view === "meeting-live" && selectedMeetingId !== null) {
    const meeting = meetings.find(m => m.id === selectedMeetingId)
    if (meeting) {
      return (
        <MeetingLive
          meeting={meeting}
          onBack={() => setView("meeting-detail")}
        />
      )
    }
  }

  // MeetingForm = full page (with back to dashboard)
  if (view === "new-meeting") {
    return (
      <MeetingForm
        draft={draftMeetingId !== null ? meetings.find(m => m.id === draftMeetingId) : undefined}
        onBack={() => { setDraftMeetingId(null); setView("dashboard") }}
        onSave={m => {
          if (draftMeetingId !== null) {
            updateMeeting({ ...m, id: draftMeetingId, isDraft: false })
          } else {
            addMeeting(m)
          }
          setDraftMeetingId(null)
          setView("dashboard")
        }}
        onSaveDraft={m => {
          if (draftMeetingId !== null) {
            updateMeeting({ ...m, id: draftMeetingId, isDraft: true })
          } else {
            addMeeting({ ...m, isDraft: true })
          }
          setDraftMeetingId(null)
          setView("dashboard")
        }}
      />
    )
  }

  return (
    <Dashboard
      meetings={meetings}
      onNewMeeting={() => { setDraftMeetingId(null); setView("new-meeting") }}
      onMeetingClick={id => {
        const m = meetings.find(x => x.id === id)
        if (m?.isDraft) {
          setDraftMeetingId(id)
          setView("new-meeting")
        } else {
          setSelectedMeetingId(id)
          setView("meeting-detail")
        }
      }}
      onMeetingDelete={deleteMeeting}
    />
  )
}
