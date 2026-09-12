export function formatSince(iso: string): string {
  const ms = Date.now() - new Date(iso).getTime()
  const minutes = Math.floor(ms / 60_000)
  if (minutes < 1) return 'seit gerade eben'
  if (minutes < 60) return `seit ${minutes} Min.`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `seit ${hours} Std.`
  const days = Math.floor(hours / 24)
  if (days < 30) return `seit ${days} Tag${days === 1 ? '' : 'en'}`
  const months = Math.floor(days / 30)
  if (months < 12) return `seit ${months} Monat${months === 1 ? '' : 'en'}`
  const years = Math.floor(months / 12)
  return `seit ${years} Jahr${years === 1 ? '' : 'en'}`
}
