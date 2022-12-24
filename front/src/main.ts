import App from './App.svelte'

const root = document.getElementById('app')

const app =
  root &&
  new App({
    target: root,
  })

export default app
