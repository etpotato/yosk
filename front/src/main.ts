import App from './App.svelte'
import { setVh, debouncedSetVh } from './utils/setVh'

const root = document.getElementById('app')

const app =
  root &&
  new App({
    target: root,
  })

setVh()
window.addEventListener('resize', debouncedSetVh)

export default app
