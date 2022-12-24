const intl = new Intl.DateTimeFormat('it-IT', {
  hour: 'numeric',
  minute: 'numeric',
  hour12: true,
})

export default function formatTime(date: Date) {
  return intl.format(date)
}
