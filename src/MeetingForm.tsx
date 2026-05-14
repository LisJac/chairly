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
import { Progress } from "@/components/ui/progress"
import type { AgendaType, AgendaItem, Meeting } from "./types"

const TYPES: Record<AgendaType, { label: string; color: string }> = {
  information:  { label: "Information",    color: "bg-blue-100 text-blue-700" },
  entscheidung: { label: "Decision",       color: "bg-amber-100 text-amber-700" },
  brainstorm:   { label: "Brainstorm",     color: "bg-emerald-100 text-emerald-700" },
  beratung:     { label: "Advisory",       color: "bg-purple-100 text-purple-700" },
  kreativ:      { label: "Creative",       color: "bg-orange-100 text-orange-700" },
  ankommen:     { label: "Check-in",       color: "bg-sky-100 text-sky-700" },
  checkout:     { label: "Check-out",      color: "bg-teal-100 text-teal-700" },
  sonstige:     { label: "Other",          color: "bg-gray-100 text-gray-600" },
}

const BUFFER = 10
const WINDOW = 60
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

export default function MeetingForm({ onBack, onSave }: { onBack: () => void; onSave: (meeting: Meeting) => void }) {
  const [meetingName, setMeetingName] = useState("")
  const [intention, setIntention] = useState("")
  const [desiredOutcome, setDesiredOutcome] = useState("")
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10))
  const [startTime, setStartTime] = useState("09:00")
  const [link, setLink] = useState("")
  const [personalMsg, setPersonalMsg] = useState("")
  const [owner, setOwner] = useState("lj")
  const [participants, setParticipants] = useState<string[]>([])
  const [tagInput, setTagInput] = useState("")
  const [toast, setToast] = useState("")
  const [agenda, setAgenda] = useState<AgendaItem[]>([
    { id: 1, topic: "Opening & Warm-up", type: "information", outcome: "", duration: "5", note: "" },
    { id: 2, topic: "Main Topic", type: "entscheidung", outcome: "", duration: "20", note: "" },
    { id: 3, topic: "Next Steps & Wrap-up", type: "beratung", outcome: "", duration: "10", note: "" },
  ])

  const agendaMin = agenda.reduce((s, i) => s + (parseInt(i.duration) || 0), 0)
  const totalMin = agendaMin + BUFFER
  const progress = Math.min((totalMin / WINDOW) * 100, 100)
  const isOver = totalMin > WINDOW
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

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(""), 3000) }

  const dateDisplay = date ? date.split("-").reverse().join(".") : "—"
  const selectedOwner = TEAM_MEMBERS.find(m => m.id === owner)!

  return (
    <div className="min-h-screen bg-muted/40">
      <header className="sticky top-0 z-50 bg-[#1C1F3A] text-white h-14 flex items-center px-8 gap-3 shadow-md">
        <button onClick={onBack} className="text-white/50 hover:text-white text-sm flex items-center gap-1.5 transition-colors">
          ← Dashboard
        </button>
        <span className="text-xl font-extrabold tracking-tight ml-3">
          Chair<span className="text-teal-400">ly</span>
        </span>
        <span className="text-white/40 text-sm ml-1">— Create new meeting</span>
      </header>

      <div className="max-w-3xl mx-auto py-10 px-4 space-y-5">
        <div>
          <h1 className="text-2xl font-bold text-[#1C1F3A]">Schedule a new meeting</h1>
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
              <Input id="name" placeholder="e.g. Q2 2026 Quarterly Review" value={meetingName} onChange={e => setMeetingName(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="intention">Meeting Intention</Label>
              <Input id="intention" placeholder="Why is this meeting happening?" value={intention} onChange={e => setIntention(e.target.value)} />
              <p className="text-xs text-muted-foreground">What's the reason? What should it accomplish?</p>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="outcome">Desired Outcome</Label>
              <Input id="outcome" placeholder="What does a successful meeting look like?" value={desiredOutcome} onChange={e => setDesiredOutcome(e.target.value)} />
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
                  draggingId === item.id ? "opacity-40 bg-teal-50 border-teal-300" : "bg-muted/50 hover:border-teal-300"
                }`}
              >
                <span className="cursor-grab active:cursor-grabbing text-muted-foreground/40 hover:text-muted-foreground flex items-center justify-center select-none">⠿</span>
                <span className="text-xs font-bold text-muted-foreground text-center">{idx + 1}</span>
                <Input className="h-8 text-sm" placeholder="Topic…" value={item.topic} onChange={e => updateRow(item.id, "topic", e.target.value)} />
                <Select value={item.type} onValueChange={v => updateRow(item.id, "type", v as AgendaType)}>
                  <SelectTrigger className="h-8 text-xs w-full"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {(Object.keys(TYPES) as AgendaType[]).map(t => (
                      <SelectItem key={t} value={t} className="text-xs">{TYPES[t].label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input className="h-8 text-sm" placeholder="Expected outcome…" value={item.outcome} onChange={e => updateRow(item.id, "outcome", e.target.value)} />
                <Input className="h-8 text-sm text-center" type="number" min={1} max={180} placeholder="min" value={item.duration} onChange={e => updateRow(item.id, "duration", e.target.value)} />
                <button type="button" onClick={() => removeRow(item.id)} className="w-7 h-7 flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded transition-colors text-lg leading-none">×</button>
              </div>
            ))}

            <Button type="button" variant="outline" size="sm" onClick={addRow} className="w-full border-dashed">
              + Add agenda item
            </Button>

            <Separator />

            <div className="space-y-2">
              <div className="flex justify-between text-sm font-semibold">
                <span>Time planning</span>
                <span className={isOver ? "text-destructive" : ""}>{totalMin} / {WINDOW} min</span>
              </div>
              <Progress value={progress} className={isOver ? "[&>div]:bg-destructive" : ""} />
              <div className="flex gap-4 text-xs text-muted-foreground">
                <span>Agenda: <strong className="text-foreground">{agendaMin} min</strong></span>
                <span>Buffer: <strong className="text-foreground">{BUFFER} min</strong></span>
                <span>Total: <strong className="text-foreground">{totalMin} min</strong></span>
                <span>Window: <strong className="text-foreground">{WINDOW} min</strong></span>
              </div>
              <div className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-md px-3 py-2 font-medium">
                ⏱ A 10-minute buffer is automatically added. If you finish on time, use those 10 minutes to chat and connect.
              </div>
              {isOver && (
                <div className="text-xs text-destructive bg-destructive/5 border border-destructive/20 rounded-md px-3 py-2 font-semibold">
                  ⚠️ The agenda exceeds the meeting window — please prioritize
                </div>
              )}
            </div>

            {isOver && (
              <div className="space-y-2 pt-1">
                <Label className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Set priorities</Label>
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
                <Input id="date" type="date" value={date} onChange={e => setDate(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="start">Start time</Label>
                <Input id="start" type="time" value={startTime} onChange={e => setStartTime(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>End time</Label>
                <Input value={endTime} readOnly className="bg-muted text-muted-foreground cursor-default" />
                <p className="text-xs text-muted-foreground">Auto-calculated</p>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="link">Link (Zoom / Teams / Meet)</Label>
              <Input id="link" type="url" placeholder="https://…" value={link} onChange={e => setLink(e.target.value)} />
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
                        ? "bg-teal-700 text-white border-teal-700"
                        : "bg-white text-muted-foreground border-border hover:border-teal-400 hover:text-teal-800"
                    }`}
                  >
                    <span>{team.emoji}</span>
                    <span>{team.name}</span>
                    <span className={`text-[10px] ${allAdded ? "text-white/70" : "text-muted-foreground/60"}`}>
                      {team.members.length}
                    </span>
                  </button>
                )
              })}
            </div>

            {/* Manual email input */}
            <div
              className="flex flex-wrap gap-1.5 p-2 min-h-11 border rounded-md bg-background focus-within:ring-2 focus-within:ring-ring cursor-text"
              onClick={() => document.getElementById("tagInput")?.focus()}
            >
              {participants.map((p, i) => (
                <Badge key={i} variant="secondary" className="gap-1 pr-1 text-teal-800 bg-teal-100">
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
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TEAM_MEMBERS.map(m => (
                  <SelectItem key={m.id} value={m.id}>
                    <div className="flex items-center gap-2.5">
                      <div className="w-6 h-6 rounded-full bg-teal-700 text-white text-[10px] font-bold flex items-center justify-center shrink-0">{m.initials}</div>
                      <span>{m.name}</span>
                      <span className="text-muted-foreground text-xs">{m.email}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted border">
              <div className="w-9 h-9 rounded-full bg-teal-700 text-white flex items-center justify-center text-sm font-bold shrink-0">{selectedOwner.initials}</div>
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
              <div className="bg-[#1C1F3A] text-white px-5 py-3.5">
                <p className="font-bold text-base">📅 {meetingName || "[Meeting Name]"}</p>
                <p className="text-white/60 text-xs mt-0.5">
                  {date && startTime ? `${dateDisplay}  ${startTime}${endTime ? " – " + endTime : ""}` : "Date & time to be set"}
                </p>
              </div>
              <div className="bg-card px-5 py-4 space-y-3">
                {personalMsg && <p className="italic text-muted-foreground text-xs border-l-2 border-teal-300 pl-3">"{personalMsg}"</p>}
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
                          <span className="text-teal-700 font-bold w-4">{idx + 1}.</span>
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
                    <p className="font-medium text-teal-700 break-all">{link}</p>
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-3 justify-end pt-1">
              <Button variant="outline" type="button" onClick={() => showToast("💾 Draft saved")}>Save draft</Button>
              <Button variant="secondary" type="button" onClick={() => showToast("✉️ Invitation sent!")}>Send invitation</Button>
              <Button type="button" className="bg-[#1C1F3A] hover:bg-[#2D3260]" onClick={() => {
                const newMeeting: Meeting = {
                  id: Date.now(),
                  title: meetingName || "New Meeting",
                  date,
                  startTime,
                  endTime,
                  owner: selectedOwner.name,
                  participants,
                  intention,
                  desiredOutcome,
                  ...(link ? { link } : {}),
                  agenda,
                }
                onSave(newMeeting)
              }}>
                Create meeting
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {toast && (
        <div className="fixed bottom-6 right-6 bg-[#1C1F3A] text-white px-5 py-3.5 rounded-xl text-sm font-semibold shadow-xl z-50">
          {toast}
        </div>
      )}
    </div>
  )
}
