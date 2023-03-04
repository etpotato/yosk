<script lang="ts">
  import { navigate } from 'svelte-navigator'
  import { Button } from 'sveltestrap'
  import { EEventRoom } from '@dto'
  import socket from '../lib/ws'
  import InitialLayout from '../components/InitialLayout.svelte';

  const createMeeting = (evt: Event) => {
    evt.preventDefault()
    socket.emit(EEventRoom.create, (id) => navigate(`/room/${id}`))
  }
</script>

<InitialLayout>
  <Button on:click={createMeeting} type="button" color="dark" class="d-block" size="lg"
    >New meeting</Button
  >
</InitialLayout>
