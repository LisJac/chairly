import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { Meeting, AgendaType } from "./types"

// ── Constants ─────────────────────────────────────────────
const TEAM_MEMBERS = [
  { id: "lj", name: "Lisa Jacob",   email: "lisa.jacob@chairly.app",   initials: "LJ" },
  { id: "mk", name: "Max Köhler",   email: "max.koehler@chairly.app",  initials: "MK" },
  { id: "sf", name: "Sara Fischer", email: "sara.fischer@chairly.app", initials: "SF" },
  { id: "tb", name: "Tom Becker",   email: "tom.becker@chairly.app",   initials: "TB" },
  { id: "am", name: "Anna Müller",  email: "anna.mueller@chairly.app", initials: "AM" },
]

const TYPES: Record<AgendaType, { label: string; color: string }> = {
  information:  { label: "Information", color: "bg-[var(--status-info-soft)] text-[var(--status-info)]" },
  entscheidung: { label: "Decision",    color: "bg-[var(--accent-soft)] text-[var(--text-on-soft)]" },
  brainstorm:   { label: "Brainstorm",  color: "bg-[var(--status-live-soft)] text-[var(--status-live)]" },
  beratung:     { label: "Advisory",    color: "bg-[var(--bg-muted)] text-[var(--text-secondary)]" },
  kreativ:      { label: "Creative",    color: "bg-[var(--status-warning-soft)] text-[var(--status-warning)]" },
  ankommen:     { label: "Check-in",    color: "bg-[var(--status-info-soft)] text-[var(--status-info)]" },
  checkout:     { label: "Check-out",   color: "bg-[var(--bg-surface)] text-[var(--text-secondary)]" },
  sonstige:     { label: "Other",       color: "bg-[var(--bg-muted)] text-[var(--text-tertiary)]" },
}

type TemplateId = "decision" | "actions" | "brainstorm" | "status" | "notes"

const TEMPLATES: { id: TemplateId; name: string; icon: string; description: string }[] = [
  { id: "decision",   name: "Decision",      icon: "✅", description: "Document a key decision" },
  { id: "actions",    name: "Action items",  icon: "📌", description: "Tasks with owners" },
  { id: "brainstorm", name: "Brainstorm",    icon: "💡", description: "Collect ideas" },
  { id: "status",     name: "Status update", icon: "📊", description: "What's working & next" },
  { id: "notes",      name: "Free notes",    icon: "📝", description: "Just type" },
]

// ── Helpers ────────────────────────────────────────────────
function formatDuration(seconds: number) {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  if (h > 0) return `${h}:${String(m).padStart(2,"0")}:${String(s).padStart(2,"0")}`
  return `${String(m).padStart(2,"0")}:${String(s).padStart(2,"0")}`
}

function getInitials(name: string) {
  return name.split(" ").map(p => p[0]).join("").toUpperCase().slice(0, 2)
}

// ── Component ──────────────────────────────────────────────
export default function MeetingLive({ meeting, onBack }: {
  meeting: Meeting
  onBack: () => void
}) {
  // Meeting-wide clock
  const [meetingStart] = useState(Date.now())
  const [now, setNow] = useState(Date.now())
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(id)
  }, [])
  const meetingElapsed = Math.floor((now - meetingStart) / 1000)

  // Agenda progress
  const [currentItemIdx, setCurrentItemIdx] = useState(0)
  const [itemStartTime, setItemStartTime] = useState<number | null>(null)
  const [timerOn, setTimerOn] = useState(true)
  const [doneItems, setDoneItems] = useState<Set<number>>(new Set())

  const currentItem = meeting.agenda[currentItemIdx]
  const currentPlannedSec = (parseInt(currentItem?.duration ?? "0") || 0) * 60
  const itemElapsed = itemStartTime !== null ? Math.floor((now - itemStartTime) / 1000) : 0
  const overTime = currentPlannedSec > 0 && itemElapsed > currentPlannedSec

  // Auto-start timer for the first item on mount
  useEffect(() => {
    if (itemStartTime === null && timerOn) setItemStartTime(Date.now())
  }, [itemStartTime, timerOn])

  const goToItem = (idx: number) => {
    if (idx < 0 || idx >= meeting.agenda.length) return
    setCurrentItemIdx(idx)
    setItemStartTime(timerOn ? Date.now() : null)
  }

  const markCurrentDone = () => {
    setDoneItems(d => new Set(d).add(currentItem.id))
    if (currentItemIdx < meeting.agenda.length - 1) goToItem(currentItemIdx + 1)
  }

  // Templates / notes
  const [activeTemplate, setActiveTemplate] = useState<TemplateId | null>(null)
  const [decisionTitle, setDecisionTitle] = useState("")
  const [decisionOptions, setDecisionOptions] = useState("")
  const [decisionChoice, setDecisionChoice] = useState("")
  const [decisionOwner, setDecisionOwner] = useState("lj")
  const [actionItems, setActionItems] = useState<{ task: string; owner: string }[]>([{ task: "", owner: "lj" }])
  const [brainstormItems, setBrainstormItems] = useState<string>("")
  const [statusGood, setStatusGood] = useState("")
  const [statusBad, setStatusBad] = useState("")
  const [statusNext, setStatusNext] = useState("")
  const [freeNotes, setFreeNotes] = useState("")

  // Participants (mock — everyone "joined")
  const participants = meeting.participants.map(email => {
    const member = TEAM_MEMBERS.find(m => m.email === email)
    return member ?? { id: email, name: email, email, initials: getInitials(email) }
  })
  const ownerMember = TEAM_MEMBERS.find(m => m.name === meeting.owner) ?? null

  return (
    <div className="min-h-screen bg-muted/40 flex flex-col">

      {/* ── Top bar ── */}
      <header className="sticky top-0 z-30 bg-[var(--bg-card)] border-b px-6 py-3 flex items-center gap-4">
        <button
          onClick={onBack}
          className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] flex items-center gap-1 transition-colors"
        >
          ← Back
        </button>
        <div className="h-5 w-px bg-border" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[var(--status-recording-soft)] text-[var(--status-recording)] text-[10px] font-medium uppercase tracking-wide">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--status-recording)] animate-pulse" />
              Live
            </span>
            <h1 className="text-sm font-medium text-[var(--text-primary)] truncate">{meeting.title}</h1>
          </div>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            🎤 Facilitated by {meeting.owner === "Lisa Jacob" ? "you" : meeting.owner} · {participants.length} participants
          </p>
        </div>
        {/* Meeting timer */}
        <div className="text-right">
          <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Elapsed</p>
          <p className="text-sm font-mono font-medium text-[var(--text-primary)] tabular-nums">{formatDuration(meetingElapsed)}</p>
        </div>
      </header>

      <div className="flex-1 max-w-7xl mx-auto w-full px-4 py-5">
        <div className="grid grid-cols-[260px_1fr_220px] gap-5 items-start">

          {/* ════════════════════════════════════════ */}
          {/* LEFT: AGENDA + TIMER                      */}
          {/* ════════════════════════════════════════ */}
          <Card>
            <CardContent className="p-0">
              <div className="px-4 py-3 border-b flex items-center justify-between">
                <h3 className="text-sm font-medium text-[var(--text-primary)]">Agenda</h3>
                <span className="text-[10px] text-muted-foreground">
                  {doneItems.size}/{meeting.agenda.length} done
                </span>
              </div>

              {/* Timer block for current item */}
              <div className="px-4 py-3 bg-[var(--bg-muted)]/40 border-b space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">Current item</p>
                  <button
                    onClick={() => {
                      setTimerOn(t => {
                        const next = !t
                        if (next && itemStartTime === null) setItemStartTime(Date.now() - itemElapsed * 1000)
                        return next
                      })
                    }}
                    className="text-[10px] font-medium px-2 py-0.5 rounded text-[var(--text-secondary)] hover:bg-muted transition-colors"
                  >
                    {timerOn ? "⏸ Pause" : "▶ Resume"}
                  </button>
                </div>
                <p className={`font-mono text-2xl font-medium tabular-nums ${overTime ? "text-[var(--status-recording)]" : "text-[var(--text-primary)]"}`}>
                  {formatDuration(itemElapsed)}
                </p>
                <p className="text-[11px] text-muted-foreground">
                  of {currentItem?.duration ?? "—"} min planned
                  {overTime && <span className="text-[var(--status-recording)] font-medium ml-1">· over time</span>}
                </p>
                {/* Progress bar */}
                <div className="h-1 bg-border rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all ${overTime ? "bg-[var(--status-recording)]" : "bg-[var(--accent)]"}`}
                    style={{ width: `${Math.min((itemElapsed / Math.max(currentPlannedSec, 1)) * 100, 100)}%` }}
                  />
                </div>
                <div className="flex gap-2 pt-1">
                  <Button
                    size="sm"
                    onClick={markCurrentDone}
                    className="flex-1 bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-[var(--text-on-accent)] h-7 text-xs font-medium"
                  >
                    {currentItemIdx === meeting.agenda.length - 1 ? "Finish ✓" : "Next →"}
                  </Button>
                </div>
              </div>

              {/* Agenda list */}
              <div className="divide-y">
                {meeting.agenda.map((item, idx) => {
                  const isCurrent = idx === currentItemIdx
                  const isDone = doneItems.has(item.id)
                  return (
                    <button
                      key={item.id}
                      onClick={() => goToItem(idx)}
                      className={`w-full flex items-start gap-2.5 px-4 py-2.5 text-left transition-colors
                        ${isCurrent ? "bg-[var(--accent-soft)]/40" : "hover:bg-muted/40"}`}
                    >
                      <div className={`mt-0.5 w-4 h-4 rounded-full shrink-0 flex items-center justify-center text-[10px] font-medium
                        ${isDone ? "bg-[var(--status-live)] text-[var(--text-on-accent)]"
                                 : isCurrent ? "bg-[var(--accent)] text-[var(--text-on-accent)]"
                                 : "bg-border text-[var(--text-tertiary)]"}`}>
                        {isDone ? "✓" : idx + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-xs leading-tight ${isDone ? "line-through text-muted-foreground" : "text-[var(--text-primary)]"}`}>
                          {item.topic || "(no title)"}
                        </p>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <Badge variant="outline" className={`text-[9px] border-0 font-normal px-1.5 py-0 ${TYPES[item.type].color}`}>
                            {TYPES[item.type].label}
                          </Badge>
                          <span className="text-[10px] text-muted-foreground">{item.duration || "—"} min</span>
                        </div>
                      </div>
                    </button>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          {/* ════════════════════════════════════════ */}
          {/* CENTER: TEMPLATES + ACTIVE TEMPLATE      */}
          {/* ════════════════════════════════════════ */}
          <div className="space-y-5 min-w-0">

            {/* Current item header */}
            <Card>
              <CardContent className="px-5 py-4">
                <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Now discussing</p>
                <div className="flex items-center gap-2 mt-1">
                  <h2 className="text-lg font-medium text-[var(--text-primary)]">{currentItem?.topic || "(no title)"}</h2>
                  <Badge variant="outline" className={`text-[10px] border-0 ${TYPES[currentItem?.type ?? "sonstige"].color}`}>
                    {TYPES[currentItem?.type ?? "sonstige"].label}
                  </Badge>
                </div>
                {currentItem?.outcome && (
                  <p className="text-xs text-muted-foreground mt-1.5">
                    <span className="font-medium text-[var(--text-secondary)]">Expected outcome: </span>
                    {currentItem.outcome}
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Template picker */}
            <Card>
              <CardContent className="px-5 py-4">
                <p className="text-[10px] uppercase tracking-wide text-muted-foreground mb-3">Capture with a template</p>
                <div className="grid grid-cols-5 gap-2">
                  {TEMPLATES.map(t => (
                    <button
                      key={t.id}
                      onClick={() => setActiveTemplate(t.id)}
                      className={`flex flex-col items-center gap-1.5 px-2 py-3 rounded-lg border text-center transition-all
                        ${activeTemplate === t.id
                          ? "bg-[var(--accent-soft)] border-[var(--accent)] text-[var(--text-on-soft)]"
                          : "bg-[var(--bg-card)] border-border hover:border-[var(--accent-soft-border)] hover:bg-muted/40"}`}
                    >
                      <span className="text-xl">{t.icon}</span>
                      <span className="text-[11px] font-medium leading-tight">{t.name}</span>
                    </button>
                  ))}
                </div>
                {activeTemplate && (
                  <p className="text-[11px] text-muted-foreground mt-2 italic">
                    {TEMPLATES.find(t => t.id === activeTemplate)?.description}
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Active template content */}
            {activeTemplate && (
              <Card>
                <CardContent className="px-5 py-4 space-y-3">
                  {/* DECISION */}
                  {activeTemplate === "decision" && (
                    <>
                      <h3 className="text-sm font-medium flex items-center gap-2">✅ Decision</h3>
                      <input
                        className="w-full text-sm border rounded-md px-3 py-1.5 bg-background outline-none focus:ring-2 focus:ring-ring"
                        placeholder="What is being decided?"
                        value={decisionTitle}
                        onChange={e => setDecisionTitle(e.target.value)}
                      />
                      <textarea
                        className="w-full text-sm border rounded-md px-3 py-1.5 bg-background outline-none focus:ring-2 focus:ring-ring min-h-16"
                        placeholder="Options considered (one per line)"
                        value={decisionOptions}
                        onChange={e => setDecisionOptions(e.target.value)}
                      />
                      <div className="grid grid-cols-[1fr_140px] gap-2">
                        <input
                          className="text-sm border rounded-md px-3 py-1.5 bg-background outline-none focus:ring-2 focus:ring-ring"
                          placeholder="Chosen option"
                          value={decisionChoice}
                          onChange={e => setDecisionChoice(e.target.value)}
                        />
                        <select
                          className="text-sm border rounded-md px-3 py-1.5 bg-background outline-none"
                          value={decisionOwner}
                          onChange={e => setDecisionOwner(e.target.value)}
                        >
                          {TEAM_MEMBERS.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                        </select>
                      </div>
                    </>
                  )}

                  {/* ACTION ITEMS */}
                  {activeTemplate === "actions" && (
                    <>
                      <h3 className="text-sm font-medium flex items-center gap-2">📌 Action items</h3>
                      {actionItems.map((row, i) => (
                        <div key={i} className="grid grid-cols-[1fr_140px_28px] gap-2 items-center">
                          <input
                            className="text-sm border rounded-md px-3 py-1.5 bg-background outline-none focus:ring-2 focus:ring-ring"
                            placeholder="Task description"
                            value={row.task}
                            onChange={e => setActionItems(items => items.map((r, ix) => ix === i ? { ...r, task: e.target.value } : r))}
                          />
                          <select
                            className="text-sm border rounded-md px-3 py-1.5 bg-background outline-none"
                            value={row.owner}
                            onChange={e => setActionItems(items => items.map((r, ix) => ix === i ? { ...r, owner: e.target.value } : r))}
                          >
                            {TEAM_MEMBERS.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                          </select>
                          <button
                            onClick={() => setActionItems(items => items.filter((_, ix) => ix !== i))}
                            className="text-muted-foreground hover:text-destructive text-base leading-none"
                          >×</button>
                        </div>
                      ))}
                      <Button
                        variant="outline" size="sm"
                        onClick={() => setActionItems(items => [...items, { task: "", owner: "lj" }])}
                        className="w-full border-dashed"
                      >+ Add action</Button>
                    </>
                  )}

                  {/* BRAINSTORM */}
                  {activeTemplate === "brainstorm" && (
                    <>
                      <h3 className="text-sm font-medium flex items-center gap-2">💡 Brainstorm</h3>
                      <textarea
                        className="w-full text-sm border rounded-md px-3 py-2 bg-background outline-none focus:ring-2 focus:ring-ring min-h-32"
                        placeholder="One idea per line — capture freely, sort later"
                        value={brainstormItems}
                        onChange={e => setBrainstormItems(e.target.value)}
                      />
                    </>
                  )}

                  {/* STATUS */}
                  {activeTemplate === "status" && (
                    <>
                      <h3 className="text-sm font-medium flex items-center gap-2">📊 Status update</h3>
                      <div>
                        <label className="text-[11px] font-medium uppercase tracking-wide text-[var(--status-live)]">What's working</label>
                        <textarea
                          className="w-full mt-1 text-sm border rounded-md px-3 py-1.5 bg-background outline-none focus:ring-2 focus:ring-ring min-h-16"
                          value={statusGood} onChange={e => setStatusGood(e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-medium uppercase tracking-wide text-[var(--status-warning)]">What's not</label>
                        <textarea
                          className="w-full mt-1 text-sm border rounded-md px-3 py-1.5 bg-background outline-none focus:ring-2 focus:ring-ring min-h-16"
                          value={statusBad} onChange={e => setStatusBad(e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-medium uppercase tracking-wide text-[var(--accent)]">Next steps</label>
                        <textarea
                          className="w-full mt-1 text-sm border rounded-md px-3 py-1.5 bg-background outline-none focus:ring-2 focus:ring-ring min-h-16"
                          value={statusNext} onChange={e => setStatusNext(e.target.value)}
                        />
                      </div>
                    </>
                  )}

                  {/* FREE NOTES */}
                  {activeTemplate === "notes" && (
                    <>
                      <h3 className="text-sm font-medium flex items-center gap-2">📝 Notes</h3>
                      <textarea
                        className="w-full text-sm border rounded-md px-3 py-2 bg-background outline-none focus:ring-2 focus:ring-ring min-h-40"
                        placeholder="Start typing…"
                        value={freeNotes} onChange={e => setFreeNotes(e.target.value)}
                      />
                    </>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* ════════════════════════════════════════ */}
          {/* RIGHT: PARTICIPANTS                       */}
          {/* ════════════════════════════════════════ */}
          <Card>
            <CardContent className="p-0">
              <div className="px-4 py-3 border-b">
                <h3 className="text-sm font-medium text-[var(--text-primary)]">Participants</h3>
                <p className="text-[10px] text-muted-foreground mt-0.5">{participants.length + (ownerMember ? 1 : 0)} in the room</p>
              </div>
              <div className="divide-y">
                {/* Owner first */}
                {ownerMember && (
                  <div className="flex items-center gap-2.5 px-4 py-2.5">
                    <div className="relative shrink-0">
                      <div className="w-7 h-7 rounded-full bg-[var(--accent)] text-[var(--text-on-accent)] text-[10px] font-medium flex items-center justify-center">
                        {ownerMember.initials}
                      </div>
                      <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-[var(--status-live)] border-2 border-[var(--bg-card)]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-[var(--text-primary)] truncate">{ownerMember.name}</p>
                      <p className="text-[10px] text-[var(--accent)] font-medium">🎤 Host</p>
                    </div>
                  </div>
                )}
                {participants.map(p => (
                  <div key={p.id} className="flex items-center gap-2.5 px-4 py-2.5">
                    <div className="relative shrink-0">
                      <div className="w-7 h-7 rounded-full bg-[var(--bg-muted)] text-[var(--text-secondary)] text-[10px] font-medium flex items-center justify-center">
                        {p.initials}
                      </div>
                      <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-[var(--status-live)] border-2 border-[var(--bg-card)]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-[var(--text-primary)] truncate">{p.name}</p>
                      <p className="text-[10px] text-muted-foreground truncate">{p.email}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
