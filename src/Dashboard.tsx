import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { MOCK_TODOS } from "./data"
import type { Meeting, Todo } from "./types"

// ── Constants ─────────────────────────────────────────────
const START_HOUR = 9
const END_HOUR = 19
const HOUR_H = 64
const HOURS = Array.from({ length: END_HOUR - START_HOUR }, (_, i) => i + START_HOUR)
const DAYS_SHORT = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"]
const MONTHS_SHORT = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"]

const COLORS = [
  { bg: "bg-violet-100", border: "border-l-teal-600", text: "text-violet-900", chip: "bg-teal-600" },
  { bg: "bg-sky-100",    border: "border-l-sky-500",    text: "text-sky-900",    chip: "bg-sky-500" },
  { bg: "bg-emerald-100",border: "border-l-emerald-500",text: "text-emerald-900",chip: "bg-emerald-500" },
  { bg: "bg-amber-100",  border: "border-l-amber-500",  text: "text-amber-900",  chip: "bg-amber-500" },
  { bg: "bg-rose-100",   border: "border-l-rose-500",   text: "text-rose-900",   chip: "bg-rose-500" },
]

type ViewMode = "day" | "week" | "month"

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
                className={`border-r last:border-r-0 border-b relative ${isSameDay(d, today) ? "bg-teal-50/40" : ""}`}
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
            const color = COLORS[m.id % COLORS.length]
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
                  className="absolute top-0.5 right-0.5 w-4 h-4 rounded-full bg-black/0 hover:bg-red-500 text-transparent hover:text-white flex items-center justify-center text-[10px] leading-none opacity-0 group-hover/block:opacity-100 transition-all"
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
            <div className="w-2 h-2 rounded-full bg-red-500 -ml-1 shrink-0" />
            <div className="flex-1 h-0.5 bg-red-500" />
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
          <div key={i} className={`py-2 text-center border-r last:border-r-0 ${isToday ? "bg-teal-50" : ""}`}>
            {days.length > 1 && <div className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">
              {DAYS_SHORT[i === 6 ? 6 : i]}
            </div>}
            <div className={`text-lg font-bold leading-none mt-0.5 mx-auto w-8 h-8 flex items-center justify-center rounded-full
              ${isToday ? "bg-teal-700 text-white" : "text-[#1C1F3A]"}`}>
              {d.getDate()}
            </div>
            <div className="h-1.5 flex justify-center mt-1">
              {hasMtg && <div className={`w-1.5 h-1.5 rounded-full ${isToday ? "bg-white" : "bg-teal-400"}`} />}
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
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#1C1F3A] text-white h-14 flex items-center px-8 gap-3 shadow-md shrink-0">
        <span className="text-xl font-extrabold tracking-tight">Chair<span className="text-teal-400">ly</span></span>
        <div className="ml-auto flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-teal-700 text-white text-xs font-bold flex items-center justify-center">LJ</div>
        </div>
      </header>

      {/* ── Greeting (full width above columns) ── */}
      <div className="max-w-6xl mx-auto w-full px-4 pt-8 pb-5">
        <h1 className="text-4xl font-bold text-[#1C1F3A] tracking-tight">Hello, Lisa 👋</h1>
        <p className="text-sm text-muted-foreground mt-1.5">{meetings.length} meetings · {openTodos.length} open to-dos</p>
      </div>

      <div className="flex flex-1 max-w-6xl mx-auto w-full px-4 pb-6 gap-5 min-h-0">
        {/* ── Calendar ── */}
        <div className="flex-1 flex flex-col min-w-0">

          {/* Controls row — aligned with To-dos header */}
          <div className="flex items-center gap-2 mb-4 h-9 justify-between">
              {/* View switcher */}
              <div className="flex rounded-lg border bg-white overflow-hidden text-sm font-medium">
                {(["day","week","month"] as ViewMode[]).map(v => (
                  <button
                    key={v}
                    onClick={() => { setViewMode(v); setOffset(0) }}
                    className={`px-3 py-1.5 capitalize transition-colors border-r last:border-r-0
                      ${viewMode === v ? "bg-teal-700 text-white" : "text-muted-foreground hover:bg-muted/60"}`}
                  >
                    {v.charAt(0).toUpperCase() + v.slice(1)}
                  </button>
                ))}
              </div>

              {/* Navigation */}
              <Button variant="outline" size="sm" onClick={() => setOffset(0)} className="text-xs h-8">Today</Button>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => setOffset(o => o - 1)}>‹</Button>
                <span className="text-sm font-medium text-[#1C1F3A] min-w-40 text-center">{navLabel}</span>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => setOffset(o => o + 1)}>›</Button>
              </div>

              {/* New Meeting */}
              <Button onClick={onNewMeeting} className="bg-teal-700 hover:bg-teal-600 text-white h-8 text-sm ml-auto">
                + New Meeting
              </Button>
          </div>

          {/* ── Calendar body ── */}
          <div className="bg-white rounded-xl border shadow-sm flex flex-col flex-1 overflow-hidden" ref={scrollRef}>

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
                        ${isToday ? "bg-teal-50/60" : ""}`}
                      >
                        <div className={`text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full self-end
                          ${isToday ? "bg-teal-700 text-white" : isThisMonth ? "text-[#1C1F3A]" : "text-muted-foreground"}`}>
                          {d.getDate()}
                        </div>
                        {dayMeetings.slice(0, 3).map(m => {
                          const color = COLORS[m.id % COLORS.length]
                          return (
                            <div key={m.id}
                              className={`relative flex items-center gap-1 text-[10px] font-medium pl-1.5 pr-1 py-0.5 rounded border-l-2 cursor-pointer hover:brightness-95 transition-all group/chip ${color.bg} ${color.border} ${color.text}`}
                              title={`${m.title} · ${m.startTime}–${m.endTime}`}
                              onClick={() => onMeetingClick(m.id)}
                            >
                              <span className="truncate flex-1">{m.startTime} {m.title}</span>
                              <button
                                className="shrink-0 w-3.5 h-3.5 rounded-full opacity-0 group-hover/chip:opacity-100 hover:bg-red-500 hover:text-white flex items-center justify-center transition-all text-[9px] leading-none"
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
            <h2 className="font-semibold text-[#1C1F3A]">To-dos</h2>
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
                <Button size="sm" className="bg-[#1C1F3A] hover:bg-[#2D3260] shrink-0" onClick={addTodo}>+</Button>
              </div>

              {openTodos.length === 0 && <p className="text-xs text-muted-foreground text-center py-4">No open tasks 🎉</p>}
              {openTodos.map(todo => (
                <div key={todo.id} className="flex items-start gap-2.5 py-2 group/todo">
                  <input type="checkbox" checked={false} onChange={() => toggleTodo(todo.id)}
                    className="mt-0.5 accent-teal-700 w-4 h-4 shrink-0 cursor-pointer" />
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
                        className="mt-0.5 accent-teal-700 w-4 h-4 shrink-0 cursor-pointer" />
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
                  <p className="text-xl font-bold text-[#1C1F3A]">{value}</p>
                  <p className="text-[11px] text-muted-foreground">{label}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
