import debounce from 'lodash.debounce'

export function setVh() {
  const vh = window.innerHeight * 0.01
  document.documentElement.style.setProperty('--vh', `${vh}px`)
}

export const debouncedSetVh = debounce(setVh, 300)
