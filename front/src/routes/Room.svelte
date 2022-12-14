<script lang="ts">
  import { onDestroy, onMount } from 'svelte'
  import { navigate } from 'svelte-navigator'
  import Button from '@smui/button'
  import { EEventRoom } from '@dto'
  import type { TRoom } from '@dto'
  import socket from '../utils/ws'
  import Chat from '../lib/Chat.svelte'

  export let roomId: TRoom['id']

  onMount(() => {
    socket.emit(EEventRoom.join, roomId);
  });

  onDestroy(() => {
    socket.emit(EEventRoom.leave)
  })

  console.log('roomId', roomId)
</script>

<div>
  Room id: {roomId}

  <Button on:click={() => navigate('/')} variant="text">Home</Button>
  <Chat />
</div>
