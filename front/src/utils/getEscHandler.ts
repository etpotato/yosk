export function getEscHandler(fn: () => void) {
  return function (evt: KeyboardEvent) {
    if (['Esc', 'Escape'].includes(evt.key)) {
      fn()
    }
  }
}