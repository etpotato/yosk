<style>
  .home {
    display: grid;
    place-content: center;
    min-height: 100vh;
  }
</style>

<script lang="ts">
  import { navigate } from 'svelte-navigator'
  import { Button, Input, Label } from 'sveltestrap'
  import { EEventRoom } from '@dto'
  import socket from '../lib/ws'

  let roomId = ''
  let invalid = false

  const createMeeting = (evt: Event) => {
    evt.preventDefault()
    socket.emit(EEventRoom.create, (id) => navigate(`/room/${id}`))
  }

  const joinMeeting = (evt: Event) => {
    evt.preventDefault()
    const reqRoomId = roomId.trim()
    socket.emit(EEventRoom.check, reqRoomId, (ack) => {
      if (ack) {
        invalid = false
        navigate(`/room/${reqRoomId}`)
      } else {
        invalid = true
      }
    })
  }

  const clearInvalid = () => {
    invalid = false
  }
</script>

<div class="home">
  <form action="/" on:submit={joinMeeting} class="mb-2">
    <Label for="roomId">Enter room ID</Label>
    <div class="d-flex pb-4 position-relative">
      <Input
        bind:value={roomId}
        on:input={clearInvalid}
        type="text"
        name="roomId"
        placeholder="Room ID"
        id="roomId"
        class="me-3"
        bsSize="lg"
      />
      <Button type="submit" class="d-block text-nowrap" color="dark" size="lg" outline
        >Join room</Button
      >
      {#if invalid}
        <p class="position-absolute bottom-0 mb-0 text-danger">Room not found</p>
      {/if}
    </div>
  </form>

  <Button on:click={createMeeting} type="button" color="dark" class="d-block" size="lg"
    >New meeting</Button
  >
</div>
