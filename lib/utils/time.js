/** Seconds to `m:ss`, safe for the NaN the player hands back before it is ready. */
export function formatClock(seconds) {
  if (!Number.isFinite(seconds) || seconds < 0) return '0:00'
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${String(s).padStart(2, '0')}`
}

/** Whatever the office is doing at this hour. */
export function shiftLabel(hour) {
  if (hour < 5) return 'Late shift'
  if (hour < 11) return 'Morning shift'
  if (hour < 14) return 'Lunch break'
  if (hour < 17) return 'Chai break'
  if (hour < 20) return 'Golden hour'
  if (hour < 23) return 'Overtime'
  return 'Late shift'
}

/** 12-hour parts for the desk clock. */
export function clockParts(date) {
  const hours = date.getHours()
  return {
    hh: String(hours % 12 || 12).padStart(2, '0'),
    mm: String(date.getMinutes()).padStart(2, '0'),
    meridiem: hours < 12 ? 'AM' : 'PM',
    shift: shiftLabel(hours),
  }
}
