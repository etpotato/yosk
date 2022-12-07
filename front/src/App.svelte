<script lang="ts">
  import { io } from 'socket.io-client';
  import { navigate } from "svelte-navigator";

  const socket = io('ws://localhost:3012');

  socket.on('connection', () => {
    console.log('connected');
  });

  socket.emit('roomid-request');

  socket.on('roomid', (payload: string) => {

    console.log('roomid', payload);
    navigate(`/room/${payload}`);
  });
</script>

<main>

</main>

<style>

</style>
