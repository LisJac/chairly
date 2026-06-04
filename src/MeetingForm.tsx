import { useState, useCallback, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import type { AgendaType, AgendaItem, Meeting, TemplateId } from "./types"
import TemplateIcon from "./TemplateIcon"

// Thinking frameworks / templates available per Goal
// `name` = persona name (shown bold), `oldName` = technical term shown in parens
const TEMPLATES: { id: TemplateId; name: string; oldName?: string; description?: string }[] = [
  { id: "none",                name: "No template" },
  { id: "basic_info",          name: "Ute",      oldName: "Kurzes Update",                 description: "strukturiertes Update ohne Diskussion" },
  { id: "grow",                name: "Kurt",     oldName: "GROW",                          description: "Ziel strukturiert erarbeiten" },
  { id: "three_field",         name: "Frieda",   oldName: "Offener Austausch",             description: "offen erkunden und entscheiden" },
  { id: "konsent",             name: "Werner",   oldName: "Konsent-Entscheid",             description: "Konsent zu einem Vorschlag prüfen" },
  { id: "systemic_condensing", name: "Sven",     oldName: "Systemisches Konsensieren",     description: "mehrere Optionen per Widerstandsmessung" },
  { id: "konsultativ",         name: "Karl",     oldName: "Konsultativer Einzelentscheid", description: "eine Person entscheidet nach Konsultation" },
]

// Which templates are valid for which Goal
const TEMPLATES_BY_GOAL: Record<AgendaType, TemplateId[]> = {
  information:  ["basic_info"],                                  // Ute
  beratung:     ["grow", "three_field"],                         // Kurt · Frieda
  entscheidung: ["konsent", "systemic_condensing", "konsultativ"], // Werner · Sven · Karl
  kreativ:      [],                                              // Ideas — empty
  ankommen:     [],
  checkout:     [],
  brainstorm:   [],
  sonstige:     [],
}

const SUGGESTED_TEMPLATE: Record<AgendaType, TemplateId> = {
  information:  "basic_info",
  beratung:     "grow",
  entscheidung: "konsent",
  kreativ:      "none",
  ankommen:     "none",
  checkout:     "none",
  brainstorm:   "none",
  sonstige:     "none",
}

const TYPES: Record<AgendaType, { label: string; color: string }> = {
  information:  { label: "Information",    color: "bg-[var(--status-info-soft)] text-[var(--status-info)]" },
  beratung:     { label: "Input",          color: "bg-[var(--bg-muted)] text-[var(--text-secondary)]" },
  entscheidung: { label: "Decision",       color: "bg-[var(--accent-soft)] text-[var(--text-on-soft)]" },
  kreativ:      { label: "Ideas",          color: "bg-[var(--status-warning-soft)] text-[var(--status-warning)]" },
  ankommen:     { label: "Check-in",       color: "bg-[var(--status-info-soft)] text-[var(--status-info)]" },
  checkout:     { label: "Check-out",      color: "bg-[var(--bg-surface)] text-[var(--text-secondary)]" },
  brainstorm:   { label: "Brainstorm",     color: "bg-[var(--status-live-soft)] text-[var(--status-live)]" },
  sonstige:     { label: "Other",          color: "bg-[var(--bg-muted)] text-[var(--text-tertiary)]" },
}

const BUFFER = 10
let idCounter = 3

const TEAM_MEMBERS = [
  { id: "lj", name: "Lisa Jacob",   email: "lisa.jacob@chairly.app",   initials: "LJ" },
  { id: "mk", name: "Max Köhler",   email: "max.koehler@chairly.app",  initials: "MK" },
  { id: "sf", name: "Sara Fischer", email: "sara.fischer@chairly.app", initials: "SF" },
  { id: "tb", name: "Tom Becker",   email: "tom.becker@chairly.app",   initials: "TB" },
  { id: "am", name: "Anna Müller",  email: "anna.mueller@chairly.app", initials: "AM" },
]

const TEAMS = [
  {
    id: "product",
    name: "Product Team",
    emoji: "🚀",
    members: ["lisa.jacob@chairly.app", "max.koehler@chairly.app", "anna.mueller@chairly.app"],
  },
  {
    id: "design",
    name: "Design Team",
    emoji: "🎨",
    members: ["sara.fischer@chairly.app", "anna.mueller@chairly.app", "lisa.jacob@chairly.app"],
  },
  {
    id: "engineering",
    name: "Engineering Team",
    emoji: "⚙️",
    members: ["max.koehler@chairly.app", "tom.becker@chairly.app"],
  },
  {
    id: "all",
    name: "All Hands",
    emoji: "🌍",
    members: ["lisa.jacob@chairly.app", "max.koehler@chairly.app", "sara.fischer@chairly.app", "tom.becker@chairly.app", "anna.mueller@chairly.app"],
  },
]

function calcEndTime(start: string, totalMin: number): string {
  if (!start) return ""
  const [h, m] = start.split(":").map(Number)
  const end = h * 60 + m + totalMin
  return `${String(Math.floor(end / 60) % 24).padStart(2, "0")}:${String(end % 60).padStart(2, "0")}`
}

export default function MeetingForm({
  onBack,
  onSave,
  onSaveDraft,
  draft,
}: {
  onBack: () => void
  onSave: (meeting: Meeting) => void
  onSaveDraft: (meeting: Meeting) => void
  draft?: Meeting
}) {
  const ownerIdFromName = (name?: string) => TEAM_MEMBERS.find(m => m.name === name)?.id ?? "lj"

  const [meetingName, setMeetingName] = useState(draft?.title ?? "")
  const [intention, setIntention] = useState(draft?.intention ?? "")
  const [desiredOutcome, setDesiredOutcome] = useState(draft?.desiredOutcome ?? "")
  const [date, setDate] = useState(draft?.date ?? new Date().toISOString().slice(0, 10))
  const [startTime, setStartTime] = useState(draft?.startTime ?? "09:00")
  const [link, setLink] = useState(draft?.link ?? "")
  const [personalMsg, setPersonalMsg] = useState("")
  const [owner, setOwner] = useState(ownerIdFromName(draft?.owner))
  const [participants, setParticipants] = useState<string[]>(draft?.participants ?? [])
  const [tagInput, setTagInput] = useState("")
  const [showDraftPrompt, setShowDraftPrompt] = useState(false)
  const [previewForItemId, setPreviewForItemId] = useState<number | null>(null)
  const [showValidation, setShowValidation] = useState(false)
  const [useBuffer, setUseBuffer] = useState(true)
  const [agenda, setAgenda] = useState<AgendaItem[]>(draft?.agenda ?? [
    { id: 1, topic: "Warm Up",    type: "ankommen",     useGenerator: true,  outcome: "", duration: "5", note: "" },
    { id: 2, topic: "Main Topic", type: "entscheidung", template: "konsent", outcome: "", duration: "",  note: "" },
    { id: 3, topic: "Wrap Up",    type: "checkout",     useGenerator: true,  outcome: "", duration: "5", note: "" },
  ])

  const agendaMin = agenda.reduce((s, i) => s + (parseInt(i.duration) || 0), 0)
  const bufferMin = useBuffer ? BUFFER : 0
  const totalMin = agendaMin + bufferMin
  const endTime = calcEndTime(startTime, totalMin)

  const dragItem = useRef<number | null>(null)
  const dragOver = useRef<number | null>(null)
  const [draggingId, setDraggingId] = useState<number | null>(null)

  const handleDragStart = (id: number) => { dragItem.current = id; setDraggingId(id) }
  const handleDragEnter = (id: number) => { dragOver.current = id }
  const handleDragEnd = () => {
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
    setAgenda(a => {
      const newItem: AgendaItem = { id: ++idCounter, topic: "", type: "information", template: "basic_info", outcome: "", duration: "", note: "" }
      // Keep any check-out item as the last agenda point
      const lastIdx = a.length - 1
      if (lastIdx >= 0 && a[lastIdx].type === "checkout") {
        return [...a.slice(0, lastIdx), newItem, a[lastIdx]]
      }
      return [...a, newItem]
    })

  const updateRow = useCallback(<K extends keyof AgendaItem>(id: number, key: K, val: AgendaItem[K]) => {
    setAgenda(a => a.map(r => {
      if (r.id !== id) return r
      const next = { ...r, [key]: val }
      // When type changes, auto-suggest the matching template (only if user hasn't changed it before)
      if (key === "type") next.template = SUGGESTED_TEMPLATE[val as AgendaType]
      return next
    }))
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

  const dateDisplay = date ? date.split("-").reverse().join(".") : "—"
  const selectedOwner = TEAM_MEMBERS.find(m => m.id === owner)!

  const hasContent = meetingName.trim() !== "" || intention.trim() !== "" || desiredOutcome.trim() !== ""
    || participants.length > 0 || link.trim() !== ""

  const isInvalidDuration = (d: string) => !d.trim() || parseInt(d) <= 0
  const invalidItems = agenda.filter(a => isInvalidDuration(a.duration))

  const buildMeeting = (): Meeting => ({
    id: draft?.id ?? Date.now(),
    title: meetingName || "Untitled meeting",
    date,
    startTime,
    endTime,
    owner: selectedOwner.name,
    participants,
    intention,
    desiredOutcome,
    ...(link ? { link } : {}),
    agenda,
  })

  const handleBack = () => {
    if (hasContent) setShowDraftPrompt(true)
    else onBack()
  }

  return (
    <div className="min-h-screen bg-muted/40">
      {/* Top bar with back arrow */}
      <div className="sticky top-0 z-20 bg-[var(--bg-canvas)]/95 backdrop-blur border-b">
        <div className="max-w-3xl mx-auto px-6 py-3">
          <button
            onClick={handleBack}
            className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] flex items-center gap-1.5 transition-colors"
          >
            ← Dashboard
          </button>
        </div>
      </div>

      <div className="max-w-3xl mx-auto pt-8 pb-12 px-6 space-y-5">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Schedule a new meeting</h1>
          <p className="text-sm text-muted-foreground mt-1">
            The more thoroughly you prepare your meeting, the easier it will be to run. Even if it feels like extra work upfront, you'll find during the meeting that you can facilitate better and achieve a stronger outcome.
          </p>
        </div>

        <div className="pt-4" />

        {/* 01 Meeting Information */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <span className="text-muted-foreground font-normal">01.</span> Meeting Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-8">
            <div className="space-y-1.5">
              <Label htmlFor="name">Meeting Name</Label>
              <Input id="name" className="h-10" placeholder="e.g. Q2 2026 Quarterly Review" value={meetingName} onChange={e => setMeetingName(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="intention">Meeting Intention</Label>
              <Input id="intention" className="h-10" placeholder="Why is this meeting happening?" value={intention} onChange={e => setIntention(e.target.value)} />
              <p className="text-xs text-muted-foreground">What's the reason? What should it accomplish?</p>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="outcome">Desired Outcome</Label>
              <Input id="outcome" className="h-10" placeholder="What does a successful meeting look like?" value={desiredOutcome} onChange={e => setDesiredOutcome(e.target.value)} />
              <p className="text-xs text-muted-foreground">What needs to be achieved by the end?</p>
            </div>
          </CardContent>
        </Card>

        {/* 02 Agenda */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <span className="text-muted-foreground font-normal">02.</span> Agenda
            </CardTitle>
            <CardDescription>Meeting duration is automatically calculated from the agenda</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {agenda.map((item, idx) => (
              <div
                key={item.id}
                draggable
                onDragStart={() => handleDragStart(item.id)}
                onDragEnter={() => handleDragEnter(item.id)}
                onDragEnd={handleDragEnd}
                onDragOver={e => e.preventDefault()}
                className={`border rounded-lg p-4 transition-all ${
                  draggingId === item.id
                    ? "opacity-40 bg-[var(--accent-soft)] border-[var(--accent-soft-border)]"
                    : "bg-muted/40 hover:border-[var(--accent-soft-border)]"
                }`}
              >
                {/* Header row: drag handle + big number + delete */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <span
                      className="cursor-grab active:cursor-grabbing text-[var(--text-tertiary)] hover:text-[var(--text-primary)] select-none text-2xl leading-none transition-colors"
                      title="Drag to reorder"
                    >⠿</span>
                    <span className="text-2xl font-medium text-[var(--text-primary)] leading-none">{idx + 1}.</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeRow(item.id)}
                    className="w-7 h-7 flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded transition-colors text-lg leading-none"
                    title="Remove agenda item"
                  >×</button>
                </div>

                {/* 3 labeled lines */}
                <div className="space-y-3">
                  {/* Line 1: Topic (full width) */}
                  <div className="space-y-1">
                    <Label className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">Topic</Label>
                    <Input
                      className="h-10 text-sm"
                      placeholder="What will be discussed?"
                      value={item.topic}
                      onChange={e => updateRow(item.id, "topic", e.target.value)}
                    />
                  </div>

                  {(() => {
                    const isCheckin   = item.type === "ankommen"
                    const isCheckout  = item.type === "checkout"
                    const isGenerator = isCheckin || isCheckout
                    const generatorLabel = isCheckin ? "Checkin Generator" : "Retro Generator"
                    const generatorHint  = isCheckin
                      ? "spontaneously generated during the meeting"
                      : "spontaneously generated during the meeting"

                    // Shared Goal select (was Type)
                    const GoalSelect = (
                      <div className="space-y-1">
                        <Label className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">Goal</Label>
                        <Select value={item.type} onValueChange={v => updateRow(item.id, "type", v as AgendaType)}>
                          <SelectTrigger className="!h-10 text-sm w-full">
                            <SelectValue>{TYPES[item.type].label}</SelectValue>
                          </SelectTrigger>
                          <SelectContent>
                            {(Object.keys(TYPES) as AgendaType[])
                              .filter(t => t !== "brainstorm")
                              .map(t => (
                                <SelectItem key={t} value={t} className="text-sm">{TYPES[t].label}</SelectItem>
                              ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )

                    // Shared Duration input
                    const DurationInput = (
                      <div className="space-y-1">
                        <Label className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">Duration</Label>
                        <div className={`flex items-center gap-1 border rounded-md px-2 bg-background h-10 focus-within:ring-2 focus-within:ring-ring ${
                          showValidation && isInvalidDuration(item.duration) ? "border-destructive ring-2 ring-destructive/20" : ""
                        }`}>
                          <Input
                            className="h-9 text-sm text-right border-0 shadow-none focus-visible:ring-0 p-0 min-w-0"
                            type="number" min={1} max={180} placeholder="0"
                            value={item.duration}
                            onChange={e => updateRow(item.id, "duration", e.target.value)}
                          />
                          <span className="text-xs text-muted-foreground shrink-0">min</span>
                        </div>
                        {showValidation && isInvalidDuration(item.duration) && (
                          <p className="text-[11px] text-destructive font-medium mt-1">Estimate the time</p>
                        )}
                      </div>
                    )

                    if (isGenerator) {
                      return (
                        <>
                          {/* Row: Goal + Duration */}
                          <div className="grid grid-cols-[1fr_120px] gap-3">
                            {GoalSelect}
                            {DurationInput}
                          </div>
                          {/* Subtle generator checkbox below Goal */}
                          <label className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer pt-0.5">
                            <input
                              type="checkbox"
                              checked={item.useGenerator ?? true}
                              onChange={e => updateRow(item.id, "useGenerator", e.target.checked)}
                              className="accent-[var(--accent)] w-3.5 h-3.5 shrink-0 cursor-pointer"
                            />
                            <span>
                              <span className="text-[var(--text-secondary)] font-medium">✨ {generatorLabel}</span>
                              <span className="ml-1.5">— {generatorHint}</span>
                            </span>
                          </label>
                        </>
                      )
                    }

                    // Normal: Goal + Duration on row 2, Template (with left bar) on row 3, Outcome (full width) on row 4
                    return (
                      <>
                        {/* Row 2: Goal + Duration */}
                        <div className="grid grid-cols-[1fr_120px] gap-3">
                          {GoalSelect}
                          {DurationInput}
                        </div>

                        {/* Row 3: Template (with left visual bar — filtered by goal) */}
                        <div className="border-l-2 border-[var(--border-default)] pl-3 space-y-1">
                          <div className="flex items-center justify-between">
                            <Label className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                              Template <span className="text-[var(--text-tertiary)] normal-case font-normal ml-0.5">— filtered by goal</span>
                            </Label>
                            <button
                              type="button"
                              onClick={() => setPreviewForItemId(item.id)}
                              className="text-[10px] font-medium text-[var(--text-secondary)] hover:text-[var(--accent)] flex items-center gap-1 transition-colors"
                            >
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                              Templates preview
                            </button>
                          </div>
                          <Select value={item.template ?? "none"} onValueChange={v => updateRow(item.id, "template", v as TemplateId)}>
                            <SelectTrigger className="!h-10 text-sm w-full">
                              <SelectValue>
                                {(() => {
                                  const t = TEMPLATES.find(x => x.id === (item.template ?? "none"))
                                  if (!t) return null
                                  return (
                                    <span className="flex items-center gap-2">
                                      <TemplateIcon id={t.id} size={22} />
                                      <span className="font-medium">{t.name}</span>
                                      {t.oldName && (
                                        <span className="text-[var(--text-tertiary)]">({t.oldName})</span>
                                      )}
                                    </span>
                                  )
                                })()}
                              </SelectValue>
                            </SelectTrigger>
                            <SelectContent>
                              {TEMPLATES
                                .filter(t => t.id === "none" || TEMPLATES_BY_GOAL[item.type]?.includes(t.id))
                                .map(t => (
                                  <SelectItem key={t.id} value={t.id} className="text-sm py-2">
                                    <div className="flex items-center gap-2.5">
                                      <TemplateIcon id={t.id} size={28} />
                                      <div className="flex flex-col gap-0.5 min-w-0">
                                        <div className="flex items-baseline gap-1.5">
                                          <span className="font-medium">{t.name}</span>
                                          {t.oldName && (
                                            <span className="text-[var(--text-tertiary)] text-xs">({t.oldName})</span>
                                          )}
                                        </div>
                                        {t.description && (
                                          <span className="text-xs italic text-[var(--text-secondary)]">
                                            {t.description}
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                  </SelectItem>
                                ))}
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Row 4: Outcome (full width) */}
                        <div className="space-y-1">
                          <Label className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                            Outcome <span className="text-[var(--text-tertiary)] normal-case font-normal ml-0.5">recommended</span>
                          </Label>
                          <Input
                            className="h-10 text-sm"
                            placeholder="e.g. We agreed on a tool"
                            value={item.outcome}
                            onChange={e => updateRow(item.id, "outcome", e.target.value)}
                          />
                        </div>
                      </>
                    )
                  })()}
                </div>
              </div>
            ))}

            <Button type="button" variant="outline" size="sm" onClick={addRow} className="w-full border-dashed">
              + Add agenda item
            </Button>

            <Separator />

            {/* Buffer opt-out checkbox */}
            <label
              className={`flex items-start gap-2.5 px-3 py-2.5 rounded-md border cursor-pointer transition-all
                ${useBuffer
                  ? "bg-[var(--status-warning-soft)] border-[var(--status-warning)]/30"
                  : "bg-muted/40 border-border"}`}
            >
              <input
                type="checkbox"
                checked={useBuffer}
                onChange={e => setUseBuffer(e.target.checked)}
                className="mt-0.5 accent-[var(--accent)] w-4 h-4 shrink-0 cursor-pointer"
              />
              <span className={`text-xs leading-relaxed ${useBuffer ? "text-[var(--status-warning)]" : "text-muted-foreground"}`}>
                <span className="font-medium">⏱ We recommend a 10 minute buffer</span>
                <span className="ml-1">— if you finish earlier, use the time to chitchat.</span>
              </span>
            </label>

            <div className="space-y-2">
              <div className="flex justify-between items-baseline text-sm font-semibold">
                <span>Time planning</span>
                <span className="text-[var(--text-primary)]">{totalMin} min total</span>
              </div>
              <div className="flex gap-4 text-xs text-muted-foreground">
                <span>Agenda: <strong className="text-foreground">{agendaMin} min</strong></span>
                {useBuffer && <span>Buffer: <strong className="text-foreground">{BUFFER} min</strong></span>}
              </div>
            </div>

            {false && (
              <div className="space-y-2 pt-1">
                {agenda.map((item, idx) => (
                  <label key={item.id} className="flex items-center gap-2 text-sm cursor-pointer">
                    <input type="checkbox" defaultChecked className="accent-teal-700" />
                    <span>{idx + 1}. {item.topic || "(no title)"}{item.duration && <> – <strong>{item.duration} min</strong></>}</span>
                  </label>
                ))}
              </div>
            )}
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
                <Label htmlFor="date">Date</Label>
                <Input id="date" className="h-10" type="date" value={date} onChange={e => setDate(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="start">Start time</Label>
                <Input id="start" className="h-10" type="time" value={startTime} onChange={e => setStartTime(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>End time</Label>
                <Input value={endTime} readOnly className="h-10 bg-muted text-muted-foreground cursor-default" />
                <p className="text-xs text-muted-foreground">Auto-calculated</p>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="link">Link (Zoom / Teams / Meet)</Label>
              <Input id="link" className="h-10" type="url" placeholder="https://…" value={link} onChange={e => setLink(e.target.value)} />
            </div>
          </CardContent>
        </Card>

        {/* 04 Participants */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <span className="text-muted-foreground font-normal">04.</span> Participants
            </CardTitle>
            <CardDescription>Add a team or enter individual email addresses</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">

            {/* Team picker */}
            <div className="flex flex-wrap gap-2">
              {TEAMS.map(team => {
                const allAdded = team.members.every(e => participants.includes(e))
                return (
                  <button
                    key={team.id}
                    type="button"
                    onClick={() => {
                      if (allAdded) {
                        setParticipants(ps => ps.filter(p => !team.members.includes(p)))
                      } else {
                        setParticipants(ps => [...ps, ...team.members.filter(e => !ps.includes(e))])
                      }
                    }}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                      allAdded
                        ? "bg-[var(--accent)] text-[var(--text-on-accent)] border-[var(--accent)]"
                        : "bg-[var(--bg-card)] text-muted-foreground border-border hover:border-[var(--accent)] hover:text-[var(--text-on-soft)]"
                    }`}
                  >
                    <span>{team.emoji}</span>
                    <span>{team.name}</span>
                    <span className={`text-[10px] ${allAdded ? "text-[var(--text-on-accent)]/70" : "text-muted-foreground/60"}`}>
                      {team.members.length}
                    </span>
                  </button>
                )
              })}
            </div>

            {/* Manual email input */}
            <div
              className="flex flex-wrap gap-1.5 p-2 min-h-10 border rounded-md bg-background focus-within:ring-2 focus-within:ring-ring cursor-text"
              onClick={() => document.getElementById("tagInput")?.focus()}
            >
              {participants.map((p, i) => (
                <Badge key={i} variant="secondary" className="gap-1 pr-1 text-[var(--text-on-soft)] bg-[var(--accent-soft)]">
                  {p}
                  <button type="button" className="ml-0.5 opacity-60 hover:opacity-100" onClick={e => { e.stopPropagation(); setParticipants(ps => ps.filter((_, j) => j !== i)) }}>×</button>
                </Badge>
              ))}
              <input
                id="tagInput" type="email"
                className="flex-1 min-w-32 text-sm outline-none bg-transparent placeholder:text-muted-foreground"
                placeholder="firstname.lastname@company.com"
                value={tagInput}
                onChange={e => setTagInput(e.target.value)}
                onKeyDown={handleTagKey}
                onBlur={addTag}
              />
            </div>
            <p className="text-xs text-muted-foreground">Confirm each address with Enter or comma</p>
          </CardContent>
        </Card>

        {/* 05 Meeting Owner */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <span className="text-muted-foreground font-normal">05.</span> Meeting Owner
            </CardTitle>
            <CardDescription>Who is facilitating this meeting?</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Select value={owner} onValueChange={v => v && setOwner(v)}>
              <SelectTrigger className="!h-10">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TEAM_MEMBERS.map(m => (
                  <SelectItem key={m.id} value={m.id}>
                    <div className="flex items-center gap-2.5">
                      <div className="w-6 h-6 rounded-full bg-[var(--accent)] text-[var(--text-on-accent)] text-[10px] font-bold flex items-center justify-center shrink-0">{m.initials}</div>
                      <span>{m.name}</span>
                      <span className="text-muted-foreground text-xs">{m.email}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted border">
              <div className="w-9 h-9 rounded-full bg-[var(--accent)] text-[var(--text-on-accent)] flex items-center justify-center text-sm font-bold shrink-0">{selectedOwner.initials}</div>
              <div>
                <p className="font-semibold text-sm">{selectedOwner.name}</p>
                <p className="text-xs text-muted-foreground">{selectedOwner.email}</p>
              </div>
              <Badge variant="secondary" className="ml-auto">Meeting Owner</Badge>
            </div>
          </CardContent>
        </Card>

        {/* 06 Invitation */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <span className="text-muted-foreground font-normal">06.</span> Invitation
            </CardTitle>
            <CardDescription>Optional personal message + preview</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="msg">Personal message (optional)</Label>
              <Textarea id="msg" placeholder="e.g. Looking forward to our meeting…" value={personalMsg} onChange={e => setPersonalMsg(e.target.value)} className="min-h-20" />
            </div>

            <Label className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground block">Invitation Preview</Label>

            <div className="rounded-lg border overflow-hidden text-sm">
              <div className="bg-[var(--text-primary)] text-[var(--text-on-accent)] px-5 py-3.5">
                <p className="font-bold text-base">📅 {meetingName || "[Meeting Name]"}</p>
                <p className="text-[var(--text-on-accent)]/60 text-xs mt-0.5">
                  {date && startTime ? `${dateDisplay}  ${startTime}${endTime ? " – " + endTime : ""}` : "Date & time to be set"}
                </p>
              </div>
              <div className="bg-card px-5 py-4 space-y-3">
                {personalMsg && <p className="italic text-muted-foreground text-xs border-l-2 border-[var(--accent-soft-border)] pl-3">"{personalMsg}"</p>}
                {[
                  { label: "Meeting Owner", value: selectedOwner.name },
                  { label: "Intention", value: intention || "—" },
                  { label: "Desired Outcome", value: desiredOutcome || "—" },
                ].map(({ label, value }) => (
                  <div key={label}>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{label}</p>
                    <p className="font-medium">{value}</p>
                  </div>
                ))}
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">Agenda</p>
                  {agenda.length === 0 ? (
                    <p className="text-muted-foreground italic text-xs">No agenda items yet</p>
                  ) : (
                    <ul className="divide-y">
                      {agenda.map((item, idx) => (
                        <li key={item.id} className="flex gap-2 py-1.5 text-xs items-center">
                          <span className="text-[var(--accent)] font-bold w-4">{idx + 1}.</span>
                          <span className="flex-1">{item.topic || "(no title)"}</span>
                          <Badge variant="outline" className={`text-[10px] ${TYPES[item.type].color}`}>{TYPES[item.type].label}</Badge>
                          <span className="text-muted-foreground ml-1 shrink-0">{item.duration ? item.duration + " min" : "—"}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Participants</p>
                  <p className="font-medium">{participants.length ? participants.join(", ") : "—"}</p>
                </div>
                {link && (
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Link</p>
                    <p className="font-medium text-[var(--accent)] break-all">{link}</p>
                  </div>
                )}
              </div>
            </div>

          </CardContent>
        </Card>

        {/* ── Footer: validation + action buttons (outside any card) ── */}
        {showValidation && invalidItems.length > 0 && (
          <div className="text-xs text-destructive bg-destructive/5 border border-destructive/30 rounded-md px-3 py-2.5 font-medium flex items-start gap-2">
            <span className="shrink-0">⚠️</span>
            <span>
              {invalidItems.length} agenda item{invalidItems.length !== 1 ? "s" : ""} {invalidItems.length === 1 ? "has" : "have"} no duration. Please enter a time for each item before sending the meeting.
            </span>
          </div>
        )}

        <div className="flex items-center justify-between gap-3 pt-2">
          <p className="text-xs text-muted-foreground italic">
            ✉️ Creating the meeting will invite all participants.
          </p>
          <div className="flex gap-2">
            <Button variant="outline" type="button" onClick={() => onSaveDraft(buildMeeting())}>
              Save as draft
            </Button>
            <Button
              type="button"
              className="bg-[var(--accent)] hover:bg-[var(--accent-hover)]"
              onClick={() => {
                if (invalidItems.length > 0) {
                  setShowValidation(true)
                  setTimeout(() => {
                    const firstInvalid = document.querySelector('.border-destructive')
                    firstInvalid?.scrollIntoView({ behavior: "smooth", block: "center" })
                  }, 0)
                  return
                }
                onSave(buildMeeting())
              }}
            >
              Create meeting
            </Button>
          </div>
        </div>
        </div>

        {/* ── Save-as-draft prompt ── */}
        {/* ── Template preview/picker ── */}
        {previewForItemId !== null && (() => {
          const targetItem = agenda.find(a => a.id === previewForItemId)
          if (!targetItem) return null
          const pick = (tplId: TemplateId) => {
            updateRow(previewForItemId, "template", tplId)
            setPreviewForItemId(null)
          }
          return (
            <div className="fixed inset-0 z-50 bg-[var(--bg-overlay)] flex items-center justify-center p-6 overflow-y-auto">
              <div className="bg-[var(--bg-card)] rounded-xl shadow-2xl max-w-3xl w-full max-h-[85vh] overflow-y-auto">
                <div className="px-6 py-4 border-b sticky top-0 bg-[var(--bg-card)] flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-medium text-[var(--text-primary)]">Choose a template</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Templates help capture what happens in this agenda item.
                    </p>
                  </div>
                  <button
                    onClick={() => setPreviewForItemId(null)}
                    className="text-muted-foreground hover:text-[var(--text-primary)] text-lg leading-none px-2"
                  >×</button>
                </div>
                <div className="grid grid-cols-2 gap-4 p-6">
                  {TEMPLATES
                    .filter(t => t.id === "none" || TEMPLATES_BY_GOAL[targetItem.type]?.includes(t.id))
                    .map(t => {
                      const isSelected = (targetItem.template ?? "none") === t.id
                      return (
                        <button
                          key={t.id}
                          onClick={() => pick(t.id)}
                          className={`text-left border rounded-lg p-4 transition-all hover:border-[var(--accent)] hover:shadow-sm
                            ${isSelected ? "border-[var(--accent)] bg-[var(--accent-soft)]/30 ring-2 ring-[var(--accent)]/20" : "border-border bg-[var(--bg-card)]"}`}
                        >
                          <div className="mb-3 flex items-start gap-2.5">
                            <TemplateIcon id={t.id} size={36} />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-baseline gap-1.5 flex-wrap">
                                <span className="text-sm font-medium text-[var(--text-primary)]">{t.name}</span>
                                {t.oldName && (
                                  <span className="text-xs text-[var(--text-tertiary)]">({t.oldName})</span>
                                )}
                                {isSelected && <span className="ml-auto text-[10px] uppercase tracking-wide text-[var(--accent)] font-medium">Selected</span>}
                              </div>
                              {t.description && (
                                <p className="text-xs italic text-[var(--text-secondary)] mt-0.5">
                                  {t.description}
                                </p>
                              )}
                            </div>
                          </div>
                          {/* Preview content */}
                          <div className="bg-[var(--bg-canvas)] border border-dashed border-border rounded-md p-3 space-y-1.5 text-xs">
                            {t.id === "none" && (
                              <p className="text-muted-foreground italic">No structured framework — capture freely during the meeting.</p>
                            )}
                            {t.id === "basic_info" && (
                              <>
                                <div className="text-[10px] uppercase tracking-wide text-muted-foreground">Was teile ich?</div>
                                <div className="h-4 bg-[var(--bg-muted)] rounded" />
                                <div className="text-[10px] uppercase tracking-wide text-muted-foreground pt-1">Hintergrund</div>
                                <div className="h-4 bg-[var(--bg-muted)] rounded" />
                                <div className="text-[10px] uppercase tracking-wide text-muted-foreground pt-1">Nächste Schritte</div>
                                <div className="h-4 bg-[var(--bg-muted)] rounded" style={{ width: "70%" }} />
                              </>
                            )}
                            {t.id === "question_topic" && (
                              <>
                                <div className="text-[10px] uppercase tracking-wide text-muted-foreground">Leitfrage</div>
                                <div className="h-4 bg-[var(--bg-muted)] rounded" />
                                <div className="text-[10px] uppercase tracking-wide text-muted-foreground pt-1">Thema</div>
                                <div className="h-4 bg-[var(--bg-muted)] rounded" />
                                <div className="h-4 bg-[var(--bg-muted)] rounded" style={{ width: "60%" }} />
                              </>
                            )}
                            {t.id === "grow" && (
                              <>
                                {[
                                  { letter: "G", word: "Goal" },
                                  { letter: "R", word: "Reality" },
                                  { letter: "O", word: "Options" },
                                  { letter: "W", word: "Will" },
                                ].map(s => (
                                  <div key={s.letter} className="flex items-center gap-2">
                                    <span className="text-[var(--accent)] font-medium text-[11px] w-3">{s.letter}</span>
                                    <span className="text-[10px] text-muted-foreground w-12">{s.word}</span>
                                    <div className="flex-1 h-3.5 bg-[var(--bg-muted)] rounded" />
                                  </div>
                                ))}
                              </>
                            )}
                            {t.id === "three_field" && (
                              <>
                                <div className="grid grid-cols-3 gap-2">
                                  {["Facts", "Feelings", "Future"].map(label => (
                                    <div key={label} className="border border-dashed border-border rounded p-2 space-y-1">
                                      <div className="text-[9px] uppercase tracking-wide text-muted-foreground">{label}</div>
                                      <div className="h-3 bg-[var(--bg-muted)] rounded" />
                                      <div className="h-3 bg-[var(--bg-muted)] rounded" style={{ width: "70%" }} />
                                    </div>
                                  ))}
                                </div>
                              </>
                            )}
                            {t.id === "konsent" && (
                              <>
                                <div className="text-[10px] uppercase tracking-wide text-muted-foreground">Proposal</div>
                                <div className="h-4 bg-[var(--bg-muted)] rounded" />
                                <div className="h-4 bg-[var(--bg-muted)] rounded" style={{ width: "80%" }} />
                                <div className="text-[10px] uppercase tracking-wide text-muted-foreground pt-1">Objections?</div>
                                <div className="flex gap-2 pt-0.5">
                                  <span className="text-[10px] px-1.5 rounded bg-[var(--status-live-soft)] text-[var(--status-live)]">None</span>
                                  <span className="text-[10px] px-1.5 rounded bg-[var(--status-warning-soft)] text-[var(--status-warning)]">Concerns</span>
                                </div>
                                <div className="text-[10px] uppercase tracking-wide text-muted-foreground pt-1">Decision</div>
                                <div className="h-4 bg-[var(--bg-muted)] rounded" style={{ width: "60%" }} />
                              </>
                            )}
                            {t.id === "systemic_condensing" && (
                              <>
                                <div className="text-[10px] uppercase tracking-wide text-muted-foreground">Optionen</div>
                                {[1,2,3].map(i => (
                                  <div key={i} className="flex items-center gap-2">
                                    <span className="text-[var(--text-tertiary)] text-[10px] w-4">{i}.</span>
                                    <div className="flex-1 h-3 bg-[var(--bg-muted)] rounded" />
                                    <div className="w-8 h-3 bg-[var(--bg-muted)]/60 rounded" />
                                  </div>
                                ))}
                                <div className="text-[10px] uppercase tracking-wide text-muted-foreground pt-1">Geringster Widerstand</div>
                                <div className="h-4 bg-[var(--bg-muted)] rounded" style={{ width: "70%" }} />
                              </>
                            )}
                            {t.id === "konsultativ" && (
                              <>
                                <div className="text-[10px] uppercase tracking-wide text-muted-foreground">Entscheider:in</div>
                                <div className="h-4 bg-[var(--bg-muted)] rounded" style={{ width: "50%" }} />
                                <div className="text-[10px] uppercase tracking-wide text-muted-foreground pt-1">Konsultierte Personen</div>
                                <div className="flex gap-1">
                                  {[1,2,3].map(i => (
                                    <div key={i} className="w-5 h-5 rounded-full bg-[var(--bg-muted)]" />
                                  ))}
                                </div>
                                <div className="text-[10px] uppercase tracking-wide text-muted-foreground pt-1">Entscheidung</div>
                                <div className="h-4 bg-[var(--bg-muted)] rounded" style={{ width: "65%" }} />
                              </>
                            )}
                          </div>
                        </button>
                      )
                    })}
                </div>
              </div>
            </div>
          )
        })()}

        {showDraftPrompt && (
          <div className="fixed inset-0 z-50 bg-[var(--bg-overlay)] flex items-center justify-center px-6">
            <div className="bg-[var(--bg-card)] rounded-lg shadow-xl max-w-sm w-full p-6 space-y-4">
              <div>
                <h3 className="text-base font-medium text-[var(--text-primary)]">Save as draft?</h3>
                <p className="text-sm text-muted-foreground mt-1.5">
                  Would you like to save this meeting as a draft so you can finish it later?
                </p>
              </div>
              <div className="flex gap-2 justify-end pt-1">
                <Button
                  variant="outline"
                  onClick={() => { setShowDraftPrompt(false); onBack() }}
                >
                  No, discard
                </Button>
                <Button
                  className="bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-[var(--text-on-accent)]"
                  onClick={() => { setShowDraftPrompt(false); onSaveDraft(buildMeeting()) }}
                >
                  Yes, save draft
                </Button>
              </div>
            </div>
          </div>
        )}

    </div>
  )
}
