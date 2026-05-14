import { useState } from "react"
import Dashboard from "./Dashboard"
import MeetingForm from "./MeetingForm"
import MeetingDetail from "./MeetingDetail"
import { MOCK_MEETINGS } from "./data"
import type { Meeting } from "./types"

type View = "dashboard" | "new-meeting" | "meeting-detail"

export default function App() {
  const [view, setView] = useState<View>("dashboard")
  const [meetings, setMeetings] = useState<Meeting[]>(MOCK_MEETINGS)
  const [selectedMeetingId, setSelectedMeetingId] = useState<number | null>(null)

  const addMeeting    = (m: Meeting) => setMeetings(ms => [...ms, m])
  const updateMeeting = (updated: Meeting) =>
    setMeetings(ms => ms.map(m => m.id === updated.id ? updated : m))
  const deleteMeeting = (id: number) =>
    setMeetings(ms => ms.filter(m => m.id !== id))

  if (view === "new-meeting") {
    return (
      <MeetingForm
        onBack={() => setView("dashboard")}
        onSave={m => { addMeeting(m); setView("dashboard") }}
      />
    )
  }

  if (view === "meeting-detail" && selectedMeetingId !== null) {
    const meeting = meetings.find(m => m.id === selectedMeetingId)
    if (meeting) {
      return (
        <MeetingDetail
          meeting={meeting}
          onBack={() => setView("dashboard")}
          onSave={updated => updateMeeting(updated)}
          onDelete={id => { deleteMeeting(id); setView("dashboard") }}
        />
      )
    }
  }

  return (
    <Dashboard
      meetings={meetings}
      onNewMeeting={() => setView("new-meeting")}
      onMeetingClick={id => { setSelectedMeetingId(id); setView("meeting-detail") }}
      onMeetingDelete={deleteMeeting}
    />
  )
}
