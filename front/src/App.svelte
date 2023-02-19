<style>
  .app {
    padding: 0 0.5rem;
  }
</style>

<script lang="ts">
  import { Router, Route } from 'svelte-navigator'
  import Main from './routes/Main.svelte'
  import Room from './routes/Room.svelte'
</script>

<main class="app">
  <Router>
    <Route path="/">
      <Main />
    </Route>
    <Route path="room/:roomId" let:params>
      <Room roomId={params.roomId} />
    </Route>
    <!-- TODO: 404 -->
  </Router>
</main>
