import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { MOCK_TODOS, MOCK_PROJECTS } from "./data"
import type { Meeting, Todo, DocumentFile, DocumentFileType } from "./types"

// ── Constants ─────────────────────────────────────────────
const START_HOUR = 9
const END_HOUR = 19
const HOUR_H = 64
const HOURS = Array.from({ length: END_HOUR - START_HOUR }, (_, i) => i + START_HOUR)
const DAYS_SHORT = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"]
const MONTHS_SHORT = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"]


type ViewMode = "day" | "week" | "month"
type DashboardView = "tiles" | "calendar"

const CURRENT_USER = "Lisa Jacob"

// Meeting role colors
const ROLE_FACILITATE = { bg: "bg-[var(--accent-soft)]",        border: "border-l-[var(--accent)]",        text: "text-[var(--text-on-soft)]",   chip: "bg-[var(--accent)]" }
const ROLE_PARTICIPATE = { bg: "bg-[var(--status-info-soft)]",  border: "border-l-[var(--status-info)]",   text: "text-[var(--status-info)]",    chip: "bg-[var(--status-info)]" }
const roleColor = (m: { owner: string }) => m.owner === CURRENT_USER ? ROLE_FACILITATE : ROLE_PARTICIPATE

const FILE_ICONS: Record<DocumentFileType, string> = {
  protocol: "📝",
  pdf:      "📕",
  doc:      "📄",
  sheet:    "📊",
  image:    "🖼️",
  link:     "🔗",
}

function formatShortDate(dateStr: string) {
  const d = new Date(dateStr + "T00:00:00")
  return `${MONTHS_SHORT[d.getMonth()]} ${d.getDate()}`
}

// ── Helpers ───────────────────────────────────────────────
function getWeekStart(d: Date) {
  const r = new Date(d); const day = r.getDay()
  r.setDate(r.getDate() - (day === 0 ? 6 : day - 1)); r.setHours(0,0,0,0); return r
}
function addDays(d: Date, n: number) { const r = new Date(d); r.setDate(r.getDate() + n); return r }
function addMonths(d: Date, n: number) { const r = new Date(d); r.setMonth(r.getMonth() + n); return r }
function toDateStr(d: Date) { return d.toISOString().slice(0, 10) }
function timeToMin(t: string) { const [h, m] = t.split(":").map(Number); return h * 60 + m }
function mTop(start: string) { return (timeToMin(start) / 60 - START_HOUR) * HOUR_H }
function mHeight(start: string, end: string) {
  return Math.max(((timeToMin(end) - timeToMin(start)) / 60) * HOUR_H, 22)
}
function isSameDay(a: Date, b: Date) { return toDateStr(a) === toDateStr(b) }

function getMonthGrid(year: number, month: number): Date[] {
  const first = new Date(year, month, 1)
  const start = getWeekStart(first)
  const last = new Date(year, month + 1, 0)
  const end = addDays(getWeekStart(last), 6)
  const days: Date[] = []
  let cur = new Date(start)
  while (cur <= end) { days.push(new Date(cur)); cur = addDays(cur, 1) }
  return days
}

// ── Time grid (shared by day + week) ─────────────────────
function TimeGrid({
  days, meetings, nowY, nowDayIdx, showSingleDay, onMeetingClick, onMeetingDelete,
}: {
  days: Date[]
  meetings: Meeting[]
  nowY: number | null
  nowDayIdx: number
  showSingleDay: boolean
  onMeetingClick: (id: number) => void
  onMeetingDelete: (id: number) => void
}) {
  const today = new Date(); today.setHours(0,0,0,0)
  const cols = days.length
  const colTemplate = showSingleDay
    ? "52px 1fr"
    : `52px repeat(${cols}, 1fr)`

  return (
    <div className="overflow-y-auto flex-1">
      <div className="relative" style={{ display: "grid", gridTemplateColumns: colTemplate }}>
        {/* Hour rows */}
        {HOURS.map(h => (
          <div key={h} className="contents">
            <div className="border-r border-b text-[10px] text-muted-foreground text-right pr-2 pt-1 select-none"
              style={{ height: HOUR_H }}>{h}:00</div>
            {days.map((d, di) => (
              <div key={di}
                className={`border-r last:border-r-0 border-b relative ${isSameDay(d, today) ? "bg-[var(--accent-soft)]/40" : ""}`}
                style={{ height: HOUR_H }} />
            ))}
          </div>
        ))}

        {/* Meeting blocks */}
        {days.map((d, di) => {
          const dayMeetings = meetings.filter(m => m.date === toDateStr(d))
          return dayMeetings.map(m => {
            const top = mTop(m.startTime)
            const height = mHeight(m.startTime, m.endTime)
            const color = roleColor(m)
            if (top < 0 || top > HOURS.length * HOUR_H) return null
            const colW = showSingleDay ? `calc(100% - 52px - 4px)` : `calc((100% - 52px) / ${cols} - 4px)`
            const colLeft = showSingleDay
              ? `calc(52px + 2px)`
              : `calc(52px + ${di} * ((100% - 52px) / ${cols}) + 2px)`
            return (
              <div key={m.id}
                className={`absolute rounded-md border-l-4 px-2 py-1 overflow-hidden cursor-pointer hover:brightness-95 transition-all shadow-sm group/block ${color.bg} ${color.border} ${color.text}`}
                style={{ top, height, left: colLeft, width: colW, zIndex: 10 }}
                title={`${m.title} · ${m.startTime}–${m.endTime}`}
                onClick={() => onMeetingClick(m.id)}
              >
                <p className="font-semibold text-[11px] leading-tight truncate pr-4">{m.title}</p>
                {height >= 36 && <p className="text-[10px] opacity-70 mt-0.5">{m.startTime} – {m.endTime}</p>}
                {height >= 52 && m.owner && <p className="text-[10px] opacity-60 truncate mt-0.5">{m.owner}</p>}
                <button
                  className="absolute top-0.5 right-0.5 w-4 h-4 rounded-full bg-black/0 hover:bg-[var(--status-recording)] text-transparent hover:text-[var(--text-on-accent)] flex items-center justify-center text-[10px] leading-none opacity-0 group-hover/block:opacity-100 transition-all"
                  onClick={e => { e.stopPropagation(); onMeetingDelete(m.id) }}
                  title="Meeting löschen"
                >×</button>
              </div>
            )
          })
        })}

        {/* Now indicator */}
        {nowY !== null && nowDayIdx >= 0 && nowDayIdx < cols && (
          <div className="absolute flex items-center pointer-events-none" style={{
            top: nowY - 1,
            left: showSingleDay
              ? `52px`
              : `calc(52px + ${nowDayIdx} * ((100% - 52px) / ${cols}))`,
            width: showSingleDay ? `calc(100% - 52px)` : `calc((100% - 52px) / ${cols})`,
            zIndex: 20,
          }}>
            <div className="w-2 h-2 rounded-full bg-[var(--status-recording)] -ml-1 shrink-0" />
            <div className="flex-1 h-0.5 bg-[var(--status-recording)]" />
          </div>
        )}
      </div>
    </div>
  )
}

// ── Main component ────────────────────────────────────────
export default function Dashboard({ meetings, onNewMeeting, onMeetingClick, onMeetingDelete }: {
  meetings: Meeting[]
  onNewMeeting: () => void
  onMeetingClick: (id: number) => void
  onMeetingDelete: (id: number) => void
}) {
  const [todos, setTodos] = useState<Todo[]>(MOCK_TODOS)
  const [newTodo, setNewTodo] = useState("")
  const [isAddingTodo, setIsAddingTodo] = useState(false)
  const newTodoRef = useRef<HTMLInputElement>(null)
  const [dashboardView, setDashboardView] = useState<DashboardView>("tiles")
  const [openProjectId, setOpenProjectId] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<ViewMode>("week")
  const [offset, setOffset] = useState(0)          // weeks / days / months
  const [nowY, setNowY] = useState<number | null>(null)
  const [nowDayIdx, setNowDayIdx] = useState(-1)
  const scrollRef = useRef<HTMLDivElement>(null)

  const today = new Date(); today.setHours(0,0,0,0)

  // current time indicator
  useEffect(() => {
    const tick = () => {
      const now = new Date()
      const y = (now.getHours() + now.getMinutes() / 60 - START_HOUR) * HOUR_H
      setNowY(y >= 0 && y <= HOURS.length * HOUR_H ? y : null)
      const dow = now.getDay(); setNowDayIdx(dow === 0 ? 6 : dow - 1)
    }
    tick(); const id = setInterval(tick, 60000); return () => clearInterval(id)
  }, [])

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = HOUR_H
  }, [viewMode])

  // ── Derived dates ──────────────────────────────────────
  // Week
  const weekStart = addDays(getWeekStart(today), offset * 7)
  const weekDays  = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))
  // Day
  const currentDay = addDays(today, offset)
  // Month
  const baseMonth = addMonths(today, offset)
  const monthDays = getMonthGrid(baseMonth.getFullYear(), baseMonth.getMonth())

  // ── Nav label ──────────────────────────────────────────
  const navLabel = (() => {
    if (viewMode === "day") {
      const d = currentDay
      const dow = DAYS_SHORT[d.getDay() === 0 ? 6 : d.getDay() - 1]
      return `${dow}, ${MONTHS[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`
    }
    if (viewMode === "week") {
      const s = weekDays[0], e = weekDays[6]
      return s.getMonth() === e.getMonth()
        ? `${MONTHS_SHORT[s.getMonth()]} ${s.getDate()} – ${e.getDate()}, ${s.getFullYear()}`
        : `${MONTHS_SHORT[s.getMonth()]} ${s.getDate()} – ${MONTHS_SHORT[e.getMonth()]} ${e.getDate()}, ${s.getFullYear()}`
    }
    return `${MONTHS[baseMonth.getMonth()]} ${baseMonth.getFullYear()}`
  })()

  // ── Header row for time views ─────────────────────────
  const HeaderRow = ({ days }: { days: Date[] }) => (
    <div className="grid border-b shrink-0" style={{ gridTemplateColumns: `52px repeat(${days.length}, 1fr)` }}>
      <div className="border-r" />
      {days.map((d, i) => {
        const isToday = isSameDay(d, today)
        const hasMtg  = meetings.some(m => m.date === toDateStr(d))
        return (
          <div key={i} className={`py-2 text-center border-r last:border-r-0 ${isToday ? "bg-[var(--accent-soft)]" : ""}`}>
            {days.length > 1 && <div className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">
              {DAYS_SHORT[i === 6 ? 6 : i]}
            </div>}
            <div className={`text-lg font-bold leading-none mt-0.5 mx-auto w-8 h-8 flex items-center justify-center rounded-full
              ${isToday ? "bg-[var(--accent)] text-[var(--text-on-accent)]" : "text-[var(--text-primary)]"}`}>
              {d.getDate()}
            </div>
            <div className="h-1.5 flex justify-center mt-1">
              {hasMtg && <div className={`w-1.5 h-1.5 rounded-full ${isToday ? "bg-[var(--text-on-accent)]" : "bg-[var(--accent)]"}`} />}
            </div>
          </div>
        )
      })}
    </div>
  )

  // ── Todos ──────────────────────────────────────────────
  const openTodos = todos.filter(t => !t.done)
  const doneTodos = todos.filter(t =>  t.done)
  const toggleTodo = (id: number) => setTodos(ts => ts.map(t => t.id === id ? { ...t, done: !t.done } : t))
  const deleteTodo = (id: number) => setTodos(ts => ts.filter(t => t.id !== id))
  const addTodo = () => {
    const v = newTodo.trim(); if (!v) return
    setTodos(ts => [...ts, { id: Date.now(), text: v, done: false }]); setNewTodo("")
  }

  return (
    <div className="min-h-screen bg-muted/40 flex flex-col">
      {/* ── Greeting + View toggle + Profile ── */}
      <div className="max-w-6xl mx-auto w-full px-4 pt-10 pb-10 flex items-center justify-between gap-4">
        <h1 className="text-4xl font-bold text-[var(--text-primary)] tracking-tight">Hello, Lisa 👋</h1>
        <div className="w-11 h-11 rounded-full bg-[var(--accent)] text-[var(--text-on-accent)] text-sm font-medium flex items-center justify-center shadow-sm shrink-0">
          LJ
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════ */}
      {/* TILES VIEW                                              */}
      {/* ════════════════════════════════════════════════════════ */}
      {dashboardView === "tiles" && (() => {
        // Sort chronologically: nearest upcoming first, furthest in future at bottom
        const upcoming = [...meetings].sort(
          (a, b) => (a.date + a.startTime).localeCompare(b.date + b.startTime)
        )

        const openProject = MOCK_PROJECTS.find(p => p.id === openProjectId)

        return (
          <div className="max-w-7xl mx-auto w-full px-4 pb-10">

            {/* 3-column row: Meetings · To-dos · Documents */}
            <div className="grid grid-cols-3 gap-5 items-start">

              {/* ── Meetings tile ── */}
              <Card>
                <CardHeader className="pb-3 flex flex-row items-center justify-between gap-3 space-y-0">
                  <CardTitle className="text-base">Meetings</CardTitle>
                  <Button
                    onClick={onNewMeeting}
                    className="bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-[var(--text-on-accent)] h-8 text-sm font-medium"
                  >
                    + Create meeting
                  </Button>
                </CardHeader>
                <CardContent className="p-0">
                  {upcoming.length === 0 ? (
                    <div className="px-5 py-10 text-center text-sm text-muted-foreground">
                      No upcoming meetings — time to create one ✨
                    </div>
                  ) : (
                    <div className="divide-y">
                      {upcoming.map(m => {
                        const color = roleColor(m)
                        const dateLabel = formatShortDate(m.date)
                        return (
                          <div
                            key={m.id}
                            onClick={() => onMeetingClick(m.id)}
                            className="flex items-center gap-4 px-5 py-3 hover:bg-muted/50 cursor-pointer group/mtg transition-colors"
                          >
                            <div className={`w-14 shrink-0 rounded-md border ${color.bg} ${color.text} py-1.5 px-2 text-center`}>
                              <div className="text-[10px] font-medium uppercase tracking-wide opacity-80">
                                {dateLabel.split(" ")[0]}
                              </div>
                              <div className="text-base font-medium leading-none mt-0.5">
                                {dateLabel.split(" ")[1]}
                              </div>
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <p className="text-sm font-medium text-[var(--text-primary)] truncate">{m.title}</p>
                                {m.isDraft && (
                                  <span className="shrink-0 text-[10px] font-medium uppercase tracking-wide px-1.5 py-0.5 rounded bg-[var(--status-warning-soft)] text-[var(--status-warning)]">
                                    Draft
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-muted-foreground mt-0.5">
                                {m.startTime} – {m.endTime} · {m.participants.length} participant{m.participants.length !== 1 ? "s" : ""}
                              </p>
                              <p className="text-[11px] mt-1 flex items-center gap-1">
                                <span className="text-muted-foreground">🎤 Facilitated by</span>
                                <span className={`font-medium ${m.owner === CURRENT_USER ? "text-[var(--accent)]" : "text-[var(--text-primary)]"}`}>
                                  {m.owner === CURRENT_USER ? "you" : m.owner}
                                </span>
                              </p>
                            </div>
                            <button
                              onClick={e => { e.stopPropagation(); onMeetingDelete(m.id) }}
                              className="opacity-0 group-hover/mtg:opacity-100 text-muted-foreground hover:text-destructive text-base transition-opacity shrink-0 px-1"
                              title="Delete meeting"
                            >×</button>
                          </div>
                        )
                      })}
                    </div>
                  )}
                  {/* Open calendar — secondary action */}
                  <div className="px-5 py-3 border-t">
                    <button
                      onClick={() => setDashboardView("calendar")}
                      className="w-full text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-muted/50 rounded-md py-2 transition-colors flex items-center justify-center gap-1.5"
                    >
                      📅 Open calendar
                    </button>
                  </div>
                </CardContent>
              </Card>

              {/* ── To-dos tile ── */}
              <Card>
                <CardHeader className="pb-3 flex flex-row items-center justify-between gap-3 space-y-0">
                  <CardTitle className="text-base">To-dos</CardTitle>
                  <Button
                    onClick={() => {
                      setIsAddingTodo(true)
                      setTimeout(() => newTodoRef.current?.focus(), 0)
                    }}
                    className="bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-[var(--text-on-accent)] h-8 text-sm font-medium"
                  >
                    + Create To-Do
                  </Button>
                </CardHeader>
                <CardContent className="px-4 pb-4 space-y-1">
                  {isAddingTodo && (
                    <div className="mb-3">
                      <input
                        ref={newTodoRef}
                        className="w-full text-sm border rounded-md px-3 py-1.5 outline-none focus:ring-2 focus:ring-ring bg-background placeholder:text-muted-foreground"
                        placeholder="What needs to get done?"
                        value={newTodo}
                        onChange={e => setNewTodo(e.target.value)}
                        onKeyDown={e => {
                          if (e.key === "Enter") { addTodo(); setIsAddingTodo(false) }
                          if (e.key === "Escape") { setNewTodo(""); setIsAddingTodo(false) }
                        }}
                        onBlur={() => {
                          if (newTodo.trim()) { addTodo() }
                          setIsAddingTodo(false)
                        }}
                      />
                    </div>
                  )}
                  {openTodos.length === 0 && <p className="text-xs text-muted-foreground text-center py-4">No open tasks 🎉</p>}
                  {openTodos.map(todo => (
                    <div key={todo.id} className="flex items-start gap-2.5 py-2 group/todo">
                      <input type="checkbox" checked={false} onChange={() => toggleTodo(todo.id)}
                        className="mt-0.5 accent-[var(--accent)] w-4 h-4 shrink-0 cursor-pointer" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm leading-snug">{todo.text}</p>
                        {todo.meetingTitle && <p className="text-[10px] text-muted-foreground mt-0.5 truncate">↳ {todo.meetingTitle}</p>}
                      </div>
                      <button onClick={() => deleteTodo(todo.id)} className="opacity-0 group-hover/todo:opacity-100 text-muted-foreground hover:text-destructive text-sm transition-opacity shrink-0">×</button>
                    </div>
                  ))}
                  {doneTodos.length > 0 && (
                    <>
                      <Separator className="my-2" />
                      <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-1">Done</p>
                      {doneTodos.map(todo => (
                        <div key={todo.id} className="flex items-start gap-2.5 py-1.5 group/todo opacity-50">
                          <input type="checkbox" checked={true} onChange={() => toggleTodo(todo.id)}
                            className="mt-0.5 accent-[var(--accent)] w-4 h-4 shrink-0 cursor-pointer" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm line-through leading-snug">{todo.text}</p>
                            {todo.meetingTitle && <p className="text-[10px] text-muted-foreground mt-0.5 truncate">↳ {todo.meetingTitle}</p>}
                          </div>
                          <button onClick={() => deleteTodo(todo.id)} className="opacity-0 group-hover/todo:opacity-100 text-muted-foreground hover:text-destructive text-sm transition-opacity shrink-0">×</button>
                        </div>
                      ))}
                    </>
                  )}
                </CardContent>
              </Card>

            {/* ── Documents tile ── */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  {openProject ? (
                    <>
                      <button
                        onClick={() => setOpenProjectId(null)}
                        className="text-muted-foreground hover:text-[var(--text-primary)] transition-colors"
                      >
                        Documents
                      </button>
                      <span className="text-muted-foreground">›</span>
                      <span>{openProject.emoji} {openProject.name}</span>
                    </>
                  ) : (
                    <>Documents</>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {!openProject ? (
                  /* Project list */
                  <div className="divide-y">
                    {MOCK_PROJECTS.map(p => (
                      <button
                        key={p.id}
                        onClick={() => setOpenProjectId(p.id)}
                        className="w-full flex items-center gap-3 px-5 py-3 hover:bg-muted/50 transition-colors text-left"
                      >
                        <span className="text-2xl shrink-0">{p.emoji}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-[var(--text-primary)] truncate">{p.name}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {p.files.length} file{p.files.length !== 1 ? "s" : ""}
                            {p.description && <> · {p.description}</>}
                          </p>
                        </div>
                        <span className="text-muted-foreground text-sm">›</span>
                      </button>
                    ))}
                  </div>
                ) : (
                  /* File list */
                  <div className="divide-y">
                    {openProject.files.map((f: DocumentFile) => (
                      <div
                        key={f.id}
                        className="flex items-center gap-3 px-5 py-2.5 hover:bg-muted/50 cursor-pointer transition-colors"
                      >
                        <span className="text-lg shrink-0">{FILE_ICONS[f.type]}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-[var(--text-primary)] truncate">{f.name}</p>
                          <p className="text-[11px] text-muted-foreground mt-0.5">
                            {formatShortDate(f.date)} · {f.author}
                            {f.meetingTitle && <> · ↳ {f.meetingTitle}</>}
                          </p>
                        </div>
                        <span className="text-[10px] uppercase tracking-wide text-muted-foreground shrink-0">
                          {f.type}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
            </div>
          </div>
        )
      })()}

      {/* ════════════════════════════════════════════════════════ */}
      {/* CALENDAR VIEW                                           */}
      {/* ════════════════════════════════════════════════════════ */}
      {dashboardView === "calendar" && (
      <div className="flex flex-1 max-w-6xl mx-auto w-full px-4 pb-6 gap-5 min-h-0">
        {/* ── Calendar ── */}
        <div className="flex-1 flex flex-col min-w-0">

          {/* Controls row — aligned with To-dos header */}
          <div className="flex items-center gap-2 mb-4 h-9 justify-between">
              <button
                onClick={() => setDashboardView("tiles")}
                className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] flex items-center gap-1 transition-colors mr-1"
              >
                ← Overview
              </button>
              {/* View switcher */}
              <div className="flex rounded-lg border bg-[var(--bg-card)] overflow-hidden text-sm font-medium">
                {(["day","week","month"] as ViewMode[]).map(v => (
                  <button
                    key={v}
                    onClick={() => { setViewMode(v); setOffset(0) }}
                    className={`px-3 py-1.5 capitalize transition-colors border-r last:border-r-0
                      ${viewMode === v ? "bg-[var(--accent)] text-[var(--text-on-accent)]" : "text-muted-foreground hover:bg-muted/60"}`}
                  >
                    {v.charAt(0).toUpperCase() + v.slice(1)}
                  </button>
                ))}
              </div>

              {/* Navigation */}
              <Button variant="outline" size="sm" onClick={() => setOffset(0)} className="text-xs h-8">Today</Button>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => setOffset(o => o - 1)}>‹</Button>
                <span className="text-sm font-medium text-[var(--text-primary)] min-w-40 text-center">{navLabel}</span>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => setOffset(o => o + 1)}>›</Button>
              </div>

              {/* New Meeting */}
              <Button onClick={onNewMeeting} className="bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-[var(--text-on-accent)] h-8 text-sm ml-auto">
                + New Meeting
              </Button>
          </div>

          {/* ── Calendar body ── */}
          <div className="bg-[var(--bg-card)] rounded-xl border shadow-sm flex flex-col flex-1 overflow-hidden" ref={scrollRef}>

            {/* DAY */}
            {viewMode === "day" && (
              <>
                <HeaderRow days={[currentDay]} />
                <TimeGrid
                  days={[currentDay]} meetings={meetings}
                  nowY={isSameDay(currentDay, today) ? nowY : null}
                  nowDayIdx={0} showSingleDay
                  onMeetingClick={onMeetingClick}
                  onMeetingDelete={onMeetingDelete}
                />
              </>
            )}

            {/* WEEK */}
            {viewMode === "week" && (
              <>
                <HeaderRow days={weekDays} />
                <TimeGrid
                  days={weekDays} meetings={meetings}
                  nowY={offset === 0 ? nowY : null}
                  nowDayIdx={nowDayIdx} showSingleDay={false}
                  onMeetingClick={onMeetingClick}
                  onMeetingDelete={onMeetingDelete}
                />
              </>
            )}

            {/* MONTH */}
            {viewMode === "month" && (
              <div className="flex flex-col flex-1 overflow-auto">
                {/* Day name header */}
                <div className="grid grid-cols-7 border-b shrink-0">
                  {DAYS_SHORT.map(d => (
                    <div key={d} className="py-2 text-center text-[11px] font-semibold text-muted-foreground uppercase tracking-wide border-r last:border-r-0">
                      {d}
                    </div>
                  ))}
                </div>
                {/* Week rows */}
                <div className="grid grid-cols-7 flex-1" style={{ gridAutoRows: "1fr" }}>
                  {monthDays.map((d, i) => {
                    const isThisMonth = d.getMonth() === baseMonth.getMonth()
                    const isToday = isSameDay(d, today)
                    const dayMeetings = meetings.filter(m => m.date === toDateStr(d))
                    return (
                      <div key={i} className={`border-r border-b last:border-r-0 p-1.5 min-h-[90px] flex flex-col gap-1
                        ${!isThisMonth ? "bg-muted/30" : ""}
                        ${isToday ? "bg-[var(--accent-soft)]/60" : ""}`}
                      >
                        <div className={`text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full self-end
                          ${isToday ? "bg-[var(--accent)] text-[var(--text-on-accent)]" : isThisMonth ? "text-[var(--text-primary)]" : "text-muted-foreground"}`}>
                          {d.getDate()}
                        </div>
                        {dayMeetings.slice(0, 3).map(m => {
                          const color = roleColor(m)
                          return (
                            <div key={m.id}
                              className={`relative flex items-center gap-1 text-[10px] font-medium pl-1.5 pr-1 py-0.5 rounded border-l-2 cursor-pointer hover:brightness-95 transition-all group/chip ${color.bg} ${color.border} ${color.text}`}
                              title={`${m.title} · ${m.startTime}–${m.endTime}`}
                              onClick={() => onMeetingClick(m.id)}
                            >
                              <span className="truncate flex-1">{m.startTime} {m.title}</span>
                              <button
                                className="shrink-0 w-3.5 h-3.5 rounded-full opacity-0 group-hover/chip:opacity-100 hover:bg-[var(--status-recording)] hover:text-[var(--text-on-accent)] flex items-center justify-center transition-all text-[9px] leading-none"
                                onClick={e => { e.stopPropagation(); onMeetingDelete(m.id) }}
                                title="Löschen"
                              >×</button>
                            </div>
                          )
                        })}
                        {dayMeetings.length > 3 && (
                          <div className="text-[10px] text-muted-foreground px-1">+{dayMeetings.length - 3} weitere</div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── Todos ── */}
        <div className="w-72 shrink-0 flex flex-col gap-4">
          <div className="flex items-center justify-between h-9 mb-0">
            <h2 className="font-semibold text-[var(--text-primary)]">To-dos</h2>
            <span className="text-xs text-muted-foreground">{openTodos.length} open</span>
          </div>

          <Card>
            <CardContent className="p-4 space-y-1">
              <div className="flex gap-2 mb-3">
                <input
                  className="flex-1 text-sm border rounded-md px-3 py-1.5 outline-none focus:ring-2 focus:ring-ring bg-background placeholder:text-muted-foreground"
                  placeholder="New task…" value={newTodo}
                  onChange={e => setNewTodo(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && addTodo()}
                />
                <Button size="sm" className="bg-[var(--accent)] hover:bg-[var(--accent-hover)] shrink-0" onClick={addTodo}>+</Button>
              </div>

              {openTodos.length === 0 && <p className="text-xs text-muted-foreground text-center py-4">No open tasks 🎉</p>}
              {openTodos.map(todo => (
                <div key={todo.id} className="flex items-start gap-2.5 py-2 group/todo">
                  <input type="checkbox" checked={false} onChange={() => toggleTodo(todo.id)}
                    className="mt-0.5 accent-[var(--accent)] w-4 h-4 shrink-0 cursor-pointer" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm leading-snug">{todo.text}</p>
                    {todo.meetingTitle && <p className="text-[10px] text-muted-foreground mt-0.5 truncate">↳ {todo.meetingTitle}</p>}
                  </div>
                  <button onClick={() => deleteTodo(todo.id)} className="opacity-0 group-hover/todo:opacity-100 text-muted-foreground hover:text-destructive text-sm transition-opacity shrink-0">×</button>
                </div>
              ))}

              {doneTodos.length > 0 && (
                <>
                  <Separator className="my-2" />
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-1">Done</p>
                  {doneTodos.map(todo => (
                    <div key={todo.id} className="flex items-start gap-2.5 py-1.5 group/todo opacity-50">
                      <input type="checkbox" checked={true} onChange={() => toggleTodo(todo.id)}
                        className="mt-0.5 accent-[var(--accent)] w-4 h-4 shrink-0 cursor-pointer" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm line-through leading-snug">{todo.text}</p>
                        {todo.meetingTitle && <p className="text-[10px] text-muted-foreground mt-0.5 truncate">↳ {todo.meetingTitle}</p>}
                      </div>
                      <button onClick={() => deleteTodo(todo.id)} className="opacity-0 group-hover/todo:opacity-100 text-muted-foreground hover:text-destructive text-sm transition-opacity shrink-0">×</button>
                    </div>
                  ))}
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2 pt-4 px-4">
              <CardTitle className="text-sm text-muted-foreground font-medium">This Week</CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4 grid grid-cols-2 gap-3">
              {[
                { label: "Meetings",      value: meetings.filter(m => weekDays.some(d => toDateStr(d) === m.date)).length },
                { label: "Open to-dos",   value: openTodos.length },
                { label: "Total meetings",value: meetings.length },
                { label: "Done",          value: doneTodos.length },
              ].map(({ label, value }) => (
                <div key={label} className="bg-muted/60 rounded-lg px-3 py-2">
                  <p className="text-xl font-bold text-[var(--text-primary)]">{value}</p>
                  <p className="text-[11px] text-muted-foreground">{label}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
      )}
    </div>
  )
}
