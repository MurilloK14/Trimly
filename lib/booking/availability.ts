/** Lógica pura de geração e filtragem de horários disponíveis. */

const SLOT_STEP_MINUTES = 30
const TIMEZONE_OFFSET = '-03:00' // America/Sao_Paulo (MVP)

export type TimeRange = { start: Date; end: Date }

export type DaySchedule = {
  active: boolean
  opensAt: string | null   // HH:mm:ss
  closesAt: string | null
  breakStart: string | null
  breakEnd: string | null
}

/** Converte "HH:mm" ou "HH:mm:ss" em minutos desde meia-noite. */
export function timeToMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number)
  return h * 60 + m
}

export function minutesToTime(minutes: number): string {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

export function toTimezoneDate(dateStr: string, timeStr: string): Date {
  const normalized = timeStr.length === 5 ? `${timeStr}:00` : timeStr
  return new Date(`${dateStr}T${normalized}${TIMEZONE_OFFSET}`)
}

export function rangesOverlap(a: TimeRange, b: TimeRange): boolean {
  return a.start < b.end && a.end > b.start
}

/** Gera slots candidatos respeitando horário de funcionamento, pausa e duração do serviço. */
export function generateCandidateSlots(
  schedule: DaySchedule,
  durationMinutes: number,
): string[] {
  if (!schedule.active || !schedule.opensAt || !schedule.closesAt) return []

  const open = timeToMinutes(schedule.opensAt)
  const close = timeToMinutes(schedule.closesAt)
  const breakStart = schedule.breakStart ? timeToMinutes(schedule.breakStart) : null
  const breakEnd = schedule.breakEnd ? timeToMinutes(schedule.breakEnd) : null

  const slots: string[] = []

  for (let start = open; start + durationMinutes <= close; start += SLOT_STEP_MINUTES) {
    const end = start + durationMinutes

    // Pula slots que cruzam o intervalo de pausa
    if (breakStart !== null && breakEnd !== null) {
      const crossesBreak = start < breakEnd && end > breakStart
      if (crossesBreak) continue
    }

    slots.push(minutesToTime(start))
  }

  return slots
}

/** Remove slots que conflitam com bloqueios ou agendamentos existentes. */
export function filterAvailableSlots(
  candidateTimes: string[],
  dateStr: string,
  durationMinutes: number,
  blockedRanges: TimeRange[],
  appointmentRanges: TimeRange[],
): string[] {
  return candidateTimes.filter((time) => {
    const slot: TimeRange = {
      start: toTimezoneDate(dateStr, time),
      end: toTimezoneDate(dateStr, minutesToTime(timeToMinutes(time) + durationMinutes)),
    }

    const hasConflict =
      blockedRanges.some((r) => rangesOverlap(slot, r)) ||
      appointmentRanges.some((r) => rangesOverlap(slot, r))

    return !hasConflict
  })
}

/** Horário padrão quando o barbeiro ainda não configurou working_hours. */
export const DEFAULT_DAY_SCHEDULE: DaySchedule = {
  active: true,
  opensAt: '09:00:00',
  closesAt: '18:00:00',
  breakStart: '12:00:00',
  breakEnd: '13:00:00',
}
