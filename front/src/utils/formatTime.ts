const intl = new Intl.DateTimeFormat('en-US', {
  hour: 'numeric',
  minute: 'numeric',
  hour12: true,
})

export function formatTime(date: Date) {
  return intl.format(date)
}
