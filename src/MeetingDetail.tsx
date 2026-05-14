import { useState, useCallback, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import type { AgendaType, AgendaItem, Meeting } from "./types"

// ── Constants ─────────────────────────────────────────────
const CURRENT_USER = "Lisa Jacob"

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

const TEAM_MEMBERS = [
  { id: "lj", name: "Lisa Jacob",   email: "lisa.jacob@chairly.app",   initials: "LJ" },
  { id: "mk", name: "Max Köhler",   email: "max.koehler@chairly.app",  initials: "MK" },
  { id: "sf", name: "Sara Fischer", email: "sara.fischer@chairly.app", initials: "SF" },
  { id: "tb", name: "Tom Becker",   email: "tom.becker@chairly.app",   initials: "TB" },
  { id: "am", name: "Anna Müller",  email: "anna.mueller@chairly.app", initials: "AM" },
]

const DAYS_LONG = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"]
const MONTHS    = ["January","February","March","April","May","June","July","August","September","October","November","December"]

let idCounter = 200

function formatDate(dateStr: string) {
  const d = new Date(dateStr + "T00:00:00")
  return `${DAYS_LONG[d.getDay()]}, ${MONTHS[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`
}

function calcEndTime(start: string, totalMin: number): string {
  if (!start) return ""
  const [h, m] = start.split(":").map(Number)
  const end = h * 60 + m + totalMin
  return `${String(Math.floor(end / 60) % 24).padStart(2, "0")}:${String(end % 60).padStart(2, "0")}`
}

function getInitials(name: string) {
  return name.split(" ").map(p => p[0]).join("").toUpperCase().slice(0, 2)
}

// ── Component ─────────────────────────────────────────────
export default function MeetingDetail({
  meeting,
  onBack,
  onSave,
  onDelete,
  onStart,
}: {
  meeting: Meeting
  onBack: () => void
  onSave: (updated: Meeting) => void
  onDelete: (id: number) => void
  onStart?: () => void
}) {
  const [editing, setEditing] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const isOwner = meeting.owner === CURRENT_USER

  // ── Edit state ──
  const [title, setTitle]               = useState(meeting.title)
  const [intention, setIntention]       = useState(meeting.intention)
  const [desiredOutcome, setDesiredOutcome] = useState(meeting.desiredOutcome)
  const [date, setDate]                 = useState(meeting.date)
  const [startTime, setStartTime]       = useState(meeting.startTime)
  const [link, setLink]                 = useState(meeting.link ?? "")
  const [owner, setOwner]               = useState(
    TEAM_MEMBERS.find(m => m.name === meeting.owner)?.id ?? "lj"
  )
  const [participants, setParticipants] = useState<string[]>(meeting.participants)
  const [tagInput, setTagInput]         = useState("")
  const [agenda, setAgenda]             = useState<AgendaItem[]>(meeting.agenda)

  const agendaMin     = agenda.reduce((s, i) => s + (parseInt(i.duration) || 0), 0)
  const endTime       = calcEndTime(startTime, agendaMin + 10)
  const selectedOwner = TEAM_MEMBERS.find(m => m.id === owner)!

  // ── Drag-and-drop ──
  const dragItem  = useRef<number | null>(null)
  const dragOver  = useRef<number | null>(null)
  const [draggingId, setDraggingId] = useState<number | null>(null)

  const handleDragStart = (id: number) => { dragItem.current = id; setDraggingId(id) }
  const handleDragEnter = (id: number) => { dragOver.current = id }
  const handleDragEnd   = () => {
    if (dragItem.current !== null && dragOver.current !== null && dragItem.current !== dragOver.current) {
      setAgenda(a => {
        const next = [...a]
        const from = next.findIndex(r => r.id === dragItem.current)
        const to   = next.findIndex(r => r.id === dragOver.current)
        const [moved] = next.splice(from, 1)
        next.splice(to, 0, moved)
        return next
      })
    }
    dragItem.current = null; dragOver.current = null; setDraggingId(null)
  }

  const addRow = () =>
    setAgenda(a => [...a, { id: ++idCounter, topic: "", type: "information", outcome: "", duration: "", note: "" }])

  const updateRow = useCallback(<K extends keyof AgendaItem>(id: number, key: K, val: AgendaItem[K]) => {
    setAgenda(a => a.map(r => r.id === id ? { ...r, [key]: val } : r))
  }, [])

  const removeRow = (id: number) => setAgenda(a => a.filter(r => r.id !== id))

  const addTag = () => {
    const v = tagInput.trim()
    if (v && !participants.includes(v)) setParticipants(p => [...p, v])
    setTagInput("")
  }

  const handleTagKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === ",") { e.preventDefault(); addTag() }
    if (e.key === "Backspace" && !tagInput && participants.length)
      setParticipants(p => p.slice(0, -1))
  }

  const handleSave = () => {
    onSave({
      ...meeting,
      title,
      intention,
      desiredOutcome,
      date,
      startTime,
      endTime,
      owner: selectedOwner.name,
      participants,
      link: link || undefined,
      agenda,
    })
    setEditing(false)
  }

  const handleCancel = () => {
    setTitle(meeting.title)
    setIntention(meeting.intention)
    setDesiredOutcome(meeting.desiredOutcome)
    setDate(meeting.date)
    setStartTime(meeting.startTime)
    setLink(meeting.link ?? "")
    setOwner(TEAM_MEMBERS.find(m => m.name === meeting.owner)?.id ?? "lj")
    setParticipants(meeting.participants)
    setAgenda(meeting.agenda)
    setEditing(false)
  }

  const ownerInitials  = TEAM_MEMBERS.find(m => m.name === meeting.owner)?.initials ?? getInitials(meeting.owner)
  const viewAgendaMin  = meeting.agenda.reduce((s, i) => s + (parseInt(i.duration) || 0), 0)

  // ════════════════════════════════════════════════════════
  // VIEW MODE
  // ════════════════════════════════════════════════════════
  if (!editing) {
    return (
      <div className="min-h-screen bg-muted/40">
        <header className="sticky top-0 z-50 bg-[var(--text-primary)] text-[var(--text-on-accent)] h-14 flex items-center px-8 gap-3 shadow-md">
          <button onClick={onBack} className="text-[var(--text-on-accent)]/50 hover:text-[var(--text-on-accent)] text-sm flex items-center gap-1.5 transition-colors">
            ← Dashboard
          </button>
          <span className="text-xl font-extrabold tracking-tight ml-3">
            Chair<span className="text-[var(--accent)]">ly</span>
          </span>
          <div className="ml-auto flex items-center gap-2">
            {isOwner && (
              <Button
                onClick={() => setEditing(true)}
                variant="outline"
                className="h-8 text-sm gap-1.5"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536M9 13l6.586-6.586a2 2 0 112.828 2.828L11.828 15.828a2 2 0 01-1.414.586H9v-2a2 2 0 01.586-1.414z" />
                </svg>
                Edit
              </Button>
            )}
            {isOwner && onStart && !meeting.isDraft && (
              <Button
                onClick={onStart}
                className="bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-[var(--text-on-accent)] h-8 text-sm gap-1.5"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--text-on-accent)] animate-pulse" />
                Start meeting
              </Button>
            )}
          </div>
        </header>

        <div className="max-w-3xl mx-auto py-10 px-4 space-y-5">

          {/* Hero */}
          <div>
            <h1 className="text-2xl font-bold text-[var(--text-primary)] leading-tight">{meeting.title}</h1>
            <p className="text-sm text-muted-foreground mt-1">
              {formatDate(meeting.date)} · {meeting.startTime} – {meeting.endTime}
            </p>
            <div className="flex flex-wrap items-center gap-2.5 mt-3">
              <div className="flex items-center gap-2 bg-[var(--bg-card)] border rounded-full px-3 py-1 shadow-sm">
                <div className="w-5 h-5 rounded-full bg-[var(--accent)] text-[var(--text-on-accent)] text-[9px] font-bold flex items-center justify-center shrink-0">
                  {ownerInitials}
                </div>
                <span className="text-xs font-medium">{meeting.owner}</span>
                <Badge variant="secondary" className="text-[9px] px-1.5 py-0">Owner</Badge>
              </div>
              {meeting.participants.length > 0 && (
                <span className="text-xs text-muted-foreground">
                  {meeting.participants.length} participant{meeting.participants.length !== 1 ? "s" : ""}
                </span>
              )}
              {meeting.link && (
                <a
                  href={meeting.link} target="_blank" rel="noreferrer"
                  className="ml-auto text-xs text-[var(--accent)] hover:text-[var(--accent-pressed)] hover:underline flex items-center gap-1 transition-colors"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.1m4.444-4.444l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                  </svg>
                  Open meeting link
                </a>
              )}
            </div>
          </div>

          {/* 01 Meeting Information */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <span className="text-muted-foreground font-normal">01.</span> Meeting Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground mb-1.5">Intention</p>
                <p className="text-sm leading-relaxed">{meeting.intention || <span className="text-muted-foreground italic">Not specified</span>}</p>
              </div>
              <Separator />
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground mb-1.5">Desired Outcome</p>
                <p className="text-sm leading-relaxed">{meeting.desiredOutcome || <span className="text-muted-foreground italic">Not specified</span>}</p>
              </div>
            </CardContent>
          </Card>

          {/* 02 Agenda */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <span className="text-muted-foreground font-normal">02.</span> Agenda
              </CardTitle>
            </CardHeader>
            <CardContent>
              {meeting.agenda.length === 0 ? (
                <p className="text-sm text-muted-foreground italic py-2">No agenda items</p>
              ) : (
                <div className="divide-y">
                  {meeting.agenda.map((item, idx) => (
                    <div key={item.id} className="flex items-center gap-3 py-3">
                      <span className="text-[var(--accent)] font-bold text-sm w-5 shrink-0 text-right">{idx + 1}.</span>
                      <span className="flex-1 text-sm">{item.topic || <span className="text-muted-foreground italic">(no title)</span>}</span>
                      <Badge variant="outline" className={`text-[10px] shrink-0 border-0 font-medium ${TYPES[item.type].color}`}>
                        {TYPES[item.type].label}
                      </Badge>
                      <span className="text-xs text-muted-foreground shrink-0 w-14 text-right">
                        {item.duration ? item.duration + " min" : "—"}
                      </span>
                    </div>
                  ))}
                </div>
              )}
              <Separator className="my-3" />
              <div className="flex gap-5 text-xs text-muted-foreground">
                <span>Agenda: <strong className="text-foreground">{viewAgendaMin} min</strong></span>
                <span>+10 min buffer</span>
                <span className="font-semibold text-foreground">Total: {viewAgendaMin + 10} min</span>
              </div>
            </CardContent>
          </Card>

          {/* 03 Participants */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <span className="text-muted-foreground font-normal">03.</span> Participants
              </CardTitle>
            </CardHeader>
            <CardContent>
              {meeting.participants.length === 0 ? (
                <p className="text-sm text-muted-foreground italic">No participants added</p>
              ) : (
                <div className="flex flex-wrap gap-1.5">
                  {meeting.participants.map((p, i) => (
                    <Badge key={i} variant="secondary" className="text-[var(--text-on-soft)] bg-[var(--accent-soft)] font-normal">{p}</Badge>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {!isOwner && (
            <p className="text-xs text-center text-muted-foreground pb-4">
              Only {meeting.owner} can edit this meeting.
            </p>
          )}
        </div>
      </div>
    )
  }

  // ════════════════════════════════════════════════════════
  // EDIT MODE
  // ════════════════════════════════════════════════════════
  return (
    <div className="min-h-screen bg-muted/40">
      <header className="sticky top-0 z-50 bg-[var(--text-primary)] text-[var(--text-on-accent)] h-14 flex items-center px-8 gap-3 shadow-md">
        <button onClick={onBack} className="text-[var(--text-on-accent)]/50 hover:text-[var(--text-on-accent)] text-sm flex items-center gap-1.5 transition-colors">
          ← Dashboard
        </button>
        <span className="text-xl font-extrabold tracking-tight ml-3">
          Chair<span className="text-[var(--accent)]">ly</span>
        </span>
        <span className="text-[var(--text-on-accent)]/40 text-sm ml-1">— Edit meeting</span>
        <div className="ml-auto flex items-center gap-2">
          <Button
            variant="ghost"
            onClick={handleCancel}
            className="h-8 text-sm text-[var(--text-on-accent)]/70 hover:text-[var(--text-on-accent)] hover:bg-[var(--bg-card)]/10"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            className="bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-[var(--text-on-accent)] h-8 text-sm"
          >
            Save changes
          </Button>
        </div>
      </header>

      <div className="max-w-3xl mx-auto py-10 px-4 space-y-5">

        {/* 01 Meeting Information */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <span className="text-muted-foreground font-normal">01.</span> Meeting Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-8">
            <div className="space-y-1.5">
              <Label htmlFor="e-name">Meeting Name</Label>
              <Input id="e-name" value={title} onChange={e => setTitle(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="e-intention">Meeting Intention</Label>
              <Input id="e-intention" value={intention} onChange={e => setIntention(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="e-outcome">Desired Outcome</Label>
              <Input id="e-outcome" value={desiredOutcome} onChange={e => setDesiredOutcome(e.target.value)} />
            </div>
          </CardContent>
        </Card>

        {/* 02 Agenda */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <span className="text-muted-foreground font-normal">02.</span> Agenda
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-[20px_24px_1fr_150px_1fr_72px_28px] gap-2 px-1 text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">
              <span /><span>#</span><span>Topic</span><span>Type</span><span>Outcome</span><span>Min</span><span />
            </div>

            {agenda.map((item, idx) => (
              <div
                key={item.id}
                draggable
                onDragStart={() => handleDragStart(item.id)}
                onDragEnter={() => handleDragEnter(item.id)}
                onDragEnd={handleDragEnd}
                onDragOver={e => e.preventDefault()}
                className={`grid grid-cols-[20px_24px_1fr_150px_1fr_72px_28px] gap-2 items-center border rounded-lg p-2 transition-all ${
                  draggingId === item.id
                    ? "opacity-40 bg-[var(--accent-soft)] border-[var(--accent-soft-border)]"
                    : "bg-muted/50 hover:border-[var(--accent-soft-border)]"
                }`}
              >
                <span className="cursor-grab active:cursor-grabbing text-muted-foreground/40 hover:text-muted-foreground flex items-center justify-center select-none">⠿</span>
                <span className="text-xs font-bold text-muted-foreground text-center">{idx + 1}</span>
                <Input
                  className="h-8 text-sm" placeholder="Topic…"
                  value={item.topic} onChange={e => updateRow(item.id, "topic", e.target.value)}
                />
                <Select value={item.type} onValueChange={v => updateRow(item.id, "type", v as AgendaType)}>
                  <SelectTrigger className="h-8 text-xs w-full"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {(Object.keys(TYPES) as AgendaType[]).map(t => (
                      <SelectItem key={t} value={t} className="text-xs">{TYPES[t].label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  className="h-8 text-sm" placeholder="Expected outcome…"
                  value={item.outcome} onChange={e => updateRow(item.id, "outcome", e.target.value)}
                />
                <Input
                  className="h-8 text-sm text-center" type="number" min={1} max={180} placeholder="min"
                  value={item.duration} onChange={e => updateRow(item.id, "duration", e.target.value)}
                />
                <button
                  type="button" onClick={() => removeRow(item.id)}
                  className="w-7 h-7 flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded transition-colors text-lg leading-none"
                >×</button>
              </div>
            ))}

            <Button type="button" variant="outline" size="sm" onClick={addRow} className="w-full border-dashed">
              + Add agenda item
            </Button>

            <Separator />
            <div className="flex gap-4 text-xs text-muted-foreground">
              <span>Agenda: <strong className="text-foreground">{agendaMin} min</strong></span>
              <span>Buffer: <strong className="text-foreground">10 min</strong></span>
              <span>Total: <strong className="text-foreground">{agendaMin + 10} min</strong></span>
            </div>
          </CardContent>
        </Card>

        {/* 03 Date, Time & Location */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <span className="text-muted-foreground font-normal">03.</span> Date, Time & Location
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="e-date">Date</Label>
                <Input id="e-date" type="date" value={date} onChange={e => setDate(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="e-start">Start time</Label>
                <Input id="e-start" type="time" value={startTime} onChange={e => setStartTime(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>End time</Label>
                <Input value={endTime} readOnly className="bg-muted text-muted-foreground cursor-default" />
                <p className="text-xs text-muted-foreground">Auto-calculated</p>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="e-link">Link (Zoom / Teams / Meet)</Label>
              <Input id="e-link" type="url" placeholder="https://…" value={link} onChange={e => setLink(e.target.value)} />
            </div>
          </CardContent>
        </Card>

        {/* 04 Participants */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <span className="text-muted-foreground font-normal">04.</span> Participants
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className="flex flex-wrap gap-1.5 p-2 min-h-11 border rounded-md bg-background focus-within:ring-2 focus-within:ring-ring cursor-text"
              onClick={() => document.getElementById("e-tagInput")?.focus()}
            >
              {participants.map((p, i) => (
                <Badge key={i} variant="secondary" className="gap-1 pr-1 text-[var(--text-on-soft)] bg-[var(--accent-soft)]">
                  {p}
                  <button
                    type="button" className="ml-0.5 opacity-60 hover:opacity-100"
                    onClick={e => { e.stopPropagation(); setParticipants(ps => ps.filter((_, j) => j !== i)) }}
                  >×</button>
                </Badge>
              ))}
              <input
                id="e-tagInput" type="email"
                className="flex-1 min-w-32 text-sm outline-none bg-transparent placeholder:text-muted-foreground"
                placeholder="firstname.lastname@company.com"
                value={tagInput}
                onChange={e => setTagInput(e.target.value)}
                onKeyDown={handleTagKey}
                onBlur={addTag}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-1.5">Confirm each address with Enter or comma</p>
          </CardContent>
        </Card>

        {/* 05 Meeting Owner */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <span className="text-muted-foreground font-normal">05.</span> Meeting Owner
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Select value={owner} onValueChange={v => v && setOwner(v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {TEAM_MEMBERS.map(m => (
                  <SelectItem key={m.id} value={m.id}>
                    <div className="flex items-center gap-2.5">
                      <div className="w-6 h-6 rounded-full bg-[var(--accent)] text-[var(--text-on-accent)] text-[10px] font-bold flex items-center justify-center shrink-0">
                        {m.initials}
                      </div>
                      <span>{m.name}</span>
                      <span className="text-muted-foreground text-xs">{m.email}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted border">
              <div className="w-9 h-9 rounded-full bg-[var(--accent)] text-[var(--text-on-accent)] flex items-center justify-center text-sm font-bold shrink-0">
                {selectedOwner.initials}
              </div>
              <div>
                <p className="font-semibold text-sm">{selectedOwner.name}</p>
                <p className="text-xs text-muted-foreground">{selectedOwner.email}</p>
              </div>
              <Badge variant="secondary" className="ml-auto">Meeting Owner</Badge>
            </div>
          </CardContent>
        </Card>

        <div className="flex items-center gap-3 pb-8">
          {/* Delete */}
          {!confirmDelete ? (
            <Button
              variant="ghost"
              onClick={() => setConfirmDelete(true)}
              className="text-destructive hover:text-destructive hover:bg-destructive/10 gap-1.5"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Delete meeting
            </Button>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-sm text-destructive font-medium">Really delete?</span>
              <Button size="sm" variant="destructive" onClick={() => onDelete(meeting.id)}>
                Yes, delete
              </Button>
              <Button size="sm" variant="outline" onClick={() => setConfirmDelete(false)}>
                Cancel
              </Button>
            </div>
          )}
          <div className="ml-auto flex gap-3">
            <Button variant="outline" onClick={handleCancel}>Cancel</Button>
            <Button onClick={handleSave} className="bg-[var(--accent)] hover:bg-[var(--accent-hover)]">
              Save changes
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
