<script lang="ts">
  import { navigate } from 'svelte-navigator'
  import Button from '@smui/button'
  import Textfield from '@smui/textfield'
  import { EEventRoom } from '@dto'
  import socket from '../utils/ws'

  let roomId = ''

  const createMeeting = (evt: CustomEvent<MouseEvent>) => {
    evt.preventDefault()
    console.log('create room req')
    socket.emit(EEventRoom.create, (id) => {
      console.log('trying to join the room')
      navigate(`/room/${id}`)
    })
  }

  const joinMeeting = (evt: Event) => {
    evt.preventDefault()
    const reqRoomId = roomId.trim()
    console.log('room:check')
    socket.emit(EEventRoom.check, reqRoomId, (ack) => {
      if (ack) {
        console.log('trying to join the room')
        navigate(`/room/${reqRoomId}`)
      }
      console.log('room:check', ack)
    })
  }


</script>

<div>
  <form action="/" on:submit={joinMeeting}>
    <Textfield variant="outlined" bind:value={roomId} label="Enter room ID"/>
    <Button variant="outlined" type="submit" touch>Join room</Button>
  </form>

  <Button on:click={createMeeting} color="secondary" variant="raised" type="button" touch>New meeting</Button>
</div>
