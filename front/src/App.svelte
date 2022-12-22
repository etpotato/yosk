<script lang="ts">
  import { Router, Route } from "svelte-navigator"
	import Main from "./routes/Main.svelte"
  import Room from "./routes/Room.svelte";
</script>

<main class="container-fluid">
  <Router>
    <Route path="/">
			<Main />
		</Route>
		<Route path="room/:roomId" let:params>
      <Room roomId={params.roomId} />
    </Route>
  </Router>
</main>

<style>
</style>
